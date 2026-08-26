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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { onlineMarketing, offlineMarketing, CategoryItem } from '../data/homeCategories';
import { businessSectors, BusinessSector } from '../data/businessSectors';
import { useAuth } from '../context/AuthContext';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const BUDGETS = ['Under ₹25K', '₹25K–50K', '₹50K–1L', '₹1L+', 'Not sure'];
const TIMELINES = ['ASAP', 'This month', 'Next month', 'Flexible'];

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [city, setCity] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const list = tab === 'online' ? onlineMarketing : offlineMarketing;

  const isOtherSector = sector?.label === 'Other';
  const resolvedSector = isOtherSector ? customSector.trim() : sector?.label ?? '';

  const isReady =
    !!service &&
    resolvedSector.length > 1 &&
    title.trim().length > 3 &&
    description.trim().length >= 20 &&
    !!budget &&
    !!timeline;

  const handleSubmit = () => {
    if (!isReady || !service) {
      Alert.alert(
        'Almost there',
        'Pick a service and your business sector, add a title, describe what you need, and choose a budget and timeline.'
      );
      return;
    }

    // Send to the backend — stored in the database and emailed to the team
    submit({
      type: 'service',
      title: title.trim(),
      description: description.trim(),
      sector: resolvedSector,
      city: city.trim() || undefined,
      details: {
        service: service.label,
        category: tab === 'online' ? 'Online Marketing' : 'Offline Marketing',
        budget,
        timeline,
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
          <StepLabel n={1} text="What service do you need?" />

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
                  onPress={() => setService(item)}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      { backgroundColor: `${item.color}1A` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
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

          {/* Step 2 — Business sector */}
          <StepLabel n={2} text="What's your business sector?" />

          <Text style={styles.stepHint}>
            This helps our team tailor the campaign to your industry
          </Text>

          <View style={styles.sectorWrap}>
            {businessSectors.map((s) => {
              const active = sector?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sectorChip, active && styles.sectorChipActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSector(s);
                    if (s.label !== 'Other') setCustomSector('');
                  }}
                >
                  <MaterialCommunityIcons
                    name={s.icon as any}
                    size={15}
                    color={active ? colors.white : colors.textLight}
                  />
                  <Text
                    style={[styles.sectorText, active && styles.sectorTextActive]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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

          <Text style={styles.label}>Request Service Name</Text>
          <View style={[styles.field, focused === 'title' && styles.fieldActive]}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Diwali campaign for my showroom"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>What exactly do you need in service?</Text>
            <Text
              style={[
                styles.counter,
                description.trim().length >= 20 && styles.counterOk,
              ]}
            >
              {description.trim().length}/20
            </Text>
          </View>
          <View
            style={[
              styles.field,
              styles.fieldMultiline,
              focused === 'desc' && styles.fieldActive,
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe your goal, target audience, locations, anything specific…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <Text style={styles.label}>City / Area</Text>
          <View style={[styles.field, focused === 'city' && styles.fieldActive]}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={focused === 'city' ? colors.primary : colors.textLight}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Guntur"
              placeholderTextColor={colors.textLight}
              value={city}
              onChangeText={setCity}
              onFocus={() => setFocused('city')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Step 4 — Budget & timeline */}
          <StepLabel n={4} text="Budget & timeline" />

          <Text style={styles.label}>Approximate Budget</Text>
          <View style={styles.chipWrap}>
            {BUDGETS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.chip, budget === b && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setBudget(b)}
              >
                <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>When do you need it?</Text>
          <View style={styles.chipWrap}>
            {TIMELINES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, timeline === t && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setTimeline(t)}
              >
                <Text style={[styles.chipText, timeline === t && styles.chipTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
  serviceLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.textDark,
  },
  serviceLabelActive: { fontFamily: fonts.bodyBold },

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
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  sectorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  sectorTextActive: { color: colors.white },
  sectorInput: { marginTop: 12 },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  counter: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 16,
  },
  counterOk: { color: '#12B3A0' },

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

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.textDark, borderColor: colors.textDark },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.textLight },
  chipTextActive: { color: colors.white },

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