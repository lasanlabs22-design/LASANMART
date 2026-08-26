import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import HomeHeader from '../components/HomeHeader';
import PlansCarousel from '../components/PlansCarousal';
import CategoryCarousel from '../components/CategoryCarousal';
import ReelsRow from '../components/ReelsRow';
import CustomRequirementBanner from '../screens/CustomRequirementBanner';
import InfluencerBanner from '../components/InfluencerBanner';
import BusinessIdeasBanner from '../components/BusinessIdeasBanner';
import {
  onlineMarketing,
  offlineMarketing,
  CategoryItem,
} from '../data/homeCategories';
import { reels } from '../data/reels';
import { plans } from '../data/plans';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const openReel = () => {
    navigation.navigate('Lasan Vibes');
  };

  const openCustomRequirement = () => {
    navigation.getParent()?.navigate('CustomRequirement');
  };

  const openInfluencerSelection = () => {
    navigation.getParent()?.navigate('InfluencerSelection');
  };

  const openBusinessIdeas = () => {
    navigation.getParent()?.navigate('BusinessIdeas');
  };

    const openPlanEnquiry = (plan: any) => {
    navigation.getParent()?.navigate('PlanEnquiry', { plan });
  };

  const openServiceRequest = (
    service: CategoryItem,
    category: 'online' | 'offline'
  ) => {
    navigation.getParent()?.navigate('PostRequest', { service, category });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HomeHeader
        onSearchPress={() => console.log('Search tapped — screen not built yet')}
        onWishlistPress={() => console.log('Wishlist tapped — screen not built yet')}
        onNotificationsPress={() =>
          console.log('Notifications tapped — screen not built yet')
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
               <PlansCarousel
          data={plans}
          onPlanPress={openPlanEnquiry}
        />

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

        <InfluencerBanner onPress={openInfluencerSelection} />

        <ReelsRow
          data={reels}
          onReelPress={openReel}
          onSeeAllPress={openReel}
          onAddPress={openReel}
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