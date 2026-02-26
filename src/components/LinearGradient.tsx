// Web-only LinearGradient (replaces expo-linear-gradient)
import React from 'react';
import { View, ViewStyle } from 'react-native';

type Point = { x: number; y: number };

interface LinearGradientProps {
  colors: string[];
  start?: Point;
  end?: Point;
  style?: ViewStyle;
  children?: React.ReactNode;
}

function toCssAngle(start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI + 90;
  return angleDeg;
}

export function LinearGradient({ colors, start = { x: 0, y: 0 }, end = { x: 1, y: 0 }, style, children }: LinearGradientProps) {
  const angle = toCssAngle(start, end);
  const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  return (
    <View
      style={[
        style,
        {
          backgroundImage: gradient,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        } as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}
