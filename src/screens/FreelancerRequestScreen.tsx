import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { freelancerServices } from '../data/freelancerServices';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import ContactDetailsSheet from '../components/ContactDetailsSheet';

const BUDGETS = [
  'Under ₹10,000',
  '₹10,000 – ₹25,000',
  '₹25,000 – ₹50,000',
  'Above ₹50,000',
  'Not sure yet',
];

const TIMELINES = ['This week', 'Within a month', 'Flexible'];

export default function FreelancerRequestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [picked, setPicked] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [focused, setFocused] = useState(false);

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  const chosen = freelancerServices.filter((s) => picked.includes(s.id));
  const ready = picked.length > 0 && description.trim().length > 9;

  const toggle = (id: string) => {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!ready) return;

    const labels = chosen.map((s) => s.label);

    submit({
      type: 'custom',
      title: labels.join(', '),
      description: description.trim(),
      descriptionLabel: 'What they need',
      details: {
        source: 'Freelancers',
        services: labels,
        budget: budget || undefined,
        timeline: timeline || undefined,
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
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hire a Freelancer</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 40 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Pick what you need — more than one is fine. Our team finds the right
            person and comes back with a quote.
          </Text>

          {/* The four services */}
          <View style={styles.grid}>
            {freelancerServices.map((s) => {
              const active = picked.includes(s.id);

              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.tile,
                    active && {
                      borderColor: s.colour,
                      backgroundColor: `${s.colour}0F`,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => toggle(s.id)}
                >
                  <View
                    style={[
                      styles.tileIcon,
                      { backgroundColor: active ? s.colour : `${s.colour}1A` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={s.icon as any}
                      size={22}
                      color={active ? colors.white : s.colour}
                    />
                  </View>

                  <Text
                    style={[styles.tileLabel, active && { color: s.colour }]}
                  >
                    {s.label}
                  </Text>
                  <Text style={styles.tileBlurb}>{s.blurb}</Text>

                  {active && (
                    <View style={[styles.tick, { backgroundColor: s.colour }]}>
                      <MaterialCommunityIcons
                        name="check"
                        size={11}
                        color={colors.white}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Prompts, so the brief is actually useful */}
          {chosen.length > 0 && (
            <View style={styles.prompts}>
              <Text style={styles.promptTitle}>Worth telling us</Text>
              {chosen.flatMap((s) =>
                s.asks.map((a) => (
                  <View key={`${s.id}-${a}`} style={styles.promptRow}>
                    <MaterialCommunityIcons
                      name="circle-small"
                      size={18}
                      color={colors.textLight}
                    />
                    <Text style={styles.promptText}>{a}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          <Text style={styles.label}>What do you need?</Text>
          <View style={[styles.field, focused && styles.fieldActive]}>
            <TextInput
              style={styles.input}
              placeholder="Tell us about the work — the more detail, the better the quote"
              placeholderTextColor={colors.textLight}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              multiline
              maxLength={800}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Budget</Text>
          <View style={styles.chipWrap}>
            {BUDGETS.map((b) => (
              <Chip
                key={b}
                label={b}
                active={budget === b}
                onPress={() => setBudget(budget === b ? '' : b)}
              />
            ))}
          </View>

          <Text style={styles.label}>When do you need it?</Text>
          <View style={styles.chipWrap}>
            {TIMELINES.map((t) => (
              <Chip
                key={t}
                label={t}
                active={timeline === t}
                onPress={() => setTimeline(timeline === t ? '' : t)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submit, !ready && styles.submitOff]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={!ready || busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.submitText}>Send Request</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={17}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Nothing is booked or charged. We'll call you to talk it through
            before anything is agreed.
          </Text>
        </ScrollView>

        <ContactDetailsSheet {...sheetProps} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  back: {
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

  content: { padding: 16 },

  intro: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textLight,
    marginBottom: 18,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 14,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 14.5,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  tileBlurb: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textLight,
    marginTop: 3,
  },
  tick: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  prompts: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  promptTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  promptRow: { flexDirection: 'row', alignItems: 'center' },
  promptText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textDark,
  },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginTop: 24,
    marginBottom: 10,
  },

  field: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    height: 120,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textDark,
    padding: 0,
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.textLight,
  },
  chipTextActive: { color: colors.white },

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 28,
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  submitOff: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },

  note: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 14,
  },
});
