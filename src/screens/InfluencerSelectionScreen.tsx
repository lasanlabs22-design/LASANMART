import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

/** Where creators apply to join. Change to a form link when there is one. */
const APPLY_PHONE = '8309074248';

export default function InfluencerSelectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const applyOnWhatsApp = () => {
    const text = encodeURIComponent(
      "Hi Lasan Mart, I'd like to join as an influencer."
    );
    Linking.openURL(`https://wa.me/91${APPLY_PHONE}?text=${text}`).catch(() =>
      Linking.openURL(`tel:+91${APPLY_PHONE}`)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color={colors.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Influencer Marketing</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={[styles.body, { paddingBottom: 24 + insets.bottom }]}>
        <LinearGradient
          colors={['#4C1D95', '#2E1065']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name="account-star-outline"
              size={30}
              color="#FFC529"
            />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          <Text style={styles.title}>
            Creator campaigns,{'\n'}launching shortly
          </Text>

          <Text style={styles.subtitle}>
            We're building a verified network of local creators across fashion,
            food, fitness and city pages. Every creator is checked before they
            join, so you know what you're paying for.
          </Text>

          <View style={styles.pointList}>
            {[
              'Verified creators only',
              'Rates agreed upfront',
              'Our team handles the outreach',
            ].map((p) => (
              <View key={p} style={styles.point}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={15}
                  color="#FFC529"
                />
                <Text style={styles.pointText}>{p}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* For creators who want to join */}
        <View style={styles.applyCard}>
          <View style={styles.applyIcon}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.applyTitle}>Are you a creator?</Text>
            <Text style={styles.applyText}>
              Get verified and join our network
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          activeOpacity={0.9}
          onPress={applyOnWhatsApp}
        >
          <MaterialCommunityIcons
            name="whatsapp"
            size={18}
            color={colors.white}
          />
          <Text style={styles.applyButtonText}>Apply to join</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryText}>Back to browsing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.3,
  },

  body: { flex: 1, padding: 16, justifyContent: 'center' },

  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,197,41,0.14)',
  },
  iconTile: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,197,41,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: '#FFC529',
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.68)',
  },

  pointList: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    gap: 10,
  },
  point: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  pointText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  applyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginTop: 22,
  },
  applyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
  },
  applyText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textLight,
    marginTop: 1,
  },

  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  applyButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: colors.white,
  },

  secondaryButton: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  secondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});