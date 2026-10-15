import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

type Props = {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  /** Opens the same map picker as My Account → Business Location */
  onLocationPress?: () => void;
  /** Number of unread notifications — 0 hides the badge */
  unreadCount?: number;
};

/**
 * The picker saves "place, street, area, city, PIN" (or whatever they
 * typed), so the city is the last part that isn't a PIN or the country.
 */
function cityFrom(address: string): string {
  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter((p) => /[a-z]/i.test(p) && p.toLowerCase() !== 'india');
  return parts[parts.length - 1] ?? '';
}

export default function HomeHeader({
  onSearchPress,
  onNotificationsPress,
  onLocationPress,
  unreadCount = 0,
}: Props) {
  const { profile } = useAuth();

  // The business location from My Account — the same one that goes
  // with every request — rather than a separate, unsaved city choice
  const city = cityFrom(profile.address);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.7}
        onPress={onLocationPress}
      >
        <Ionicons
          name={city ? 'location-sharp' : 'location-outline'}
          size={16}
          color={colors.primary}
        />
        <Text
          style={styles.locationText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.1}
        >
          {city || 'Set location'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.7}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.textLight}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={onNotificationsPress}>
        <Ionicons name="notifications-outline" size={24} color={colors.textDark} />

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    maxWidth: 132,
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textDark,
    flexShrink: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
});