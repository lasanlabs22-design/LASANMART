import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

// Guntur — sensible default before we know where the user is
const FALLBACK = { latitude: 16.3067, longitude: 80.4365 };

export default function LocationPickerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [coords, setCoords] = useState({
    latitude: profile.latitude ?? FALLBACK.latitude,
    longitude: profile.longitude ?? FALLBACK.longitude,
  });
  const [address, setAddress] = useState(profile.address);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);

  // If we have no saved location, try the device's on open
  useEffect(() => {
    if (profile.latitude == null) useMyLocation();
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const r = results?.[0];
      if (r) {
        const line = [r.name, r.street, r.district, r.city, r.postalCode]
          .filter(Boolean)
          .join(', ');
        setAddress(line);
      }
    } catch {
      // Leave whatever the user typed
    } finally {
      setResolving(false);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Allow location access, or drag the pin to set your address manually.'
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setCoords(next);
      mapRef.current?.animateToRegion(
        { ...next, latitudeDelta: 0.008, longitudeDelta: 0.008 },
        600
      );
      reverseGeocode(next.latitude, next.longitude);
    } catch {
      Alert.alert('Could not get location', 'Try dragging the pin instead.');
    } finally {
      setLocating(false);
    }
  };

  const onDragEnd = (e: any) => {
    const next = e.nativeEvent.coordinate;
    setCoords(next);
    reverseGeocode(next.latitude, next.longitude);
  };

  const handleSave = () => {
    if (!address.trim()) {
      Alert.alert('Add an address', 'Set a pin or type your address.');
      return;
    }
    updateProfile({
      address: address.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color={colors.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Location</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={onDragEnd}
        >
          <Marker
            coordinate={coords}
            draggable
            onDragEnd={onDragEnd}
            pinColor={colors.primary}
          />
        </MapView>

        <View style={styles.mapHint} pointerEvents="none">
          <MaterialCommunityIcons
            name="gesture-tap"
            size={13}
            color={colors.white}
          />
          <Text style={styles.mapHintText}>Tap or drag the pin</Text>
        </View>

        <TouchableOpacity
          style={styles.locateBtn}
          activeOpacity={0.9}
          onPress={useMyLocation}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.addressRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={19}
            color={colors.primary}
          />
          <Text style={styles.addressLabel}>Address</Text>
          {resolving && (
            <ActivityIndicator size="small" color={colors.textLight} />
          )}
        </View>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Shop no, street, area, city"
            placeholderTextColor={colors.textLight}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <Text style={styles.coordText}>
          {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
        </Text>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="check" size={18} color={colors.white} />
          <Text style={styles.saveText}>Save Location</Text>
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
  iconButton: {
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

  mapWrap: { flex: 1 },
  mapHint: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  mapHintText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.white,
  },
  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: -18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 9,
  },
  addressLabel: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 70,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.textDark,
    padding: 0,
  },
  coordText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 8,
    marginLeft: 2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  saveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
});