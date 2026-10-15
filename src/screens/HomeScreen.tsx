import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import HomeHeader from '../components/HomeHeader';
import PlansCarousel from '../components/PlansCarousal';
import CategoryCarousel from '../components/CategoryCarousal';
import ReelsRow from '../components/ReelsRow';
import CustomRequirementBanner from '../screens/CustomRequirementBanner';
import HireTalent from '../components/HireTalent';
import BusinessIdeasBanner from '../components/BusinessIdeasBanner';
import { useAuth } from '../context/AuthContext';
import { fetchUnreadCount, fetchReels, ApiReel } from '../api/client';
import {
  onlineMarketing,
  offlineMarketing,
  CategoryItem,
} from '../data/homeCategories';
import { plans } from '../data/plans';
import { events } from '../lib/analytics';
import { withoutHidden } from '../lib/hiddenVibes';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { hasContactDetails } = useAuth();

  const [unread, setUnread] = useState(0);
  const [reels, setReels] = useState<ApiReel[]>([]);

  // Refresh whenever Home comes into view — so a status change made by
  // the team, or a newly posted reel, shows up without restarting the app
  useFocusEffect(
    useCallback(() => {
      // The backend reads the phone from the verified token, so there's
      // nothing to pass — but there's no point asking if they haven't
      // verified a number yet
      if (hasContactDetails) {
        fetchUnreadCount()
          .then(setUnread)
          .catch(() => setUnread(0));
      } else {
        setUnread(0);
      }

      // A failure here just leaves whatever was already on screen.
      // Reels they've reported or hidden stay out of the row too.
      fetchReels()
        .then(withoutHidden)
        .then(setReels)
        .catch(() => {});
    }, [hasContactDetails])
  );

  const openReel = () => {
    navigation.navigate('Lasan Vibes');
  };

  const openAddReel = () => {
    navigation.getParent()?.navigate('AddReel');
  };

  const openNotifications = () => {
    navigation.getParent()?.navigate('Notifications');
  };

  const openSearch = () => {
    navigation.getParent()?.navigate('Search');
  };

  const openCustomRequirement = () => {
    navigation.getParent()?.navigate('CustomRequirement');
  };

  const openInfluencerSelection = () => {
    navigation.getParent()?.navigate('InfluencerSelection');
  };

  const openFreelancers = () => {
    navigation.getParent()?.navigate('FreelancerRequest');
  };

  const openBusinessIdeas = () => {
    navigation.getParent()?.navigate('BusinessIdeas');
  };

  const openPlanEnquiry = (plan: any) => {
    events.planOpened(plan.title, plan.price);
    navigation.getParent()?.navigate('PlanEnquiry', { plan });
  };

  const openServiceRequest = (
    service: CategoryItem,
    category: 'online' | 'offline'
  ) => {
    events.serviceOpened(service.label, category);
    navigation.getParent()?.navigate('PostRequest', { service, category });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HomeHeader
        unreadCount={unread}
        onSearchPress={openSearch}
        onNotificationsPress={openNotifications}
      />

      {/* Bottom room so the last card clears the raised centre button */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 44 }}
      >
        {/* Business Ideas leads (a requirement), then catalogue →
            bundles → social proof → talent → catch-all.
            Online and Offline Marketing always stay together. */}
        <BusinessIdeasBanner onPress={openBusinessIdeas} />

        <CategoryCarousel
          title="Online Marketing"
          data={onlineMarketing}
          onItemPress={(item) => openServiceRequest(item, 'online')}
        />

        <CategoryCarousel
          title="Offline Marketing"
          data={offlineMarketing}
          onItemPress={(item) => openServiceRequest(item, 'offline')}
        />

        {/* Straight after the services they bundle */}
        <PlansCarousel data={plans} onPlanPress={openPlanEnquiry} />

        {/* Video breaks up the run of cards. Hidden entirely when
            there's nothing to show, rather than an empty row with
            just the Add tile */}
        {reels.length > 0 && (
          <ReelsRow
            data={reels}
            onReelPress={openReel}
            onSeeAllPress={openReel}
            onAddPress={openAddReel}
          />
        )}

        <HireTalent
          onInfluencersPress={openInfluencerSelection}
          onFreelancersPress={openFreelancers}
        />

        <CustomRequirementBanner onPress={openCustomRequirement} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
