import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

type Props = {
  onAvatarPress: () => void;
};

// The Business Ideas pill's gold, so the two read as one set
const GOLD: [string, string] = ['#FFE29A', '#E8AE00'];

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * "Hey, Aaron!" on a soft lavender card, with the profile picture in a
 * gold ring on the right. The name is only ever the profile name; anyone
 * without one yet is greeted as Guest.
 */
export default function HomeGreeting({ onAvatarPress }: Props) {
  const { profile } = useAuth();

  // Guest only while there's no profile name — someone who skipped
  // sign-in but filled in My Account still gets their own name
  const fullName = profile.name.trim();
  const isGuest = fullName.length === 0;
  const firstName = isGuest ? 'Guest' : fullName.split(/\s+/)[0];

  const initials = isGuest
    ? ''
    : fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  return (
    <LinearGradient
      colors={['#EFE6FC', '#FBF8FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Soft brand-coloured glow behind the picture */}
      <View pointerEvents="none" style={styles.glowLarge} />
      <View pointerEvents="none" style={styles.glowSmall} />

      <View style={styles.text}>
        <Text style={styles.eyebrow}>{timeOfDay().toUpperCase()}</Text>
        <Text style={styles.hey} numberOfLines={1}>
          Hey, {firstName}! 👋
        </Text>
        <Text style={styles.sub}>
          Explore our services and grow your business
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAvatarPress}
        hitSlop={8}
        accessibilityLabel="My Account"
      >
        <LinearGradient
          colors={GOLD}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        >
          <View style={styles.ringGap}>
            {profile.profilePictureUri ? (
              <Image
                source={{ uri: profile.profilePictureUri }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholder]}>
                {initials ? (
                  <Text style={styles.initials}>{initials}</Text>
                ) : (
                  <MaterialCommunityIcons
                    name="account"
                    size={28}
                    color={colors.white}
                  />
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const AVATAR = 50;
const RING = 2.5;
const GAP = 2.5;
const OUTER = AVATAR + (RING + GAP) * 2;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(95,37,159,0.10)',
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(95,37,159,0.08)',
  },
  glowSmall: {
    position: 'absolute',
    right: 50,
    bottom: -46,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(232,174,0,0.10)',
  },
  text: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.primary,
    opacity: 0.75,
  },
  hey: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textDark,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textLight,
    marginTop: 2,
  },
  ring: {
    width: OUTER,
    height: OUTER,
    borderRadius: OUTER / 2,
    padding: RING,
  },
  // White gap between the gold ring and the picture
  ringGap: {
    flex: 1,
    borderRadius: OUTER / 2,
    padding: GAP,
    backgroundColor: colors.white,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  placeholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.white,
  },
});
