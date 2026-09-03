import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { uploadVideo, postReel, ApiError } from '../api/client';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const MAX_SECONDS = 90;
const MAX_MB = 60;

export default function AddReelScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { hasContactDetails } = useAuth();

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Preview player — only created once a video is chosen
  const player = useVideoPlayer(videoUri || '', (p) => {
    p.loop = true;
    p.muted = true;
    if (videoUri) p.play();
  });

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow access to your videos so you can pick one to post.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: MAX_SECONDS,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const sizeMb = (asset.fileSize || 0) / 1024 / 1024;

    if (sizeMb > MAX_MB) {
      Alert.alert(
        'Video too large',
        `Please pick something under ${MAX_MB}MB. This one is ${sizeMb.toFixed(0)}MB.`
      );
      return;
    }

    setVideoUri(asset.uri);
    setFileSizeMb(sizeMb);
  };

  const doUpload = async () => {
    if (!videoUri) return;

    setBusy(true);
    setProgress(0);

    try {
      const uploaded = await uploadVideo(videoUri, setProgress);

      await postReel({
        videoUrl: uploaded.videoUrl,
        thumbnailUrl: uploaded.thumbnailUrl,
        publicId: uploaded.publicId,
        duration: uploaded.duration,
        caption: caption.trim() || undefined,
      });

      Alert.alert(
        'Posted',
        'Your vibe is live. Everyone using Lasan Mart can see it now.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.';
      Alert.alert('Could not post', message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handlePost = () => {
    // We need a name and phone to attribute the reel
    if (!hasContactDetails) {
      setSheetVisible(true);
      return;
    }
    doUpload();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={busy}
          >
            <MaterialCommunityIcons
              name="close"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Vibe</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.content}>
          {!videoUri ? (
            /* ---------- Nothing chosen yet ---------- */
            <TouchableOpacity
              style={styles.dropZone}
              activeOpacity={0.85}
              onPress={pickVideo}
            >
              <View style={styles.dropIcon}>
                <MaterialCommunityIcons
                  name="video-plus-outline"
                  size={30}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.dropTitle}>Choose a video</Text>
              <Text style={styles.dropText}>
                Up to {MAX_SECONDS} seconds · under {MAX_MB}MB
              </Text>

              <View style={styles.pickButton}>
                <MaterialCommunityIcons
                  name="folder-multiple-image"
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.pickButtonText}>Open gallery</Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* ---------- Preview and caption ---------- */
            <View style={styles.previewArea}>
              <View style={styles.previewRow}>
                <View style={styles.videoWrap}>
                  <VideoView
                    style={styles.video}
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                  />
                </View>

                <View style={styles.previewSide}>
                  <Text style={styles.previewLabel}>YOUR VIDEO</Text>
                  <Text style={styles.previewSize}>
                    {fileSizeMb.toFixed(1)} MB
                  </Text>

                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={pickVideo}
                    disabled={busy}
                  >
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Caption</Text>
              <View style={[styles.field, focused && styles.fieldActive]}>
                <TextInput
                  style={styles.input}
                  placeholder="What's happening in this vibe?"
                  placeholderTextColor={colors.textLight}
                  value={caption}
                  onChangeText={setCaption}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  multiline
                  maxLength={300}
                  editable={!busy}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.counter}>{caption.length}/300</Text>

              <View style={styles.noticeRow}>
                <MaterialCommunityIcons
                  name="earth"
                  size={15}
                  color={colors.textLight}
                />
                <Text style={styles.noticeText}>
                  Everyone using Lasan Mart will be able to see this
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        {videoUri && (
          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            {busy && (
              <View style={styles.progressWrap}>
                <View style={styles.progressTop}>
                  <Text style={styles.progressLabel}>Uploading…</Text>
                  <Text style={styles.progressValue}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.postButton, busy && styles.postDisabled]}
              activeOpacity={0.9}
              onPress={handlePost}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.postText}>Post Vibe</Text>
                  <MaterialCommunityIcons
                    name="send-outline"
                    size={17}
                    color={colors.white}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <ContactDetailsSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onComplete={() => {
            setSheetVisible(false);
            doUpload();
          }}
        />
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.3,
  },

  content: { flex: 1, padding: 16 },

  /* Empty state */
  dropZone: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  dropIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.textDark,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  dropText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 22,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pickButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },

  /* Preview */
  previewArea: { flex: 1 },
  previewRow: { flexDirection: 'row', gap: 14, marginBottom: 22 },
  videoWrap: {
    width: 110,
    height: 165,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: { flex: 1 },
  previewSide: { flex: 1, paddingTop: 4 },
  previewLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textLight,
    marginBottom: 5,
  },
  previewSize: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 14,
  },
  changeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 8,
  },
  field: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    height: 110,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textDark,
    padding: 0,
  },
  counter: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 6,
  },

  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textLight,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  progressWrap: { marginBottom: 12 },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
  },
  progressValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  postDisabled: { opacity: 0.6 },
  postText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
});