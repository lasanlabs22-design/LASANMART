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
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Receives the details just saved, so the caller doesn't read stale state */
  onComplete: (details: { name: string; phone: string; email: string }) => void;
};

export default function ContactDetailsSheet({
  visible,
  onClose,
  onComplete,
}: Props) {
  const { profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone.replace(/\D/g, '').slice(-10));
  const [email, setEmail] = useState(profile.email);
  const [focused, setFocused] = useState<string | null>(null);

  const nameOk = name.trim().length > 1;
  const phoneOk = phone.length === 10;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isReady = nameOk && phoneOk && emailOk;

   const handleSave = () => {
    if (!isReady) return;

    const details = {
      name: name.trim(),
      phone,
      email: email.trim().toLowerCase(),
    };

    updateProfile(details);
    onComplete(details);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grabber} />

            <View style={styles.iconTile}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.title}>Almost there</Text>
            <Text style={styles.subtitle}>
              We just need a few details so our team can get back to you about
              this request.
            </Text>

            {/* Name */}
            <Text style={styles.label}>Your Name</Text>
            <View style={[styles.field, focused === 'name' && styles.fieldActive]}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color={focused === 'name' ? colors.primary : colors.textLight}
              />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
              {nameOk && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#12B3A0"
                />
              )}
            </View>

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.field, focused === 'phone' && styles.fieldActive]}>
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ''))}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
              />
              {phoneOk && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#12B3A0"
                />
              )}
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.field, focused === 'email' && styles.fieldActive]}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={focused === 'email' ? colors.primary : colors.textLight}
              />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
              {emailOk && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#12B3A0"
                />
              )}
            </View>

            <View style={styles.assureRow}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={colors.textLight}
              />
              <Text style={styles.assureText}>
                Saved on your device — you won't be asked again
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, !isReady && styles.saveDisabled]}
              activeOpacity={0.9}
              onPress={handleSave}
              disabled={!isReady}
            >
              <Text style={styles.saveText}>Save & Continue</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
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
    paddingBottom: 30,
    maxHeight: '90%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
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
  countryCode: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
  },
  divider: { width: 1, height: 20, backgroundColor: colors.border },
  assureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  assureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textLight,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  saveDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  cancelButton: { alignItems: 'center', paddingVertical: 14, marginTop: 2 },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});