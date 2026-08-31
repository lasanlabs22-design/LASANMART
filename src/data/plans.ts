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
    title: 'Starter',
    subtitle: 'For local shops & new brands',
    price: '₹25,000',
    strikePrice: '₹32,000',
    duration: '3 months',
    savings: 'Save ₹7,000',
    tier: 1,
    features: ['Social Media', 'GMB Setup', 'Basic SEO'],
    gradient: ['#FF8A3D', '#F2542D'],
  },
  {
    id: 'plan2',
    title: 'Growth',
    subtitle: 'For scaling businesses',
    price: '₹50,000',
    strikePrice: '₹68,000',
    duration: '3 months',
    savings: 'Save ₹18,000',
    tier: 2,
    badge: 'MOST POPULAR',
    features: ['Everything in Starter', 'Paid Ads', 'Landing Pages'],
    gradient: ['#2E6BE8', '#1A3F94'],
  },
  {
    id: 'plan3',
    title: 'Pro',
    subtitle: 'Full-suite, done for you',
    price: '₹75,000',
    strikePrice: '₹1,05,000',
    duration: '3 months',
    savings: 'Save ₹30,000',
    tier: 3,
    features: ['Everything in Growth', 'Influencers', 'Dedicated Manager'],
    gradient: ['#3A506B', '#1C2541'],
  },
];
