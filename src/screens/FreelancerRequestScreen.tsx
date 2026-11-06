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
  Image,
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
import HeaderInset from '../components/HeaderInset';
import ServiceBox, { BoxTick, BOX_BLACK } from '../components/ServiceBox';

// Two boxes per row: the screen less the page padding and the gap
const GRID_GAP = 10;
const BOX_WIDTH = (Dimensions.get('window').width - 32 - GRID_GAP) / 2;
const PAGE_PADDING = 16;
const INTRO_GAP = 14;
// The whole grid fits on screen: box height comes from the space left
// under the intro, kept within sensible bounds on very small/large phones
const MIN_BOX_HEIGHT = 112;
const MAX_BOX_HEIGHT = Math.round(BOX_WIDTH * 1.15);
// The banner artwork is 1100x472 with the objects in its right half on a
// plain dark backdrop. The wide box shows that right part: the picture
// is drawn at the box's height and pinned to the right edge.
const BANNER_RATIO = 1100 / 472;

// [a, b, c, d, e] -> [[a, b], [c, d], [e]]
function inRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

export default function FreelancerRequestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [picked, setPicked] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState(false);

  // Measured so the grid can be sized to fit without scrolling
  const [viewportH, setViewportH] = useState(0);
  const [introH, setIntroH] = useState(0);
  const rowCount = Math.ceil(freelancerServices.length / 2);
  const bottomPad = PAGE_PADDING + insets.bottom;
  const boxH =
    viewportH > 0
      ? Math.max(
          MIN_BOX_HEIGHT,
          Math.min(
            MAX_BOX_HEIGHT,
            Math.floor(
              (viewportH -
                PAGE_PADDING -
                introH -
                bottomPad -
                GRID_GAP * (rowCount - 1)) /
                rowCount
            )
          )
        )
      : MIN_BOX_HEIGHT;
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <HeaderInset />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hire a Freelancer</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={styles.intro}
            onLayout={(e) =>
              // The layout height leaves out the margin under the text
              setIntroH(e.nativeEvent.layout.height + INTRO_GAP)
            }
          >
            Pick what you need — more than one is fine. Our team finds the right
            person and comes back with a quote.
          </Text>

          {/* The services as a 2-column grid of image boxes — tap to
              pick, more than one is fine */}
          <View
            style={styles.list}
            onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}
          >
            {inRows(freelancerServices).map((row) => (
              <React.Fragment key={row[0].id}>
                <View
                  style={styles.row}
                  onLayout={(e) => {
                    for (const s of row) {
                      cardY.current[s.id] = e.nativeEvent.layout.y;
                    }
                  }}
                >
                  {row.map((s) => {
                    const active = picked.includes(s.id);

                    // A lone last service runs full width as a banner:
                    // art on the right, copy over the dark left side
                    if (row.length === 1 && s.bannerImage) {
                      return (
                        <TouchableOpacity
                          key={s.id}
                          style={[
                            styles.box,
                            styles.wideBox,
                            { height: boxH },
                            active && { borderColor: s.colour },
                          ]}
                          activeOpacity={0.88}
                          onPress={() => toggle(s.id)}
                        >
                          <Image
                            source={s.bannerImage}
                            style={[
                              styles.bannerImage,
                              { width: boxH * BANNER_RATIO, height: boxH },
                            ]}
                          />
                          <LinearGradient
                            pointerEvents="none"
                            colors={['rgba(14,14,18,0.85)', 'rgba(14,14,18,0)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.6, y: 0 }}
                            style={StyleSheet.absoluteFill}
                          />
                          <View style={styles.wideText}>
                            <Text style={styles.wideLabel}>{s.label}</Text>
                            <Text style={styles.wideBlurb}>{s.blurb}</Text>
                          </View>
                          <BoxTick active={active} colour={s.colour} />
                        </TouchableOpacity>
                      );
                    }

                    return (
                      <ServiceBox
                        key={s.id}
                        service={s}
                        width={BOX_WIDTH}
                        height={boxH}
                        active={active}
                        onPress={() => toggle(s.id)}
                      />
                    );
                  })}
                </View>

                {/* Opens under the row of the box just picked: prompts,
                    the brief and the button, so nothing waits at the
                    bottom of the page */}
                {row.map((s) =>
                  anchor?.id === s.id ? (
                    <View
                      key={`panel-${s.id}`}
                      style={[styles.panel, { borderColor: s.colour }]}
                    >
                      {/* Package prices of the picked services that
                          have one */}
                      {chosen.some((c) => c.price) && (
                        <View style={styles.prices}>
                          {chosen
                            .filter((c) => c.price)
                            .map((c) => (
                              <View key={`price-${c.id}`} style={styles.priceRow}>
                                <Text style={styles.priceLabel} numberOfLines={1}>
                                  {c.label}
                                </Text>
                                <Text style={[styles.priceValue, { color: c.colour }]}>
                                  {c.price}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}

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
                  ) : null
                )}
              </React.Fragment>
            ))}
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.3,
  },

  content: { padding: 16 },

  intro: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textLight,
    marginBottom: INTRO_GAP,
  },

  list: { gap: GRID_GAP },
  row: { flexDirection: 'row', gap: GRID_GAP },
  // Same frame as ServiceBox, for the full-width banner
  box: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: BOX_BLACK,
  },
  // Pinned right, so the objects (right half of the art) fill the banner
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  wideBox: {
    width: BOX_WIDTH * 2 + GRID_GAP,
    justifyContent: 'center',
  },
  // The banner art's objects start about halfway across
  wideText: { width: '48%', paddingHorizontal: 16 },
  wideLabel: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 21,
    color: colors.white,
    letterSpacing: -0.3,
  },
  wideBlurb: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
  },
  // Full width under the row, in the picked box's border colour
  panel: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: colors.white,
  },

  prices: {
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceLabel: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  priceValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: -0.2,
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
