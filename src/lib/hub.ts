import { Linking } from 'react-native';

/**
 * Lasan Hub — the partner app for creators, vendors and freelancers.
 * Until Hub is published, Play shows "item not found" for this link.
 */
export const HUB_PACKAGE = 'com.lasanhub.app';

export const HUB_STORE_URL = `https://play.google.com/store/apps/details?id=${HUB_PACKAGE}`;

/** Opens the Play Store app straight on Hub's page, or the web page if that fails */
export const openHubListing = () =>
  Linking.openURL(`market://details?id=${HUB_PACKAGE}`).catch(() =>
    Linking.openURL(HUB_STORE_URL)
  );
