import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import {
  onlineMarketing,
  offlineMarketing,
  CategoryItem,
  serviceRoute,
} from '../data/homeCategories';
import { events } from '../lib/analytics';
import HeaderInset from '../components/HeaderInset';

const CATEGORIES = {
  online: {
    title: 'Online Marketing',
    subtitle: 'Get found, followed and chosen online',
    data: onlineMarketing,
  },
  offline: {
    title: 'Offline Marketing',
    subtitle: 'Be seen on every street and screen',
    data: offlineMarketing,
  },
};

/**
 * Every service in one category as a grid — the "View all" from the
 * Home rows, which only show a few at a time. Tapping one opens the
 * request exactly as tapping it on Home does.
 */
export default function AllServicesScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const category: 'online' | 'offline' = route?.params?.category ?? 'online';
  const { title, subtitle, data } = CATEGORIES[category];

  const openService = (service: CategoryItem) => {
    events.serviceOpened(service.label, category);
    navigation.navigate(...serviceRoute(service, category));
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
            name="arrow-left"
            size={21}
            color={colors.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 30 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.intro}>
            {subtitle}. Tap a service to tell us what you need.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tile}
            activeOpacity={0.7}
            onPress={() => openService(item)}
          >
            {item.image ? (
              <Image source={item.image} style={styles.art} />
            ) : (
              <MaterialCommunityIcons
                name={item.icon as any}
                size={40}
                color={item.color}
                style={styles.icon}
              />
            )}
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 18,
  },

  row: { gap: 10, marginBottom: 18 },
  // Three to a row; flex keeps them equal on any screen width
  tile: { flex: 1, maxWidth: '33.3%', alignItems: 'center' },
  art: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 6 },
  icon: { marginVertical: 20 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.textDark,
    textAlign: 'center',
  },
});
