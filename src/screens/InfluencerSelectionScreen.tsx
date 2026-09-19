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

/** Compact follower counts, the way Instagram itself shows them */
function formatCount(value?: string | null): string {
  if (!value) return '—';
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  if (!n) return value;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openProfile = (influencer: ApprovedInfluencer) => {
    navigation.navigate('InfluencerProfile', { influencer });
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      Alert.alert('No selection', 'Please pick at least one creator.');
      return;
    }

    submit({
      type: 'influencer',
      title: `${selected.length} creator${selected.length > 1 ? 's' : ''}`,
      description:
        'Interested in working with the creators selected in the app.',
      descriptionLabel: 'What they want',
      details: {
        creators: selected.map(
          (i) => `${i.name}${i.instagram_id ? ` (@${i.instagram_id})` : ''}`
        ),
        count: selected.length,
      },
    });
  };

  const renderItem = ({ item }: { item: ApprovedInfluencer }) => {
    const isSelected = selectedIds.includes(item.id);
    const colour = colourFor(item.name);

    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        {/* Tapping the identity opens the profile; the whole card
            toggling selection would fight with that tap target */}
        <TouchableOpacity
          style={styles.cardTop}
          activeOpacity={0.85}
          onPress={() => openProfile(item)}
        >
          {item.photo_url ? (
            <Image
              source={{ uri: item.photo_url }}
              style={styles.avatarPhoto}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: `${colour}1A` }]}>
              <Text style={[styles.avatarText, { color: colour }]}>
                {initials(item.name)}
              </Text>
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {/* Instagram-style verified tick */}
              <MaterialCommunityIcons
                name="check-decagram"
                size={15}
                color="#3897F0"
                style={styles.verifiedTick}
              />
            </View>
            {item.instagram_id && (
              <Text style={styles.handle} numberOfLines={1}>
                @{item.instagram_id}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.statValue}>{formatCount(item.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.statValue} numberOfLines={1}>
              {item.category || '—'}
            </Text>
            <Text style={styles.statLabel}>Posts about</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.statValue} numberOfLines={1}>
              {item.city || '—'}
            </Text>
            <Text style={styles.statLabel}>City</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.85}
            onPress={() => openProfile(item)}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && styles.selectButtonActive,
            ]}
            activeOpacity={0.85}
            onPress={() => toggleSelect(item.id)}
          >
            <MaterialCommunityIcons
              name={isSelected ? 'check-circle' : 'plus-circle-outline'}
              size={16}
              color={isSelected ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.selectButtonText,
                isSelected && styles.selectButtonTextActive,
              ]}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Explore Influencers</Text>
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
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 20 + (selected.length > 0 ? 90 : 0) },
            ]}
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

      {/* Sticky footer — only appears once something is selected */}
      {!loading && selected.length > 0 && (
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <View>
            <Text style={styles.totalValue}>{selected.length} picked</Text>
            <Text style={styles.totalLabel}>{selected.length} selected</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, busy && styles.submitDisabled]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={busy}
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

  listContent: { paddingHorizontal: 16, gap: 12 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  avatarPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    backgroundColor: colors.surface,
  },

  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedTick: { marginLeft: 4 },
  handle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: '#C13584',
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  statCell: { flex: 1, alignItems: 'center', paddingHorizontal: 4, gap: 3 },
  statValue: {
    fontFamily: fonts.displayMedium,
    fontSize: 13.5,
    color: colors.textDark,
  },
  statLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textLight },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  viewButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingVertical: 12,
  },
  selectButtonActive: {
    backgroundColor: colors.primary,
  },
  selectButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  selectButtonTextActive: { color: colors.white },

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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
