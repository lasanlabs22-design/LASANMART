import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function ReelPlayerScreen({ route, navigation }: any) {
  const { reel } = route.params;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const player = useVideoPlayer(reel.videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('statusChange', (payload: any) => {
      if (payload.status === 'readyToPlay') setStatus('ready');
      if (payload.status === 'error') setStatus('error');
    });
    return () => sub.remove();
  }, [player]);

  const togglePlayback = () => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
  };

  return (
    <View style={styles.container}>
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

      {/* Top + bottom scrims so white text stays readable over any frame */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={styles.scrimTop}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.scrimBottom}
      />

      {status === 'loading' && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading vibe…</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.errorIcon}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={26}
              color="rgba(255,255,255,0.9)"
            />
          </View>
          <Text style={styles.errorTitle}>Can't play this right now</Text>
          <Text style={styles.errorText}>
            Check your connection and try again
          </Text>
        </View>
      )}

      {isPaused && status !== 'error' && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.playBadge}>
            <MaterialCommunityIcons name="play" size={34} color={colors.white} />
          </View>
        </View>
      )}

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="close" size={22} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.brandPill}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>Lasan Vibes</Text>
          </View>

          <View style={styles.iconButtonGhost} />
        </View>

        {/* Bottom row: caption on the left, actions on the right */}
        <View style={styles.bottomRow}>
          <View style={styles.captionArea}>
            <View style={styles.userRow}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
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

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.action}
              onPress={() => setIsLiked((v) => !v)}
            >
              <MaterialCommunityIcons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? colors.primary : colors.white}
              />
              <Text style={styles.actionLabel}>{isLiked ? '1' : 'Like'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.action}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={26}
                color={colors.white}
              />
              <Text style={styles.actionLabel}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.action}>
              <MaterialCommunityIcons
                name="share-outline"
                size={28}
                color={colors.white}
              />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },

  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
  },

  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.white,
    marginBottom: 5,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  playBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonGhost: { width: 38 },
  brandPill: {
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 12,
  },
  captionArea: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
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

  actions: { alignItems: 'center', gap: 18, paddingBottom: 4 },
  action: { alignItems: 'center', gap: 3 },
  actionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
});