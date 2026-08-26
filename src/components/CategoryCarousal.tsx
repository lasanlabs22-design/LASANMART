import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CategoryItem } from '../data/homeCategories';
import SectionHeading from './SectionHeading';
import { type } from '../theme/typography';

type Props = {
  title: string;
  data: CategoryItem[];
  onItemPress?: (item: CategoryItem) => void;
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

export default function CategoryCarousel({ title, data, onItemPress }: Props) {
  const columns = chunkIntoPairs(data);

  return (
    <View style={styles.section}>
          <SectionHeading title={title} />

      <FlatList
        data={columns}
        keyExtractor={(_, index) => `col-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: column }) => (
          <View style={styles.column}>
            {column.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => onItemPress?.(item)}
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
                    size={30}
                    color={item.color}
                  />
                </View>
                <Text style={styles.cardLabel} numberOfLines={2}>
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

const CARD_WIDTH = 88;

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
    gap: 14,
  },
  column: {
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH + 40,
    alignItems: 'center',
  },
  iconTile: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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