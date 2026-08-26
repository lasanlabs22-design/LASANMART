import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  onSearchPress?: () => void;
  onWishlistPress?: () => void;
  onNotificationsPress?: () => void;
};

export default function HomeHeader({
  onSearchPress,
  onWishlistPress,
  onNotificationsPress,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.7}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services, categories..."
          placeholderTextColor={colors.textLight}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={onWishlistPress}>
        <Ionicons name="heart-outline" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={onNotificationsPress}>
        <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
        <View style={styles.badge} />
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
    gap: 10,
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
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});