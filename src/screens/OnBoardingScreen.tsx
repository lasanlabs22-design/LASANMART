import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_MS = 4500;

/** Where partners reach us until Lasan Hub is on the store */
const PARTNER_PHONE = '8309074248';

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
  accent: string;
  /** Dark gradient behind the slide — edge, centre, edge */
  background: [string, string, string];
  /** Deep enough to keep white button text readable */
  button: string;
  points: string[];
  /** The last slide has a button rather than points alone */
  action?: 'partner';
};

const SLIDES: Slide[] = [
  {
    key: 'intro',
    eyebrow: 'LASAN MART',
    title: 'One app for every\nmarketing need',
    body: 'Hoardings, Instagram, websites, print, events — whatever your business needs to be seen, it starts here.',
    icon: 'star-four-points',
    accent: '#A78BFA',
    background: ['#14102E', '#2A1F5C', '#14102E'],
    button: '#6D28D9',
    points: [
      'Thirty services, one place',
      'Free to browse and ask',
      'Built for Andhra Pradesh',
    ],
  },
  {
    key: 'ask',
    eyebrow: 'JUST ASK',
    title: 'Tell us what you need,\nin your own words',
    body: 'Pick a service, or describe your goal and let us work it out. Not sure where to start? Business Ideas suggests what works for your sector.',
    icon: 'message-text-outline',
    accent: '#60A5FA',
    background: ['#0A1330', '#15295E', '#0A1330'],
    button: '#2563EB',
    points: [
      'Pick a service or describe it',
      'Ideas tailored to your sector',
      'Plans with prices upfront',
    ],
  },
  {
    key: 'handled',
    eyebrow: 'WE HANDLE IT',
    title: 'No agencies to chase.\nNo quotes to compare.',
    body: 'Our team reads every request and calls you back. We find the right people, agree the cost with you, and get the work done.',
    icon: 'account-hard-hat',
    accent: '#2DD4BF',
    background: ['#051D1D', '#0E3B3A', '#051D1D'],
    button: '#0F766E',
    points: [
      'A real person calls you back',
      'You approve the cost first',
      'Track every request in the app',
    ],
  },
  {
    key: 'partner',
    eyebrow: 'ON THE OTHER SIDE',
    title: 'Do you provide\nthese services?',
    body: "There's an app for that too. Creators, vendors and freelancers join our verified network, and we bring them work from businesses who have already paid.",
    icon: 'handshake-outline',
    accent: '#F472B6',
    background: ['#240A20', '#46163D', '#240A20'],
    button: '#BE185D',
    points: [
      'Creators, vendors, freelancers',
      'Real briefs, already funded',
      'Free to join',
    ],
    action: 'partner',
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const listRef = useRef<FlatList>(null);
  const indexRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Fills the active dot, so the wait is visible rather than mysterious */
  const progress = useRef(new Animated.Value(0)).current;

  /** Follows the index so each slide's background fades into the next */
  const bgPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgPosition, {
      toValue: index,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [index, bgPosition]);

  /** Colours can't run on the native driver, so the button has its own value */
  const buttonPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(buttonPosition, {
      toValue: index,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [index, buttonPosition]);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    indexRef.current = clamped;
    setIndex(clamped);
    listRef.current?.scrollToOffset({
      offset: clamped * SCREEN_WIDTH,
      animated: true,
    });
  };

  useEffect(() => {
    if (paused) return;

    progress.setValue(0);

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (!finished) return;

      // Stops at the last slide — looping onboarding leaves people
      // wondering whether they missed the end
      if (indexRef.current < SLIDES.length - 1) {
        goTo(indexRef.current + 1);
      }
    });

    return () => anim.stop();
  }, [index, paused, progress]);

  const isLast = index === SLIDES.length - 1;
  const active = SLIDES[index];

  const callPartners = () => {
    Linking.openURL(
      `https://wa.me/91${PARTNER_PHONE}?text=${encodeURIComponent(
        "Hi Lasan Mart, I'd like to join as a partner."
      )}`
    ).catch(() => Linking.openURL(`tel:+91${PARTNER_PHONE}`));
  };

  return (
    <View style={styles.root}>
      {SLIDES.map((s, i) => (
        <Animated.View
          key={s.key}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: bgPosition.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <LinearGradient
            colors={s.background}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ))}

      <View
        pointerEvents="none"
        style={[styles.glow, { backgroundColor: active.accent }]}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          {!isLast && (
            <TouchableOpacity onPress={onDone} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => setPaused(true)}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            indexRef.current = i;
            setIndex(i);
            setPaused(false);
          }}
          renderItem={({ item }) => (
            <SlideView slide={item} onPartnerPress={callPartners} />
          )}
        />

        {/* Progress dots — the active one stretches and fills */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const isActive = i === index;

            return (
              <TouchableOpacity
                key={s.key}
                activeOpacity={0.7}
                onPress={() => goTo(i)}
                style={[styles.dot, isActive && styles.dotActive]}
              >
                {isActive && (
                  <Animated.View
                    style={[
                      styles.dotFill,
                      {
                        backgroundColor: active.accent,
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.next}
            activeOpacity={0.9}
            onPress={() => (isLast ? onDone() : goTo(index + 1))}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: buttonPosition.interpolate({
                    inputRange: SLIDES.map((_, i) => i),
                    outputRange: SLIDES.map((s) => s.button),
                  }),
                },
              ]}
            />
            <Text style={styles.nextText}>
              {isLast ? 'Get started' : 'Next'}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ---------- One slide ---------- */

function SlideView({
  slide,
  onPartnerPress,
}: {
  slide: Slide;
  onPartnerPress: () => void;
}) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [rise]);

  const slideUp = rise.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={{ opacity: rise, transform: [{ translateY: slideUp }] }}
      >
        <View style={[styles.icon, { backgroundColor: `${slide.accent}26` }]}>
          <MaterialCommunityIcons
            name={slide.icon as any}
            size={32}
            color={slide.accent}
          />
        </View>

        <Text style={[styles.eyebrow, { color: slide.accent }]}>
          {slide.eyebrow}
        </Text>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.points}>
          {slide.points.map((p) => (
            <View key={p} style={styles.point}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={slide.accent}
              />
              <Text style={styles.pointText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Until Lasan Hub is on the store, partners reach us directly */}
        {slide.action === 'partner' && (
          <TouchableOpacity
            style={styles.partnerButton}
            activeOpacity={0.85}
            onPress={onPartnerPress}
          >
            <MaterialCommunityIcons name="whatsapp" size={17} color="#25D366" />
            <Text style={styles.partnerText}>Talk to us about joining</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#14102E' },
  glow: {
    position: 'absolute',
    top: '-12%',
    alignSelf: 'center',
    width: 380,
    height: 380,
    borderRadius: 190,
    opacity: 0.2,
  },

  topBar: {
    height: 44,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skip: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
  },

  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 30,
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 38,
    color: colors.white,
    letterSpacing: -0.9,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.52)',
    marginTop: 14,
  },

  points: { marginTop: 28, gap: 13 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pointText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: 'rgba(255,255,255,0.82)',
  },

  partnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 26,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(37,211,102,0.4)',
    backgroundColor: 'rgba(37,211,102,0.1)',
  },
  partnerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  dotActive: { width: 34 },
  dotFill: { height: '100%', borderRadius: 4 },

  footer: { paddingHorizontal: 26, paddingBottom: 22 },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: colors.white,
  },
});
