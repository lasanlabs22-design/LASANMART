import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

/* Copy from lasanmediaworks.com, so the app and the website say the
   same thing. Update both together. */
const WEBSITE = 'https://www.lasanmediaworks.com/';

const STATS = [
  { value: '4+', label: 'Years' },
  { value: '200+', label: 'Projects' },
  { value: '98%', label: 'Happy clients' },
];

const SERVICES = [
  'SMM, SEO, PPC',
  'Website & CRM',
  'Branding & Creative',
  'Market Research',
  'Marketing Workforce',
  'Media PR',
];

const OFFICES = 'Tirupati (HQ) · Hyderabad · Bangalore';

const GOLD = '#FFC93C';

/**
 * Who does the work when someone asks for Digital Marketing: our own
 * agency, LaSän Media Works, with its founders up front.
 */
export default function LasanMediaCard() {
  return (
    <LinearGradient
      colors={['#3B1E6E', '#241347', '#150C2E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Soft gold glow behind the founders */}
      <View pointerEvents="none" style={styles.glow} />

      {/* ---------- Hero: brand on the left, founders on the right ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <View style={styles.brandRow}>
            <View style={styles.logoTile}>
              <Image
                source={require('../../assets/brand/lasan-media-mark.png')}
                style={styles.logo}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow} numberOfLines={1}>
                OUR OWN AGENCY
              </Text>
              <Text style={styles.brand} numberOfLines={1} adjustsFontSizeToFit>
                LaSän Media Works
              </Text>
            </View>
          </View>

          <Text style={styles.tagline}>
            Marketing solutions to make your business{' '}
            <Text style={styles.taglineGold}>the best one in your area</Text>
          </Text>

          <View style={styles.founders}>
            <Text style={styles.founderName}>Sree Latha Royal</Text>
            <Text style={styles.founderRole}>Founder & CMO</Text>
            <Text style={[styles.founderName, { marginTop: 6 }]}>
              Santhosh Rokaya
            </Text>
            <Text style={styles.founderRole}>Co-Founder & CEO</Text>
          </View>
        </View>

        <Image
          source={require('../../assets/brand/lasan-media-founders.png')}
          style={styles.foundersImage}
          resizeMode="contain"
          accessibilityLabel="Founders Sree Latha Royal and Santhosh Rokaya"
        />
      </View>

      {/* ---------- Numbers ---------- */}
      <View style={styles.stats}>
        {STATS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* ---------- What we do ---------- */}
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>WHAT WE DO</Text>
        <View style={styles.chips}>
          {SERVICES.map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footRow}>
          <View style={styles.offices}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color="rgba(255,255,255,0.65)"
            />
            <Text style={styles.officesText} numberOfLines={2}>
              {OFFICES}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.siteBtn}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(WEBSITE).catch(() => {})}
          >
            <Text style={styles.siteText}>Website</Text>
            <MaterialCommunityIcons name="open-in-new" size={13} color="#2A1650" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const HERO_H = 216;

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 22,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: -30,
    top: 10,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,201,60,0.14)',
  },

  hero: {
    height: HERO_H,
    flexDirection: 'row',
  },
  heroText: {
    flex: 1,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 4,
    zIndex: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: 28, height: 24 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 8.5,
    letterSpacing: 1.1,
    color: GOLD,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.white,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  tagline: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
    marginTop: 12,
  },
  taglineGold: { color: GOLD },

  founders: { marginTop: 10, paddingBottom: 12 },
  founderName: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: colors.white,
  },
  founderRole: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.6)',
  },

  // Stands on the stats strip, like the website's hero
  foundersImage: {
    width: Math.round((HERO_H - 6) * (380 / 450)),
    height: HERO_H - 6,
    alignSelf: 'flex-end',
    marginRight: 2,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 11,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.14)' },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: GOLD,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  body: { padding: 16, paddingTop: 14 },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 9,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.white },

  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  offices: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  officesText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.7)',
  },
  siteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: GOLD,
  },
  siteText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#2A1650' },
});
