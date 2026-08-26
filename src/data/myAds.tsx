export type AdStatus = 'live' | 'in_review' | 'draft' | 'completed';

export type AdType =
  | 'plan'
  | 'influencer'
  | 'custom'
  | 'online'
  | 'offline';

export type MyAd = {
  id: string;
  title: string;
  service: string;
  type: AdType;
  status: AdStatus;
  submittedOn: string;
  budget?: string;
  // Simple counters — replace with real analytics later
  views?: number;
  leads?: number;
  note?: string;
};

export const statusMeta: Record <AdStatus,
  { label: string; color: string; icon: string }
> = {
  live: {
    label: 'Live',
    color: '#12B3A0',
    icon: 'access-point',
  },
  in_review: {
    label: 'In Review',
    color: '#E8AE00',
    icon: 'clock-outline',
  },
  draft: {
    label: 'Draft',
    color: '#767676',
    icon: 'file-document-outline',
  },
  completed: {
    label: 'Completed',
    color: '#3A86FF',
    icon: 'check-circle-outline',
  },
};

export const typeMeta: Record<AdType, { icon: string; color: string }> = {
  plan: { icon: 'package-variant-closed', color: '#7B2FF7' },
  influencer: { icon: 'account-star', color: '#C13584' },
  custom: { icon: 'hammer-wrench', color: '#FF6B35' },
  online: { icon: 'monitor-dashboard', color: '#2D6CDF' },
  offline: { icon: 'billboard', color: '#E63946' },
};

// POC data — replace with GET /my-ads once the backend exists
export const myAds: MyAd[] = [
  {
    id: 'ad1',
    title: 'Diwali Offer Campaign',
    service: 'Growth Plan',
    type: 'plan',
    status: 'live',
    submittedOn: '12 Aug 2026',
    budget: '₹50,000',
    views: 18420,
    leads: 96,
  },
  {
    id: 'ad2',
    title: 'Creator collab — 3 influencers',
    service: 'Influencer Marketing',
    type: 'influencer',
    status: 'in_review',
    submittedOn: '19 Aug 2026',
    note: 'Our team is finalising creator availability',
  },
  {
    id: 'ad3',
    title: 'Ring Road hoarding — 2 sites',
    service: 'Hoardings',
    type: 'offline',
    status: 'live',
    submittedOn: '02 Aug 2026',
    budget: '₹1,20,000',
    views: 240000,
    leads: 34,
  },
  {
    id: 'ad4',
    title: 'Dealership CRM build',
    service: 'Custom Requirement',
    type: 'custom',
    status: 'in_review',
    submittedOn: '21 Aug 2026',
    note: 'Scoping call scheduled',
  },
  {
    id: 'ad5',
    title: 'Store launch reels',
    service: 'Social Media',
    type: 'online',
    status: 'draft',
    submittedOn: '22 Aug 2026',
  },
  {
    id: 'ad6',
    title: 'Summer sale — WhatsApp blast',
    service: 'WhatsApp Automation',
    type: 'online',
    status: 'completed',
    submittedOn: '04 Jun 2026',
    budget: '₹18,000',
    views: 9600,
    leads: 212,
  },
];