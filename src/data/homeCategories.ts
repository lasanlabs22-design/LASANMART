export type CategoryItem = {
  id: string;
  label: string;
  icon: string;   // MaterialCommunityIcons name
  color: string;  // accent colour for the tile
};

export const onlineMarketing: CategoryItem[] = [
  { id: 'om1',  label: 'Digital Marketing',    icon: 'bullhorn-variant',        color: '#FF6B35' },
  { id: 'om2',  label: 'Website & CRM',        icon: 'laptop',                  color: '#2D6CDF' },
  { id: 'om3',  label: 'Social Media',         icon: 'instagram',               color: '#C13584' },
  { id: 'om4',  label: 'Lead Generation',      icon: 'filter-variant',          color: '#00A389' },
  { id: 'om5',  label: 'GMB Optimization',     icon: 'google-maps',             color: '#EA4335' },
  { id: 'om6',  label: 'SEO & Ads',            icon: 'chart-line',              color: '#7B2FF7' },
  { id: 'om7',  label: 'Landing Pages',        icon: 'monitor-dashboard',       color: '#0F9BD7' },
  { id: 'om8',  label: 'WhatsApp Automation',  icon: 'whatsapp',                color: '#25D366' },
  { id: 'om9',  label: 'Influencer Marketing', icon: 'account-star',            color: '#F2542D' },
  { id: 'om10', label: 'TV & Theater Ads',     icon: 'television-play',         color: '#4A4E69' },
  { id: 'om11', label: 'Flash Shoot',          icon: 'camera-iris',             color: '#E8AE00' },
  { id: 'om12', label: 'Analytics & Growth',   icon: 'chart-areaspline',        color: '#0B8457' },
  { id: 'om13', label: 'AI Optimization',      icon: 'robot-outline',           color: '#5E60CE' },
  { id: 'om14', label: 'PR & Publicity',       icon: 'bullhorn-outline',        color: '#B5179E' },
  { id: 'om15', label: 'Offline-Online Sync',  icon: 'sync',                    color: '#0891B2' },
];

export const offlineMarketing: CategoryItem[] = [
  { id: 'ofm1',  label: 'Hoardings',          icon: 'billboard',               color: '#E63946' },
  { id: 'ofm2',  label: 'Outdoor Ads',        icon: 'city-variant-outline',    color: '#457B9D' },
  { id: 'ofm3',  label: 'LED Boards',         icon: 'monitor',                 color: '#7209B7' },
  { id: 'ofm4',  label: 'Transit Ads',        icon: 'bus-side',                color: '#F4A261' },
  { id: 'ofm5',  label: 'Print Media',        icon: 'newspaper-variant',       color: '#495057' },
  { id: 'ofm6',  label: 'Event Marketing',    icon: 'calendar-star',           color: '#D62828' },
  { id: 'ofm7',  label: 'Local Engagement',   icon: 'map-marker-radius',       color: '#2A9D8F' },
  { id: 'ofm8',  label: 'Direct Marketing',   icon: 'email-outline',           color: '#3A86FF' },
  { id: 'ofm9',  label: 'Vehicle Branding',   icon: 'car-side',                color: '#FB8500' },
  { id: 'ofm10', label: 'Traditional Media',  icon: 'radio',                   color: '#6D597A' },
  { id: 'ofm11', label: 'Field Sales',        icon: 'briefcase-account',       color: '#1D3557' },
  { id: 'ofm12', label: 'Telecalling',        icon: 'headset',                 color: '#06A77D' },
  { id: 'ofm13', label: 'Display Boards',     icon: 'presentation',            color: '#8338EC' },
  { id: 'ofm14', label: 'Exhibitions',        icon: 'store',                   color: '#BC6C25' },
  { id: 'ofm15', label: 'Corporate Events',   icon: 'handshake',               color: '#264653' },
];