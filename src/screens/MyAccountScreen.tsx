import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth, UserProfile } from '../context/AuthContext';
import ProfileCompletionCard from '../components/ProfileCompletionCard';

const pickImage = async (onPicked: (uri: string) => void) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Permission Needed',
      'We need access to your photos to set this image.'
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled && result.assets?.[0]) {
    onPicked(result.assets[0].uri);
  }
};

const METHOD_LABEL: Record<string, string> = {
  google: 'Signed in with Google',
  apple: 'Signed in with Apple',
  phone: 'Signed in with phone',
  skip: 'Browsing as guest',
};

const PROFILE_FIELDS: { key: keyof UserProfile; label: string }[] = [
  { key: 'profilePictureUri', label: 'Profile picture' },
  { key: 'name', label: 'Your name' },
  { key: 'companyName', label: 'Company name' },
  { key: 'companyDescription', label: 'Company description' },
  { key: 'phone', label: 'Phone number' },
  { key: 'email', label: 'Email address' },
  { key: 'address', label: 'Business location' },
  { key: 'companyLogoUri', label: 'Company logo' },
  { key: 'instagramId', label: 'Instagram' },
  { key: 'facebookId', label: 'Facebook' },
];

export default function MyAccountScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const {
    profile,
    loginMethod,
    isProfileSaved,
    updateProfile,
    markProfileSaved,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(!isProfileSaved);
  const [form, setForm] = useState<UserProfile>(profile);
  const [focused, setFocused] = useState<string | null>(null);

  const setField = (key: keyof UserProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Images save immediately — they aren't part of the form's save/cancel flow
  const setImage = (key: keyof UserProfile, uri: string) => {
    setForm((prev) => ({ ...prev, [key]: uri }));
    updateProfile({ [key]: uri } as Partial<UserProfile>);
  };

  const startEditing = () => {
    setForm(profile); // resync, in case images or location changed while viewing
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }

    updateProfile(form);
    markProfileSaved();
    setIsEditing(false);
  };

  const openSettings = () => navigation.getParent()?.navigate('Settings');

  const openLocationPicker = () =>
    navigation.getParent()?.navigate('LocationPicker');

  const initials = (profile.name || form.name || '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  /* ---------- Profile completion ---------- */
  const filledKeys = PROFILE_FIELDS.filter((f) => {
    const v = profile[f.key];
    return typeof v === 'string' && v.trim().length > 0;
  }).map((f) => f.key);

  const percent = Math.round((filledKeys.length / PROFILE_FIELDS.length) * 100);
  const missing = PROFILE_FIELDS.filter((f) => !filledKeys.includes(f.key));
  const nextUp = missing[0];

  const hasLocation =
    profile.latitude != null && profile.longitude != null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity style={styles.iconButton} onPress={openSettings}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 48 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile banner */}
          <LinearGradient
            colors={['#2B2D42', '#14151F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View pointerEvents="none" style={styles.bannerOrb} />

            <View style={styles.bannerTop}>
              {/* Avatar */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  pickImage((uri) => setImage('profilePictureUri', uri))
                }
              >
                {form.profilePictureUri ? (
                  <Image
                    source={{ uri: form.profilePictureUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    {initials ? (
                      <Text style={styles.initials}>{initials}</Text>
                    ) : (
                      <MaterialCommunityIcons
                        name="account"
                        size={36}
                        color="rgba(255,255,255,0.6)"
                      />
                    )}
                  </View>
                )}

                <View style={styles.editBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={12}
                    color={colors.white}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.bannerText}>
                <Text style={styles.bannerName} numberOfLines={1}>
                  {profile.name || 'Add your name'}
                </Text>
                <Text style={styles.bannerCompany} numberOfLines={1}>
                  {profile.companyName || 'No company added yet'}
                </Text>

                {loginMethod && (
                  <View style={styles.methodPill}>
                    <View style={styles.methodDot} />
                    <Text style={styles.methodText}>
                      {METHOD_LABEL[loginMethod]}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Company logo strip */}
            <TouchableOpacity
              style={styles.logoStrip}
              activeOpacity={0.85}
              onPress={() => pickImage((uri) => setImage('companyLogoUri', uri))}
            >
              {form.companyLogoUri ? (
                <Image
                  source={{ uri: form.companyLogoUri }}
                  style={styles.logo}
                />
              ) : (
                <View style={[styles.logo, styles.logoPlaceholder]}>
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={20}
                    color="rgba(255,255,255,0.55)"
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.logoTitle}>Company Logo</Text>
                <Text style={styles.logoHint}>
                  {form.companyLogoUri ? 'Tap to replace' : 'Tap to upload'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="tray-arrow-up"
                size={18}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          </LinearGradient>

          {/* Profile completion */}
          <ProfileCompletionCard
            percent={percent}
            filled={filledKeys.length}
            total={PROFILE_FIELDS.length}
            nextLabel={nextUp?.label}
            onPress={startEditing}
          />

          {/* Business location */}
          <Text style={styles.groupTitle}>Business Location</Text>

          <TouchableOpacity
            style={styles.mapCard}
            activeOpacity={0.9}
            onPress={openLocationPicker}
          >
            {hasLocation ? (
              <>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.mapPreview}
                  pointerEvents="none"
                  region={{
                    latitude: profile.latitude as number,
                    longitude: profile.longitude as number,
                    latitudeDelta: 0.006,
                    longitudeDelta: 0.006,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: profile.latitude as number,
                      longitude: profile.longitude as number,
                    }}
                    pinColor={colors.primary}
                  />
                </MapView>

                <View style={styles.mapFoot}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={17}
                    color={colors.primary}
                  />
                  <Text style={styles.mapAddress} numberOfLines={2}>
                    {profile.address || 'Location set'}
                  </Text>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={16}
                    color={colors.textLight}
                  />
                </View>
              </>
            ) : (
              <View style={styles.mapEmpty}>
                <View style={styles.mapEmptyIcon}>
                  <MaterialCommunityIcons
                    name="map-marker-plus-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapEmptyTitle}>Add your location</Text>
                  <Text style={styles.mapEmptyText}>
                    Helps our team plan local campaigns for you
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textLight}
                />
              </View>
            )}
          </TouchableOpacity>

          {!isEditing ? (
            /* ---------- View mode ---------- */
            <View style={styles.viewCard}>
              <Text style={styles.groupTitle}>Business Details</Text>

              <InfoRow
                icon="text-box-outline"
                label="About the company"
                value={profile.companyDescription}
              />

              <Text style={styles.groupTitle}>Contact</Text>

              <InfoRow
                icon="phone-outline"
                label="Phone"
                value={profile.phone}
              />
              <InfoRow
                icon="email-outline"
                label="Email"
                value={profile.email}
              />

              <Text style={styles.groupTitle}>Social</Text>

              <InfoRow
                icon="instagram"
                label="Instagram"
                value={profile.instagramId}
              />
              <InfoRow
                icon="facebook"
                label="Facebook"
                value={profile.facebookId}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPress={startEditing}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={17}
                  color={colors.white}
                />
                <Text style={styles.primaryButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ---------- Edit mode ---------- */
            <View style={styles.formCard}>
              <Text style={styles.groupTitle}>Business Details</Text>

              <Field
                id="name"
                label="Name"
                icon="account-outline"
                value={form.name}
                onChangeText={(v: string) => setField('name', v)}
                placeholder="Your full name"
                focused={focused}
                setFocused={setFocused}
              />

              <Field
                id="company"
                label="Company Name"
                icon="office-building-outline"
                value={form.companyName}
                onChangeText={(v: string) => setField('companyName', v)}
                placeholder="Your company name"
                focused={focused}
                setFocused={setFocused}
              />

              <Field
                id="desc"
                label="Company Description"
                value={form.companyDescription}
                onChangeText={(v: string) => setField('companyDescription', v)}
                placeholder="What does your company do?"
                multiline
                focused={focused}
                setFocused={setFocused}
              />

              <Text style={styles.groupTitle}>Contact</Text>

              <Field
                id="phone"
                label="Phone Number"
                icon="phone-outline"
                value={form.phone}
                onChangeText={(v: string) =>
                  setField('phone', v.replace(/[^0-9]/g, ''))
                }
                placeholder="9876543210"
                keyboardType="number-pad"
                maxLength={10}
                focused={focused}
                setFocused={setFocused}
              />

              <Field
                id="email"
                label="Email"
                icon="email-outline"
                value={form.email}
                onChangeText={(v: string) => setField('email', v)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                focused={focused}
                setFocused={setFocused}
              />

              <Text style={styles.groupTitle}>Social</Text>

              <Field
                id="insta"
                label="Instagram ID"
                icon="instagram"
                value={form.instagramId}
                onChangeText={(v: string) => setField('instagramId', v)}
                placeholder="@yourhandle"
                autoCapitalize="none"
                focused={focused}
                setFocused={setFocused}
              />

              <Field
                id="fb"
                label="Facebook ID"
                icon="facebook"
                value={form.facebookId}
                onChangeText={(v: string) => setField('facebookId', v)}
                placeholder="facebook.com/yourpage"
                autoCapitalize="none"
                focused={focused}
                setFocused={setFocused}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPress={handleSave}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.primaryButtonText}>Save Details</Text>
              </TouchableOpacity>

              {isProfileSaved && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setForm(profile);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Sub-components ---------- */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const empty = !value;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={17}
          color={colors.textLight}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, empty && styles.infoValueEmpty]}>
          {value || 'Not added yet'}
        </Text>
      </View>
    </View>
  );
}

function Field({
  id,
  label,
  icon,
  focused,
  setFocused,
  ...inputProps
}: {
  id: string;
  label: string;
  icon?: string;
  focused: string | null;
  setFocused: (v: string | null) => void;
  [key: string]: any;
}) {
  const active = focused === id;

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.fieldBox,
          inputProps.multiline && styles.fieldBoxMultiline,
          active && styles.fieldBoxActive,
        ]}
      >
        {icon && !inputProps.multiline && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={active ? colors.primary : colors.textLight}
          />
        )}
        <TextInput
          style={[
            styles.fieldInput,
            inputProps.multiline && styles.fieldInputMultiline,
          ]}
          placeholderTextColor={colors.textLight}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          textAlignVertical={inputProps.multiline ? 'top' : 'center'}
          {...inputProps}
        />
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: { padding: 16, paddingBottom: 48 },

  /* Banner */
  banner: {
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerOrb: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,107,53,0.14)',
  },
  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 96, height: 96, borderRadius: 28 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.5,
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#1B1D2A',
  },
  bannerText: { flex: 1 },
  bannerName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
    letterSpacing: -0.5,
  },
  bannerCompany: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8,
  },
  methodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#12B3A0',
  },
  methodText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  logoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },
  logo: { width: 44, height: 44, borderRadius: 12 },
  logoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.white,
  },
  logoHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },

  /* Location */
  mapCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  mapPreview: { height: 150, width: '100%' },
  mapFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mapAddress: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textDark,
  },
  mapEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  mapEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapEmptyTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 14.5,
    color: colors.textDark,
  },
  mapEmptyText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },

  /* Shared */
  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 12,
  },

  /* View mode */
  viewCard: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  infoValueEmpty: {
    fontFamily: fonts.body,
    color: colors.textLight,
  },

  /* Edit mode */
  formCard: {},
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 7,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 54,
  },
  fieldBoxMultiline: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  fieldBoxActive: { borderColor: colors.primary, backgroundColor: colors.white },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  fieldInputMultiline: { height: '100%', lineHeight: 20 },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },

  cancelButton: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});