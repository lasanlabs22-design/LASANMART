import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { search, SearchResult, POPULAR_SEARCHES } from '../data/searchIndex';
import { plans } from '../data/plans';

/** '#FF6B35' -> soft tinted background */
function tint(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  // Open the keyboard straight away — they tapped search to type
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => search(query), [query]);
  const showResults = query.trim().length >= 2;

  const handlePress = (item: SearchResult) => {
    Keyboard.dismiss();
    const a = item.action;

    if (a.type === 'service') {
      navigation.replace('PostRequest', {
        service: a.service,
        category: a.category,
      });
    } else if (a.type === 'plan') {
      const plan = plans.find((p) => p.id === a.planId);
      if (plan) navigation.replace('PlanEnquiry', { plan });
    } else if (a.type === 'idea') {
      navigation.replace('BusinessIdeas');
    } else {
      navigation.replace('LasanTools');
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => handlePress(item)}
    >
      <View
        style={[
          styles.iconTile,
          {
            backgroundColor: tint(item.color, 0.12),
            borderColor: tint(item.color, 0.22),
          },
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={20}
          color={item.color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.sublabel}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="arrow-top-left"
        size={17}
        color={colors.textLight}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search bar */}
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

        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={19}
            color={colors.textLight}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Hoardings, Instagram, leads…"
            placeholderTextColor={colors.textLight}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showResults ? (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 24 + insets.bottom },
          ]}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>
                {results.length} result{results.length === 1 ? '' : 's'}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={28}
                  color={colors.textLight}
                />
              </View>
              <Text style={styles.emptyTitle}>No match for "{query}"</Text>
              <Text style={styles.emptyText}>
                We might still be able to help — describe what you need and our
                team will take a look.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.9}
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.replace('CustomRequirement');
                }}
              >
                <MaterialCommunityIcons
                  name="hammer-wrench"
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.emptyButtonText}>Post a custom request</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        /* Nothing typed yet — show what people usually look for */
        <View style={styles.suggestions}>
          <Text style={styles.suggestTitle}>POPULAR SEARCHES</Text>

          <View style={styles.chipWrap}>
            {POPULAR_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.chip}
                activeOpacity={0.8}
                onPress={() => setQuery(term)}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={13}
                  color={colors.textLight}
                />
                <Text style={styles.chipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.hintCard}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.hintText}>
              Search in your own words — "banner", "insta", "google maps" all
              work.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 46,
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },

  listContent: { padding: 16, gap: 8 },
  resultCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },

  suggestions: { padding: 16 },
  suggestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
  },

  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 14,
    marginTop: 26,
  },
  hintText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textDark,
  },

  empty: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
});