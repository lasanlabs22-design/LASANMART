import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Hoarding } from '../api/client';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';
import HeaderInset from '../components/HeaderInset';
import { rupees, sizeLabel, dateLabel, distanceLabel } from '../lib/hoardings';

const SCREEN_W = Dimensions.get('window').width;
const GALLERY_H = Math.round(SCREEN_W * 0.7);

// Same violet-and-gold as the Hoardings list card
const HERO_BG = '#22123F';
const GOLD = '#FFC93C';
const INK = '#2A1650';

/**
 * One hoarding in full: photos, every detail the team filled in, where
 * it is on the map, and a button to ask for it.
 */
export default function HoardingDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const h: Hoarding = route.params.hoarding;
  const km: number | null = route.params.km ?? null;

  const [photo, setPhoto] = useState(0);
  const [note, setNote] = useState('');
  const [focused, setFocused] = useState(false);

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const booked = h.availability === 'booked';
  const price = rupees(h.price_per_month);
  const size = sizeLabel(h);

  // Booking length: starts at the team's minimum, then common lengths
  const minMonths = h.min_months && h.min_months > 0 ? h.min_months : 1;
  const monthOptions = [minMonths, ...[1, 3, 6, 9, 12].filter((m) => m > minMonths)];
  const [months, setMonths] = useState(minMonths);
  const monthsLabel = `${months} month${months > 1 ? 's' : ''}`;
  const total =
    h.price_per_month != null ? rupees(h.price_per_month * months) : null;
  const hasPin = h.latitude != null && h.longitude != null;

  const openMaps = () => {
    const query = hasPin
      ? `${h.latitude},${h.longitude}`
      : encodeURIComponent(`${h.address || h.title}, ${h.area}, ${h.city}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const request = () => {
    submit({
      type: 'service',
      title: `Hoarding: ${h.title}`,
      description: note.trim() || 'Interested in booking this hoarding.',
      descriptionLabel: 'Their note',
      // Shown as rows in the team email and the admin console
      details: {
        service: 'Hoardings',
        category: 'Offline Marketing',
        hoarding: h.title,
        location: [h.address, h.area, h.city].filter(Boolean).join(', '),
        type: h.media_type,
        size: size || undefined,
        pricePerMonth: price || undefined,
        duration: monthsLabel,
        estimatedTotal: total || undefined,
        availability: booked
          ? `Booked${h.available_from ? ` until ${dateLabel(h.available_from)}` : ''}`
          : 'Available',
      },
    });
  };

  const specs: { icon: string; label: string; value: string | null }[] = [
    { icon: 'billboard', label: 'Type', value: h.media_type },
    { icon: 'ruler-square', label: 'Size', value: size },
    { icon: 'lightbulb-on-outline', label: 'Lighting', value: h.illumination },
    { icon: 'compass-outline', label: 'Facing', value: h.facing },
    { icon: 'car-multiple', label: 'Traffic', value: h.traffic },
    {
      icon: 'calendar-range',
      label: 'Minimum booking',
      value: h.min_months ? `${h.min_months} month${h.min_months > 1 ? 's' : ''}` : null,
    },
  ].filter((s) => !!s.value);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <HeaderInset />
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={21} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hoarding details</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ---------- Hero: photos melting into the violet title block ---------- */}
          <View style={styles.hero}>
          <View pointerEvents="none" style={styles.glow} />
          <View style={styles.gallery}>
            {h.photos.length > 0 ? (
              <FlatList
                data={h.photos}
                keyExtractor={(u) => u}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) =>
                  setPhoto(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
                }
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.galleryImage} />
                )}
              />
            ) : (
              <View style={[styles.galleryImage, styles.noPhoto]}>
                <MaterialCommunityIcons name="billboard" size={56} color="rgba(255,255,255,0.45)" />
              </View>
            )}

            <LinearGradient
              pointerEvents="none"
              colors={['rgba(34,18,63,0)', HERO_BG]}
              locations={[0.6, 1]}
              style={StyleSheet.absoluteFill}
            />

            {h.photos.length > 1 && (
              <View style={styles.dots}>
                {h.photos.map((u, i) => (
                  <View key={u} style={[styles.dot, i === photo && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.heroBody}>
            {/* ---------- Title ---------- */}
            <View style={[styles.badge, booked ? styles.badgeBooked : styles.badgeFree]}>
              <View style={[styles.badgeDot, { backgroundColor: booked ? '#B45309' : '#0B8457' }]} />
              <Text style={[styles.badgeText, { color: booked ? '#B45309' : '#0B8457' }]}>
                {booked
                  ? h.available_from
                    ? `Booked · free from ${dateLabel(h.available_from)}`
                    : 'Currently booked'
                  : 'Available now'}
              </Text>
            </View>

            <Text style={styles.title}>{h.title}</Text>

            <View style={styles.locRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={GOLD} />
              <Text style={styles.locText}>
                {[h.address, h.area, h.city].filter(Boolean).join(', ')}
              </Text>
            </View>
            {km != null && <Text style={styles.distance}>{distanceLabel(km)} from your business</Text>}

            {/* ---------- Price ---------- */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>RENT</Text>
                {price ? (
                  <Text style={styles.price}>
                    {price}
                    <Text style={styles.perMonth}> / month</Text>
                  </Text>
                ) : (
                  <Text style={styles.price}>On request</Text>
                )}
              </View>
              {h.min_months ? (
                <View style={styles.minPill}>
                  <Text style={styles.minText}>
                    Min. {h.min_months} month{h.min_months > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          </View>

          <View style={styles.body}>
            {/* ---------- Booking length ---------- */}
            <Text style={[styles.section, { marginTop: 4 }]}>How long do you need it?</Text>
            <View style={styles.durRow}>
              {monthOptions.map((m, i) => {
                const active = m === months;
                return (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.85}
                    onPress={() => setMonths(m)}
                    style={[styles.durChip, i > 0 && { marginLeft: 8 }, active && styles.durChipActive]}
                  >
                    <Text style={[styles.durNum, active && styles.durNumActive]}>{m}</Text>
                    <Text style={[styles.durUnit, active && styles.durUnitActive]}>
                      {m > 1 ? 'months' : 'month'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {total && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {price} × {monthsLabel}
                </Text>
                <Text style={styles.totalValue}>{total}</Text>
              </View>
            )}
            <Text style={styles.durHint}>
              Need a different length? Mention it in the note below.
            </Text>

            {/* ---------- Specs ---------- */}
            {specs.length > 0 && (
              <>
                <Text style={styles.section}>Details</Text>
                <View style={styles.specGrid}>
                  {specs.map((s) => (
                    <View key={s.label} style={styles.specCell}>
                      <View style={styles.specIcon}>
                        <MaterialCommunityIcons name={s.icon as any} size={17} color={GOLD} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.specLabel}>{s.label}</Text>
                        <Text style={styles.specValue}>{s.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* ---------- About ---------- */}
            {h.description ? (
              <>
                <Text style={styles.section}>About this spot</Text>
                <Text style={styles.description}>{h.description}</Text>
              </>
            ) : null}

            {/* ---------- Map ---------- */}
            <Text style={styles.section}>Location</Text>
            {hasPin && (
              <View style={styles.mapWrap}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                  liteMode
                  initialRegion={{
                    latitude: h.latitude as number,
                    longitude: h.longitude as number,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: h.latitude as number,
                      longitude: h.longitude as number,
                    }}
                    pinColor={colors.primary}
                  />
                </MapView>
              </View>
            )}
            <TouchableOpacity style={styles.mapsBtn} activeOpacity={0.8} onPress={openMaps}>
              <MaterialCommunityIcons name="google-maps" size={18} color={colors.primary} />
              <Text style={styles.mapsText}>Open in Google Maps</Text>
              <MaterialCommunityIcons name="open-in-new" size={15} color={colors.primary} />
            </TouchableOpacity>

            {/* ---------- Note ---------- */}
            <Text style={styles.section}>
              Anything to add? <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={[styles.field, focused && styles.fieldActive]}>
              <TextInput
                style={styles.input}
                placeholder="Campaign dates, how many months, artwork ready or not…"
                placeholderTextColor={colors.textLight}
                value={note}
                onChangeText={setNote}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                multiline
                maxLength={600}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* ---------- Sticky footer ---------- */}
        <View style={[styles.footer, { paddingBottom: 14 + insets.bottom }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footPrice}>{total ?? 'Price on request'}</Text>
            <Text style={styles.footSub}>
              {total ? `est. for ${monthsLabel}` : `for ${monthsLabel}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={request}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={INK} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {booked ? 'Enquire for later' : 'Request this hoarding'}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={17} color={INK} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <ContactDetailsSheet {...sheetProps} />
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  hero: {
    backgroundColor: HERO_BG,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: -70,
    bottom: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBody: { paddingHorizontal: 16, paddingBottom: 20, marginTop: -6 },
  gallery: { height: GALLERY_H, backgroundColor: '#1E1E24' },
  galleryImage: { width: SCREEN_W, height: GALLERY_H },
  noPhoto: { justifyContent: 'center', alignItems: 'center' },
  dots: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 16, backgroundColor: colors.white },

  body: { padding: 16 },

  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeFree: { backgroundColor: '#E7F6EF' },
  badgeBooked: { backgroundColor: '#FEF3C7' },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 12 },

  title: {
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 29,
    color: colors.white,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  locRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 8 },
  locText: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.78)' },
  distance: { fontFamily: fonts.bodyBold, fontSize: 12, color: GOLD, marginTop: 4, marginLeft: 21 },

  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  priceLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.6)',
  },
  price: { fontFamily: fonts.display, fontSize: 26, color: GOLD, letterSpacing: -0.5, marginTop: 2 },
  perMonth: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  minPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.55)',
    backgroundColor: 'rgba(255,201,60,0.12)',
  },
  minText: { fontFamily: fonts.bodyBold, fontSize: 12, color: GOLD },

  section: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: -0.3,
    marginTop: 24,
    marginBottom: 12,
  },
  optional: { fontFamily: fonts.body, fontSize: 13, color: colors.textLight },

  durRow: { flexDirection: 'row' },
  durChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  durChipActive: { backgroundColor: HERO_BG, borderColor: HERO_BG },
  durNum: { fontFamily: fonts.display, fontSize: 18, color: colors.textDark, letterSpacing: -0.3 },
  durNumActive: { color: GOLD },
  durUnit: { fontFamily: fonts.body, fontSize: 11, color: colors.textLight, marginTop: 1 },
  durUnitActive: { color: 'rgba(255,255,255,0.75)' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  totalLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textDark },
  totalValue: { fontFamily: fonts.display, fontSize: 17, color: INK, letterSpacing: -0.3 },
  durHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textLight, marginTop: 8 },

  specGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  specCell: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  specIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: HERO_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textLight },
  specValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textDark, marginTop: 1 },

  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textDark },

  mapWrap: { height: 170, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  mapsText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.primary },

  field: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 104,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, lineHeight: 20, color: colors.textDark, padding: 0 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footPrice: { fontFamily: fonts.display, fontSize: 18, color: INK, letterSpacing: -0.3 },
  footSub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.textLight },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 14,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 15, color: INK },
});
