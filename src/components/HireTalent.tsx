import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import SectionHeading from './SectionHeading';

type Props = {
  onInfluencersPress: () => void;
  onFreelancersPress: () => void;
};

type TalentCardProps = {
  tag: string;
  title: string;
  subtitle: string;
  icon: string; // MaterialCommunityIcons name
  gradient: [string, string];
  onPress: () => void;
};

/**
 * Influencers and freelancers side by side — both are "hire a person"
 * jobs, so they read as one section instead of two lone banners.
 */
export default function HireTalent({
  onInfluencersPress,
  onFreelancersPress,
}: Props) {
  return (
    <View style={styles.section}>
      <SectionHeading
        title="Hire Talent"
        subtitle="Creators and crew for your brand"
      />

      <View style={styles.row}>
        <TalentCard
          tag="CREATORS"
          title="Influencer Marketing"
          subtitle="Top creators to promote your brand"
          icon="star"
          gradient={['#7B2FF7', '#4C1D95']}
          onPress={onInfluencersPress}
        />
        <TalentCard
          tag="FREELANCERS"
          title="Shoots & Editors"
          subtitle="Photo, video, marketing, software"
          icon="camera-account"
          gradient={['#3B1782', '#1E0B45']}
          onPress={onFreelancersPress}
        />
      </View>
    </View>
  );
}

function TalentCard({
  tag,
  title,
  subtitle,
  icon,
  gradient,
  onPress,
}: TalentCardProps) {
  return (
    <TouchableOpacity
      style={styles.cardTouch}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative shapes, as on the Bespoke banner */}
        <View pointerEvents="none" style={styles.orb} />
        <View pointerEvents="none" style={styles.sheen} />

        <View style={styles.topRow}>
          <View style={styles.iconTile}>
            <MaterialCommunityIcons
              name={icon as any}
              size={22}
              color={colors.white}
            />
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Pushes the arrow to the bottom, so both cards line up */}
        <View style={{ flex: 1 }} />

        <View style={styles.arrowCircle}>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={gradient[1]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  // Both cards stretch to the taller one's height
  cardTouch: { flex: 1 },
  card: {
    flex: 1,
    minHeight: 168,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  orb: {
    position: 'absolute',
    top: -45,
    right: -35,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  sheen: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 60,
    height: 240,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '22deg' }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 19,
    color: colors.white,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
  },
  arrowCircle: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
});
