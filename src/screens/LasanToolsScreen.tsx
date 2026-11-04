import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import HeaderInset from '../components/HeaderInset';

type Tool = {
  id: string;
  title: string;
  tagline: string;
  detail: string;
  icon: string;
  gradient: [string, string];
  points: string[];
  /** Artwork for the top of the card: objects right, plain space left */
  image: ImageSourcePropType;
  /** The artwork's bottom-edge colour, so the lower half continues it */
  base: string;
  /** How it's offered: free to use now, or set up on request */
  badge: string;
  free?: boolean;
};

// The artwork is cropped to 2.2:1; at this height it's all in frame
const IMAGE_HEIGHT = Math.round((Dimensions.get('window').width - 32) / 2.2);

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
    image: require('../../assets/tools/quotation.jpg'),
    base: '#B0290C',
    badge: 'FREE TOOL',
    free: true,
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
    image: require('../../assets/tools/attendance.jpg'),
    base: '#017270',
    badge: 'SUBSCRIPTION · ON REQUEST',
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
    image: require('../../assets/tools/crm.jpg'),
    base: '#4B0A98',
    badge: 'CUSTOM-BUILT · ON REQUEST',
  },
];

export default function LasanToolsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

   const handleToolPress = (tool: Tool) => {
    if (tool.id === 'quotation') {
      navigation.navigate('Quotation');
      return;
    }

    // Attendance and CRM open a dedicated enquiry form,
    // carrying the chosen tool with them
    navigation.navigate('ToolEnquiry', { tool });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <HeaderInset />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="close"
            size={21}
            color={colors.white}
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
          Quotation Generation is free to use right away. Attendance
          Management (subscription plans) and Customised CRM (built for you)
          are set up on request — tap one to enquire.
        </Text>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            activeOpacity={0.9}
            onPress={() => handleToolPress(tool)}
            style={styles.cardWrap}
          >
            <View style={[styles.card, { backgroundColor: tool.base }]}>
              {/* Artwork with the name over its plain left side */}
              <ImageBackground
                source={tool.image}
                resizeMode="cover"
                style={styles.cardImage}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.6, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardHead}>
                  <View
                    style={[styles.badge, tool.free && styles.badgeFree]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        tool.free && styles.badgeTextFree,
                      ]}
                    >
                      {tool.badge}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{tool.title}</Text>
                  <Text style={styles.cardTagline}>{tool.tagline}</Text>
                </View>
              </ImageBackground>

              {/* The rest in the artwork's own colour, full width, so the
                  longer copy never has to sit over the objects */}
              <View style={styles.cardBody}>
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
              </View>

              {/* Pinned to the corner; the chips leave room for it */}
              <View style={styles.arrowCircle}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={colors.white}
                />
              </View>
            </View>
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.white,
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

  cardWrap: { marginBottom: 12 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImage: {
    minHeight: IMAGE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  // The artwork's objects start a little past halfway across
  cardHead: { width: '52%' },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeFree: { backgroundColor: '#FFD166' },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: colors.white,
  },
  badgeTextFree: { color: '#2E1065' },
  arrowCircle: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 22,
    color: colors.white,
    letterSpacing: -0.5,
  },
  cardTagline: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
  },
  cardDetail: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.82)',
  },

  // Margins rather than gap: a wrapping row doesn't count gap when it
  // decides where to break, so the chips would push the arrow off
  pointRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    // Keeps the last chip clear of the corner arrow
    paddingRight: 40,
  },
  point: {
    marginRight: 6,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
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