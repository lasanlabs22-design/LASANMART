import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { openHubListing } from '../lib/hub';
import { events } from '../lib/analytics';

const ACCENT = '#A78BFA';

const ROLES = [
  { id: 'influencer', label: 'Influencer or creator', icon: 'star-outline' },
  { id: 'vendor', label: 'Vendor or agency', icon: 'storefront-outline' },
  { id: 'freelancer', label: 'Freelancer', icon: 'camera-account' },
];

/**
 * Between onboarding and login. Like Messenger beside Facebook: anyone
 * who also does the work gets pointed at Lasan Hub, the partner app.
 * Entirely optional — "No" carries straight on to login.
 */
export default function PartnerStepScreen({ onDone }: { onDone: () => void }) {
  const [role, setRole] = useState<string | null>(null);

  const getHub = () => {
    if (!role) return;
    events.partnerStepAnswered(role, true);
    openHubListing();
  };

  const carryOn = () => {
    events.partnerStepAnswered(role ?? 'business', false);
    onDone();
  };

  return (
    <View style={styles.root}>
      {/* Shown before navigation exists, so a plain StatusBar */}
      <StatusBar style="light" />
      <LinearGradient
        colors={['#14102E', '#2A1F5C', '#14102E']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.body}>
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name="handshake-outline"
              size={30}
              color={ACCENT}
            />
          </View>

          <Text style={styles.eyebrow}>ONE QUICK QUESTION</Text>
          <Text style={styles.title}>
            Are you also a creator,{'\n'}vendor or freelancer?
          </Text>
          <Text style={styles.subtitle}>
            Lasan Hub is our app for the people who do the work. Join the
            verified network and get briefs from businesses on Lasan Mart.
          </Text>

          <View style={styles.options}>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.option, active && styles.optionActive]}
                  activeOpacity={0.85}
                  // Tap again to clear, in case they picked by mistake
                  onPress={() => setRole(active ? null : r.id)}
                >
                  <MaterialCommunityIcons
                    name={r.icon as any}
                    size={20}
                    color={active ? colors.white : ACCENT}
                  />
                  <Text style={styles.optionText}>{r.label}</Text>
                  <MaterialCommunityIcons
                    name={active ? 'check-circle' : 'circle-outline'}
                    size={20}
                    color={active ? ACCENT : 'rgba(255,255,255,0.3)'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          {role ? (
            <>
              <TouchableOpacity
                style={styles.primary}
                activeOpacity={0.9}
                onPress={getHub}
              >
                <MaterialCommunityIcons
                  name="google-play"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.primaryText}>Get Lasan Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondary}
                onPress={carryOn}
                hitSlop={8}
              >
                <Text style={styles.secondaryText}>
                  Continue to Lasan Mart
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.primary, styles.primaryQuiet]}
              activeOpacity={0.9}
              onPress={carryOn}
            >
              <Text style={styles.primaryText}>No, I'm here as a business</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#14102E' },

  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: `${ACCENT}26`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: ACCENT,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 35,
    color: colors.white,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 12,
  },

  options: { marginTop: 26, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(167,139,250,0.16)',
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },

  footer: { paddingHorizontal: 26, paddingBottom: 22, paddingTop: 12 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#6D28D9',
  },
  // The "no" path is a real choice, not a punishment — same button,
  // just without the brand colour pulling them towards it
  primaryQuiet: { backgroundColor: 'rgba(255,255,255,0.1)' },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: colors.white,
  },
  secondary: { alignItems: 'center', paddingVertical: 14 },
  secondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});
