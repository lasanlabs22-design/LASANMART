import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import {
  sendOtp,
  verifyCode,
  Confirmation,
  PhoneAuthError,
} from '../lib/phoneAuth';

const RESEND_SECONDS = 45;
const CODE_LENGTH = 6;

export default function PhoneAuthScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { setLoginMethod, updateProfile } = useAuth();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const codeInput = useRef<TextInput>(null);

  const phoneValid = phone.length === 10;
  const codeValid = code.length === CODE_LENGTH;

  /* Countdown before they can ask for another code */
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  /* Open the keyboard when the code step appears */
  useEffect(() => {
    if (step === 'code') {
      const t = setTimeout(() => codeInput.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSendOtp = async (isResend = false) => {
    if (!phoneValid || busy) return;

    setBusy(true);
    setError('');

    try {
      const result = await sendOtp(phone);

      setConfirmation(result);
      setSecondsLeft(RESEND_SECONDS);

      if (!isResend) {
        setStep('code');
        setCode('');
      }
    } catch (err: any) {
      // TEMPORARY — shows the raw Firebase error so we can diagnose.
      // Swap back to the friendly message once this is working.
      setError(`${err?.code || 'no-code'} — ${err?.message || 'no message'}`);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!codeValid || !confirmation || busy) return;

    Keyboard.dismiss();
    setBusy(true);
    setError('');

    try {
      await verifyCode(confirmation, code);

      // The number is now verified — save it and let them in
      updateProfile({ phone });
      setLoginMethod('phone');
      navigation.replace('Main');
    } catch (err: any) {
      // TEMPORARY — same as above
      setError(`${err?.code || 'no-code'} — ${err?.message || 'no message'}`);
      setCode('');
      codeInput.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setCode('');
    setError('');
    setConfirmation(null);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B0D1A', '#141830', '#0B0D1A']}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.glow} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                step === 'code' ? goBackToPhone() : navigation.goBack()
              }
              disabled={busy}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={21}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {step === 'phone' ? (
              /* ---------------- Number ---------------- */
              <>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons
                    name="cellphone-message"
                    size={26}
                    color="#FF8A3D"
                  />
                </View>

                <Text style={styles.title}>What's your number?</Text>
                <Text style={styles.subtitle}>
                  We'll text you a 6-digit code to confirm it's really you.
                </Text>

                <View style={[styles.field, phoneValid && styles.fieldValid]}>
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                    autoFocus
                    editable={!busy}
                  />
                  {phoneValid && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#12B3A0"
                    />
                  )}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  onPress={() => handleSendOtp()}
                  disabled={!phoneValid || busy}
                  activeOpacity={0.9}
                  style={styles.buttonWrap}
                >
                  <LinearGradient
                    colors={
                      phoneValid && !busy
                        ? ['#FF8A3D', '#F2542D']
                        : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.buttonText,
                          !phoneValid && { color: 'rgba(255,255,255,0.4)' },
                        ]}
                      >
                        Send code
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.legal}>Standard SMS rates may apply</Text>
              </>
            ) : (
              /* ---------------- Code ---------------- */
              <>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons
                    name="message-text-lock-outline"
                    size={26}
                    color="#FF8A3D"
                  />
                </View>

                <Text style={styles.title}>Enter the code</Text>
                <Text style={styles.subtitle}>
                  Sent to <Text style={styles.phoneEcho}>+91 {phone}</Text>
                  {'  '}
                  <Text style={styles.changeLink} onPress={goBackToPhone}>
                    Change
                  </Text>
                </Text>

                {/* Six boxes, backed by one hidden input */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => codeInput.current?.focus()}
                  style={styles.boxRow}
                >
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => {
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
                  maxLength={CODE_LENGTH}
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
                  onPress={handleVerify}
                  disabled={!codeValid || busy}
                  activeOpacity={0.9}
                  style={styles.buttonWrap}
                >
                  <LinearGradient
                    colors={
                      codeValid && !busy
                        ? ['#FF8A3D', '#F2542D']
                        : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.buttonText,
                          !codeValid && { color: 'rgba(255,255,255,0.4)' },
                        ]}
                      >
                        Verify
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend */}
                {secondsLeft > 0 ? (
                  <Text style={styles.resendWaiting}>
                    Resend code in {secondsLeft}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSendOtp(true)}
                    disabled={busy}
                    style={styles.resendButton}
                  >
                    <MaterialCommunityIcons
                      name="refresh"
                      size={15}
                      color="#FF8A3D"
                    />
                    <Text style={styles.resendText}>Send a new code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D1A' },

  glow: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#FF6B35',
    opacity: 0.16,
  },

  header: { paddingHorizontal: 14, paddingVertical: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: { flex: 1, paddingHorizontal: 26, paddingTop: 20 },

  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: '#fff',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 30,
  },
  phoneEcho: {
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.85)',
  },
  changeLink: {
    fontFamily: fonts.bodyBold,
    color: '#FF8A3D',
  },

  /* Phone step */
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    height: 60,
  },
  fieldValid: { borderColor: 'rgba(18,179,160,0.6)' },
  countryCode: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  phoneInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.5,
    padding: 0,
  },

  /* Code step */
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: 'rgba(255,138,61,0.7)',
    backgroundColor: 'rgba(255,107,53,0.12)',
  },
  boxActive: { borderColor: '#FF8A3D' },
  boxText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: '#fff',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  /* Shared */
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FF6B6B',
    marginTop: 14,
  },

  buttonWrap: { marginTop: 26 },
  button: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#fff',
  },

  legal: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 18,
  },

  resendWaiting: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginTop: 20,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  resendText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#FF8A3D',
  },
});
