import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useRequests, ServiceRequest } from '../context/RequestsContext';

export default function MyRequestsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { requests, removeRequest } = useRequests();

  const openPost = () => navigation.getParent()?.navigate('PostRequest');

  const confirmDelete = (r: ServiceRequest) => {
    Alert.alert('Delete Request', `Remove "${r.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeRequest(r.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onLongPress={() => confirmDelete(item)}
    >
      <View style={styles.cardTop}>
        <View style={styles.serviceTag}>
          <MaterialCommunityIcons
            name={item.category === 'online' ? 'monitor-dashboard' : 'billboard'}
            size={12}
            color={colors.textLight}
          />
          <Text style={styles.serviceTagText}>{item.serviceLabel}</Text>
        </View>

        <Text style={styles.postedOn}>{item.postedOn}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        <Meta icon="briefcase-outline" text={item.sector} />
        <Meta icon="wallet-outline" text={item.budget} />
        <Meta icon="calendar-clock" text={item.timeline} />
        <Meta icon="map-marker-outline" text={item.city} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSub}>
          {requests.length === 0
            ? 'Nothing posted yet'
            : `${requests.length} request${requests.length > 1 ? 's' : ''} raised`}
        </Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.hintRow}>
              <MaterialCommunityIcons
                name="gesture-tap-hold"
                size={13}
                color={colors.textLight}
              />
              <Text style={styles.hintText}>
                Long-press a request to remove it
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={30}
                color={colors.textLight}
              />
            </View>
            <Text style={styles.emptyTitle}>Post your first request</Text>
            <Text style={styles.emptyText}>
              Tell us what marketing help you need — online or offline — and our
              team takes it from there.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.9}
              onPress={openPost}
            >
              <MaterialCommunityIcons name="plus" size={17} color={colors.white} />
              <Text style={styles.emptyButtonText}>Post a Request</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating action button */}
      {requests.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 20 + insets.bottom }]}
          activeOpacity={0.9}
          onPress={openPost}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
          <Text style={styles.fabText}>Post Request</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.meta}>
      <MaterialCommunityIcons
        name={icon as any}
        size={13}
        color={colors.textLight}
      />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.6,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },

  listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 2,
  },
  hintText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
  },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.white,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  serviceTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: colors.textLight,
  },
  postedOn: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
  },

  cardTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textLight,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    rowGap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
  },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 36 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.textDark,
    letterSpacing: -0.4,
    marginBottom: 7,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },

  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.white },
});