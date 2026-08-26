import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { reels, Reel } from '../data/reels';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LasanVibesScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [activeIndex, setActiveIndex] = useState(0);

  // Tab bar height must be subtracted so each reel fills exactly one page
  const TAB_BAR = 60 + insets.bottom;
  const ITEM_HEIGHT = SCREEN_HEIGHT - TAB_BAR;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelItem
        reel={item}
        height={ITEM_HEIGHT}
        isActive={isFocused && index === activeIndex}
        topInset={insets.top}
      />
    ),
    [activeIndex, isFocused, ITEM_HEIGHT, insets.top]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />
    </View>
  );
}

/* ---------- One reel ---------- */

function ReelItem({
  reel,
  height,
  isActive,
  topInset,
}: {
  reel: Reel;
  height: number;
  isActive: boolean;
  topInset: number;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const player = useVideoPlayer(reel.videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  // Play only while this reel is the visible one
  React.useEffect(() => {
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  React.useEffect(() => {
    const sub = player.addListener('statusChange', (payload: any) => {
      if (payload.status === 'readyToPlay') setStatus('ready');
      if (payload.status === 'error') setStatus('error');
    });
    return () => sub.remove();
  }, [player]);

  const togglePlayback = () => setIsPaused((v) => !v);

  return (
    <View style={[styles.page, { height }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlayback}
        style={StyleSheet.absoluteFillObject}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* Scrims */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        style={styles.scrimTop}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.scrimBottom}
      />

      {/* States */}
      {status === 'loading' && (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.errorIcon}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={24}
              color="rgba(255,255,255,0.9)"
            />
          </View>
          <Text style={styles.errorTitle}>Can't play this right now</Text>
          <Text style={styles.errorText}>Check your connection</Text>
        </View>
      )}

      {isPaused && status !== 'error' && (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.playBadge}>
            <MaterialCommunityIcons name="play" size={32} color={colors.white} />
          </View>
        </View>
      )}

      {/* Brand pill */}
      <View style={[styles.brandPill, { top: topInset + 12 }]}>
        <View style={styles.brandDot} />
        <Text style={styles.brandText}>Lasan Vibes</Text>
      </View>

      {/* Bottom content */}
      <View style={styles.bottomRow}>
        <View style={styles.captionArea}>
          <View style={styles.userRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <MaterialCommunityIcons
                  name="account"
                  size={15}
                  color={colors.white}
                />
              </View>
            </View>
            <Text style={styles.username}>{reel.username}</Text>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.caption} numberOfLines={3}>
            {reel.caption}
          </Text>
        </View>

        {/* Action rail */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => setIsLiked((v) => !v)}
          >
            <MaterialCommunityIcons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={30}
              color={isLiked ? colors.primary : colors.white}
            />
            <Text style={styles.actionLabel}>{isLiked ? '1' : 'Like'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={27}
              color={colors.white}
            />
            <Text style={styles.actionLabel}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <MaterialCommunityIcons
              name="share-outline"
              size={30}
              color={colors.white}
            />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  page: { width: SCREEN_WIDTH, backgroundColor: '#000' },
  video: { flex: 1 },

  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },

  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.white,
    marginBottom: 4,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
  },
  playBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  brandPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  brandText: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.white,
    letterSpacing: -0.2,
  },

  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  captionArea: { flex: 1 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatarRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.white,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  followText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.white,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.92)',
  },

  actions: { alignItems: 'center', gap: 20, paddingBottom: 4 },
  action: { alignItems: 'center', gap: 3 },
  actionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
});