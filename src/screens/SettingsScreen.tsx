import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'This clears your saved details from this device. Your requests stay linked to your phone number.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
            name="arrow-left"
            size={21}
            color={colors.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 30 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Help */}
        <Text style={styles.groupTitle}>Help</Text>

        <Row
          icon="lifebuoy"
          iconColor={colors.primary}
          label="Help & Support"
          sublabel="FAQs, WhatsApp and phone support"
          onPress={() => navigation.navigate('Help')}
        />

        {/* About */}
        <Text style={styles.groupTitle}>About</Text>

        <Row
          icon="information-outline"
          label="App version"
          sublabel="1.0.3"
          showChevron={false}
        />

        <Row
          icon="shield-check-outline"
          label="Privacy"
          sublabel="Your details are used only to contact you about your requests"
          showChevron={false}
        />

        {/* Account */}
        <Text style={styles.groupTitle}>Account</Text>

        <Row
          icon="logout"
          iconColor="#D93025"
          label="Log Out"
          labelColor="#D93025"
          sublabel="Clear your saved details from this device"
          onPress={confirmLogout}
        />

        <Text style={styles.footNote}>
          Lasan Mart · Your Business. Our Marketplace.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  iconColor,
  label,
  labelColor,
  sublabel,
  onPress,
  showChevron = true,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  labelColor?: string;
  sublabel?: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <View
        style={[
          styles.rowIcon,
          iconColor ? { backgroundColor: `${iconColor}18` } : null,
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={19}
          color={iconColor || colors.textLight}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}
        >
          {label}
        </Text>
        {sublabel && (
          <Text style={styles.rowSub} numberOfLines={2}>
            {sublabel}
          </Text>
        )}
      </View>

      {showChevron && onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={colors.textLight}
        />
      )}
    </Wrapper>
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

  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: colors.textDark,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textLight,
    marginTop: 2,
  },

  footNote: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 30,
  },
});
