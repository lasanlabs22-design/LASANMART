import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { fetchRequests, SavedRequest, ApiError } from '../api/client';

const TYPE_META: Record<string, { label: string; icon: string }> = {
  service: { label: 'Service Request', icon: 'monitor-dashboard' },
  custom: { label: 'Custom Requirement', icon: 'hammer-wrench' },
  plan: { label: 'Plan Enquiry', icon: 'package-variant-closed' },
  influencer: { label: 'Influencer Request', icon: 'account-star' },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: 'Received', color: '#3A86FF' },
  contacted: { label: 'Contacted', color: '#E8AE00' },
  in_progress: { label: 'In Progress', color: '#12B3A0' },
  closed: { label: 'Completed', color: '#767676' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function MyRequestsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile, hasContactDetails } = useAuth();

  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      // No phone number means nothing to look up yet
      if (!hasContactDetails) {
        setRequests([]);
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const data = await fetchRequests(profile.phone);
        setRequests(data);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load your requests.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [profile.phone, hasContactDetails]
  );

  // Reload every time the tab comes into view, so a new request appears
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openPost = () => navigation.getParent()?.navigate('PostRequest');

  const renderItem = ({ item }: { item: SavedRequest }) => {
    const type = TYPE_META[item.type] || { label: item.type, icon: 'file-outline' };
    const status = STATUS_META[item.status] || STATUS_META.new;

    const detailEntries = item.details
      ? Object.entries(item.details).filter(
          ([, v]) => v !== null && v !== undefined && v !== ''
        )
      : [];

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.typeTag}>
            <MaterialCommunityIcons
              name={type.icon as any}
              size={12}
              color={colors.textLight}
            />
            <Text style={styles.typeTagText}>{type.label}</Text>
          </View>

          <View
            style={[styles.statusPill, { backgroundColor: `${status.color}1A` }]}
          >
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {item.title && (
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        )}

        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {detailEntries.length > 0 && (
          <View style={styles.metaRow}>
            {detailEntries.slice(0, 4).map(([key, value]) => (
              <View key={key} style={styles.meta}>
                <Text style={styles.metaText} numberOfLines={1}>
                  {String(Array.isArray(value) ? value.join(', ') : value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.postedOn}>Posted {formatDate(item.created_at)}</Text>
      </View>
    );
  };

  /* ---------- States ---------- */

  const showEmpty = !loading && !error && requests.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSub}>
          {loading
            ? 'Loading…'
            : requests.length === 0
            ? 'Nothing posted yet'
            : `${requests.length} request${requests.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="wifi-off"
                  size={16}
                  color="#D93025"
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => load(true)}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListEmptyComponent={
            showEmpty ? (
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
                  Tell us what marketing help you need — online or offline — and
                  our team takes it from there.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  activeOpacity={0.9}
                  onPress={openPost}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={17}
                    color={colors.white}
                  />
                  <Text style={styles.emptyButtonText}>Post a Request</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

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

  centre: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217,48,37,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#D93025',
  },
  retryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#D93025',
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
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: colors.textLight,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontFamily: fonts.bodyBold, fontSize: 10 },

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
    gap: 6,
    marginTop: 12,
  },
  meta: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  metaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: colors.textLight,
  },

  postedOn: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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