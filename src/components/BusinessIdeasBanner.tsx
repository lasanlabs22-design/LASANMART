import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import Shimmer from './Shimmer';

type Props = {
  onPress: () => void;
};

const CARD_WIDTH = Dimensions.get('window').width - 32;
// Matches the artwork's 2.6:1 crop, so the bulb and everything around
// it is in frame on a typical phone
const CARD_HEIGHT = Math.round(CARD_WIDTH / 2.6);

// Gold picked up from the bulb's glow
const ACCENT = '#FFD166';

export default function BusinessIdeasBanner({ onPress }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <ImageBackground
          source={require('../../assets/banners/business-ideas.jpg')}
          resizeMode="cover"
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          {/* Darkens the left so the copy reads over any part of the art */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(46,16,101,0.85)', 'rgba(46,16,101,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.65, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Shimmer width={CARD_WIDTH} opacity={0.2} delay={2800} />

          <View style={styles.textArea}>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>FREE · 20+ SECTORS</Text>
              </View>
            </View>
            <Text style={styles.title}>Business Ideas</Text>
            <Text style={styles.subtitle}>
              See what's working for businesses like yours
            </Text>

            <View style={styles.cta}>
              <Text style={styles.ctaText}>Explore ideas</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={14}
                color="#2E1065"
              />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 16 },
  banner: {
    justifyContent: 'center',
    borderRadius: 20,
    // A floor, not a fixed size: on narrow phones or with large text
    // the copy wraps, and the card grows instead of cutting it off
    minHeight: CARD_HEIGHT,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#3B0A78',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: { borderRadius: 20 },
  // The artwork starts a little past halfway across
  textArea: { width: '56%' },
  tagRow: { flexDirection: 'row', marginBottom: 6 },
  tag: {
    backgroundColor: 'rgba(255,209,102,0.22)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: ACCENT,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 10,
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: '#2E1065',
  },
});
