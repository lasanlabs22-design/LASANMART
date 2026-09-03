import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { fetchMyReels, MyReel } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 10;
const TILE_WIDTH = (SCREEN_WIDTH - 32 - GAP * 2) / 3;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export default function MyReelsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { hasContactDetails } = useAuth();

  const [reels, setReels] = useState<MyReel[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!hasContactDetails) {
        setReels([]);
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        // The backend reads the phone from the verified token
        const data = await fetchMyReels();
        setReels(data.reels);
        setTotalViews(data.totalViews);
      } catch (err: any) {
        setError(err?.message || 'Could not load your reels.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hasContactDetails]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openAddReel = () => navigation.navigate('AddReel');

  const renderItem = ({ item }: { item: MyReel }) => {
    const isHidden = item.status !== 'live';

    return (
      <View style={[styles.tile, isHidden && styles.tileHidden]}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <MaterialCommunityIcons
              name="play-circle-outline"
              size={24}
              color="rgba(255,255,255,0.5)"
            />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.scrim}
          pointerEvents="none"
        />

        {isHidden && (
          <View style={styles.hiddenBadge}>
            <MaterialCommunityIcons
              name="eye-off"
              size={10}
              color={colors.white}
            />
            <Text style={styles.hiddenText}>Hidden</Text>
          </View>
        )}

        <View style={styles.tileFoot}>
          <View style={styles.viewRow}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={11}
              color={colors.white}
            />
            <Text style={styles.viewText}>{item.view_count}</Text>
          </View>
          <Text style={styles.tileTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  /* ---------- States ---------- */

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header navigation={navigation} />
        <View style={styles.centre}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header navigation={navigation} />

      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 30 + insets.bottom },
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
          reels.length > 0 ? (
            <View style={styles.statsRow}>
              <Stat value={reels.length} label="Posted" />
              <View style={styles.statDivider} />
              <Stat value={totalViews} label="Total views" />
              <View style={styles.statDivider} />
              <Stat
                value={reels.filter((r) => r.status === 'live').length}
                label="Live"
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name={error ? 'wifi-off' : 'video-plus-outline'}
                size={28}
                color={colors.textLight}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {error ? "Couldn't load your reels" : 'Nothing posted yet'}
            </Text>
            <Text style={styles.emptyText}>
              {error
                ? 'Check your connection and pull down to try again.'
                : 'Share what your business is up to — everyone using Lasan Mart will see it.'}
            </Text>

            {!error && (
              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.9}
                onPress={openAddReel}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={17}
                  color={colors.white}
                />
                <Text style={styles.emptyButtonText}>Post your first vibe</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {reels.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 20 + insets.bottom }]}
          activeOpacity={0.9}
          onPress={openAddReel}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
          <Text style={styles.fabText}>Post a Vibe</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function Header({ navigation }: any) {
  return (
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
      <Text style={styles.headerTitle}>My Vibes</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  listContent: { padding: 16, gap: GAP },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },

  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  tileHidden: { opacity: 0.55 },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  hiddenBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  hiddenText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: colors.white,
  },

  tileFoot: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },
  tileTime: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
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
    textAlign: 'center',
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
