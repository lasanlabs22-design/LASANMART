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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const MIN_DESCRIPTION = 20;

export default function CustomRequirementScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const isPhoneValid = phone.length === 10;
  const isReady =
    name.trim().length > 1 &&
    isPhoneValid &&
    description.trim().length >= MIN_DESCRIPTION;

  const handleSubmit = () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Please add your name, a 10-digit phone number, and a bit more detail about what you need.'
      );
      return;
    }

    // POC stub — replace with real API call once backend is ready:
    // await api.post('/custom-requirements', { name, phone, description });
    console.log('Custom requirement submitted:', { name, phone, description });

    Alert.alert(
      'Request Submitted',
      'Thanks! Our team will reach out to you shortly.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
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

          {/* Name */}
          <Text style={styles.label}>Your Name</Text>
          <View
            style={[styles.field, focused === 'name' && styles.fieldFocused]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={19}
              color={focused === 'name' ? colors.primary : colors.textLight}
            />
            <TextInput
              style={styles.input}
              placeholder="Ravi Kumar"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <View
            style={[styles.field, focused === 'phone' && styles.fieldFocused]}
          >
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.fieldDivider} />
            <TextInput
              style={[styles.input, styles.inputPhone]}
              placeholder="9876543210"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
            />
            {isPhoneValid && (
              <MaterialCommunityIcons
                name="check-circle"
                size={19}
                color="#12B3A0"
              />
            )}
          </View>

          {/* Description */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Describe Your Requirement</Text>
            <Text
              style={[
                styles.counter,
                description.trim().length >= MIN_DESCRIPTION &&
                  styles.counterOk,
              ]}
            >
              {description.trim().length}/{MIN_DESCRIPTION}
            </Text>
          </View>
          <View
            style={[
              styles.field,
              styles.textAreaField,
              focused === 'desc' && styles.fieldFocused,
            ]}
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. a custom CRM for my dealership, a booking app feature, a WhatsApp integration…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Reassurance */}
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

        {/* Sticky footer */}
        <View
          style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}
        >
          <TouchableOpacity
            style={[styles.submitButton, !isReady && styles.submitDisabled]}
            activeOpacity={0.9}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Request</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
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
    marginBottom: 22,
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
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  inputPhone: { letterSpacing: 0.8 },
  countryCode: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
  },
  fieldDivider: { width: 1, height: 20, backgroundColor: colors.border },

  textAreaField: { height: 150, alignItems: 'flex-start', paddingVertical: 14 },
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