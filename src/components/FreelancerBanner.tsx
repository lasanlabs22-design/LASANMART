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

const CARD_WIDTH = Dimensions.get('window').width - 32;
const CARD_HEIGHT = 96;

export default function FreelancerBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={['#2E1065', '#2E1065']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View pointerEvents="none" style={styles.orb} />
          <Shimmer width={CARD_WIDTH} opacity={0.18} delay={3600} />

          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name="camera-account"
              size={24}
              color={colors.white}
            />
          </View>

          <View style={styles.textArea}>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>FREELANCERS</Text>
              </View>
            </View>
            <Text style={styles.title}>Need a shoot or an editor?</Text>
            <Text style={styles.subtitle}>
              Photography, video, digital marketing
            </Text>
          </View>

          <View style={styles.arrow}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color="#1D4ED8"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26, paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: CARD_HEIGHT,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: colors.white,
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
    color: 'rgba(255,255,255,0.75)',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
