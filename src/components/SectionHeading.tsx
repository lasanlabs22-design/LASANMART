import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function SectionHeading({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.accent} />
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {actionLabel && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  title: { ...type.sectionTitle, color: colors.textDark },
  subtitle: { ...type.sectionSub, color: colors.textLight, marginTop: 1 },
  action: { ...type.label, fontSize: 13, color: colors.primary },
});