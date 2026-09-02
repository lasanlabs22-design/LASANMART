import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import LasanLogo from '../components/LasanLogo';
import { signInWithGoogle } from '../lib/googleAuth';

const { width: W, height: H } = Dimensions.get('window');

/* Floating particles — position, size and timing baked in */
const PARTICLES = Array.from({ length: 14 }, () => ({
  x: Math.random() * W,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 6000,
  duration: 9000 + Math.random() * 7000,
  drift: (Math.random() - 0.5) * 60,
}));

type Props = { navigation: any };

export default function LoginScreen({ navigation }: Props) {
  const { setLoginMethod, updateProfile } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);

  /* ---------------- Animations ---------------- */
  const aurora1 = useRef(new Animated.Value(0)).current;
  const aurora2 = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const logoIn = useRef(new Animated.Value(0)).current;

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

    drift(aurora1, 12000).start();
    drift(aurora2, 16000).start();

    // Shimmer sweep across the primary button
    Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.spring(logoIn, {
      toValue: 1,
      friction: 6,
      tension: 45,
      useNativeDriver: true,
    }).start();

    Animated.timing(enter, {
      toValue: 1,
      duration: 1100,
      delay: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const fadeUp = (offset: number) => ({
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [30 + offset, 0],
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

  const handleAppleSignIn = () => {
    updateProfile({ name: 'Rahul Sharma', email: 'rahul.sharma@icloud.com' });
    setLoginMethod('apple');
    navigation.replace('Main');
  };

  const handleSkip = () => {
    setLoginMethod('skip');
    navigation.replace('Main');
  };

  return (
    <View style={styles.root}>
      {/* ---------- Cinematic background ---------- */}
      <LinearGradient
        colors={['#0B0D1A', '#141830', '#0B0D1A']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.aurora,
          styles.auroraOne,
          {
            transform: [
              {
                translateX: aurora1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-40, 50],
                }),
              },
              {
                translateY: aurora1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 70],
                }),
              },
              {
                scale: aurora1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.25],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,107,53,0.55)', 'rgba(255,107,53,0)']}
          style={styles.auroraFill}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.aurora,
          styles.auroraTwo,
          {
            transform: [
              {
                translateX: aurora2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, -60],
                }),
              },
              {
                translateY: aurora2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, -50],
                }),
              },
              {
                scale: aurora2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.2, 0.95],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(46,107,232,0.45)', 'rgba(46,107,232,0)']}
          style={styles.auroraFill}
        />
      </Animated.View>

      {/* Rising particles */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Vignette so content stays readable */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11,13,26,0.2)', 'rgba(11,13,26,0.92)']}
        style={styles.vignette}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* ---------- Logo ---------- */}
          <View style={styles.logoStage}>
            <Animated.View
              style={{
                opacity: logoIn,
                transform: [
                  {
                    scale: logoIn.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              }}
            >
              <LasanLogo size={132} />
            </Animated.View>
          </View>

          <Animated.View style={fadeUp(0)}>
            <Text style={styles.wordmark}>LASAN MART</Text>

            <View style={styles.dotRow}>
              <Text style={styles.dotWord}>POST</Text>
              <View style={[styles.dot, { backgroundColor: '#FF8A3D' }]} />
              <Text style={styles.dotWord}>FIND</Text>
              <View style={[styles.dot, { backgroundColor: '#2E6BE8' }]} />
              <Text style={styles.dotWord}>GROW</Text>
            </View>

            <Text style={styles.tagline}>Your Business. Our Marketplace.</Text>
          </Animated.View>

          {/* ---------- Actions ---------- */}
          <Animated.View style={[styles.actions, fadeUp(18)]}>
            {/* Primary with shimmer */}
            <TouchableOpacity
              activeOpacity={0.92}
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
                    styles.shimmer,
                    {
                      transform: [
                        {
                          translateX: shimmer.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-W, W],
                          }),
                        },
                        { rotate: '18deg' },
                      ],
                    },
                  ]}
                />
                <Ionicons name="call" size={19} color="#fff" />
                <Text style={styles.primaryText}>Continue with Phone</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Glass social row */}
            <View style={styles.socialRow}>
              <GlassButton onPress={handleGoogleSignIn}>
                {googleBusy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={19} color="#fff" />
                    <Text style={styles.glassText}>Google</Text>
                  </>
                )}
              </GlassButton>

              {Platform.OS === 'ios' && (
                <GlassButton onPress={handleAppleSignIn}>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={styles.glassText}>Apple</Text>
                </GlassButton>
              )}
            </View>

            <View style={styles.dividerRow}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.22)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
              <Text style={styles.dividerText}>OR</Text>
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
            </View>

            <TouchableOpacity
              style={styles.guest}
              activeOpacity={0.7}
              onPress={handleSkip}
            >
              <Text style={styles.guestText}>Explore without an account</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color="rgba(255,255,255,0.75)"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.legal, { opacity: enter }]}>
          By continuing you agree to our Terms & Privacy Policy
        </Animated.Text>
      </SafeAreaView>
    </View>
  );
}

/* ---------------- Sub-components ---------------- */

function GlassButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.glassWrap}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <BlurView intensity={22} tint="light" style={styles.glass}>
        <LinearGradient
          colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.05)']}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}

function Particle({
  x,
  size,
  delay,
  duration,
  drift,
}: {
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        bottom: -20,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFB347',
        opacity: v.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [0, 0.7, 0.5, 0],
        }),
        transform: [
          {
            translateY: v.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -H * 0.9],
            }),
          },
          {
            translateX: v.interpolate({
              inputRange: [0, 1],
              outputRange: [0, drift],
            }),
          },
        ],
      }}
    />
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0D1A' },
  safe: { flex: 1 },

  aurora: { position: 'absolute' },
  auroraFill: { flex: 1, borderRadius: 260 },
  auroraOne: {
    width: 420,
    height: 420,
    top: -110,
    left: -120,
  },
  auroraTwo: {
    width: 380,
    height: 380,
    bottom: 40,
    right: -140,
  },
  vignette: { ...StyleSheet.absoluteFillObject },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },

  logoStage: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  wordmark: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  dotWord: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.7)',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 40,
  },

  actions: { gap: 13 },

  primaryWrap: {
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: -40,
    width: 70,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#fff',
  },

  socialRow: { flexDirection: 'row', gap: 12 },
  glassWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  glass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  glassText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },

  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
  },
  guestText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },

  legal: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingBottom: 14,
  },
});
