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
  Alert,
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
  onPhoneVerified,
  Confirmation,
  PhoneAuthError,
} from '../lib/phoneAuth';
import { fetchMyContact } from '../api/client';
import { events } from '../lib/analytics';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const RESEND_SECONDS = 45;
const CODE_LENGTH = 6;

export default function PhoneAuthScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { setLoginMethod, updateProfile, markProfileSaved } = useAuth();

  /* Sent from the "already have an account?" entry point, so the copy
     can say "welcome back" instead of asking like it's the first time */
  const returning = route?.params?.returning === true;

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const codeInput = useRef<TextInput>(null);

  // Typing the code and Android verifying it by itself can both
  // land — only the first one should carry on into the app
  const finished = useRef(false);

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
      const result = await sendOtp(phone, isResend);

      setConfirmation(result);
      setSecondsLeft(RESEND_SECONDS);

      if (!isResend) {
        setStep('code');
        setCode('');
      }
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

  const enterApp = () => {
    events.signedIn('phone');
    setLoginMethod('phone');
    navigation.replace('Main');
  };

  /* Everything after the number is proven */
  const finishSignIn = async () => {
    if (finished.current) return;
    finished.current = true;

    Keyboard.dismiss();
    setBusy(true);
    setError('');

    try {
      // The number is now verified — save it regardless of what
      // happens next
      updateProfile({ phone });

      // Bring back whatever we already hold against this number.
      // Returns null for a brand new number (or if the call fails).
      const contact = await fetchMyContact();

      if (contact) {
        updateProfile({
          name: contact.name || '',
          email: contact.email || '',
          companyName: contact.companyName || '',
          companyDescription: contact.companyDescription || '',
          sector: contact.sector || '',
          profilePictureUri: contact.photoUrl || null,
          companyLogoUri: contact.logoUrl || null,
        });
        markProfileSaved();
        enterApp();
        return;
      }

      // Verified, but we've never seen this number before.
      // Only worth flagging if they came in expecting an existing
      // account — a plain first-time sign-up should never see this.
      if (returning) {
        Alert.alert(
          'No account found',
          "We don't have anything saved against this number yet. Your number is verified, so you can carry on and set things up now.",
          [{ text: 'Continue', onPress: enterApp }]
        );
        return;
      }

      enterApp();
    } finally {
      setBusy(false);
    }
  };

  /* Android can read the SMS and sign in before the code is typed */
  useEffect(() => {
    if (!confirmation) return;
    return onPhoneVerified(confirmation, finishSignIn);
  }, [confirmation]);

  const handleVerify = async () => {
    if (!codeValid || !confirmation || busy) return;

    Keyboard.dismiss();
    setBusy(true);
    setError('');

    try {
      await verifyCode(confirmation, code);
    } catch (err: any) {
      setError(
        err instanceof PhoneAuthError
          ? err.message
          : 'That code did not work. Please try again.'
      );
      setCode('');
      setBusy(false);
      codeInput.current?.focus();
      return;
    }

    await finishSignIn();
  };

  const goBackToPhone = () => {
    setStep('phone');
    setCode('');
    setError('');
    setConfirmation(null);
  };

  return (
    <View style={styles.root}>
      <FocusAwareStatusBar style="light" />
      <LinearGradient
        colors={['#120823', '#241041', '#120823']}
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
                    color="#F2B705"
                  />
                </View>

                <Text style={styles.title}>
                  {returning ? 'Welcome back' : "What's your number?"}
                </Text>
                <Text style={styles.subtitle}>
                  {returning
                    ? "Enter the number you used before and we'll bring your requests back."
                    : "We'll text you a 6-digit code to confirm it's really you."}
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
                        ? ['#FFD24A', '#F2B705']
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
                    color="#F2B705"
                  />
                </View>

                <Text style={styles.title}>Enter the code</Text>
                {/* A real button — a tappable word inside a Text
                    doesn't fire on some Android phones */}
                <View style={styles.sentRow}>
                  <Text style={[styles.subtitle, { marginBottom: 0 }]}>
                    Sent to <Text style={styles.phoneEcho}>+91 {phone}</Text>
                  </Text>
                  <TouchableOpacity onPress={goBackToPhone} hitSlop={10}>
                    <Text style={styles.changeLink}>Change</Text>
                  </TouchableOpacity>
                </View>

                {/* Six boxes, with the one real input laid invisibly
                    over them. A tap has to land on the input itself —
                    focusing it from code is ignored on Android once it
                    thinks it's already focused, e.g. after the user
                    closed the keyboard or left to read the SMS. */}
                <View style={styles.boxRow}>
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

                  {/* Never disabled — a disabled input can't take
                      focus, which left the boxes dead after an error */}
                  <TextInput
                    ref={codeInput}
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    maxLength={CODE_LENGTH}
                    value={code}
                    onChangeText={(t) => {
                      setCode(t.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                    caretHidden
                  />
                </View>

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
                        ? ['#FFD24A', '#F2B705']
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
                      color="#F2B705"
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
  root: { flex: 1, backgroundColor: '#120823' },

  glow: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#8B5CF6',
    opacity: 0.18,
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
    backgroundColor: 'rgba(242,183,5,0.14)',
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
    fontSize: 14,
    color: '#F2B705',
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 10,
    marginBottom: 30,
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
    borderColor: 'rgba(242,183,5,0.7)',
    backgroundColor: 'rgba(242,183,5,0.1)',
  },
  boxActive: { borderColor: '#F2B705' },
  boxText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: '#fff',
  },
  // Covers the boxes; text this small always puts the cursor at the
  // end, wherever the row is tapped
  codeInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    color: 'transparent',
    fontSize: 1,
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
  // Dark on gold, the same as the login screen's main button
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#120823',
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
    color: '#F2B705',
  },
});
