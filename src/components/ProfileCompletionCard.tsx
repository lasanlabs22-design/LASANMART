import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  percent: number;
  filled: number;
  total: number;
  nextLabel?: string;
  onPress: () => void;
};

export default function ProfileCompletionCard({
  percent,
  filled,
  total,
  nextLabel,
  onPress,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const done = percent === 100;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.iconTile, done && styles.iconTileDone]}>
          <MaterialCommunityIcons
            name={done ? 'shield-check' : 'account-details-outline'}
            size={20}
            color={done ? '#12B3A0' : colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {done ? 'Profile complete' : 'Complete your profile'}
          </Text>
          <Text style={styles.subtitle}>
            {filled} of {total} details added
          </Text>
        </View>

        <Text style={[styles.percent, done && styles.percentDone]}>
          {percent}
          <Text style={styles.percentSign}>%</Text>
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width }]}>
          <LinearGradient
            colors={done ? ['#12B3A0', '#0B8457'] : ['#FF8A3D', '#F2542D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>

      {!done && nextLabel && (
        <TouchableOpacity
          style={styles.nextRow}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={15}
            color={colors.primary}
          />
          <Text style={styles.nextText}>Add {nextLabel.toLowerCase()}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={17}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTileDone: { backgroundColor: 'rgba(18,179,160,0.12)' },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  percent: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -1,
  },
  percentDone: { color: '#12B3A0' },
  percentSign: { fontSize: 13 },

  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginTop: 14,
  },
  fillWrap: { height: '100%', borderRadius: 4, overflow: 'hidden' },
  fill: { flex: 1 },

  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
});