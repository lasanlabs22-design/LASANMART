import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  onPress: () => void;
};

export default function InfluencerBanner({ onPress }: Props) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <View style={styles.section}>
      <View style={styles.glowWrapper}>
        <Animated.View
          style={[styles.glowLayer, { opacity: glowOpacity }]}
          pointerEvents="none"
        />
        <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={24} color={colors.white} />
          </View>

          <View style={styles.textArea}>
            <Text style={styles.title}>Influencer Marketing</Text>
            <Text style={styles.subtitle}>Choose from top creators to promote your brand</Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  glowWrapper: {
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: '#7B2FF7',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2FF7',
    borderRadius: 14,
    padding: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
});