import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import Shimmer from './Shimmer';

type Props = {
  onPress: () => void;
};

const CARD_WIDTH = Dimensions.get('window').width - 32;
const CARD_HEIGHT = 92;

export default function BusinessIdeasBanner({ onPress }: Props) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.85],
  });

  return (
    <View style={styles.section}>
      <View style={styles.glowWrapper}>
        <Animated.View
          style={[styles.glowLayer, { opacity: glowOpacity }]}
          pointerEvents="none"
        />

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={onPress}
        >
          <View pointerEvents="none" style={styles.orb} />
          <Shimmer width={CARD_WIDTH} opacity={0.2} delay={2800} />

          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color="#FFD166"
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
              color={colors.white}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 16 },
  glowWrapper: { position: 'relative' },
  glowLayer: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 24,
    backgroundColor: '#2E1065',
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4C1D95',
    borderRadius: 18,
    height: CARD_HEIGHT,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  iconTile: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    color: '#FFD166',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
