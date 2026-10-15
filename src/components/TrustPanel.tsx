import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const POINTS = [
  {
    icon: 'account-lock-outline',
    title: 'Only you see your requests',
    body: 'Your phone number is verified, so nobody else can look up what you have asked for.',
  },
  {
    icon: 'phone-outline',
    title: 'We use your details to reach you',
    body: 'Name, number and email go to our team so we can call you back about a request. Nothing else.',
  },
  {
    icon: 'lock-outline',
    title: 'Never sold, never shared',
    body: 'Not to advertisers, not to anyone. Your business details stay between you and our team.',
  },
  {
    icon: 'delete-outline',
    title: 'Ask us to delete it anytime',
    body: 'Message support and we remove your profile and request history within 30 days.',
  },
];

/**
 * Sits at the foot of the profile form. Two jobs: it tells people what
 * happens to what they have just typed, and it gives the last field
 * room to scroll clear of the keyboard.
 */
export default function TrustPanel() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Your details, and what we do with them</Text>

      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.pointIcon}>
              <MaterialCommunityIcons
                name={p.icon as any}
                size={15}
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
          name="information-outline"
          size={14}
          color={colors.textLight}
        />
        <Text style={styles.footerText}>
          Full detail at lasanmart.com/privacy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A soft card instead of a page section, so it sits quietly at the end
  wrap: {
    marginTop: 26,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  heading: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  list: { gap: 14 },
  point: { flexDirection: 'row', gap: 11 },
  pointIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    lineHeight: 18,
  },
  pointBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
    marginTop: 1,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
  },
});
