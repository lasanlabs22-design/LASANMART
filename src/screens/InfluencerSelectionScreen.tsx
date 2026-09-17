import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { fetchApprovedInfluencers, ApprovedInfluencer } from '../api/client';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

/** A consistent colour per person, derived from their name */
const AVATAR_COLOURS = [
  '#5F259F',
  '#7B3FC4',
  '#12B3A0',
  '#C13584',
  '#3A86FF',
  '#E8AE00',
  '#0B8457',
  '#E63946',
];

function colourFor(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const formatPrice = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function InfluencerSelectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [all, setAll] = useState<ApprovedInfluencer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await fetchApprovedInfluencers();
      setAll(data.influencers);
      setCategories(data.categories);
    } catch (err: any) {
      setError(err?.message || 'Could not load creators.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return all
      .filter((i) => category === 'all' || i.category === category)
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          (i.instagram_id || '').toLowerCase().includes(q) ||
          (i.city || '').toLowerCase().includes(q)
      );
  }, [all, category, query]);

  const selected = all.filter((i) => selectedIds.includes(i.id));
  const total = selected.reduce((sum, i) => sum + (i.rate_per_post || 0), 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      Alert.alert('No selection', 'Please pick at least one creator.');
      return;
    }

    submit({
      type: 'influencer',
      title: `${selected.length} creator${selected.length > 1 ? 's' : ''}${
        total > 0 ? ` — ${formatPrice(total)}` : ''
      }`,
      description:
        'Interested in working with the creators selected in the app.',
      descriptionLabel: 'What they want',
      details: {
        creators: selected.map(
          (i) =>
            `${i.name}${i.instagram_id ? ` (@${i.instagram_id})` : ''}${
              i.rate_per_post ? ` — ${formatPrice(i.rate_per_post)}` : ''
            }`
        ),
        count: selected.length,
        estimatedTotal: total > 0 ? formatPrice(total) : 'On request',
      },
    });
  };

  const renderItem = ({ item }: { item: ApprovedInfluencer }) => {
    const isSelected = selectedIds.includes(item.id);
    const colour = colourFor(item.name);

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        activeOpacity={0.8}
        onPress={() => toggleSelect(item.id)}
      >
        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            style={[
              styles.avatarPhoto,
              isSelected && { borderColor: colors.primary },
            ]}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: `${colour}1A`,
                borderColor: isSelected ? colors.primary : `${colour}44`,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colour }]}>
              {initials(item.name)}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            {item.category && <Text style={styles.meta}>{item.category}</Text>}
            {item.followers && (
              <Text style={styles.meta}>· {item.followers} followers</Text>
            )}
          </View>

          <View style={styles.bottomRow}>
            {item.city && (
              <View style={styles.cityChip}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={10}
                  color={colors.textLight}
                />
                <Text style={styles.cityText}>{item.city}</Text>
              </View>
            )}

            {item.rate_per_post ? (
              <Text style={styles.price}>
                {formatPrice(item.rate_per_post)} per post
              </Text>
            ) : (
              <Text style={styles.priceAsk}>Rate on request</Text>
            )}
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && (
            <MaterialCommunityIcons
              name="check"
              size={15}
              color={colors.white}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color={colors.textDark}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Creators</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading…' : `${all.length} available`}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons
                name="magnify"
                size={18}
                color={colors.textLight}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, handle or city"
                placeholderTextColor={colors.textLight}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={17}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category filter — only shows categories we actually have */}
          {categories.length > 0 && (
            <View style={styles.filterWrap}>
              <FlatList
                data={['all', ...categories]}
                keyExtractor={(c) => c}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContent}
                renderItem={({ item }) => {
                  const active = item === category;
                  return (
                    <TouchableOpacity
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.8}
                      onPress={() => setCategory(item)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {item === 'all' ? 'All' : item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => load(true)}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons
                    name={error ? 'wifi-off' : 'account-search-outline'}
                    size={26}
                    color={colors.textLight}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  {error
                    ? "Couldn't load creators"
                    : all.length === 0
                      ? 'No creators yet'
                      : 'Nothing matches that'}
                </Text>

                <Text style={styles.emptyText}>
                  {error
                    ? 'Check your connection and pull down to try again.'
                    : all.length === 0
                      ? "We're building our creator network. Check back soon, or tell us what you need and we'll find someone."
                      : 'Try a different search or category.'}
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* Sticky footer */}
      {!loading && all.length > 0 && (
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <View>
            <Text style={styles.totalValue}>
              {selected.length > 0
                ? total > 0
                  ? formatPrice(total)
                  : `${selected.length} picked`
                : '—'}
            </Text>
            <Text style={styles.totalLabel}>
              {selected.length === 0
                ? 'Nothing selected'
                : `${selected.length} selected · estimate`}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (selected.length === 0 || busy) && styles.submitDisabled,
            ]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={busy || selected.length === 0}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Send Request</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={17}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ContactDetailsSheet {...sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
  },

  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 13,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },

  filterWrap: { paddingVertical: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  chipTextActive: { color: colors.white },

  listContent: { paddingHorizontal: 16, paddingBottom: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 9,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  avatarPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    backgroundColor: colors.surface,
  },

  info: { flex: 1 },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  metaRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 7,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cityText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.textLight,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textDark,
  },
  priceAsk: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 36 },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: -0.4,
    marginBottom: 7,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    textAlign: 'center',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 160,
    minHeight: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  submitDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
});
