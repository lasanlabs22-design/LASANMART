import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import {
  guidelines,
  enforcement,
  PRIVACY_POLICY_URL,
} from '../data/communityGuidelines';

export default function CommunityGuidelinesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 30 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Lasan Vibes is public to everyone using Lasan Mart. These rules keep
          it useful and safe for the businesses who use it.
        </Text>

        {guidelines.map((g, i) => (
          <View key={g.title} style={styles.rule}>
            <View style={styles.ruleNum}>
              <Text style={styles.ruleNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>{g.title}</Text>
              <Text style={styles.ruleBody}>{g.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.enforce}>
          <MaterialCommunityIcons
            name="flag-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.enforceText}>{enforcement}</Text>
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}
        >
          <Text style={styles.linkText}>Read our Privacy Policy</Text>
          <MaterialCommunityIcons
            name="open-in-new"
            size={15}
            color={colors.primary}
          />
        </TouchableOpacity>
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

  content: { padding: 18 },

  intro: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textLight,
    marginBottom: 20,
  },

  rule: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  ruleNum: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleNumText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },
  ruleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 3,
  },
  ruleBody: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textLight,
  },

  enforce: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },
  enforceText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textDark,
  },

  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  linkText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
});
