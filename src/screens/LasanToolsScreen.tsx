import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Tool = {
  id: string;
  title: string;
  tagline: string;
  detail: string;
  icon: string;
  gradient: [string, string];
  points: string[];
};

const TOOLS: Tool[] = [
  {
    id: 'quotation',
    title: 'Quotation Generation',
    tagline: 'Professional quotes in under a minute',
    detail:
      'Build branded quotations with your logo, line items and taxes, then send them on WhatsApp or email straight from your phone.',
    icon: 'file-document-edit-outline',
    gradient: ['#FF8A3D', '#F2542D'],
    points: ['Branded templates', 'GST-ready', 'Share instantly'],
  },
  {
    id: 'attendance',
    title: 'Attendance Management',
    tagline: 'Know who showed up, without the register',
    detail:
      'Mark staff attendance with a tap, track leaves and shifts, and pull monthly reports when it is time to calculate salaries.',
    icon: 'account-clock-outline',
    gradient: ['#12B3A0', '#0B6E63'],
    points: ['One-tap marking', 'Leave tracking', 'Monthly reports'],
  },
  {
    id: 'crm',
    title: 'Customised CRM',
    tagline: 'A CRM shaped around how you work',
    detail:
      'Stop forcing your business into someone else s software. We build the fields, stages and reports your team actually uses.',
    icon: 'view-dashboard-outline',
    gradient: ['#7B2FF7', '#4C1D95'],
    points: ['Your workflow', 'Your fields', 'Fully supported'],
  },
];

export default function LasanToolsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleToolPress = (tool: Tool) => {
    if (tool.id === 'quotation') {
      navigation.navigate('Quotation');
      return;
    }

    Alert.alert(
      tool.title,
      'Our team will set this up for you. Post a request and we will get in touch.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Post a request',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('PostRequest');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="close"
            size={21}
            color={colors.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lasan Tools</Text>
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
          Software built for how small businesses actually run — set up and
          supported by our team.
        </Text>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            activeOpacity={0.9}
            onPress={() => handleToolPress(tool)}
            style={styles.cardWrap}
          >
            <LinearGradient
              colors={tool.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View pointerEvents="none" style={styles.orb} />

              <View style={styles.cardTop}>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons
                    name={tool.icon as any}
                    size={24}
                    color={colors.white}
                  />
                </View>
                <View style={styles.arrowCircle}>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={colors.white}
                  />
                </View>
              </View>

              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardTagline}>{tool.tagline}</Text>
              <Text style={styles.cardDetail}>{tool.detail}</Text>

              <View style={styles.pointRow}>
                {tool.points.map((p) => (
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
          </TouchableOpacity>
        ))}

        <View style={styles.footNote}>
          <MaterialCommunityIcons
            name="headset"
            size={16}
            color={colors.textLight}
          />
          <Text style={styles.footNoteText}>
            Every tool comes with setup, training and ongoing support from our
            team.
          </Text>
        </View>
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
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.textDark,
    letterSpacing: -0.5,
  },

  content: { padding: 16 },

  intro: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    marginBottom: 20,
  },

  cardWrap: { marginBottom: 14 },
  card: {
    borderRadius: 22,
    padding: 18,
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
    letterSpacing: -0.5,
  },
  cardTagline: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  cardDetail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
  },

  pointRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
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
    fontSize: 10.5,
    color: colors.white,
  },

  footNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  footNoteText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textLight,
  },
});