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
import Shimmer from '../components/Shimmer';

type Props = {
  onPress: () => void;
};

const CARD_WIDTH = Dimensions.get('window').width - 32;
// Matches the artwork's 2.6:1 crop, same as the Business Ideas banner
const CARD_HEIGHT = Math.round(CARD_WIDTH / 2.6);

/**
 * This banner deliberately keeps the original orange, rather than
 * following colors.primary — so it stays warm against the purple
 * used elsewhere in the app.
 */
const ACCENT = '#FF6B35';

export default function CustomRequirementBanner({ onPress }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <ImageBackground
          source={require('../../assets/banners/custom-requirement.jpg')}
          resizeMode="cover"
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          {/* Darkens the left so the copy reads over any part of the art */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(20,21,31,0.85)', 'rgba(20,21,31,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.65, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Shimmer width={CARD_WIDTH} opacity={0.2} delay={2800} />

          <View style={styles.textArea}>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>BESPOKE</Text>
              </View>
            </View>
            <Text
              style={styles.title}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Something else in mind?
            </Text>
            <Text style={styles.subtitle}>
              Describe it — our team plans and builds it for you
            </Text>

            <View style={styles.cta}>
              <Text style={styles.ctaText}>Tell us your idea</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={14}
                color={colors.white}
              />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 26,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  banner: {
    justifyContent: 'center',
    borderRadius: 20,
    // A floor, not a fixed size: on narrow phones or with large text
    // the copy wraps, and the card grows instead of cutting it off
    minHeight: CARD_HEIGHT,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#1D1E2C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: { borderRadius: 20 },
  // The artwork starts a little past halfway across. The title shrinks
  // slightly to stay on one line: a second line makes the card taller,
  // and the image then crops the tools off the right edge
  textArea: { width: '60%' },
  tagRow: { flexDirection: 'row', marginBottom: 6 },
  tag: {
    backgroundColor: 'rgba(255,107,53,0.22)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: '#FFB08F',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.72)',
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
    color: colors.white,
  },
});
