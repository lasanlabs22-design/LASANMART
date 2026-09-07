import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import SectionHeading from './SectionHeading';
import { ApiReel } from '../api/client';
import { VIBES_UNLOCKED } from '../config/features';

type Props = {
  data: ApiReel[];
  onReelPress: (reel: ApiReel) => void;
  onAddPress?: () => void;
  onSeeAllPress?: () => void;
};

const THUMB_WIDTH = 124;
const THUMB_HEIGHT = 186;

/**
 * The add tile, with a locked layer over it while posting is closed.
 * We still show the tile — people should know the feature is coming
 * rather than never seeing it at all.
 */
function AddTile({ onPress }: { onPress?: () => void }) {
  const sweep = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (VIBES_UNLOCKED) return;

    // A light passing across the tile
    const shine = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // The lock drifting, so it reads as alive rather than broken
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    shine.start();
    drift.start();

    return () => {
      shine.stop();
      drift.stop();
    };
  }, [sweep, float]);

  const sweepX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, THUMB_WIDTH + 40],
  });

  const lift = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  /* Open — the plain tile */
  if (VIBES_UNLOCKED) {
    return (
      <TouchableOpacity
        style={styles.addTile}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.addCircle}>
          <MaterialCommunityIcons
            name="plus"
            size={22}
            color={colors.primary}
          />
        </View>
        <Text style={styles.addLabel}>Post a{'\n'}Vibe</Text>
      </TouchableOpacity>
    );
  }

  /* Locked — still tappable, so they land on the explanation */
  return (
    <TouchableOpacity
      style={styles.addTileLocked}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#3B1E6E', '#1E1140']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sweep,
          { transform: [{ translateX: sweepX }, { rotate: '16deg' }] },
        ]}
      />

      <Animated.View
        style={[styles.lockCircle, { transform: [{ translateY: lift }] }]}
      >
        <MaterialCommunityIcons name="lock-outline" size={20} color="#FFC529" />
      </Animated.View>

      <Text style={styles.lockedLabel}>Post a{'\n'}Vibe</Text>

      <View style={styles.soonBadge}>
        <Text style={styles.soonText}>SOON</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ReelsRow({
  data,
  onReelPress,
  onAddPress,
  onSeeAllPress,
}: Props) {
  return (
    <View style={styles.section}>
      <SectionHeading
        title="Lasan Vibes"
        subtitle="Campaigns, shoots & stories from the ground"
        actionLabel="See all"
        onActionPress={onSeeAllPress}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<AddTile onPress={onAddPress} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.thumbWrapper}
            activeOpacity={0.85}
            onPress={() => onReelPress(item)}
          >
            {item.thumbnail_url ? (
              <Image
                source={{ uri: item.thumbnail_url }}
                style={styles.thumbImage}
              />
            ) : (
              <View style={[styles.thumbImage, styles.thumbFallback]}>
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={28}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            )}

            {/* Scrim so the text stays readable over any thumbnail */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.scrim}
              pointerEvents="none"
            />

            <View style={styles.playChip}>
              <MaterialCommunityIcons
                name="play"
                size={11}
                color={colors.white}
              />
              <Text style={styles.playChipText}>Reel</Text>
            </View>

            <View style={styles.overlay}>
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
              {item.caption && (
                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },

  listContent: { paddingHorizontal: 16, gap: 12 },

  addTile: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Locked version */
  addTileLocked: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sweep: {
    position: 'absolute',
    top: -40,
    left: 0,
    width: 44,
    height: 280,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  lockCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,197,41,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,197,41,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 16,
  },
  soonBadge: {
    backgroundColor: 'rgba(255,197,41,0.18)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 9,
  },
  soonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: '#FFC529',
    letterSpacing: 1,
  },

  thumbWrapper: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbFallback: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 110 },

  playChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  playChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8.5,
    color: colors.white,
    letterSpacing: 0.3,
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  username: {
    fontFamily: fonts.displayMedium,
    fontSize: 12,
    color: colors.white,
    marginBottom: 2,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
