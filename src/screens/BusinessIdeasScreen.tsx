import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { businessSectors, BusinessSector } from '../data/businessSectors';
import { findIdea } from '../data/businessIdeas';

export default function BusinessIdeasScreen({ navigation }: any) {
  const [sector, setSector] = useState<BusinessSector | null>(null);
  const insets = useSafeAreaInsets();
  const idea = sector ? findIdea(sector.id) : undefined;

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
        <Text style={styles.headerTitle}>Business Ideas</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Pick your business sector to see what actually works — the moves that
          bring results, and where to spend first.
        </Text>

        {/* Sector chips */}
        <View style={styles.sectorWrap}>
          {businessSectors.map((s) => {
            const active = sector?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.sectorChip, active && styles.sectorChipActive]}
                activeOpacity={0.85}
                onPress={() => setSector(active ? null : s)}
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

        {/* Result */}
        {!sector ? (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={26}
                color={colors.textLight}
              />
            </View>
            <Text style={styles.placeholderText}>
              Choose a sector above to see ideas
            </Text>
          </View>
        ) : idea ? (
          <View style={styles.result}>
            {/* Headline */}
            <View style={styles.headlineCard}>
              <View style={styles.headlineIcon}>
                <MaterialCommunityIcons
                  name={sector.icon as any}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorLabel}>
                  {sector.label.toUpperCase()}
                </Text>
                <Text style={styles.headline}>{idea.headline}</Text>
              </View>
            </View>

            <Text style={styles.overview}>{idea.overview}</Text>

            {/* Opportunities */}
            <Text style={styles.groupTitle}>What to do</Text>
            {idea.opportunities.map((o, i) => (
              <View key={o} style={styles.oppRow}>
                <View style={styles.oppNum}>
                  <Text style={styles.oppNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.oppText}>{o}</Text>
              </View>
            ))}

            {/* Services */}
            <Text style={styles.groupTitle}>Start with these services</Text>
            <View style={styles.serviceWrap}>
              {idea.bestServices.map((s) => (
                <View key={s} style={styles.servicePill}>
                  <MaterialCommunityIcons
                    name="check"
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={styles.serviceText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Budget note */}
            <View style={styles.budgetCard}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={17}
                color="#0B7A66"
              />
              <Text style={styles.budgetText}>{idea.budgetNote}</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={() => {
                navigation.goBack();
                navigation.navigate('PostRequest');
              }}
            >
              <Text style={styles.ctaText}>Post a request for this</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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

  content: { padding: 16, paddingBottom: 40 },

  intro: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginBottom: 18,
  },

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

  placeholder: { alignItems: 'center', paddingTop: 48 },
  placeholderIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textLight,
  },

  result: { marginTop: 26 },

  headlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
  },
  headlineIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectorLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9.5,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: -0.5,
    lineHeight: 22,
  },

  overview: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDark,
    marginTop: 18,
  },

  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 12,
  },

  oppRow: { flexDirection: 'row', gap: 11, marginBottom: 12 },
  oppNum: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  oppNumText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
  },
  oppText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textDark,
  },

  serviceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  serviceText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textDark,
  },

  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(18,179,160,0.10)',
    borderRadius: 14,
    padding: 14,
    marginTop: 22,
  },
  budgetText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#0B6E63',
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 26,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
});