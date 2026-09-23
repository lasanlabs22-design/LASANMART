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
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/googleAuth';
import { events } from '../lib/analytics';

const { width: W } = Dimensions.get('window');

/**
 * This screen keeps its own palette and type scale rather than the app
 * theme: it is the one dark screen in the product, and the brand reads
 * strongest here — deep purple with a single gold accent.
 */
const ink = {
  base: '#120823',
  mid: '#241041',
  purple: '#5F259F',
  purpleLit: '#8B5CF6',
  gold: '#F2B705',
  goldLit: '#FFD24A',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.62)',
  faint: 'rgba(255,255,255,0.38)',
  line: 'rgba(255,255,255,0.14)',
  surface: 'rgba(255,255,255,0.055)',
};

type Props = { navigation: any };

export default function LoginScreen({ navigation }: Props) {
  const { setLoginMethod, updateProfile } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);

  /* ---------------- Motion ---------------- */

  /* Few moving parts on purpose: two slow lights, one sheen, one rule
     that draws itself. A sign-in screen should feel composed, and every
     loop left running keeps the GPU awake behind it. */
  const lightOne = useRef(new Animated.Value(0)).current;
  const lightTwo = useRef(new Animated.Value(0)).current;
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

    const running = [
      drift(lightOne, 15000),
      drift(lightTwo, 19000),

      // A light crosses the main action every few seconds
      Animated.loop(
        Animated.sequence([
          Animated.delay(2800),
          Animated.timing(sheen, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sheen, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),

      Animated.timing(enter, {
        toValue: 1,
        duration: 950,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    running.forEach((a) => a.start());
    return () => running.forEach((a) => a.stop());
  }, []);

  /** Each block settles a beat after the one above it */
  const rise = (order: number) => {
    const start = Math.min(0.16 * order, 0.62);
    return {
      opacity: enter.interpolate({
        inputRange: [start, Math.min(start + 0.38, 1)],
        outputRange: [0, 1],
        extrapolate: 'clamp' as const,
      }),
      transform: [
        {
          translateY: enter.interpolate({
            inputRange: [0, 1],
            outputRange: [20 + order * 6, 0],
          }),
        },
      ],
    };
  };

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
        colors={[ink.base, ink.mid, ink.base]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Light
        value={lightOne}
        style={styles.lightTop}
        colors={['rgba(139,92,246,0.42)', 'rgba(139,92,246,0)']}
        from={{ x: -30, y: -20, scale: 1 }}
        to={{ x: 40, y: 45, scale: 1.16 }}
      />
      <Light
        value={lightTwo}
        style={styles.lightBottom}
        colors={['rgba(242,183,5,0.22)', 'rgba(242,183,5,0)']}
        from={{ x: 30, y: 25, scale: 1.12 }}
        to={{ x: -35, y: -25, scale: 0.94 }}
      />

      {/* Holds the text legible wherever the lights drift */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(18,8,35,0.3)', 'rgba(18,8,35,0.88)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* ---------- Statement ---------- */}
          <Animated.View style={rise(0)}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark} />
              <Text style={styles.brand}>LASAN MART</Text>
            </View>

            <Text style={styles.headline}>
              Everything your{'\n'}business needs,{'\n'}
              <Text style={styles.headlineAccent}>in one place.</Text>
            </Text>

            <Animated.View
              style={[
                styles.rule,
                {
                  transform: [
                    {
                      scaleX: enter.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />

            <View style={styles.pillars}>
              <Text style={styles.pillar}>POST</Text>
              <View style={styles.pillarDot} />
              <Text style={styles.pillar}>FIND</Text>
              <View style={styles.pillarDot} />
              <Text style={styles.pillar}>GROW</Text>
            </View>
          </Animated.View>

          {/* ---------- Ways in ---------- */}
          <View style={styles.actions}>
            <Animated.View style={rise(1)}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('PhoneAuth')}
                style={styles.primaryWrap}
              >
                <LinearGradient
                  colors={[ink.goldLit, ink.gold]}
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
                  <Ionicons name="call" size={18} color={ink.base} />
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
                  <ActivityIndicator size="small" color={ink.text} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color={ink.text} />
                    <Text style={styles.secondaryText}>
                      Continue with Google
                    </Text>
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
                  color={ink.muted}
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

/** A soft coloured light drifting behind the content */
function Light({
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
        styles.light,
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
      <LinearGradient colors={colors} style={styles.lightFill} />
    </Animated.View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ink.base },
  safe: { flex: 1 },

  light: { position: 'absolute' },
  lightFill: { flex: 1, borderRadius: 999 },
  lightTop: { width: 430, height: 430, top: -150, left: -120 },
  lightBottom: { width: 400, height: 400, bottom: -100, right: -130 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: ink.gold,
  },
  brand: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 4,
    color: ink.muted,
  },

  headline: {
    fontSize: 33,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: ink.text,
    marginTop: 20,
  },
  headlineAccent: { color: ink.gold },

  rule: {
    width: 64,
    height: 2,
    borderRadius: 2,
    backgroundColor: ink.purpleLit,
    marginTop: 22,
  },

  pillars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  pillar: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: ink.faint,
  },
  pillarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ink.purpleLit,
  },

  actions: { marginTop: 52, gap: 12 },

  primaryWrap: {
    borderRadius: 14,
    shadowColor: ink.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
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
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  primaryText: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: ink.base,
  },

  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ink.line,
    backgroundColor: ink.surface,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: ink.text,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: ink.line },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: ink.faint,
  },

  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 15,
  },
  ghostText: { fontSize: 14, fontWeight: '600', color: ink.muted },

  footer: { paddingHorizontal: 28, paddingBottom: 10 },
  returning: { alignItems: 'center', paddingVertical: 10 },
  returningText: { fontSize: 13, color: ink.muted },
  returningLink: { fontWeight: '700', color: ink.gold },

  legal: {
    fontSize: 11,
    lineHeight: 16,
    color: ink.faint,
    textAlign: 'center',
    paddingHorizontal: 30,
    paddingTop: 6,
    paddingBottom: 8,
  },
});
