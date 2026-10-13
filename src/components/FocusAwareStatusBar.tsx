import React from 'react';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

/**
 * A status bar style that applies only while its screen is in view.
 *
 * Tabs and screens under a pushed page stay mounted, so a plain
 * <StatusBar> on a dark screen would keep white icons on the white
 * page in front of it. App.tsx sets dark icons for everything else.
 */
export default function FocusAwareStatusBar({ style }: { style: StatusBarStyle }) {
  return useIsFocused() ? <StatusBar style={style} /> : null;
}
