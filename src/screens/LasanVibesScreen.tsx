import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import {
  fetchReels,
  markReelViewed,
  toggleReelLike,
  updateReelCaption,
  deleteReel,
  ApiReel,
} from '../api/client';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LasanVibesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [reels, setReels] = useState<ApiReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Measure the real available height rather than calculating it.
   * The tab bar and the system nav bar vary between devices, so any
   * arithmetic here ends up slightly wrong somewhere — onLayout gives
   * us exactly what React Navigation handed this screen.
   */
  const [pageHeight, setPageHeight] = useState(SCREEN_HEIGHT);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await fetchReels();
      setReels(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load reels.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever the tab is opened, so new reels appear
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  /** Drop a deleted reel out of the feed without a full reload */
  const handleDeleted = useCallback((id: string) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /** Update a caption in place, so the change shows immediately */
  const handleCaptionChanged = useCallback((id: string, caption: string) => {
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, caption } : r)));
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setActiveIndex(index);

      const reel = viewableItems[0].item as ApiReel;
      if (reel?.id) markReelViewed(reel.id);
    }
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: ApiReel; index: number }) => (
      <ReelItem
        reel={item}
        height={pageHeight}
        isActive={isFocused && index === activeIndex}
        onDeleted={handleDeleted}
        onCaptionChanged={handleCaptionChanged}
      />
    ),
    [activeIndex, isFocused, pageHeight, handleDeleted, handleCaptionChanged]
  );

  /* ---------- States ---------- */

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (error || reels.length === 0) {
    return (
      <View style={[styles.centre, { paddingHorizontal: 40 }]}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name={error ? 'wifi-off' : 'video-off-outline'}
            size={28}
            color="rgba(255,255,255,0.65)"
          />
        </View>

        <Text style={styles.emptyTitle}>
          {error ? "Can't load Vibes right now" : 'No vibes yet'}
        </Text>
        <Text style={styles.emptyText}>
          {error
            ? 'Check your connection and try again.'
            : 'Check back soon — new reels are posted regularly.'}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.9}
          onPress={() => load(true)}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={16}
            color={colors.white}
          />
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
    >
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageHeight}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: pageHeight,
          offset: pageHeight * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.white}
          />
        }
      />

      {/* One pill for the whole screen, not one per reel */}
      <View
        style={[styles.brandPill, { top: insets.top + 12 }]}
        pointerEvents="none"
      >
        <View style={styles.brandDot} />
        <Text style={styles.brandText}>Lasan Vibes</Text>
      </View>

      {/* My Vibes */}
      <TouchableOpacity
        style={[styles.myVibesButton, { top: insets.top + 12 }]}
        activeOpacity={0.85}
        onPress={() => navigation.getParent()?.navigate('MyReels')}
      >
        <MaterialCommunityIcons
          name="account-box-outline"
          size={20}
          color={colors.white}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- One reel ---------- */

