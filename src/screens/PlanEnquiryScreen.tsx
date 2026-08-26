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
import { Plan } from '../data/plans';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const START_WHEN = ['Right away', 'Within a week', 'This month', 'Just exploring'];

export default function PlanEnquiryScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuth();
  const plan: Plan = route.params.plan;

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(
    profile.phone.replace(/\D/g, '').slice(-10)
  );
  const [company, setCompany] = useState(profile.companyName);
  const [sector, setSector] = useState<BusinessSector | null>(null);
  const [startWhen, setStartWhen] = useState('');
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const isReady = name.trim().length > 1 && phone.length === 10 && !!startWhen;

  const handleSubmit = () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Add your name, a 10-digit phone number, and when you want to start.'
      );
      return;
    }

    // Save what they typed here into the profile, so the details
    // sheet only appears if we're still missing an email
    updateProfile({
      name: name.trim(),
      phone,
      companyName: company.trim(),
    });

    submit({
      type: 'plan',
      title: `${plan.title} Plan — ${plan.price}`,
      description: message.trim() || undefined,
      sector: sector?.label,
      details: {
        plan: plan.title,
        price: plan.price,
        duration: plan.duration,
        tier: plan.tier,
        startWhen,
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
          <Text style={styles.headerTitle}>Plan Enquiry</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Selected plan summary */}
          <LinearGradient
            colors={plan.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCard}
          >
            <View pointerEvents="none" style={styles.orb} />

            <View style={styles.planTop}>
              <View>
                <Text style={styles.planLabel}>SELECTED PLAN</Text>
                <Text style={styles.planTitle}>{plan.title}</Text>
              </View>
              <View style={styles.tierPill}>
                <Text style={styles.tierText}>Tier {plan.tier}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.duration}>/ {plan.duration}</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.savings}>{plan.savings}</Text>
            </View>

            <View style={styles.chipRow}>
              {plan.features.map((f) => (
                <View key={f} style={styles.chip}>
                  <MaterialCommunityIcons
                    name="check"
                    size={11}
                    color={colors.white}
                  />
                  <Text style={styles.chipText}>{f}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Contact */}
          <Text style={styles.groupTitle}>Your Details</Text>

          <Field
            id="name"
            label="Your Name"
            icon="account-outline"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            focused={focused}
            setFocused={setFocused}
          />

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={[styles.field, focused === 'phone' && styles.fieldActive]}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.fieldDivider} />
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ''))}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
            />
            {phone.length === 10 && (
              <MaterialCommunityIcons
                name="check-circle"
                size={19}
                color="#12B3A0"
              />
            )}
          </View>

          <Field
            id="company"
            label="Company Name"
            icon="office-building-outline"
            value={company}
            onChangeText={setCompany}
            placeholder="Your business name"
            focused={focused}
            setFocused={setFocused}
          />

          {/* Sector */}
          <Text style={styles.groupTitle}>Business Sector</Text>
          <View style={styles.chipWrap}>
            {businessSectors.map((s) => {
              const active = sector?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.selectChip, active && styles.selectChipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSector(active ? null : s)}
                >
                  <MaterialCommunityIcons
                    name={s.icon as any}
                    size={14}
                    color={active ? colors.white : colors.textLight}
                  />
                  <Text
                    style={[
                      styles.selectChipText,
                      active && styles.selectChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Timeline */}
          <Text style={styles.groupTitle}>When do you want to start?</Text>
          <View style={styles.chipWrap}>
            {START_WHEN.map((w) => {
              const active = startWhen === w;
              return (
                <TouchableOpacity
                  key={w}
                  style={[styles.selectChip, active && styles.selectChipActive]}
                  activeOpacity={0.85}
                  onPress={() => setStartWhen(w)}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      active && styles.selectChipTextActive,
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message */}
          <Text style={styles.fieldLabel}>Anything specific? (optional)</Text>
          <View
            style={[
              styles.field,
              styles.fieldMultiline,
              focused === 'msg' && styles.fieldActive,
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Questions about the plan, custom needs, or anything else…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
              onFocus={() => setFocused('msg')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.assureRow}>
            <MaterialCommunityIcons
              name="phone-in-talk-outline"
              size={15}
              color={colors.textLight}
            />
            <Text style={styles.assureText}>
              Our team usually calls back within one working day
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

function Field({ id, label, icon, focused, setFocused, ...inputProps }: any) {
  const active = focused === id;
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.field, active && styles.fieldActive]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={active ? colors.primary : colors.textLight}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          {...inputProps}
        />
      </View>
    </>
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

  /* Plan summary */
  planCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
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
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    marginBottom: 3,
  },
  planTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
    letterSpacing: -0.7,
  },
  tierPill: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tierText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginTop: 12,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.white,
    letterSpacing: -1,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    paddingBottom: 5,
  },
  savings: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#FFD166',
    paddingBottom: 5,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },

  /* Form */
  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 14,
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
  fieldMultiline: {
    height: 110,
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
  countryCode: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
  },
  fieldDivider: { width: 1, height: 20, backgroundColor: colors.border },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: {
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
  selectChipActive: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  selectChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  selectChipTextActive: { color: colors.white },

  assureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
  },
  assureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
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