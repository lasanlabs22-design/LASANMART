import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { influencers, InfluencerProfile } from '../data/influencers';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

export default function InfluencerSelectionScreen({ navigation }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const insets = useSafeAreaInsets();

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(influencers.map((i) => i.category)))],
    []
  );

  const visible = useMemo(
    () =>
      activeCategory === 'All'
        ? influencers
        : influencers.filter((i) => i.category === activeCategory),
    [activeCategory]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one influencer.');
      return;
    }

    const chosen = influencers.filter((inf) => selectedIds.includes(inf.id));

    submit({
      type: 'influencer',
      title: `${chosen.length} influencer${chosen.length > 1 ? 's' : ''} selected`,
      details: {
        influencers: chosen.map(
          (i) => `${i.name} (${i.handle}, ${i.followers}, ${i.category})`
        ),
        count: chosen.length,
      },
    });
  };

  const renderItem = ({ item }: { item: InfluencerProfile }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        activeOpacity={0.8}
        onPress={() => toggleSelect(item.id)}
      >
        <View style={[styles.avatarRing, isSelected && styles.avatarRingActive]}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <MaterialCommunityIcons
              name="check-decagram"
              size={13}
              color="#3A86FF"
            />
          </View>

          <Text style={styles.handle} numberOfLines={1}>
            {item.handle}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.followRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={12}
                color={colors.textLight}
              />
              <Text style={styles.followText}>{item.followers}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={15} color={colors.white} />
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
          <Text style={styles.headerTitle}>Select Influencers</Text>
          <Text style={styles.headerSub}>
            {influencers.length} creators available
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Category filter */}
      <View style={styles.filterWrap}>
        <FlatList
          data={categories}
          keyExtractor={(c) => c}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item === activeCategory;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
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
      />

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <View>
          <Text style={styles.selectedCount}>{selectedIds.length} selected</Text>
          <Text style={styles.selectedHint}>
            {selectedIds.length === 0
              ? 'Pick one or more creators'
              : 'Tap a card to remove'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedIds.length === 0 || busy) && styles.submitDisabled,
          ]}
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Request</Text>
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

  filterWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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

  listContent: { padding: 16, paddingBottom: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarRingActive: { borderColor: colors.primary },
  avatar: { width: 52, height: 52, borderRadius: 26 },

  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  handle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
    marginBottom: 7,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryTag: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.textLight,
  },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  followText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
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
  selectedCount: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  selectedHint: {
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
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 168,
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