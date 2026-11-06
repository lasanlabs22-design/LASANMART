import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import HomeHeader from '../components/HomeHeader';
import HeaderInset from '../components/HeaderInset';
import PlansCarousel from '../components/PlansCarousal';
import CategoryCarousel from '../components/CategoryCarousal';
import ReelsRow from '../components/ReelsRow';
import CustomRequirementBanner from '../screens/CustomRequirementBanner';
import HireTalent from '../components/HireTalent';
import BusinessIdeasBanner from '../components/BusinessIdeasBanner';
import HomeGreeting from '../components/HomeGreeting';
import { useAuth } from '../context/AuthContext';
import { fetchUnreadCount, fetchReels, ApiReel } from '../api/client';
import {
  onlineMarketing,
  offlineMarketing,
  CategoryItem,
  serviceRoute,
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

  const openLocationPicker = () => {
    navigation.getParent()?.navigate('LocationPicker');
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
    navigation.getParent()?.navigate(...serviceRoute(service, category));
  };

  const openAllServices = (category: 'online' | 'offline') => {
    navigation.getParent()?.navigate('AllServices', { category });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <HeaderInset />
      <HomeHeader
        unreadCount={unread}
        onSearchPress={openSearch}
        onNotificationsPress={openNotifications}
        onLocationPress={openLocationPicker}
      />

      {/* Bottom room so the last card clears the raised centre button */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 44 }}
      >
        {/* Business Ideas leads (a requirement), then everything you
            can hire — catalogue → bundles → talent — then social proof
            right before the catch-all ask.
            Online and Offline Marketing always stay together. */}
        <HomeGreeting onAvatarPress={() => navigation.navigate('My Account')} />

        <BusinessIdeasBanner onPress={openBusinessIdeas} />

        <CategoryCarousel
          title="Online Marketing"
          subtitle="Get found, followed and chosen online"
          data={onlineMarketing}
          onItemPress={(item) => openServiceRequest(item, 'online')}
          onViewAll={() => openAllServices('online')}
        />

        <CategoryCarousel
          title="Offline Marketing"
          subtitle="Be seen on every street and screen"
          data={offlineMarketing}
          onItemPress={(item) => openServiceRequest(item, 'offline')}
          onViewAll={() => openAllServices('offline')}
        />

        {/* Straight after the services they bundle */}
        <PlansCarousel data={plans} onPlanPress={openPlanEnquiry} />

        <HireTalent
          onInfluencersPress={openInfluencerSelection}
          onFreelancersPress={openFreelancers}
        />

        {/* Our work, just before "tell us your idea" — and it keeps the
            dark Hire Talent cards and Bespoke banner apart. Hidden
            entirely when there's nothing to show, rather than an empty
            row with just the Add tile */}
        {reels.length > 0 && (
          <ReelsRow
            data={reels}
            onReelPress={openReel}
            onSeeAllPress={openReel}
            onAddPress={openAddReel}
          />
        )}

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
