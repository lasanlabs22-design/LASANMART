import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  percent: number;      // 0–100
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
};

export default function ProfileProgressRing({
  percent,
  size = 92,
  stroke = 4,
  children,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percent,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8A3D" />
            <Stop offset="1" stopColor="#12B3A0" />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

export function ProgressPercent({ percent }: { percent: number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#1B1D2A',
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    color: colors.white,
  },
});