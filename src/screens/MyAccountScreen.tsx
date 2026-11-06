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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import TrustPanel from '../components/TrustPanel';
import {
  uploadPhoto,
  saveContactImages,
  saveContactProfile,
} from '../api/client';
import { verifiedPhoneNumber } from '../lib/phoneAuth';
import HeaderInset from '../components/HeaderInset';
import { shareProfile } from '../lib/shareProfile';

/* The system photo picker hands back only what the person chooses,
   so no photo library permission is asked for (Play policy, too) */
const pickImage = async (onPicked: (uri: string) => void) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]) return;

  const localUri = result.assets[0].uri;

  // Show it immediately, then replace with the hosted URL
  onPicked(localUri);

  try {
    const url = await uploadPhoto(localUri);
    onPicked(url);
  } catch {
    // Keep the local one — it still works on this device
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

/** What the view mode lists, in order */
const DETAIL_ROWS: { key: keyof UserProfile; label: string; icon: string }[] = [
  { key: 'sector', label: 'Sector', icon: 'tag-outline' },
  { key: 'companyDescription', label: 'About the company', icon: 'text-box-outline' },
  { key: 'phone', label: 'Phone', icon: 'phone-outline' },
  { key: 'email', label: 'Email', icon: 'email-outline' },
  { key: 'instagramId', label: 'Instagram', icon: 'instagram' },
  { key: 'facebookId', label: 'Facebook', icon: 'facebook' },
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

  const verifiedPhone = verifiedPhoneNumber();

  const [isEditing, setIsEditing] = useState(!isProfileSaved);
  const [form, setForm] = useState<UserProfile>(profile);
  const [focused, setFocused] = useState<string | null>(null);
  /** True when they have picked something the list does not cover */
  const [customSector, setCustomSector] = useState(
    !!profile.sector && !businessSectors.some((s) => s.label === profile.sector)
  );
  const [sectorOpen, setSectorOpen] = useState(false);

  const setField = (key: keyof UserProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setImage = async (key: keyof UserProfile, uri: string) => {
    setForm((prev) => ({ ...prev, [key]: uri }));
    updateProfile({ [key]: uri } as Partial<UserProfile>);

    // Only hosted URLs are worth saving — a local path means nothing
    // on another device
    if (uri.startsWith('http')) {
      saveContactImages(
        key === 'profilePictureUri' ? { photoUrl: uri } : { logoUrl: uri }
      );
    }
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

    const next = verifiedPhone ? { ...form, phone: verifiedPhone } : form;

    updateProfile(next);
    markProfileSaved();
    setIsEditing(false);

    // Keep the team's copy in step, so a new phone gets these back.
    // Only possible once the number is verified; fire-and-forget.
    if (verifiedPhone) {
      saveContactProfile({
        name: next.name.trim(),
        email: next.email.trim() || undefined,
        companyName: next.companyName.trim() || undefined,
        companyDescription: next.companyDescription.trim() || undefined,
        sector: next.sector.trim() || undefined,
        city: next.address.trim() || undefined,
      });
    }
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
  const profileDone = percent === 100;

  const hasLocation = profile.latitude != null && profile.longitude != null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <HeaderInset />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
          <View style={styles.headerActions}>
            {/* Shares the saved profile as a business card */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => shareProfile(profile)}
              accessibilityLabel="Share profile"
            >
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={openSettings}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={21}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
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
            {/* Layered shapes, so the card has depth rather than a flat wash */}
            <View pointerEvents="none" style={styles.orbOne} />
            <View pointerEvents="none" style={styles.orbTwo} />
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
                          size={28}
                          color="rgba(255,255,255,0.6)"
                        />
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.editBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={10}
                    color={colors.white}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.bannerText}>
                {/* Shrink rather than cut off — "Add your …" says nothing */}
                <Text
                  style={styles.bannerName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {profile.name || 'Add your name'}
                </Text>
                <Text
                  style={styles.bannerCompany}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
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

            {/* Profile completion, folded in rather than a card of its own */}
            <TouchableOpacity
              style={styles.progressBlock}
              activeOpacity={0.8}
              onPress={startEditing}
              disabled={profileDone}
            >
              {profileDone ? (
                <View style={styles.progressLine}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={15}
                    color="#12B3A0"
                  />
                  <Text style={styles.progressDone}>Profile complete</Text>
                </View>
              ) : (
                <>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${percent}%` }]}
                    />
                  </View>
                  <View style={styles.progressLine}>
                    <Text style={styles.progressPercent}>
                      {percent}% complete
                    </Text>
                    <View style={{ flex: 1 }} />
                    {nextUp && (
                      <Text style={styles.progressNext} numberOfLines={1}>
                        Add {nextUp.label.toLowerCase()}
                      </Text>
                    )}
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color="rgba(255,255,255,0.75)"
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>

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

          {/* Uploads — a short row of its own */}
          <View style={[styles.listCard, { marginTop: 12 }]}>
            <LinkRow
              icon="play-box-multiple-outline"
              title="My Vibes"
              subtitle="Reels you've posted and their views"
              onPress={() => navigation.getParent()?.navigate('MyReels')}
            />
          </View>

          {!isEditing ? (
            /* ---------- View mode ---------- */
            <View>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderTitle}>Your Details</Text>
                <TouchableOpacity
                  style={styles.editPill}
                  activeOpacity={0.8}
                  onPress={startEditing}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.editPillText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* One card, hairline-separated, instead of six boxes */}
              <View style={styles.listCard}>
                {DETAIL_ROWS.map((row, i) => (
                  <React.Fragment key={row.key}>
                    {i > 0 && <View style={styles.rowDivider} />}
                    <InfoRow
                      icon={row.icon}
                      label={row.label}
                      value={profile[row.key] as string}
                    />
                  </React.Fragment>
                ))}
              </View>
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

              {/* Sector — a dropdown with every sector; picking the
                  selected one again clears it */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Business Sector</Text>

                {(() => {
                  const selected = customSector
                    ? businessSectors.find(
                        (s) => s.label.toLowerCase() === 'other'
                      )
                    : businessSectors.find((s) => s.label === form.sector);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.fieldBox,
                        sectorOpen && styles.fieldBoxActive,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSectorOpen(!sectorOpen)}
                    >
                      <MaterialCommunityIcons
                        name={(selected?.icon ?? 'tag-outline') as any}
                        size={18}
                        color={
                          sectorOpen || selected
                            ? colors.primary
                            : colors.textLight
                        }
                      />
                      <Text
                        style={[
                          styles.fieldInput,
                          !selected && styles.sectorPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {selected?.label ?? 'Select your business sector'}
                      </Text>
                      <MaterialCommunityIcons
                        name={sectorOpen ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textLight}
                      />
                    </TouchableOpacity>
                  );
                })()}

                {sectorOpen && (
                  <View style={styles.sectorMenu}>
                    {/* Scrolls inside the page so the whole list fits */}
                    <ScrollView
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                      {businessSectors.map((s, i) => {
                        const isOther = s.label.toLowerCase() === 'other';
                        const active = isOther
                          ? customSector
                          : !customSector && form.sector === s.label;
                        return (
                          <TouchableOpacity
                            key={s.id}
                            style={[
                              styles.sectorOption,
                              i > 0 && styles.sectorOptionDivider,
                              active && styles.sectorOptionActive,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setSectorOpen(false);
                              if (isOther) {
                                // Typed in the box below instead
                                setCustomSector(!customSector);
                                setField('sector', '');
                              } else {
                                setCustomSector(false);
                                setField('sector', active ? '' : s.label);
                              }
                            }}
                          >
                            <MaterialCommunityIcons
                              name={s.icon as any}
                              size={18}
                              color={active ? colors.primary : colors.textLight}
                            />
                            <Text
                              style={[
                                styles.sectorOptionText,
                                active && styles.sectorOptionTextActive,
                              ]}
                            >
                              {s.label}
                            </Text>
                            {active && (
                              <MaterialCommunityIcons
                                name="check"
                                size={18}
                                color={colors.primary}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {customSector && (
                  <View style={styles.otherBox}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={17}
                      color={colors.primary}
                    />
                    <TextInput
                      style={styles.otherInput}
                      placeholder="What sector is your business in?"
                      placeholderTextColor={colors.textLight}
                      value={form.sector}
                      onChangeText={(v) => setField('sector', v)}
                      maxLength={40}
                      autoFocus
                    />
                  </View>
                )}
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
                label={verifiedPhone ? 'Phone Number (verified)' : 'Phone Number'}
                icon="phone-outline"
                // A verified number is the account itself — it changes
                // only by signing in with another one
                value={verifiedPhone || form.phone}
                editable={!verifiedPhone}
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
          <TrustPanel />
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
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={colors.primary}
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

function LinkRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.textLight}
      />
    </TouchableOpacity>
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: { flexDirection: 'row', gap: 8 },

  content: { padding: 16, paddingBottom: 48 },

  /* Banner */
  banner: {
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    // A plain drop shadow — no coloured glow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  orbOne: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(139,92,246,0.28)',
  },
  orbTwo: {
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

  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },

  /* A soft ring around the avatar lifts it off the gradient */
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 22,
    padding: 2.5,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 20 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.5,
  },
  editBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1140',
  },

  bannerText: { flex: 1, paddingRight: 44 },
  bannerName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
    letterSpacing: -0.6,
  },
  bannerCompany: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
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

  /* Completion, inside the profile card */
  progressBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFD166',
  },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressPercent: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: colors.white,
  },
  progressNext: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.75)',
  },
  progressDone: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.85)',
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

  /* Shared list card — uploads and the details */
  listCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Starts after the icon, so rows read as one list
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 58,
  },
  linkTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.textDark,
  },
  linkSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textLight,
    marginTop: 1,
  },

  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  groupHeaderTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  editPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },

  /* View mode */
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 1,
  },
  infoValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.textDark,
  },
  infoValueEmpty: {
    fontFamily: fonts.body,
    color: colors.textLight,
  },

  /* Edit mode */
  formCard: {},
  fieldWrapper: { marginBottom: 12 },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textDark,
    marginBottom: 6,
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
    height: 48,
  },
  fieldBoxMultiline: {
    height: 96,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  fieldBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.textDark,
    padding: 0,
  },
  fieldInputMultiline: { height: '100%', lineHeight: 20 },

  /* Sector dropdown */
  sectorPlaceholder: { color: colors.textLight },
  sectorMenu: {
    // About six rows show at once; the rest scroll
    maxHeight: 290,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  sectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  sectorOptionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectorOptionActive: { backgroundColor: colors.surface },
  sectorOptionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
  },
  sectorOptionTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },

  otherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 12,
  },
  otherInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.textDark,
    padding: 0,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },

  cancelButton: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
});
