export type Plan = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  strikePrice: string;
  duration: string;
  savings: string;
  tier: number; // 1-3, drives the tier meter
  badge?: string;
  features: string[];
  gradient: [string, string];
};

export const plans: Plan[] = [
  {
    id: 'plan1',
    title: 'Starter Plan',
    subtitle: 'For local shops & new brands',
    price: '₹25,000',
    strikePrice: '₹32,000',
    duration: 'Per month',
    savings: 'Save ₹7,000',
    tier: 1,
    features: [
      '5 Reels',
      '10 Posters',
      'Paid Ads',
      'Social Media',
      'GMB Setup',
    ],
    gradient: ['#7C3AED', '#5B21B6'],
  },
  {
    id: 'plan2',
    title: 'Growth Plan',
    subtitle: 'For scaling businesses',
    price: '₹50,000',
    strikePrice: '₹68,000',
    duration: 'Per month',
    savings: 'Save ₹18,000',
    tier: 2,
    badge: 'MOST POPULAR',
    features: [
      '10 Reels',
      '15 Posters',
      'Paid Ads',
      'Dedicated Manager',
      'Advanced SEO',
      'Social Media Management',
    ],
    gradient: ['#5F259F', '#3F1470'],
  },
  {
    id: 'plan3',
    title: 'Advanced Plan',
    subtitle: 'Full-suite, done for you',
    price: '₹75,000',
    strikePrice: '₹1,05,000',
    duration: 'Per month',
    savings: 'Save ₹30,000',
    tier: 3,
    features: [
      'Everything in Growth',
      'Influencers',
      'Dedicated Manager',
      'Personalized Page Building',
    ],
    gradient: ['#4C1D95', '#2E1065'],
  },
];
