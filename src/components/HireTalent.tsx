import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
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
  // 2:3 artwork with the subject in the lower half and a plain top
  // for the copy
  image: ImageSourcePropType;
  gradient: [string, string];
  onPress: () => void;
};

// Matte black, matching the artwork's backdrop, so white copy always
// has full contrast
const CARD_BLACK: [string, string] = ['#1E1E24', '#111114'];

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
          title="Creators & Influencers"
          subtitle="Top creators to promote your brand"
          image={require('../../assets/talent/influencers.jpg')}
          gradient={CARD_BLACK}
          onPress={onInfluencersPress}
        />
        <TalentCard
          tag="FREELANCERS"
          title="Shoots & Editors"
          subtitle="Photo, video, drone, design, software"
          image={require('../../assets/talent/freelancers.jpg')}
          gradient={CARD_BLACK}
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
  image,
  gradient,
  onPress,
}: TalentCardProps) {
  return (
    <TouchableOpacity
      style={styles.cardTouch}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={[styles.card, { backgroundColor: gradient[1] }]}
        imageStyle={styles.cardImage}
      >
        {/* Darkens the top so the copy reads over the artwork */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
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
      </ImageBackground>
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
    // The artwork's subject starts halfway down; at this height that's
    // just below the copy, so the two never overlap
    minHeight: 250,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImage: { borderRadius: 20 },
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
    color: 'rgba(255,255,255,0.82)',
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
