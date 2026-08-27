import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';

type Props = {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  /** Number of unread notifications — 0 hides the badge */
  unreadCount?: number;
};

const cities = [
  'Hyderabad',
  'Bengaluru',
  'Chennai',
  'Tirupati',
];

export default function HomeHeader({
  onSearchPress,
  onNotificationsPress,
  unreadCount = 0,
}: Props) {
  const [selectedCity, setSelectedCity] = useState('Detecting...');
  const [modalVisible, setModalVisible] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setSelectedCity('Select City');
        setIsDetecting(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const cityName = place?.city || place?.subregion || place?.region;

      if (cityName) {
        setSelectedCity(cityName);
      } else {
        setSelectedCity('Select City');
      }
    } catch (error) {
      console.log('Location detection failed:', error);
      setSelectedCity('Select City');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        {isDetecting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="location-sharp" size={16} color={colors.primary} />
        )}
        <Text style={styles.locationText} numberOfLines={1}>
          {selectedCity}
        </Text>
        {!isDetecting && (
          <Ionicons name="chevron-down" size={14} color={colors.textLight} />
        )}
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your City</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.detectRow}
              onPress={() => {
                setModalVisible(false);
                detectLocation();
              }}
            >
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.detectText}>Use Current Location</Text>
            </TouchableOpacity>

            <FlatList
              data={cities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityRow}
                  onPress={() => handleSelectCity(item)}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={colors.textLight}
                  />
                  <Text style={styles.cityText}>{item}</Text>
                  {item === selectedCity && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    maxWidth: 110,
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  detectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFF1EA',
  },
  detectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cityText: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
  },
});