function ReelItem({
  reel,
  height,
  isActive,
  onDeleted,
  onCaptionChanged,
}: {
  reel: ApiReel;
  height: number;
  isActive: boolean;
  onDeleted: (id: string) => void;
  onCaptionChanged: (id: string, caption: string) => void;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isPaused, setIsPaused] = useState(false);

  // Kept locally so the heart responds instantly, before the server replies
  const [liked, setLiked] = useState(reel.liked_by_me);
  const [likeCount, setLikeCount] = useState(reel.like_count || 0);
  const [likeBusy, setLikeBusy] = useState(false);

  // Caption editing
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reel.caption || '');
  const [saving, setSaving] = useState(false);

  const player = useVideoPlayer(reel.video_url, (p) => {
    p.loop = true;
    p.muted = false;
  });

  // Only the visible reel plays — otherwise every player runs at once.
  // Editing also pauses it, so the video isn't running behind the sheet.
  useEffect(() => {
    if (isActive && !isPaused && !editing) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, editing, player]);

  useEffect(() => {
    const sub = player.addListener('statusChange', (payload: any) => {
      if (payload.status === 'readyToPlay') setStatus('ready');
      if (payload.status === 'error') setStatus('error');
    });
    return () => sub.remove();
  }, [player]);

  const handleLike = async () => {
    if (likeBusy) return;

    // Flip immediately — a like that waits for the network feels broken
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setLikeBusy(true);

    try {
      const result = await toggleReelLike(reel.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      // Put it back the way it was
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setLikeBusy(false);
    }
  };

  const openEditor = () => {
    setDraft(reel.caption || '');
    setEditing(true);
  };

  const saveCaption = async () => {
    if (saving) return;

    const next = draft.trim();
    setSaving(true);

    try {
      await updateReelCaption(reel.id, next);
      onCaptionChanged(reel.id, next);
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Could not save', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete this vibe?',
      'It will be removed for everyone. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReel(reel.id);
              onDeleted(reel.id);
            } catch (err: any) {
              Alert.alert(
                'Could not delete',
                err?.message || 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.page, { height }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsPaused((v) => !v)}
        style={StyleSheet.absoluteFillObject}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* Scrims so text stays readable */}
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

      {isPaused && status !== 'error' && !editing && (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.playBadge}>
            <MaterialCommunityIcons
              name="play"
              size={32}
              color={colors.white}
            />
          </View>
        </View>
      )}

      {/* Action rail — raised so it falls under the thumb */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? colors.primary : colors.white}
          />
          <Text style={styles.actionLabel}>
            {likeCount > 0 ? likeCount : 'Like'}
          </Text>
        </TouchableOpacity>

        <View style={styles.action}>
          <MaterialCommunityIcons
            name="eye-outline"
            size={26}
            color="rgba(255,255,255,0.85)"
          />
          <Text style={styles.actionLabel}>{reel.view_count}</Text>
        </View>

        {reel.is_mine && (
          <>
            <TouchableOpacity
              style={styles.action}
              onPress={openEditor}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={27}
                color={colors.white}
              />
              <Text style={styles.actionLabel}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.action}
              onPress={confirmDelete}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={27}
                color="#FF6B6B"
              />
              <Text style={[styles.actionLabel, { color: '#FF9B9B' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Caption */}
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

            {reel.source === 'team' && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color="#3A86FF"
              />
            )}

            {reel.is_mine && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>

          {reel.caption ? (
            <Text style={styles.caption} numberOfLines={3}>
              {reel.caption}
            </Text>
          ) : reel.is_mine ? (
            <TouchableOpacity onPress={openEditor}>
              <Text style={styles.addCaption}>Add a caption</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Caption editor */}
      <Modal visible={editing} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.editOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.editSheet}>
            <View style={styles.editGrabber} />

            <Text style={styles.editTitle}>Edit caption</Text>

            <TextInput
              style={styles.editInput}
              value={draft}
              onChangeText={setDraft}
              placeholder="What's happening in this vibe?"
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={300}
              autoFocus
              textAlignVertical="top"
              editable={!saving}
            />

            <Text style={styles.editCounter}>{draft.length}/300</Text>

            <TouchableOpacity
              style={[styles.editSave, saving && styles.editSaveDisabled]}
              activeOpacity={0.9}
              onPress={saveCaption}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.editSaveText}>Save changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editCancel}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.editCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centre: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  page: { width: SCREEN_WIDTH, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },

  scrimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 130 },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
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

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },

  brandPill: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
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

  myVibesButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Raised well clear of the bottom edge, so it falls under the thumb */
  actions: {
    position: 'absolute',
    right: 12,
    bottom: 180,
    alignItems: 'center',
    gap: 20,
  },
  action: { alignItems: 'center', gap: 4, minWidth: 46 },
  actionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },

  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingRight: 76,
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
  youBadge: {
    backgroundColor: 'rgba(255,107,53,0.9)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  youText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    color: colors.white,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.92)',
  },
  addCaption: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'underline',
  },

  /* Caption editor */
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  editSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  editGrabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  editTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  editInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    height: 110,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textDark,
  },
  editCounter: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 6,
  },
  editSave: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    minHeight: 54,
  },
  editSaveDisabled: { opacity: 0.6 },
  editSaveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  editCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 2 },
  editCancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});
