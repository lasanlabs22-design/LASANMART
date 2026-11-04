import React, { useRef, useState } from 'react';
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
  ImageBackground,
  Dimensions,
  LayoutAnimation,
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

// The artwork is cropped to ~2.33:1, so at this height the objects are
// all in frame. Width is the screen less padding and the 2px border.
const BANNER_HEIGHT = Math.round(
  (Dimensions.get('window').width - 32 - 4) / 2.33
);

export default function FreelancerRequestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [picked, setPicked] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState(false);

  const { submit, busy, sheetProps } = useSubmitRequest(() =>
    navigation.goBack()
  );

  // Where things sit, so a newly picked card can be scrolled into view
  // together with the panel that opens under it
  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);
  const cardY = useRef<Record<string, number>>({});

  const chosen = freelancerServices.filter((s) => picked.includes(s.id));
  // Picking a service is enough — the description is optional, since
  // plenty of people can't say yet exactly what they want
  const ready = picked.length > 0;

  // The details panel hangs under the most recently picked card
  const anchorId = picked[picked.length - 1];
  const anchor = freelancerServices.find((s) => s.id === anchorId);

  const toggle = (id: string) => {
    const adding = !picked.includes(id);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    // Once the panel has opened, bring the card and its panel into view
    if (adding) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, listY.current + (cardY.current[id] ?? 0) - 8),
          animated: true,
        });
      }, 320);
    }
  };

  const handleSubmit = () => {
    if (!ready) return;

    const labels = chosen.map((s) => s.label);

    submit({
      type: 'custom',
      title: labels.join(', '),
      description: description.trim() || undefined,
      descriptionLabel: 'What they need',
      details: {
        source: 'Freelancers',
        services: labels,
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
          ref={scrollRef}
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

          {/* The services as image banners — tap to pick, more than one
              is fine */}
          <View
            style={styles.list}
            onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}
          >
            {freelancerServices.map((s) => {
              const active = picked.includes(s.id);

              return (
                <React.Fragment key={s.id}>
                  <TouchableOpacity
                    style={[styles.banner, active && { borderColor: s.colour }]}
                    activeOpacity={0.88}
                    onPress={() => toggle(s.id)}
                    onLayout={(e) =>
                      (cardY.current[s.id] = e.nativeEvent.layout.y)
                    }
                  >
                    <ImageBackground
                      source={s.image}
                      resizeMode="cover"
                      style={styles.bannerInner}
                      imageStyle={styles.bannerImage}
                    >
                      {/* Darkens the left so the copy reads over the art */}
                      <LinearGradient
                        pointerEvents="none"
                        colors={['rgba(14,14,18,0.85)', 'rgba(14,14,18,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.6, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />

                      <View style={styles.bannerText}>
                        <Text style={styles.bannerLabel}>{s.label}</Text>
                        <Text style={styles.bannerBlurb}>{s.blurb}</Text>
                      </View>

                      {/* Empty ring until picked, so it reads as selectable */}
                      <View
                        style={[
                          styles.tick,
                          active
                            ? { backgroundColor: s.colour, borderColor: s.colour }
                            : null,
                        ]}
                      >
                        {active && (
                          <MaterialCommunityIcons
                            name="check"
                            size={13}
                            color={colors.white}
                          />
                        )}
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>

                  {/* Opens out of the card: prompts, the brief and the
                      button, so nothing waits at the bottom of the page */}
                  {anchor?.id === s.id && (
                    <View style={[styles.panel, { borderColor: s.colour }]}>
                      <View style={styles.prompts}>
                        <Text style={styles.promptTitle}>Worth telling us</Text>
                        {chosen.flatMap((c) =>
                          c.asks.map((a) => (
                            <View key={`${c.id}-${a}`} style={styles.promptRow}>
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

                      <Text style={styles.label}>
                        What do you need?{' '}
                        <Text style={styles.optional}>(optional)</Text>
                      </Text>
                      <Text style={styles.hint}>
                        Not sure yet? Leave it blank — our team will work it
                        out with you.
                      </Text>
                      <View
                        style={[styles.field, focused && styles.fieldActive]}
                      >
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

                      <TouchableOpacity
                        style={styles.submit}
                        activeOpacity={0.9}
                        onPress={handleSubmit}
                        disabled={busy}
                      >
                        {busy ? (
                          <ActivityIndicator color={colors.white} />
                        ) : (
                          <>
                            <Text style={styles.submitText}>
                              Send Request · {picked.length} selected
                            </Text>
                            <MaterialCommunityIcons
                              name="arrow-right"
                              size={17}
                              color={colors.white}
                            />
                          </>
                        )}
                      </TouchableOpacity>

                      <Text style={styles.note}>
                        Nothing is booked or charged. We'll call you to talk
                        it through before anything is agreed.
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>

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

  list: { gap: 12 },
  banner: {
    // Sits over the top of its panel, so the panel looks like it
    // slides out from under the card
    zIndex: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#0E0E12',
  },
  bannerInner: {
    minHeight: BANNER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerImage: { borderRadius: 18 },
  // The artwork starts about halfway across
  bannerText: { width: '48%' },
  bannerLabel: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 21,
    color: colors.white,
    letterSpacing: -0.3,
  },
  bannerBlurb: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
  },
  tick: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tucks 20px up behind the card's rounded bottom (on top of the
  // list's 12px gap), and shares the card's border colour
  panel: {
    zIndex: 1,
    marginTop: -32,
    paddingTop: 34,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: colors.white,
  },

  prompts: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
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
    marginTop: 18,
    marginBottom: 10,
  },
  optional: { fontFamily: fonts.body, color: colors.textLight },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
    marginTop: -6,
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

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 16,
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
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
    marginTop: 12,
  },
});
