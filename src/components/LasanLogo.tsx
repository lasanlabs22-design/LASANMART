import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

type Props = {
  size?: number;
  animated?: boolean;
};

export default function LasanLogo({ size = 130, animated = true }: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Gentle up-down float
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Breathing glow behind the mark
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Signal rings expanding outward
    const pulse = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 2800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    pulse(ring1, 0).start();
    pulse(ring2, 1400).start();
  }, [animated]);

  const ringStyle = (v: Animated.Value) => ({
    opacity: v.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.45, 0],
    }),
    transform: [
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.7] }) },
    ],
  });

  return (
    <View style={[styles.stage, { width: size * 1.7, height: size * 1.7 }]}>
      {/* Signal rings */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6 },
          ringStyle(ring1),
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6 },
          ringStyle(ring2),
        ]}
      />

      {/* Glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2 },
          {
            opacity: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.08],
            }),
            transform: [
              {
                scale: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.45],
                }),
              },
            ],
          },
        ]}
      />

      {/* The mark */}
      <Animated.View
        style={{
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [5, -7],
              }),
            },
          ],
        }}
      >
        <Image
          source={require('../../assets/lasan-icon.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FF8A3D',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#2E6BE8',
  },
});