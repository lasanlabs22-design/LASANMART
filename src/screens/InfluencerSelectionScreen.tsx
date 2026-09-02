import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import {
  influencers,
  priceBands,
  formatPrice,
  InfluencerProfile,
} from '../data/influencers';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

/** A consistent colour per person, from their name */
const AVATAR_COLOURS = [
  '#FF6B35',
  '#7B2FF7',
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

export default function InfluencerSelectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [band, setBand] = useState('all');
  const [query, setQuery] = useState('');

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const visible = useMemo(() => {
    const activeBand = priceBands.find((b) => b.key === band)!;
    const q = query.trim().toLowerCase();

    return influencers
      .filter((i) => i.price >= activeBand.min && i.price <= activeBand.max)
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          i.handle.toLowerCase().includes(q)
      )
      .sort((a, b) => a.price - b.price);
  }, [band, query]);

  const selected = influencers.filter((i) => selectedIds.includes(i.id));
  const total = selected.reduce((sum, i) => sum + i.price, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      Alert.alert('No Selection', 'Please select at least one creator.');
      return;
    }

    submit({
      type: 'influencer',
      title: `${selected.length} creator${selected.length > 1 ? 's' : ''} — ${formatPrice(total)}`,
      details: {
        creators: selected.map(
          (i) => `${i.name} (${i.handle}) — ${formatPrice(i.price)}`
        ),
        count: selected.length,
        estimatedTotal: formatPrice(total),
      },
    });
  };

  const renderItem = ({ item }: { item: InfluencerProfile }) => {
    const isSelected = selectedIds.includes(item.id);
    const colour = colourFor(item.name);

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        activeOpacity={0.8}
        onPress={() => toggleSelect(item.id)}
      >
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

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL(item.profileUrl)}
            hitSlop={6}
          >
            <Text style={styles.handle} numberOfLines={1}>
              {item.handle}{' '}
              <MaterialCommunityIcons name="open-in-new" size={10} />
            </Text>
          </TouchableOpacity>

          <Text style={styles.price}>{formatPrice(item.price)} per post</Text>
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
          <Text style={styles.headerSub}>{influencers.length} available</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

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
            placeholder="Search by name or handle"
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

      {/* Budget filter */}
      <View style={styles.filterWrap}>
        <FlatList
          data={priceBands}
          keyExtractor={(b) => b.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item.key === band;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setBand(item.key)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={26}
              color={colors.textLight}
            />
            <Text style={styles.emptyText}>No creators match that</Text>
          </View>
        }
      />

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <View>
          <Text style={styles.totalValue}>
            {selected.length > 0 ? formatPrice(total) : '—'}
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

      <ContactDetailsSheet {...sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

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
    width: 48,
    height: 48,
    borderRadius: 24,
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

  info: { flex: 1 },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  handle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#C13584',
    marginTop: 1,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textDark,
    marginTop: 5,
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

  empty: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textLight,
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
