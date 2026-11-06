import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { fetchHoardings, Hoarding, HoardingCity } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { cityFrom } from '../components/HomeHeader';
import HeaderInset from '../components/HeaderInset';
import { offlineMarketing } from '../data/homeCategories';
import {
  rupees,
  sizeLabel,
  dateLabel,
  distanceKm,
  distanceLabel,
} from '../lib/hoardings';

const ALL = 'All';

/**
 * Hoardings the team has listed from the admin console, by city and
 * area — the customer's own city first, and the nearest ones first
 * when they've saved their business location.
 */
export default function HoardingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [hoardings, setHoardings] = useState<Hoarding[]>([]);
  const [cities, setCities] = useState<HoardingCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [city, setCity] = useState<string | null>(null);
  const [area, setArea] = useState(ALL);

  const myCity = cityFrom(profile.address).toLowerCase();
  const myPoint =
    profile.latitude != null && profile.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null;

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await fetchHoardings();
        setHoardings(data.hoardings);
        setCities(data.cities);

        // First visit: their own city if we list hoardings there
        setCity((current) => {
          if (current) return current;
          const mine = data.cities.find((c) => c.city.toLowerCase() === myCity);
          return mine ? mine.city : ALL;
        });
      } catch (err: any) {
        setError(err?.message || 'Could not load hoardings.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [myCity]
  );

  // Fresh every time the screen opens — the team may have just added one
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selectedCity = city ?? ALL;
  const areas =
    selectedCity === ALL
      ? []
      : cities.find((c) => c.city === selectedCity)?.areas ?? [];

  const visible = useMemo(() => {
    const list = hoardings
      .filter((h) => selectedCity === ALL || h.city === selectedCity)
      .filter((h) => area === ALL || h.area === area)
      .map((h) => ({
        h,
        km:
          myPoint && h.latitude != null && h.longitude != null
            ? distanceKm(myPoint, { latitude: h.latitude, longitude: h.longitude })
            : null,
      }));

    // Nearest first; ones without a pin keep the team's order, after
    if (myPoint) {
      list.sort((a, b) => {
        if (a.km == null && b.km == null) return 0;
        if (a.km == null) return 1;
        if (b.km == null) return -1;
        return a.km - b.km;
      });
    }
    return list;
  }, [hoardings, selectedCity, area, myPoint?.latitude, myPoint?.longitude]);

  const pickCity = (c: string) => {
    setCity(c);
    setArea(ALL);
  };

  const summary =
    `${visible.length} hoarding${visible.length === 1 ? '' : 's'}` +
    (area !== ALL ? ` in ${area}` : selectedCity !== ALL ? ` in ${selectedCity}` : '') +
    (myPoint && visible.some((v) => v.km != null) ? ' · nearest first' : '');

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <HeaderInset />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={21} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoardings</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="wifi-off" size={36} color={colors.textLight} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(v) => v.h.id}
          contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* City */}
              {cities.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {[ALL, ...cities.map((c) => c.city)].map((c) => (
                    <Chip
                      key={c}
                      label={c === ALL ? 'All cities' : c}
                      icon={c === ALL ? 'earth' : 'city-variant-outline'}
                      active={selectedCity === c}
                      onPress={() => pickCity(c)}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Area, once a city is picked */}
              {areas.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.chipRow, { paddingTop: 0 }]}
                >
                  {[ALL, ...areas].map((a) => (
                    <Chip
                      key={a}
                      label={a === ALL ? 'All areas' : a}
                      small
                      active={area === a}
                      onPress={() => setArea(a)}
                    />
                  ))}
                </ScrollView>
              )}

              <Text style={styles.summary}>{summary}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="billboard" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>
                {hoardings.length === 0
                  ? 'No hoardings listed yet'
                  : 'Nothing here right now'}
              </Text>
              <Text style={styles.emptyText}>
                Tell us where you want to advertise and our team will find
                the right spot for you.
              </Text>
              <TouchableOpacity
                style={styles.retry}
                onPress={() =>
                  navigation.replace('PostRequest', {
                    service: offlineMarketing.find((s) => s.id === 'ofm1'),
                    category: 'offline',
                  })
                }
              >
                <Text style={styles.retryText}>Post a request</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: { h, km } }) => (
            <HoardingCard
              hoarding={h}
              km={km}
              onPress={() => navigation.navigate('HoardingDetail', { hoarding: h, km })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function Chip({
  label,
  icon,
  active,
  small,
  onPress,
}: {
  label: string;
  icon?: string;
  active: boolean;
  small?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        small && styles.chipSmall,
        active && styles.chipActive,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={14}
          color={active ? colors.white : colors.primary}
        />
      )}
      <Text style={[styles.chipText, small && styles.chipTextSmall, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function HoardingCard({
  hoarding: h,
  km,
  onPress,
}: {
  hoarding: Hoarding;
  km: number | null;
  onPress: () => void;
}) {
  const size = sizeLabel(h);
  const price = rupees(h.price_per_month);
  const booked = h.availability === 'booked';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.cover}>
        {h.photos[0] ? (
          <Image source={{ uri: h.photos[0] }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noPhoto]}>
            <MaterialCommunityIcons name="billboard" size={44} color="rgba(255,255,255,0.5)" />
          </View>
        )}
        {/* Darkens the bottom so the type tag reads over any photo */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
          start={{ x: 0, y: 0.55 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.badge, booked ? styles.badgeBooked : styles.badgeFree]}>
          <View style={[styles.badgeDot, { backgroundColor: booked ? '#B45309' : '#0B8457' }]} />
          <Text style={[styles.badgeText, { color: booked ? '#B45309' : '#0B8457' }]}>
            {booked
              ? h.available_from
                ? `Booked · free ${dateLabel(h.available_from)}`
                : 'Booked'
              : 'Available'}
          </Text>
        </View>

        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{h.media_type}</Text>
        </View>
        {h.photos.length > 1 && (
          <View style={styles.photoCount}>
            <MaterialCommunityIcons name="image-multiple-outline" size={12} color={colors.white} />
            <Text style={styles.photoCountText}>{h.photos.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {h.title}
        </Text>

        <View style={styles.locRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
          <Text style={styles.locText} numberOfLines={1}>
            {h.area}, {h.city}
            {km != null ? `  ·  ${distanceLabel(km)}` : ''}
          </Text>
        </View>

        {(size || h.illumination) && (
          <View style={styles.specRow}>
            {size && <Spec icon="ruler-square" text={size} />}
            {h.illumination && <Spec icon="lightbulb-on-outline" text={h.illumination} />}
          </View>
        )}

        <View style={styles.cardFoot}>
          {price ? (
            <Text style={styles.price}>
              {price}
              <Text style={styles.perMonth}> / month</Text>
            </Text>
          ) : (
            <Text style={styles.perMonth}>Price on request</Text>
          )}
          <View style={styles.viewBtn}>
            <Text style={styles.viewText}>View details</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Spec({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.spec}>
      <MaterialCommunityIcons name={icon as any} size={13} color={colors.textLight} />
      <Text style={styles.specText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.3,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  chipRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    backgroundColor: colors.white,
  },
  chipSmall: { height: 30, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  chipTextSmall: { fontSize: 12 },
  chipTextActive: { color: colors.white },

  summary: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textLight,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cover: { height: 180, backgroundColor: '#1E1E24' },
  noPhoto: { justifyContent: 'center', alignItems: 'center' },

  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeFree: { backgroundColor: '#E7F6EF' },
  badgeBooked: { backgroundColor: '#FEF3C7' },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11 },

  typeTag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  typeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.white, letterSpacing: 0.3 },
  photoCount: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  photoCountText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.white },

  cardBody: { padding: 14 },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 21,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.textLight },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  specText: { fontFamily: fonts.body, fontSize: 12, color: colors.textDark },

  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  price: { fontFamily: fonts.display, fontSize: 18, color: colors.primary, letterSpacing: -0.3 },
  perMonth: { fontFamily: fonts.body, fontSize: 12, color: colors.textLight },
  viewBtn: { flexDirection: 'row', alignItems: 'center' },
  viewText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },

  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 48 },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  retryText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
});
