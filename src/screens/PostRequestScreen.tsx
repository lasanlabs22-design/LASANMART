import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { onlineMarketing, offlineMarketing, CategoryItem } from '../data/homeCategories';
import { BusinessSector } from '../data/businessSectors';
import { useAuth } from '../context/AuthContext';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';
import SectorDropdown from '../components/SectorDropdown';
import { cityFrom } from '../components/HomeHeader';

export default function PostRequestScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  // Handles the contact-details gate, the API call, and the busy state
  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  // A service can be pre-selected when arriving from a Home category tap
  const preset: CategoryItem | undefined = route?.params?.service;
  const presetCategory: 'online' | 'offline' | undefined = route?.params?.category;

  const [tab, setTab] = useState<'online' | 'offline'>(presetCategory ?? 'online');
  const [service, setService] = useState<CategoryItem | null>(preset ?? null);
  const [sector, setSector] = useState<BusinessSector | null>(null);
  const [customSector, setCustomSector] = useState('');
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  // Arriving from Home shows just the chosen service; "Change" opens
  // the full picker. Without a preset (e.g. from My Requests) the
  // picker is always shown.
  const [changingService, setChangingService] = useState(false);
  const showPicker = !preset || changingService;

  const list = tab === 'online' ? onlineMarketing : offlineMarketing;

  const isOtherSector = sector?.label === 'Other';
  const resolvedSector = isOtherSector ? customSector.trim() : sector?.label ?? '';

  // From the saved business location (set with the map / GPS picker),
  // the same one the Home header shows — no separate city to type
  const city = cityFrom(profile.address);

  const isReady =
    !!service && resolvedSector.length > 1 && description.trim().length > 3;

  const handleSubmit = () => {
    if (!isReady || !service) {
      Alert.alert(
        'Almost there',
        'Pick a service and your business sector, and tell us what you need.'
      );
      return;
    }

    // Send to the backend — stored in the database and emailed to the team
    submit({
      type: 'service',
      title: service.label,
      description: description.trim(),
      sector: resolvedSector,
      city: city || undefined,
      details: {
        service: service.label,
        category: tab === 'online' ? 'Online Marketing' : 'Offline Marketing',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Request</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1 — Service */}
          <StepLabel
            n={1}
            text={showPicker ? 'What service do you need?' : 'Your selected service'}
          />

          {!showPicker && service && (
            <View style={styles.selectedCard}>
              <View
                style={[
                  styles.selectedArt,
                  { backgroundColor: `${service.color}1A` },
                ]}
              >
                {service.image ? (
                  <Image source={service.image} style={styles.selectedImage} />
                ) : (
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={26}
                    color={service.color}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedLabel}>{service.label}</Text>
                <Text style={styles.selectedCategory}>
                  {tab === 'online' ? 'Online Marketing' : 'Offline Marketing'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setChangingService(true)}
                hitSlop={10}
              >
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {showPicker && (
            <>
              <View style={styles.tabs}>
                {(['online', 'offline'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tab, tab === t && styles.tabActive]}
                    activeOpacity={0.8}
                    onPress={() => setTab(t)}
                  >
                    <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                      {t === 'online' ? 'Online Marketing' : 'Offline Marketing'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FlatList
                data={list}
                keyExtractor={(i) => i.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ gap: 10 }}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => {
                  const active = service?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[styles.serviceCard, active && styles.serviceCardActive]}
                      activeOpacity={0.85}
                      onPress={() => {
                        setService(item);
                        // Back to the single selected-service card
                        if (preset) setChangingService(false);
                      }}
                    >
                      <View
                        style={[
                          styles.serviceIcon,
                          { backgroundColor: `${item.color}1A` },
                        ]}
                      >
                        {item.image ? (
                          <Image source={item.image} style={styles.serviceArt} />
                        ) : (
                          <MaterialCommunityIcons
                            name={item.icon as any}
                            size={18}
                            color={item.color}
                          />
                        )}
                      </View>
                      <Text
                        style={[styles.serviceLabel, active && styles.serviceLabelActive]}
                        numberOfLines={2}
                      >
                        {item.label}
                      </Text>
                      {active && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}

          {/* Step 2 — Business sector */}
          <StepLabel n={2} text="What's your business sector?" />

          <Text style={styles.stepHint}>
            This helps our team tailor the campaign to your industry
          </Text>

          <SectorDropdown
            value={sector}
            onChange={(s) => {
              setSector(s);
              if (s.label !== 'Other') setCustomSector('');
            }}
          />

          {isOtherSector && (
            <View
              style={[
                styles.field,
                styles.sectorInput,
                focused === 'sector' && styles.fieldActive,
              ]}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={18}
                color={focused === 'sector' ? colors.primary : colors.textLight}
              />
              <TextInput
                style={styles.input}
                placeholder="Tell us your sector"
                placeholderTextColor={colors.textLight}
                value={customSector}
                onChangeText={setCustomSector}
                onFocus={() => setFocused('sector')}
                onBlur={() => setFocused(null)}
              />
            </View>
          )}

          {/* Step 3 — Details */}
          <StepLabel n={3} text="Tell us about it" />

          <Text style={styles.label}>What do you need?</Text>
          <Text style={styles.hint}>
            A line or two is enough — our team will work out the rest with you.
          </Text>
          <View
            style={[
              styles.field,
              styles.fieldMultiline,
              focused === 'desc' && styles.fieldActive,
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. A Diwali campaign for my showroom — goal, audience, anything specific…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* City comes from the saved location; tapping opens the same
              map / GPS picker as the Home header */}
          <TouchableOpacity
            style={styles.locationRow}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LocationPicker')}
          >
            <MaterialCommunityIcons
              name={city ? 'map-marker' : 'map-marker-outline'}
              size={18}
              color={city ? colors.primary : colors.textLight}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {city ? `Location: ${city}` : 'Set your location'}
            </Text>
            <Text style={styles.changeText}>{city ? 'Change' : 'Set'}</Text>
          </TouchableOpacity>

          <View style={styles.assureRow}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={15}
              color={colors.textLight}
            />
            <Text style={styles.assureText}>
              Our team reviews every request and contacts you
              {profile.phone ? ` on ${profile.phone}` : ' directly'}
            </Text>
          </View>
        </ScrollView>

        {/* Sticky footer */}
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isReady || busy) && styles.submitDisabled,
            ]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.submitText}>Post Request</Text>
                <MaterialCommunityIcons
                  name="send-outline"
                  size={17}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Asks for name / phone / email the first time only */}
        <ContactDetailsSheet {...sheetProps} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNum}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
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
  backButton: {
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

  content: { padding: 16, paddingBottom: 28 },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 26,
    marginBottom: 14,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.white },
  stepText: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.4,
  },
  stepHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: -8,
    marginBottom: 14,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.textLight },
  tabTextActive: { color: colors.textDark },

  serviceCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.white,
  },
  serviceCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceArt: {
    width: 24,
    height: 24,
  },
  serviceLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.textDark,
  },
  serviceLabelActive: { fontFamily: fonts.bodyBold },

  /* The service picked on Home */
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 12,
  },
  selectedArt: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: { width: 46, height: 46 },
  selectedLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
  },
  selectedCategory: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  changeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },

  sectorInput: { marginTop: 12 },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
    marginTop: -4,
    marginBottom: 8,
  },

  field: {
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
  fieldMultiline: { height: 130, alignItems: 'flex-start', paddingVertical: 14 },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  inputMultiline: { height: '100%', lineHeight: 20 },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  locationText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textDark,
  },

  assureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 24,
  },
  assureText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textLight,
    flex: 1,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  submitDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.white },
});