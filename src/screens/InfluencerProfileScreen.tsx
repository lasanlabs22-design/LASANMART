import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { ApprovedInfluencer } from '../api/client';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

/**
 * Header accent colours. Swap these two to re-theme the gradient —
 * every purple usage below points back to these constants.
 */
const PURPLE = '#5F259F';
const PURPLE_DARK = '#3D1866';

function formatCount(value?: string | null): string {
  if (!value) return '—';
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  if (!n) return value;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const SUPPORT_PHONE = '8309074248';
const SUPPORT_EMAIL = 'admin@lasanlabs.com';

export default function InfluencerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const influencer: ApprovedInfluencer = route.params?.influencer;
  const [saved, setSaved] = useState(false);

  // Same submit hook + bottom sheet the selection screen uses — this is
  // what actually sends the request. There is no 'InfluencerEnquiry'
  // screen in the navigator, so we don't navigate to one.
  const { submit, busy, duplicate, clearDuplicate, sheetProps } =
    useSubmitRequest(() => navigation.goBack());

  if (!influencer) {
    navigation.goBack();
    return null;
  }

  const handleSubmit = () => {
    submit({
      type: 'influencer',
      title: influencer.name,
      description:
        'Interested in working with this creator selected in the app.',
      descriptionLabel: 'What they want',
      details: {
        creators: [
          `${influencer.name}${influencer.instagram_id ? ` (@${influencer.instagram_id})` : ''}`,
        ],
        count: 1,
      },
    });
  };

  return (
    <View style={styles.root}>
      {/* Full-bleed header, the way Promofy does it — the photo sits
          in a card that overlaps the gradient below */}
      <LinearGradient
        colors={[PURPLE, PURPLE_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBg, { paddingTop: insets.top + 10 }]}
      >
        <View pointerEvents="none" style={styles.orbOne} />
        <View pointerEvents="none" style={styles.orbTwo} />

        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.identityRow}>
          {influencer.photo_url ? (
            <Image
              source={{ uri: influencer.photo_url }}
              style={styles.avatarPhoto}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {influencer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{influencer.name}</Text>

            <View style={styles.verifiedPill}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={13}
                color="#FFC529"
              />
              <Text style={styles.verifiedText}>Verified Influencer</Text>
            </View>

            {influencer.city && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.locationText}>{influencer.city}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Floating stats card, overlapping the header — followers,
          category and city only; no pricing or handle here */}
      <View style={styles.statsCard}>
        <View style={styles.statCell}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={19}
            color={PURPLE}
          />
          <Text style={styles.statValue}>
            {formatCount(influencer.followers)}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <MaterialCommunityIcons name="tag-outline" size={19} color={PURPLE} />
          <Text style={styles.statValue} numberOfLines={1}>
            {influencer.category || '—'}
          </Text>
          <Text style={styles.statLabel}>Category</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={19}
            color={PURPLE}
          />
          <Text style={styles.statValue} numberOfLines={1}>
            {influencer.city || '—'}
          </Text>
          <Text style={styles.statLabel}>City</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {influencer.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{influencer.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={styles.infoIconTile}>
                <MaterialCommunityIcons
                  name="shape-outline"
                  size={18}
                  color={PURPLE}
                />
              </View>
              <Text style={styles.infoLabel}>Content Category</Text>
              <Text style={styles.infoValue}>
                {influencer.category || 'Not specified'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIconTile}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color={PURPLE}
                />
              </View>
              <Text style={styles.infoLabel}>Based In</Text>
              <Text style={styles.infoValue}>
                {influencer.city || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Shown instead of a generic alert — a duplicate has a real
            next step (go look at the existing request), so it earns
            a permanent spot on screen rather than a dismissible popup */}
        {duplicate && (
          <View style={styles.section}>
            <View style={styles.duplicateCard}>
              <View style={styles.duplicateIconTile}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color="#B8860B"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.duplicateTitle}>Already requested</Text>
                <Text style={styles.duplicateText}>{duplicate.message}</Text>

                <View style={styles.duplicateActions}>
                  <TouchableOpacity
                    style={styles.duplicateViewButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      const requestId = duplicate.requestId;
                      clearDuplicate();
                      navigation.navigate('Main', {
                        screen: 'My Requests',
                        params: { highlightId: requestId },
                      });
                    }}
                  >
                    <Text style={styles.duplicateViewButtonText}>
                      View request
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={clearDuplicate}
                    activeOpacity={0.6}
                    style={styles.duplicateDismissButton}
                  >
                    <Text style={styles.duplicateDismissText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.helpCard}>
            <View style={styles.helpIconTile}>
              <MaterialCommunityIcons name="headset" size={18} color={PURPLE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpText}>
                Our team can help with collaborations, enquiries and support.
              </Text>
              <Text style={styles.helpContact}>{SUPPORT_EMAIL}</Text>
              <Text style={styles.helpContact}>{SUPPORT_PHONE}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={() => setSaved((s) => !s)}
        >
          <MaterialCommunityIcons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? '#E63946' : colors.textDark}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.enquiryButton, busy && styles.enquiryButtonDisabled]}
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="send"
                size={17}
                color={colors.white}
              />
              <Text style={styles.enquiryButtonText}>Send Enquiry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ContactDetailsSheet {...sheetProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  headerBg: { paddingBottom: 46, overflow: 'hidden' },
  orbOne: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbTwo: {
    position: 'absolute',
    top: 40,
    left: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    paddingHorizontal: 20,
  },
  avatarPhoto: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.white,
  },

  name: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.white,
    letterSpacing: -0.4,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 6,
  },
  verifiedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: -34,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  statValue: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.textDark,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.textLight,
  },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },

  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 12,
  },

  bioText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textDark,
  },

  infoGrid: { flexDirection: 'row', gap: 10 },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  infoIconTile: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#5F259F1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.textDark,
  },

  duplicateCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF7E6',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5D98B',
  },
  duplicateIconTile: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFECC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duplicateTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: '#7A5A00',
  },
  duplicateText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#8A6A10',
    marginTop: 3,
  },
  duplicateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  duplicateViewButton: {
    backgroundColor: '#B8860B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  duplicateViewButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.white,
  },
  duplicateDismissButton: {
    paddingVertical: 8,
  },
  duplicateDismissText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: '#8A6A10',
  },

  helpCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  helpIconTile: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#5F259F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.textDark,
  },
  helpText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textLight,
    marginTop: 3,
    marginBottom: 8,
  },
  helpContact: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: PURPLE,
    marginTop: 2,
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enquiryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PURPLE,
    borderRadius: 14,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  enquiryButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  enquiryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
});
