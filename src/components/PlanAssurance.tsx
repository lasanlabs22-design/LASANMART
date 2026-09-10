import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const POINTS = [
  {
    icon: 'gesture-tap-button',
    title: 'This is an enquiry, not an order',
    body: 'Nothing is booked and nothing is charged. You are asking us to get in touch.',
  },
  {
    icon: 'phone-in-talk-outline',
    title: 'We call you within working hours',
    body: 'Someone from our team goes through what you need and what the plan covers.',
  },
  {
    icon: 'file-document-edit-outline',
    title: 'The plan can be adjusted',
    body: 'If something in it does not suit your business, we change it before anything is agreed.',
  },
  {
    icon: 'currency-inr',
    title: 'You approve the cost first',
    body: 'Work begins only once you have seen the final quote and said yes.',
  },
];

/**
 * Sits at the foot of the plan enquiry form. Answers what someone
 * hesitating over a ₹50,000 plan is actually worried about — and
 * gives the last field room to scroll clear of the keyboard.
 */
export default function PlanAssurance() {
  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />

      <Text style={styles.heading}>What happens next</Text>

      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.pointIcon}>
              <MaterialCommunityIcons
                name={p.icon as any}
                size={17}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointBody}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <MaterialCommunityIcons
          name="help-circle-outline"
          size={14}
          color={colors.textLight}
        />
        <Text style={styles.footerText}>
          Not sure which plan fits? Ask us — we will tell you honestly.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 34 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 26,
  },
  heading: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  list: { gap: 22 },
  point: { flexDirection: 'row', gap: 13 },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 14.5,
    color: colors.textDark,
    lineHeight: 20,
  },
  pointBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginTop: 3,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
  },
});
