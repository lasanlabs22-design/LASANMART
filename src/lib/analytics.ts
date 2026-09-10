import {
  getAnalytics,
  logEvent,
  logScreenView,
} from '@react-native-firebase/analytics';

/**
 * Aggregate analytics only — Firebase never stores a per-person history,
 * and the IP address is used to derive a city and then discarded.
 *
 * Every call is wrapped so a failure here can never break the app.
 */

/** Which screen someone is looking at. Called automatically by the navigator. */
export async function trackScreen(name: string) {
  try {
    await logScreenView(getAnalytics(), {
      screen_name: name,
      screen_class: name,
    });
  } catch {
    // Never worth surfacing
  }
}

/** Something worth counting */
export async function track(
  event: string,
  params?: Record<string, string | number | boolean>
) {
  try {
    await logEvent(getAnalytics(), event, params);
  } catch {
    // Never worth surfacing
  }
}

/* ---------------- The events worth having ---------------- */

export const events = {
  /** They sent us a request. `type` is service, custom, plan or influencer. */
  requestSubmitted: (type: string, service?: string) =>
    track('request_submitted', { type, service: service || 'none' }),

  /** They opened a service from a Home carousel */
  serviceOpened: (service: string, category: string) =>
    track('service_opened', { service, category }),

  /** They opened a plan */
  planOpened: (plan: string, price: string) =>
    track('plan_opened', { plan, price }),

  /** They looked up a sector in Business Ideas */
  businessIdeaViewed: (sector: string) =>
    track('business_idea_viewed', { sector }),

  /** They searched for something */
  searched: (query: string, results: number) =>
    track('search', { search_term: query, results }),

  /** They watched a reel through */
  reelViewed: (source: string) => track('reel_viewed', { source }),

  /** They generated a quotation */
  quotationCreated: (items: number) => track('quotation_created', { items }),

  /** How they signed in */
  signedIn: (method: string) => track('login', { method }),

  /**
   * They opened the contact sheet but closed it without finishing.
   * The clearest drop-off point in the whole app.
   */
  contactSheetAbandoned: (step: string) =>
    track('contact_sheet_abandoned', { step }),
};
