import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import {
  sendOtp,
  verifyCode,
  hasVerifiedPhone,
  verifiedPhoneNumber,
  Confirmation,
  PhoneAuthError,
} from '../lib/phoneAuth';

const RESEND_SECONDS = 45;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Called once details are saved and the number is verified */
  onComplete: (details: { name: string; phone: string; email: string }) => void;
};

export default function ContactDetailsSheet({
  visible,
  onClose,
  onComplete,
}: Props) {
  const { profile, updateProfile } = useAuth();

  const alreadyVerified = hasVerifiedPhone();
  const knownPhone = verifiedPhoneNumber();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(
    knownPhone || profile.phone.replace(/\D/g, '').slice(-10)
  );

  /** 'details' collects name/email/phone, 'code' verifies the OTP */
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);

  const codeInput = useRef<TextInput>(null);

  const nameOk = name.trim().length > 1;
  const phoneOk = phone.length === 10;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const detailsOk = nameOk && phoneOk && emailOk;

  /* Resend countdown */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  /* Focus the code box when that step appears */
  useEffect(() => {
    if (step === 'code') {
      const t = setTimeout(() => codeInput.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  const finish = () => {
    const details = {
      name: name.trim(),
      phone,
      email: email.trim().toLowerCase(),
    };

    updateProfile(details);
    onComplete(details);
  };

  const handleContinue = async () => {
    if (!detailsOk || busy) return;

    // Already verified this number? Nothing more to prove.
    if (alreadyVerified && phone === knownPhone) {
      finish();
      return;
    }

    setBusy(true);
    setError('');

    try {
      const result = await sendOtp(phone);
      setConfirmation(result);
      setSecondsLeft(RESEND_SECONDS);
      setStep('code');
      setCode('');
    } catch (err: any) {
      setError(
        err instanceof PhoneAuthError
          ? err.message
          : 'Could not send the code. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || !confirmation || busy) return;

    Keyboard.dismiss();
    setBusy(true);
    setError('');

    try {
      await verifyCode(confirmation, code);
      finish();
    } catch (err: any) {
      setError(
        err instanceof PhoneAuthError
          ? err.message
          : 'That code did not work. Please try again.'
      );
      setCode('');
      codeInput.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (secondsLeft > 0 || busy) return;

    setBusy(true);
    setError('');

    try {
      const result = await sendOtp(phone);
      setConfirmation(result);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err: any) {
      setError(
        err instanceof PhoneAuthError ? err.message : 'Could not resend.'
      );
    } finally {
      setBusy(false);
    }
  };

  const backToDetails = () => {
    setStep('details');
    setCode('');
    setError('');
    setConfirmation(null);
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

            {step === 'details' ? (
              /* ---------------- Details ---------------- */
              <>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.title}>Almost there</Text>
                <Text style={styles.subtitle}>
                  {alreadyVerified
                    ? 'We just need a couple of details so our team can reach you.'
                    : "We'll verify your number so only you can see your requests."}
                </Text>

                {/* Name */}
                <Text style={styles.label}>Your Name</Text>
                <View
                  style={[
                    styles.field,
                    focused === 'name' && styles.fieldActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={18}
                    color={
                      focused === 'name' ? colors.primary : colors.textLight
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor={colors.textLight}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    editable={!busy}
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
                <View
                  style={[
                    styles.field,
                    focused === 'phone' && styles.fieldActive,
                    alreadyVerified &&
                      phone === knownPhone &&
                      styles.fieldLocked,
                  ]}
                >
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
                    editable={!busy}
                  />
                  {alreadyVerified && phone === knownPhone ? (
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={18}
                      color="#12B3A0"
                    />
                  ) : (
                    phoneOk && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color="#12B3A0"
                      />
                    )
                  )}
                </View>

                {/* Email */}
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.field,
                    focused === 'email' && styles.fieldActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color={
                      focused === 'email' ? colors.primary : colors.textLight
                    }
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
                    editable={!busy}
                  />
                  {emailOk && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#12B3A0"
                    />
                  )}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.assureRow}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={14}
                    color={colors.textLight}
                  />
                  <Text style={styles.assureText}>
                    {alreadyVerified && phone === knownPhone
                      ? 'Your number is already verified'
                      : "We'll text you a 6-digit code to confirm your number"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!detailsOk || busy) && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.9}
                  onPress={handleContinue}
                  disabled={!detailsOk || busy}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryText}>
                        {alreadyVerified && phone === knownPhone
                          ? 'Save & Continue'
                          : 'Send verification code'}
                      </Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={17}
                        color={colors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={busy}
                >
                  <Text style={styles.cancelText}>Not now</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ---------------- Code ---------------- */
              <>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons
                    name="message-text-lock-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.title}>Enter the code</Text>
                <Text style={styles.subtitle}>
                  Sent to <Text style={styles.phoneEcho}>+91 {phone}</Text>{' '}
                  <Text style={styles.changeLink} onPress={backToDetails}>
                    Change
                  </Text>
                </Text>

                {/* Six boxes over one hidden input */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => codeInput.current?.focus()}
                  style={styles.boxRow}
                >
                  {Array.from({ length: 6 }).map((_, i) => {
                    const digit = code[i];
                    const isCurrent = i === code.length;

                    return (
                      <View
                        key={i}
                        style={[
                          styles.box,
                          digit ? styles.boxFilled : null,
                          isCurrent ? styles.boxActive : null,
                        ]}
                      >
                        <Text style={styles.boxText}>{digit || ''}</Text>
                      </View>
                    );
                  })}
                </TouchableOpacity>

                <TextInput
                  ref={codeInput}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={(t) => {
                    setCode(t.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  editable={!busy}
                  caretHidden
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (code.length !== 6 || busy) && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.9}
                  onPress={handleVerify}
                  disabled={code.length !== 6 || busy}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryText}>Verify & Continue</Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={17}
                        color={colors.white}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {secondsLeft > 0 ? (
                  <Text style={styles.resendWaiting}>
                    Resend code in {secondsLeft}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={resend}
                    disabled={busy}
                  >
                    <MaterialCommunityIcons
                      name="refresh"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.resendText}>Send a new code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
  phoneEcho: {
    fontFamily: fonts.bodyBold,
    color: colors.textDark,
  },
  changeLink: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
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
  fieldLocked: { borderColor: 'rgba(18,179,160,0.5)' },
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

  /* Code boxes */
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
  },
  box: {
    flex: 1,
    height: 54,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  boxActive: { borderColor: colors.primary },
  boxText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },

  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#D93025',
    marginTop: 12,
  },

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

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 22,
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
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

  resendWaiting: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 18,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
  },
  resendText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.primary,
  },
});
