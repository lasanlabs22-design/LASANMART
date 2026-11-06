import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FreelancerService } from '../data/freelancerServices';

export const BOX_BLACK = '#0E0E12';
// Room under the art for a two-line name and a one-line blurb
export const BOX_TEXT_HEIGHT = 54;

type Props = {
  service: FreelancerService;
  width: number;
  height: number;
  active: boolean;
  onPress: () => void;
};

// '#3A86FF' -> 'rgba(58,134,255,0.18)'
function tint(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * A dark service box: artwork on top, name and blurb underneath, and a
 * ring in the corner that fills with the service colour when picked.
 * Used on Hire a Freelancer and for the Flash Shoot choice.
 */
export default function ServiceBox({
  service: s,
  width,
  height,
  active,
  onPress,
}: Props) {
  const artH = height - BOX_TEXT_HEIGHT;

  return (
    <TouchableOpacity
      style={[
        styles.box,
        { width, height },
        active && { borderColor: s.colour },
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={[styles.art, { height: artH }]}>
        {s.image ? (
          // Whole scene, never cropped: the art's dark backdrop meets
          // the box's at the sides
          <Image source={s.image} style={styles.image} resizeMode="contain" />
        ) : (
          // No artwork yet: the service's icon on a soft glow in its colour
          <View
            style={[
              styles.iconGlow,
              {
                width: artH * 0.66,
                height: artH * 0.66,
                borderRadius: artH * 0.33,
                backgroundColor: tint(s.colour, 0.18),
              },
            ]}
          >
            <MaterialCommunityIcons
              name={s.icon as any}
              size={Math.round(artH * 0.36)}
              color={s.colour}
            />
          </View>
        )}
        {/* Fades the art into the box so the copy underneath sits on one
            surface */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(14,14,18,0)', BOX_BLACK]}
          start={{ x: 0, y: 0.6 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={2}>
          {s.label}
        </Text>
        <Text style={styles.blurb} numberOfLines={1}>
          {s.blurb}
        </Text>
      </View>

      <BoxTick active={active} colour={s.colour} />
    </TouchableOpacity>
  );
}

/** Empty ring until picked, so it reads as selectable */
export function BoxTick({ active, colour }: { active: boolean; colour: string }) {
  return (
    <View
      style={[
        styles.tick,
        active ? { backgroundColor: colour, borderColor: colour } : null,
      ]}
    >
      {active && (
        <MaterialCommunityIcons name="check" size={13} color={colors.white} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: BOX_BLACK,
  },
  art: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  iconGlow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingBottom: 6,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13.5,
    lineHeight: 17,
    color: colors.white,
    letterSpacing: -0.3,
  },
  blurb: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  tick: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
