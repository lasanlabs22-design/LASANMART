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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth, UserProfile } from '../context/AuthContext';
import { businessSectors } from '../data/businessSectors';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
  { key: 'sector', label: 'Business sector' },
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

  const hasLocation = profile.latitude != null && profile.longitude != null;

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
            colors={['#3B1E6E', '#1E1140', '#120B28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            {/* Layered glows, so the card has depth rather than a flat wash */}
            <View pointerEvents="none" style={styles.glowOne} />
            <View pointerEvents="none" style={styles.glowTwo} />
            <View pointerEvents="none" style={styles.sheen} />

            {/* Company logo — small, top right, out of the way */}
            <TouchableOpacity
              style={styles.logoChip}
              activeOpacity={0.85}
              onPress={() =>
                pickImage((uri) => setImage('companyLogoUri', uri))
              }
            >
              {form.companyLogoUri ? (
                <Image
                  source={{ uri: form.companyLogoUri }}
                  style={styles.logoImage}
                />
              ) : (
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={16}
                  color="rgba(255,255,255,0.55)"
                />
              )}

              <View style={styles.logoChipBadge}>
                <MaterialCommunityIcons
                  name={form.companyLogoUri ? 'pencil' : 'plus'}
                  size={9}
                  color={colors.white}
                />
              </View>

              {/* Only shown while there's no logo — otherwise the icon
                  alone gives no clue what it's for */}
              {!form.companyLogoUri && (
                <Text style={styles.logoHint}>Add logo</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bannerTop}>
              {/* Avatar */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  pickImage((uri) => setImage('profilePictureUri', uri))
                }
              >
                <View style={styles.avatarRing}>
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
                          size={34}
                          color="rgba(255,255,255,0.6)"
                        />
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.editBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={11}
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
              </View>
            </View>

            {/* Chips sit on their own row, so long names don't squeeze them */}
            <View style={styles.chipRow}>
              {profile.sector ? (
                <View style={styles.chip}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={11}
                    color="rgba(255,255,255,0.85)"
                  />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {profile.sector}
                  </Text>
                </View>
              ) : null}

              {loginMethod && (
                <View style={styles.chip}>
                  <View style={styles.methodDot} />
                  <Text style={styles.chipText}>
                    {METHOD_LABEL[loginMethod]}
                  </Text>
                </View>
              )}
            </View>
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

          {/* My Vibes */}
          <Text style={styles.groupTitle}>My Vibes</Text>
          <TouchableOpacity
            style={styles.mapCard}
            activeOpacity={0.9}
            onPress={() => navigation.getParent()?.navigate('MyReels')}
          >
            <View style={styles.mapEmpty}>
              <View style={styles.mapEmptyIcon}>
                <MaterialCommunityIcons
                  name="play-box-multiple-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapEmptyTitle}>My uploads</Text>
                <Text style={styles.mapEmptyText}>
                  See the reels you've posted and how many views they've had
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textLight}
              />
            </View>
          </TouchableOpacity>

          {!isEditing ? (
            /* ---------- View mode ---------- */
            <View style={styles.viewCard}>
              <Text style={styles.groupTitle}>Business Details</Text>

              <InfoRow
                icon="tag-outline"
                label="Sector"
                value={profile.sector}
              />

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

              {/* Sector — tap to select, tap again to clear */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Business Sector</Text>
                <View style={styles.sectorWrap}>
                  {businessSectors.map((s) => {
                    const active = form.sector === s.label;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.sectorChip,
                          active && styles.sectorChipActive,
                        ]}
                        activeOpacity={0.85}
                        onPress={() =>
                          setField('sector', active ? '' : s.label)
                        }
                      >
                        <MaterialCommunityIcons
                          name={s.icon as any}
                          size={14}
                          color={active ? colors.white : colors.textLight}
                        />
                        <Text
                          style={[
                            styles.sectorChipText,
                            active && styles.sectorChipTextActive,
                          ]}
                        >
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

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
    borderRadius: 26,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#3B1E6E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  glowOne: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(139,92,246,0.28)',
  },
  glowTwo: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,197,41,0.10)',
  },
  sheen: {
    position: 'absolute',
    top: -40,
    left: -60,
    width: 90,
    height: 280,
    backgroundColor: 'rgba(255,255,255,0.045)',
    transform: [{ rotate: '20deg' }],
  },

  /* Small logo chip, top right */
  logoChip: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logoImage: { width: 30, height: 30, borderRadius: 10 },
  logoChipBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1140',
  },
  logoHint: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 60,
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },

  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: 15 },

  /* A soft ring around the avatar lifts it off the gradient */
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 30,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 27 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.white,
    letterSpacing: -0.5,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#1E1140',
  },

  bannerText: { flex: 1, paddingRight: 44 },
  bannerName: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.white,
    letterSpacing: -0.8,
  },
  bannerCompany: {
    fontFamily: fonts.bodyBold,
    fontSize: 17.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.85)',
  },
  methodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#12B3A0',
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
  fieldBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  fieldInputMultiline: { height: '100%', lineHeight: 20 },

  /* Sector chips */
  sectorWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sectorChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  sectorChipTextActive: { color: colors.white },

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
