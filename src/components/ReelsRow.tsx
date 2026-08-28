import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import SectionHeading from './SectionHeading';
import { ApiReel } from '../api/client';

type Props = {
  data: ApiReel[];
  onReelPress: (reel: ApiReel) => void;
  onAddPress?: () => void;
  onSeeAllPress?: () => void;
};

const THUMB_WIDTH = 124;
const THUMB_HEIGHT = 186;

export default function ReelsRow({
  data,
  onReelPress,
  onAddPress,
  onSeeAllPress,
}: Props) {
  return (
    <View style={styles.section}>
      <SectionHeading
        title="Lasan Vibes"
        subtitle="Campaigns, shoots & stories from the ground"
        actionLabel="See all"
        onActionPress={onSeeAllPress}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addTile}
            activeOpacity={0.85}
            onPress={onAddPress}
          >
            <View style={styles.addCircle}>
              <MaterialCommunityIcons
                name="plus"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={styles.addLabel}>Post a{'\n'}Vibe</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.thumbWrapper}
            activeOpacity={0.85}
            onPress={() => onReelPress(item)}
          >
            {item.thumbnail_url ? (
              <Image
                source={{ uri: item.thumbnail_url }}
                style={styles.thumbImage}
              />
            ) : (
              <View style={[styles.thumbImage, styles.thumbFallback]}>
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={28}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            )}

            {/* Scrim so the text stays readable over any thumbnail */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.scrim}
              pointerEvents="none"
            />

            <View style={styles.playChip}>
              <MaterialCommunityIcons
                name="play"
                size={11}
                color={colors.white}
              />
              <Text style={styles.playChipText}>Reel</Text>
            </View>

            <View style={styles.overlay}>
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
              {item.caption && (
                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },

  listContent: { paddingHorizontal: 16, gap: 12 },

  addTile: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },

  thumbWrapper: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbFallback: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 110 },

  playChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  playChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8.5,
    color: colors.white,
    letterSpacing: 0.3,
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  username: {
    fontFamily: fonts.displayMedium,
    fontSize: 12,
    color: colors.white,
    marginBottom: 2,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
