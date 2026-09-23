import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/googleAuth';
import { events } from '../lib/analytics';

const { width: W } = Dimensions.get('window');

type Props = { navigation: any };

export default function LoginScreen({ navigation }: Props) {
  const { setLoginMethod, updateProfile } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);

  /* ---------------- Animation ---------------- */

  /* Two slow glows behind the content, and one sheen across the primary
     button. Deliberately few moving parts — a sign-in screen should feel
     calm, and every looping animation keeps the GPU awake. */
  const glowOne = useRef(new Animated.Value(0)).current;
  const glowTwo = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (v: Animated.Value, ms: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: ms,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: ms,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    const loops = [drift(glowOne, 14000), drift(glowTwo, 18000)];

    // A light passes over the primary button now and then, so the main
    // action keeps catching the eye without demanding it
    loops.push(
      Animated.loop(
        Animated.sequence([
          Animated.delay(2600),
          Animated.timing(sheen, {
            toValue: 1,
            duration: 950,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sheen, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.push(
      Animated.timing(enter, {
        toValue: 1,
        duration: 900,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  /** Each block arrives a beat after the one above it */
  const rise = (order: number) => ({
    opacity: enter.interpolate({
      inputRange: [Math.min(0.18 * order, 0.6), Math.min(0.18 * order + 0.4, 1)],
      outputRange: [0, 1],
      extrapolate: 'clamp' as const,
    }),
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [18 + order * 6, 0],
        }),
      },
    ],
  });

  /* ---------------- Auth ---------------- */

  const handleGoogleSignIn = async () => {
    if (googleBusy) return;
    setGoogleBusy(true);

    try {
      const user = await signInWithGoogle();

      updateProfile({
        name: user.name,
        email: user.email,
        profilePictureUri: user.photo,
      });
      events.signedIn('google');
      setLoginMethod('google');
      navigation.replace('Main');
    } catch (err: any) {
      // Backing out isn't an error worth interrupting them for
      if (!err?.cancelled) {
        Alert.alert('Sign-in failed', err?.message || 'Please try again.');
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleSkip = () => {
    events.signedIn('guest');
    setLoginMethod('skip');
    navigation.replace('Main');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A0C18', '#12162B', '#0A0C18']}
        style={StyleSheet.absoluteFill}
      />

      <Glow
        value={glowOne}
        style={styles.glowTop}
        colors={['rgba(255,107,53,0.34)', 'rgba(255,107,53,0)']}
        from={{ x: -30, y: -20, scale: 1 }}
        to={{ x: 40, y: 40, scale: 1.18 }}
      />
      <Glow
        value={glowTwo}
        style={styles.glowBottom}
        colors={['rgba(46,107,232,0.28)', 'rgba(46,107,232,0)']}
        from={{ x: 30, y: 20, scale: 1.15 }}
        to={{ x: -40, y: -30, scale: 0.95 }}
      />

      {/* Keeps text legible wherever the glows drift */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(10,12,24,0.35)', 'rgba(10,12,24,0.9)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* ---------- Headline ---------- */}
          <Animated.View style={rise(0)}>
            <Text style={styles.brand}>LASAN MART</Text>

            <Text style={styles.headline}>
              Everything your business{'\n'}needs, in one place.
            </Text>

            <View style={styles.pillars}>
              <Text style={styles.pillar}>POST</Text>
              <View style={[styles.pillarDot, { backgroundColor: '#FF8A3D' }]} />
              <Text style={styles.pillar}>FIND</Text>
              <View style={[styles.pillarDot, { backgroundColor: '#2E6BE8' }]} />
              <Text style={styles.pillar}>GROW</Text>
            </View>
          </Animated.View>

          {/* ---------- Sign in ---------- */}
          <View style={styles.actions}>
            <Animated.View style={rise(1)}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('PhoneAuth')}
                style={styles.primaryWrap}
              >
                <LinearGradient
                  colors={['#FF8A3D', '#F2542D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primary}
                >
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.sheen,
                      {
                        transform: [
                          {
                            translateX: sheen.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-W * 0.6, W],
                            }),
                          },
                          { rotate: '18deg' },
                        ],
                      },
                    ]}
                  />
                  <Ionicons name="call" size={18} color="#fff" />
                  <Text style={styles.primaryText}>Continue with phone</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={rise(2)}>
              <TouchableOpacity
                style={styles.secondary}
                activeOpacity={0.85}
                onPress={handleGoogleSignIn}
                disabled={googleBusy}
              >
                {googleBusy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#fff" />
                    <Text style={styles.secondaryText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.dividerRow, rise(3)]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            <Animated.View style={rise(3)}>
              <TouchableOpacity
                style={styles.ghost}
                activeOpacity={0.7}
                onPress={handleSkip}
              >
                <Text style={styles.ghostText}>Explore without an account</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color="rgba(255,255,255,0.8)"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* ---------- Footer ----------
            For anyone coming back on a new phone or after a reinstall.
            Same OTP flow — the flag only changes the wording and tells
            the app to look for existing data afterwards. */}
        <Animated.View style={[styles.footer, rise(4)]}>
          <TouchableOpacity
            style={styles.returning}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PhoneAuth', { returning: true })}
          >
            <Text style={styles.returningText}>
              Already have an account?{' '}
              <Text style={styles.returningLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

/* ---------------- Sub-components ---------------- */

type Point = { x: number; y: number; scale: number };

/** A soft coloured light that drifts behind the content */
function Glow({
  value,
  style,
  colors,
  from,
  to,
}: {
  value: Animated.Value;
  style: any;
  colors: [string, string];
  from: Point;
  to: Point;
}) {
  const between = (a: number, b: number) =>
    value.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glow,
        style,
        {
          transform: [
            { translateX: between(from.x, to.x) },
            { translateY: between(from.y, to.y) },
            { scale: between(from.scale, to.scale) },
          ],
        },
      ]}
    >
      <LinearGradient colors={colors} style={styles.glowFill} />
    </Animated.View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C18' },
  safe: { flex: 1 },

  glow: { position: 'absolute' },
  glowFill: { flex: 1, borderRadius: 999 },
  glowTop: { width: 420, height: 420, top: -140, left: -110 },
  glowBottom: { width: 400, height: 400, bottom: -90, right: -130 },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },

  brand: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.55)',
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 39,
    color: '#fff',
    letterSpacing: -0.4,
    marginTop: 16,
  },
  pillars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  pillar: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.6)',
  },
  pillarDot: { width: 4, height: 4, borderRadius: 2 },

  actions: { marginTop: 54, gap: 12 },

  primaryWrap: {
    borderRadius: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: -40,
    width: 60,
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: '#fff',
  },

  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  secondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },

  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 15,
  },
  ghostText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  footer: { paddingHorizontal: 26, paddingBottom: 10 },
  returning: { alignItems: 'center', paddingVertical: 10 },
  returningText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  returningLink: {
    fontFamily: fonts.bodyBold,
    color: '#FF8A3D',
  },

  legal: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.32)',
    textAlign: 'center',
    paddingHorizontal: 30,
    paddingTop: 6,
    paddingBottom: 8,
  },
});
