import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import FocusAwareStatusBar from './FocusAwareStatusBar';

/**
 * Sits directly above a page header and fills the status-bar area with
 * the same brand purple as the header (and the tab bar), with white
 * status icons while the page is in view.
 *
 * The page's SafeAreaView must leave out the 'top' edge, or the inset
 * is added twice.
 */
export default function HeaderInset() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <FocusAwareStatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />
    </>
  );
}
