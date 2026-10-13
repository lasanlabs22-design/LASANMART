import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { reportReel, ApiError, ApiReel, ReportReason } from '../api/client';
import { hideReel, hideCreator, creatorKey } from '../lib/hiddenVibes';

const REASONS: { key: ReportReason; label: string; icon: string }[] = [
  { key: 'inappropriate', label: 'Offensive or inappropriate', icon: 'alert-octagon-outline' },
  { key: 'harassment', label: 'Harassment or hate', icon: 'account-cancel-outline' },
  { key: 'misleading', label: 'Misleading or a scam', icon: 'shield-alert-outline' },
  { key: 'spam', label: 'Spam or unrelated to business', icon: 'email-alert-outline' },
  { key: 'other', label: 'Something else', icon: 'dots-horizontal-circle-outline' },
];

/**
 * Lets anyone watching flag a reel. The team is emailed straight away,
 * and the reel leaves this person's feed whatever happens next.
 */
export default function ReportReelSheet({
  reel,
  onClose,
  onReported,
}: {
  /** The reel being reported — null keeps the sheet closed */
  reel: ApiReel | null;
  onClose: () => void;
  /** Tells the feed to drop it (and the creator, if they chose that) */
  onReported: (reel: ApiReel, hidCreator: boolean) => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [alsoHide, setAlsoHide] = useState(false);
  const [busy, setBusy] = useState(false);

  const canHideCreator = !!reel && !!creatorKey(reel);

  const reset = () => {
    setReason(null);
    setDetails('');
    setAlsoHide(false);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const submit = async () => {
    if (!reel || !reason || busy) return;
    setBusy(true);

    try {
      await reportReel(reel.id, reason, details.trim() || undefined);

      await hideReel(reel.id);
      const hidCreator = alsoHide && canHideCreator;
      if (hidCreator) await hideCreator(reel);

      reset();
      onReported(reel, hidCreator);

      Alert.alert(
        'Thanks for telling us',
        'Our team reviews every report, usually within a day. You won’t see this video again.'
      );
    } catch (err) {
      Alert.alert(
        'Could not send',
        err instanceof ApiError ? err.message : 'Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={!!reel}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={close} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Report this video</Text>
            <Text style={styles.subtitle}>
              Reports are private. The person who posted it won’t know it was
              you.
            </Text>

            {REASONS.map((r) => {
              const active = reason === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.option, active && styles.optionActive]}
                  activeOpacity={0.85}
                  onPress={() => setReason(r.key)}
                  disabled={busy}
                >
                  <MaterialCommunityIcons
                    name={r.icon as any}
                    size={19}
                    color={active ? colors.primary : colors.textLight}
                  />
                  <Text
                    style={[styles.optionText, active && styles.optionTextActive]}
                  >
                    {r.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={active ? 'radiobox-marked' : 'radiobox-blank'}
                    size={19}
                    color={active ? colors.primary : colors.border}
                  />
                </TouchableOpacity>
              );
            })}

            <TextInput
              style={styles.details}
              value={details}
              onChangeText={setDetails}
              placeholder="Anything else we should know? (optional)"
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              textAlignVertical="top"
              editable={!busy}
            />

            {canHideCreator && (
              <TouchableOpacity
                style={styles.hideRow}
                activeOpacity={0.8}
                onPress={() => setAlsoHide((v) => !v)}
                disabled={busy}
              >
                <MaterialCommunityIcons
                  name={alsoHide ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={21}
                  color={alsoHide ? colors.primary : colors.textLight}
                />
                <Text style={styles.hideText}>
                  Also stop showing me videos from {reel?.username}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submit, (!reason || busy) && styles.submitOff]}
              activeOpacity={0.9}
              onPress={submit}
              disabled={!reason || busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Send report</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancel} onPress={close} disabled={busy}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 16,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  optionTextActive: { color: colors.primary },

  details: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },

  hideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  hideText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textDark,
  },

  submit: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 14,
    minHeight: 54,
    marginTop: 8,
  },
  submitOff: { backgroundColor: colors.border },
  submitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});
