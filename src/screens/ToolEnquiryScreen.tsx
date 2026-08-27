import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { businessSectors, BusinessSector } from '../data/businessSectors';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', '200+'];
const TIMELINES = ['Right away', 'Within a month', 'Next quarter', 'Just exploring'];

/** Questions that only make sense for a particular tool */
const TOOL_QUESTIONS: Record<string, { label: string; placeholder: string }> = {
  attendance: {
    label: 'How do you track attendance today?',
    placeholder:
      'e.g. paper register, biometric machine, WhatsApp messages, nothing yet…',
  },
  crm: {
    label: 'What should the CRM keep track of?',
    placeholder:
      'e.g. leads and follow-ups, service jobs, dealer orders, site visits…',
  },
  quotation: {
    label: 'What do your quotations usually include?',
    placeholder: 'e.g. line items with GST, delivery terms, payment schedule…',
  },
};

export default function ToolEnquiryScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuth();

  const tool = route.params.tool;
  const question = TOOL_QUESTIONS[tool.id] || {
    label: 'What do you need it to do?',
    placeholder: 'Tell us how you would use it…',
  };

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const [company, setCompany] = useState(profile.companyName);
  const [sector, setSector] = useState<BusinessSector | null>(null);
  const [teamSize, setTeamSize] = useState('');
  const [timeline, setTimeline] = useState('');
  const [requirement, setRequirement] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const isReady = requirement.trim().length >= 15 && !!teamSize && !!timeline;

  const handleSubmit = () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Tell us a bit more about what you need, and pick your team size and timeline.'
      );
      return;
    }

    if (company.trim()) {
      updateProfile({ companyName: company.trim() });
    }

    submit({
      type: 'custom',
      title: `${tool.title} — enquiry`,
      description: requirement.trim(),
      // The email shows this as the heading above their answer,
      // so the question and answer stay together
      descriptionLabel: question.label,
      sector: sector?.label,
      details: {
        tool: tool.title,
        teamSize,
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
          <Text style={styles.headerTitle}>Tool Enquiry</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Selected tool */}
          <LinearGradient
            colors={tool.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toolCard}
          >
            <View pointerEvents="none" style={styles.orb} />

            <View style={styles.toolTop}>
              <View style={styles.iconTile}>
                <MaterialCommunityIcons
                  name={tool.icon as any}
                  size={24}
                  color={colors.white}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolLabel}>SELECTED TOOL</Text>
                <Text style={styles.toolTitle}>{tool.title}</Text>
              </View>
            </View>

            <Text style={styles.toolTagline}>{tool.tagline}</Text>

            <View style={styles.pointRow}>
              {tool.points.map((p: string) => (
                <View key={p} style={styles.point}>
                  <MaterialCommunityIcons
                    name="check"
                    size={11}
                    color={colors.white}
                  />
                  <Text style={styles.pointText}>{p}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Requirement */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>{question.label}</Text>
            <Text
              style={[
                styles.counter,
                requirement.trim().length >= 15 && styles.counterOk,
              ]}
            >
              {requirement.trim().length}/15
            </Text>
          </View>
          <View
            style={[
              styles.field,
              styles.fieldMultiline,
              focused === 'req' && styles.fieldActive,
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder={question.placeholder}
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={requirement}
              onChangeText={setRequirement}
              onFocus={() => setFocused('req')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Company */}
          <Text style={styles.label}>Company Name</Text>
          <View style={[styles.field, focused === 'co' && styles.fieldActive]}>
            <MaterialCommunityIcons
              name="office-building-outline"
              size={18}
              color={focused === 'co' ? colors.primary : colors.textLight}
            />
            <TextInput
              style={styles.input}
              placeholder="Your business name"
              placeholderTextColor={colors.textLight}
              value={company}
              onChangeText={setCompany}
              onFocus={() => setFocused('co')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Sector */}
          <Text style={styles.groupTitle}>Business Sector</Text>
          <View style={styles.chipWrap}>
            {businessSectors.map((s) => {
              const active = sector?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSector(active ? null : s)}
                >
                  <MaterialCommunityIcons
                    name={s.icon as any}
                    size={14}
                    color={active ? colors.white : colors.textLight}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Team size */}
          <Text style={styles.groupTitle}>How many people will use it?</Text>
          <View style={styles.chipWrap}>
            {TEAM_SIZES.map((t) => {
              const active = teamSize === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setTeamSize(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Timeline */}
          <Text style={styles.groupTitle}>When do you need it?</Text>
          <View style={styles.chipWrap}>
            {TIMELINES.map((t) => {
              const active = timeline === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setTimeline(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.assureRow}>
            <MaterialCommunityIcons
              name="headset"
              size={15}
              color={colors.textLight}
            />
            <Text style={styles.assureText}>
              Setup, training and ongoing support are included — our team walks
              you through it
            </Text>
          </View>
        </ScrollView>

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
                <Text style={styles.submitText}>Send Enquiry</Text>
                <MaterialCommunityIcons
                  name="send-outline"
                  size={17}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        <ContactDetailsSheet {...sheetProps} />
      </KeyboardAvoidingView>
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

  /* Tool summary */
  toolCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  orb: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  toolTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  toolTitle: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.white,
    letterSpacing: -0.5,
  },
  toolTagline: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
  },
  pointRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pointText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },

  /* Form */
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 18,
    marginBottom: 8,
    flex: 1,
    paddingRight: 10,
  },
  counter: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 18,
  },
  counterOk: { color: '#12B3A0' },
  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 12,
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
  fieldMultiline: {
    height: 130,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.textDark, borderColor: colors.textDark },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  chipTextActive: { color: colors.white },

  assureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 24,
  },
  assureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textLight,
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
  submitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
});