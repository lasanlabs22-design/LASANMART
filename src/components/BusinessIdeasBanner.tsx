import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
const CARD_HEIGHT = 92;

// Same card build as the Bespoke banner, in purple with a gold accent
const ACCENT = '#FFD166';

export default function BusinessIdeasBanner({ onPress }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={['#4C1D95', '#2E1065']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          {/* Decorative shapes */}
          <View pointerEvents="none" style={styles.orb} />
          <View pointerEvents="none" style={styles.sheen} />
          <Shimmer width={CARD_WIDTH} opacity={0.2} delay={2800} />

          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color={ACCENT}
            />
          </View>

          <View style={styles.textArea}>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>FREE</Text>
              </View>
            </View>
            <Text style={styles.title}>Business Ideas</Text>
            <Text style={styles.subtitle}>
              What works for your sector — pick yours
            </Text>
          </View>

          <View style={styles.arrowCircle}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color="#2E1065"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    // A floor, not a fixed size: on narrow phones or with large text
    // the subtitle wraps, and the card grows instead of cutting it off
    minHeight: CARD_HEIGHT,
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  orb: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,209,102,0.14)',
  },
  sheen: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 70,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '22deg' }],
  },
  iconTile: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,209,102,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textArea: { flex: 1 },
  tagRow: { flexDirection: 'row', marginBottom: 5 },
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
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.68)',
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
