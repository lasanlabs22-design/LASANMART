import { ImageSourcePropType } from 'react-native';

export type CategoryItem = {
  id: string;
  label: string;
  icon: string;   // MaterialCommunityIcons name
  color: string;  // accent colour for the tile
  // 3D artwork shown in place of the glyph where there's room for it.
  // Microsoft Fluent Emoji 3D (MIT), bundled so it works offline.
  image?: ImageSourcePropType;
};

/**
 * Where tapping a service goes. Influencer Marketing opens the creators
 * list (pick creators, then send the request from there); everything
 * else opens the Post a Request form with the service filled in.
 * Shared by Home, All Services and Search so they always agree.
 */
export function serviceRoute(
  service: CategoryItem,
  category: 'online' | 'offline'
): [string, Record<string, unknown> | undefined] {
  if (service.id === 'om9') return ['InfluencerSelection', undefined];
  return ['PostRequest', { service, category }];
}

export const onlineMarketing: CategoryItem[] = [
  { id: 'om1',  label: 'Digital Marketing',    icon: 'bullhorn-variant',        color: '#FF6B35', image: require('../../assets/services/online/digital-marketing.png') },
  { id: 'om2',  label: 'Website & CRM',        icon: 'laptop',                  color: '#2D6CDF', image: require('../../assets/services/online/website-crm.png') },
  { id: 'om3',  label: 'Social Media',         icon: 'instagram',               color: '#C13584', image: require('../../assets/services/online/social-media.png') },
  { id: 'om9',  label: 'Influencer Marketing', icon: 'account-star',            color: '#F2542D', image: require('../../assets/services/online/influencer-marketing.png') },
  { id: 'om11', label: 'Flash Shoot',         icon: 'camera-iris',             color: '#E8AE00', image: require('../../assets/services/online/flash-shoot.png') },
  { id: 'om6',  label: 'SEO & Ads',            icon: 'chart-line',              color: '#7B2FF7', image: require('../../assets/services/online/seo-ads.png') },
  { id: 'om5',  label: 'GMB Optimization',     icon: 'google-maps',             color: '#EA4335', image: require('../../assets/services/online/gmb-optimization.png') },
  { id: 'om8',  label: 'WhatsApp Automation',  icon: 'whatsapp',                color: '#25D366', image: require('../../assets/services/online/whatsapp-automation.png') },
  { id: 'om4',  label: 'Lead Generation',      icon: 'filter-variant',          color: '#00A389', image: require('../../assets/services/online/lead-generation.png') },
  { id: 'om10', label: 'TV & Theater Ads',     icon: 'television-play',         color: '#4A4E69', image: require('../../assets/services/online/tv-theater-ads.png') },
  { id: 'om7',  label: 'Landing Pages',        icon: 'monitor-dashboard',       color: '#0F9BD7', image: require('../../assets/services/online/landing-pages.png') },
  { id: 'om12', label: 'Analytics & Growth',   icon: 'chart-areaspline',        color: '#0B8457', image: require('../../assets/services/online/analytics-growth.png') },
  { id: 'om13', label: 'AI Optimization',      icon: 'robot-outline',           color: '#5E60CE', image: require('../../assets/services/online/ai-optimization.png') },
  { id: 'om14', label: 'PR & Publicity',       icon: 'bullhorn-outline',        color: '#B5179E', image: require('../../assets/services/online/pr-publicity.png') },
  { id: 'om15', label: 'Offline-Online Sync',  icon: 'sync',                    color: '#0891B2', image: require('../../assets/services/online/offline-online-sync.png') },
];

export const offlineMarketing: CategoryItem[] = [
  { id: 'ofm1',  label: 'Hoardings',          icon: 'billboard',               color: '#E63946', image: require('../../assets/services/offline/hoardings.png') },
  { id: 'ofm2',  label: 'Outdoor Ads',        icon: 'city-variant-outline',    color: '#457B9D', image: require('../../assets/services/offline/outdoor-ads.png') },
  { id: 'ofm3',  label: 'LED Boards',         icon: 'monitor',                 color: '#7209B7', image: require('../../assets/services/offline/led-boards.png') },
  { id: 'ofm4',  label: 'Transit Ads',        icon: 'bus-side',                color: '#F4A261', image: require('../../assets/services/offline/transit-ads.png') },
  { id: 'ofm5',  label: 'Print Media',        icon: 'newspaper-variant',       color: '#495057', image: require('../../assets/services/offline/print-media.png') },
  { id: 'ofm6',  label: 'Event Marketing',    icon: 'calendar-star',           color: '#D62828', image: require('../../assets/services/offline/event-marketing.png') },
  { id: 'ofm7',  label: 'Local Engagement',   icon: 'map-marker-radius',       color: '#2A9D8F', image: require('../../assets/services/offline/local-engagement.png') },
  { id: 'ofm8',  label: 'Direct Marketing',   icon: 'email-outline',           color: '#3A86FF', image: require('../../assets/services/offline/direct-marketing.png') },
  { id: 'ofm9',  label: 'Vehicle Branding',   icon: 'car-side',                color: '#FB8500', image: require('../../assets/services/offline/vehicle-branding.png') },
  { id: 'ofm10', label: 'Traditional Media',  icon: 'radio',                   color: '#6D597A', image: require('../../assets/services/offline/traditional-media.png') },
  { id: 'ofm11', label: 'Field Sales',        icon: 'briefcase-account',       color: '#1D3557', image: require('../../assets/services/offline/field-sales.png') },
  { id: 'ofm12', label: 'Telecalling',        icon: 'headset',                 color: '#06A77D', image: require('../../assets/services/offline/telecalling.png') },
  { id: 'ofm13', label: 'Display Boards',     icon: 'presentation',            color: '#8338EC', image: require('../../assets/services/offline/display-boards.png') },
  { id: 'ofm14', label: 'Exhibitions',        icon: 'store',                   color: '#BC6C25', image: require('../../assets/services/offline/exhibitions.png') },
  { id: 'ofm15', label: 'Corporate Events',   icon: 'handshake',               color: '#264653', image: require('../../assets/services/offline/corporate-events.png') },
];