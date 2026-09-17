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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { requestVibesAccess } from '../api/client';

/** Quick starts, so nobody faces an empty box */
const PROMPTS = [
  'Show what we make',
  'Behind the scenes',
  'Our campaigns',
  'Customer stories',
  'New products',
];

export default function VibesAccessSheet({
  visible,
  onClose,
  onDone,
}: {
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 10 || busy) return;

    setBusy(true);

    try {
      await requestVibesAccess(reason.trim());
      setReason('');
      onDone();
    } catch (err: any) {
      Alert.alert('Could not send', err?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.close}
              onPress={onClose}
              disabled={busy}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={21}
                color={colors.textDark}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="video-plus-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.title}>Ask to post on Vibes</Text>
            <Text style={styles.subtitle}>
              Vibes is seen by everyone using Lasan Mart, so we check who posts.
              Tell us what you'd share and our team will come back to you.
            </Text>

            <Text style={styles.label}>What would you post?</Text>

            <View style={styles.chipWrap}>
              {PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.chip}
                  activeOpacity={0.85}
                  onPress={() =>
                    setReason((r) => (r ? `${r}, ${p.toLowerCase()}` : p))
                  }
                >
                  <Text style={styles.chipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.field}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. We run a bakery in Tirupati and want to show our daily specials and cake orders"
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              textAlignVertical="top"
              editable={!busy}
            />

            <TouchableOpacity
              style={[
                styles.submit,
                reason.trim().length < 10 && styles.submitOff,
              ]}
              activeOpacity={0.9}
              onPress={submit}
              disabled={reason.trim().length < 10 || busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.submitText}>Send request</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={17}
                    color={colors.white}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* What they're agreeing to, before they ask */}
            <View style={styles.rules}>
              <Text style={styles.rulesTitle}>If we say yes</Text>

              {[
                'Your videos are public to everyone on Lasan Mart',
                'Post your own work only — nothing copied',
                'Nothing offensive, misleading or unrelated to business',
                'We can remove a video or pause posting if needed',
              ].map((r) => (
                <View key={r} style={styles.ruleRow}>
                  <MaterialCommunityIcons
                    name="circle-small"
                    size={18}
                    color={colors.textLight}
                  />
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  topBar: { paddingHorizontal: 14, paddingVertical: 12 },
  close: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  body: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textDark,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textLight,
    marginBottom: 26,
  },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 10,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textLight,
  },

  field: {
    height: 130,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textDark,
  },

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 20,
    minHeight: 56,
  },
  submitOff: { backgroundColor: colors.border },
  submitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },

  rules: {
    marginTop: 30,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rulesTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  ruleText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textLight,
  },
});
