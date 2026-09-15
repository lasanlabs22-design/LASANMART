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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { sendFeedback } from '../api/client';

const VERDICTS = [
  {
    key: 'good' as const,
    icon: 'emoticon-happy-outline',
    label: 'Went well',
    colour: '#0EA97A',
  },
  {
    key: 'okay' as const,
    icon: 'emoticon-neutral-outline',
    label: 'It was okay',
    colour: '#E8A400',
  },
  {
    key: 'poor' as const,
    icon: 'emoticon-sad-outline',
    label: 'Not good',
    colour: '#D93025',
  },
];

export default function FeedbackSheet({
  visible,
  requestId,
  onClose,
  onDone,
}: {
  visible: boolean;
  requestId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [verdict, setVerdict] = useState<'good' | 'okay' | 'poor' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!verdict || busy) return;

    setBusy(true);

    try {
      await sendFeedback(requestId, verdict, comment.trim() || undefined);
      setVerdict(null);
      setComment('');
      onDone();
    } catch (err: any) {
      Alert.alert('Could not send', err?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <Text style={styles.title}>How did it go?</Text>
          <Text style={styles.subtitle}>
            This only reaches our team — it helps us decide who to send your
            next job to.
          </Text>

          <View style={styles.row}>
            {VERDICTS.map((v) => {
              const active = verdict === v.key;

              return (
                <TouchableOpacity
                  key={v.key}
                  style={[
                    styles.option,
                    active && {
                      borderColor: v.colour,
                      backgroundColor: `${v.colour}14`,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setVerdict(active ? null : v.key)}
                >
                  <MaterialCommunityIcons
                    name={v.icon as any}
                    size={30}
                    color={active ? v.colour : colors.textLight}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      active && { color: v.colour, fontFamily: fonts.bodyBold },
                    ]}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.comment}
            value={comment}
            onChangeText={setComment}
            placeholder="Anything else we should know? (optional)"
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={500}
            textAlignVertical="top"
            editable={!busy}
          />

          <TouchableOpacity
            style={[styles.submit, !verdict && styles.submitOff]}
            activeOpacity={0.9}
            onPress={submit}
            disabled={!verdict || busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Send</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.later}
            onPress={onClose}
            disabled={busy}
          >
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginTop: 6,
    marginBottom: 22,
  },

  row: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textLight,
    textAlign: 'center',
  },

  comment: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginTop: 18,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.textDark,
  },

  submit: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  submitOff: { backgroundColor: colors.border },
  submitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },

  later: { alignItems: 'center', paddingVertical: 15 },
  laterText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});
