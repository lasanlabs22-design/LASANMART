import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  onPress: () => void;
};

export default function CustomRequirementBanner({ onPress }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={['#2B2D42', '#14151F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          {/* Decorative shapes */}
          <View pointerEvents="none" style={styles.orb} />
          <View pointerEvents="none" style={styles.sheen} />

          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name="hammer-wrench"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.textArea}>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>BESPOKE</Text>
              </View>
            </View>
            <Text style={styles.title}>Something else in mind?</Text>
            <Text style={styles.subtitle}>
              Describe it and our team builds it for you
            </Text>
          </View>

          <View style={styles.arrowCircle}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color={colors.white}
            />
          </View>
        </LinearGradient>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
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
    backgroundColor: 'rgba(255,107,53,0.14)',
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
    backgroundColor: 'rgba(255,107,53,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textArea: { flex: 1 },
  tagRow: { flexDirection: 'row', marginBottom: 5 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
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
    color: 'rgba(255,255,255,0.62)',
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});