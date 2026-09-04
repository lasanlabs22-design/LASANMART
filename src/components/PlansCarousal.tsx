import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { type, fonts } from '../theme/typography';
import SectionHeading from './SectionHeading';
import { Plan } from '../data/plans';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 56;
const CARD_SPACING = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const AUTO_SCROLL_DELAY = 4000;

type Props = {
  data: Plan[];
  onPlanPress?: (plan: Plan) => void;
};

export default function PlansCarousel({ data, onPlanPress }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const indexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % data.length;
      indexRef.current = next;
      setActiveIndex(next);
      flatListRef.current?.scrollToOffset({
        offset: next * SNAP_INTERVAL,
        animated: true,
      });
    }, AUTO_SCROLL_DELAY);

    return () => clearInterval(timer);
  }, [isInteracting, data.length]);

  return (
    <View style={styles.section}>
      <SectionHeading
        title="Most Popular Plans"
        subtitle="Bundled packages, billed quarterly"
      />

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScrollBeginDrag={() => setIsInteracting(true)}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
          indexRef.current = i;
          setActiveIndex(i);
          setIsInteracting(false);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPlanPress?.(item)}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Decorative light shapes */}
              <View pointerEvents="none" style={styles.orbLarge} />
              <View pointerEvents="none" style={styles.orbSmall} />
              <View pointerEvents="none" style={styles.sheen} />

              {/* Savings ribbon, folded corner */}
              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>{item.savings}</Text>
              </View>

              {/* Top: name + optional badge */}
              <View style={styles.topRow}>
                <Text style={styles.planTitle}>{item.title}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={11}
                      color="#FFD166"
                    />
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planSub}>{item.subtitle}</Text>

              {/* Tier meter — 3 segments, filled to this plan's level */}
              <View style={styles.meterRow}>
                {[1, 2, 3].map((n) => (
                  <View
                    key={n}
                    style={[
                      styles.meterSeg,
                      n <= item.tier && styles.meterSegFilled,
                    ]}
                  />
                ))}
                <Text style={styles.meterLabel}>Tier {item.tier}</Text>
              </View>

              {/* Price block */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.priceMeta}>
                  <Text style={styles.strike}>{item.strikePrice}</Text>
                  <Text style={styles.duration}>/ {item.duration}</Text>
                </View>
              </View>

              {/* Feature chips */}
              <View style={styles.chipRow}>
                {item.features.map((f) => (
                  <View key={f} style={styles.chip}>
                    <Text style={styles.chipText} numberOfLines={1}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>View details</Text>
                <View style={styles.ctaCircle}>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={colors.white}
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      {/* Pagination */}
      <View style={styles.dots}>
        {data.map((p, i) => (
          <View
            key={p.id}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },

  listContent: { paddingHorizontal: 16, gap: CARD_SPACING, paddingBottom: 4 },

  card: {
    width: CARD_WIDTH,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },

  orbLarge: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  sheen: {
    position: 'absolute',
    top: -40,
    left: -60,
    width: 90,
    height: 320,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '22deg' }],
  },

  ribbon: {
    position: 'absolute',
    top: 16,
    right: -30,
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 34,
    paddingVertical: 4,
    transform: [{ rotate: '38deg' }],
  },
  ribbonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 0.4,
  },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8.5,
    color: '#FFD166',
    letterSpacing: 0.5,
  },
  planSub: {
    ...type.sectionSub,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
  },
  meterSeg: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  meterSegFilled: { backgroundColor: 'rgba(255,255,255,0.95)' },
  meterLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.white,
    letterSpacing: -1.2,
  },
  priceMeta: { paddingBottom: 6 },
  strike: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },

  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.white,
  },
  ctaCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: { width: 20, backgroundColor: colors.primary },
});
