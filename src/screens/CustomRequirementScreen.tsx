import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const MIN_DESCRIPTION = 20;

export default function CustomRequirementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const isReady =
    title.trim().length > 3 && description.trim().length >= MIN_DESCRIPTION;

  const handleSubmit = () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Give it a short title and tell us a bit more about what you need.'
      );
      return;
    }

    submit({
      type: 'custom',
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Custom Requirement</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Intro card */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons
                name="hammer-wrench"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>Tell us what you need</Text>
              <Text style={styles.introText}>
                Share the details and our team will get back with a tailored
                plan, usually within 24 hours.
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.label}>What do you need?</Text>
          <View style={[styles.field, focused === 'title' && styles.fieldActive]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Custom CRM for my dealership"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Description */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Describe Your Requirement</Text>
            <Text
              style={[
                styles.counter,
                description.trim().length >= MIN_DESCRIPTION && styles.counterOk,
              ]}
            >
              {description.trim().length}/{MIN_DESCRIPTION}
            </Text>
          </View>
          <View
            style={[
              styles.field,
              styles.textAreaField,
              focused === 'desc' && styles.fieldActive,
            ]}
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us what you're looking for — features, who will use it, any systems it should connect to…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.assureRow}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={15}
              color={colors.textLight}
            />
            <Text style={styles.assureText}>
              Your details stay private and are used only to contact you
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isReady || busy) && styles.submitDisabled,
            ]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Request</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        <ContactDetailsSheet {...sheetProps} />
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

  content: { padding: 16, paddingBottom: 24 },

  introCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  introIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 3,
  },
  introText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
  counter: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 16,
  },
  counterOk: { color: '#12B3A0' },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 54,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  textAreaField: { height: 170, alignItems: 'flex-start', paddingVertical: 14 },
  textArea: { height: '100%', lineHeight: 20 },

  assureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 2,
  },
  assureText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    flex: 1,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
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
  submitDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
});