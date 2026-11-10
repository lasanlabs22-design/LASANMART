import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CategoryItem } from '../data/homeCategories';
import SectionHeading from './SectionHeading';
import { type } from '../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  data: CategoryItem[];
  onItemPress?: (item: CategoryItem) => void;
  /** Shows "View all" in the heading — the row only fits a few at once */
  onViewAll?: () => void;
};

// Groups a flat list into pairs: [1,2,3,4,5] -> [[1,2],[3,4],[5]]
function chunkIntoPairs(items: CategoryItem[]): CategoryItem[][] {
  const pairs: CategoryItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

// '#FF6B35' -> 'rgba(255,107,53,0.12)' for a soft tinted tile
function tint(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function CategoryCarousel({
  title,
  subtitle,
  data,
  onItemPress,
  onViewAll,
}: Props) {
  const columns = chunkIntoPairs(data);
  const hasArt = data.some((item) => !!item.image);

  return (
    <View style={styles.section}>
      <SectionHeading
        title={title}
        subtitle={subtitle}
        actionLabel={onViewAll ? 'View all ›' : undefined}
        onActionPress={onViewAll}
      />

      <FlatList
        data={columns}
        keyExtractor={(_, index) => `col-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, hasArt && styles.artListContent]}
        renderItem={({ item: column }) => (
          <View style={[styles.column, hasArt && styles.artColumn]}>
            {column.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, !!item.image && styles.artCard]}
                activeOpacity={0.7}
                onPress={() => onItemPress?.(item)}
              >
                {item.image ? (
                  // Product-shot style: the object stands on its own,
                  // no tile, so it reads like a real thing on the page
                  <Image source={item.image} style={styles.art} />
                ) : (
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
                      size={ICON_SIZE}
                      color={item.color}
                    />
                  </View>
                )}
                <Text
                  style={[styles.cardLabel, !!item.image && styles.artLabel]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

// Label column is wider than the tile: the longest single word,
// "Optimization", measures 70px in Jakarta Bold 11, so it never splits
const CARD_WIDTH = 76;
// Regular app-grid proportions, so 4+ services show per row
const TILE_SIZE = 60;
const ICON_SIZE = 26;
// Artwork cards: sized so 5 columns show on a ~400dp phone with the
// 6th peeking; "Optimization" in Jakarta Bold 10.5 is ~67px, one line at 70
const ART_CARD_WIDTH = 70;
const ART_SIZE = 64;
const ART_GAP = 6;

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: -0.3,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  artListContent: {
    gap: ART_GAP,
  },
  column: {
    gap: 14,
  },
  artColumn: {
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: TILE_SIZE + 36,
    alignItems: 'center',
  },
  iconTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  artCard: {
    width: ART_CARD_WIDTH,
    height: ART_SIZE + 34,
  },
  art: {
    width: ART_SIZE,
    height: ART_SIZE,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  artLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    height: 28,
  },
  cardLabel: {
    ...type.label,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
    includeFontPadding: false,
  },
});