import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  LayoutAnimation,
  Platform,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { faqs, faqCategories, Faq } from '../data/faqs';

/* Change these to your team's real contact details */
const SUPPORT_PHONE = '8309074248';
const SUPPORT_EMAIL = 'admin@lasanlabs.com';

export default function HelpScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return faqs.filter((f) => {
      const matchesCategory = category === 'all' || f.category === category;
      const matchesQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  };

  const openWhatsApp = async () => {
    const url = `whatsapp://send?phone=91${SUPPORT_PHONE}&text=${encodeURIComponent(
      'Hi Lasan Mart, I need help with '
    )}`;

    const supported = await Linking.canOpenURL(url).catch(() => false);

    if (!supported) {
      Alert.alert(
        'WhatsApp not found',
        'Install WhatsApp, or call us instead.'
      );
      return;
    }

    Linking.openURL(url);
  };

  const callSupport = () => Linking.openURL(`tel:+91${SUPPORT_PHONE}`);

  const emailSupport = () =>
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Lasan Mart — Support')}`
    );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 30 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Support banner */}
        <LinearGradient
          colors={['#2B2D42', '#14151F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.supportCard}
        >
          <View pointerEvents="none" style={styles.orb} />

          <View style={styles.supportTop}>
            <View style={styles.supportIcon}>
              <MaterialCommunityIcons
                name="headset"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Talk to our team</Text>
              <Text style={styles.supportSub}>
                We usually reply within 4–6 hours
              </Text>
            </View>
          </View>

          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={[styles.supportButton, { backgroundColor: '#25D366' }]}
              activeOpacity={0.85}
              onPress={openWhatsApp}
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={17}
                color={colors.white}
              />
              <Text style={styles.supportButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.supportButton,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.85}
              onPress={callSupport}
            >
              <MaterialCommunityIcons
                name="phone"
                size={16}
                color={colors.white}
              />
              <Text style={styles.supportButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportButtonGhost}
              activeOpacity={0.85}
              onPress={emailSupport}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={17}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.hoursRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={13}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.hoursText}>
              Monday to Saturday, 9:00 AM – 7:00 PM
            </Text>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={19}
            color={colors.textLight}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics…"
            placeholderTextColor={colors.textLight}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            active={category === 'all'}
            onPress={() => setCategory('all')}
            label="All"
          />
          {faqCategories.map((c) => (
            <Chip
              key={c.key}
              active={category === c.key}
              onPress={() => setCategory(c.key)}
              label={c.label}
              icon={c.icon}
            />
          ))}
        </ScrollView>

        {/* Questions */}
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={26}
              color={colors.textLight}
            />
            <Text style={styles.emptyTitle}>No matching answers</Text>
            <Text style={styles.emptyText}>
              Message our team on WhatsApp and we will help you directly.
            </Text>
          </View>
        ) : (
          <View style={styles.faqList}>
            {visible.map((faq) => (
              <FaqRow
                key={faq.id}
                faq={faq}
                open={openId === faq.id}
                onPress={() => toggle(faq.id)}
              />
            ))}
          </View>
        )}

        <Text style={styles.footNote}>
          Still stuck? Message us on WhatsApp — it is the fastest way to reach
          our team.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Pieces ---------- */

function FaqRow({
  faq,
  open,
  onPress,
}: {
  faq: Faq;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.faqCard, open && styles.faqCardOpen]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.faqTop}>
        <Text style={[styles.faqQuestion, open && styles.faqQuestionOpen]}>
          {faq.question}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={19}
          color={open ? colors.primary : colors.textLight}
        />
      </View>

      {open && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
    </TouchableOpacity>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={14}
          color={active ? colors.white : colors.textLight}
        />
      )}
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

  content: { padding: 16 },

  /* Support */
  supportCard: {
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
    top: -50,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,107,53,0.14)',
  },
  supportTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,53,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.4,
  },
  supportSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },

  supportButtons: { flexDirection: 'row', gap: 8, marginTop: 16 },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  supportButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.white,
  },
  supportButtonGhost: {
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  hoursText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 22,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.textDark,
    padding: 0,
  },

  chipRow: { gap: 8, paddingVertical: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },
  chipTextActive: { color: colors.white },

  /* FAQ */
  faqList: { gap: 8 },
  faqCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
  },
  faqCardOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  faqTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQuestion: {
    flex: 1,
    fontFamily: fonts.displayMedium,
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  faqQuestionOpen: { color: colors.primary },
  faqAnswer: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textDark,
    marginTop: 11,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,107,53,0.2)',
  },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30 },
  emptyTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 5,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    textAlign: 'center',
  },

  footNote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
