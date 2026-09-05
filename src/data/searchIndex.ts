import {
  onlineMarketing,
  offlineMarketing,
  CategoryItem,
} from './homeCategories';
import { businessSectors } from './businessSectors';
import { plans } from './plans';
import { businessIdeas } from './businessIdeas';

export type SearchResult = {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  kind: 'service' | 'plan' | 'idea' | 'tool';
  /** What tapping this result should open */
  action:
    | { type: 'service'; service: CategoryItem; category: 'online' | 'offline' }
    | { type: 'plan'; planId: string }
    | { type: 'idea'; sectorId: string }
    | { type: 'tool' };
};

/**
 * What people actually type, mapped to what we actually call it.
 * Without this, someone searching "banner" would never find "Hoardings".
 */
const KEYWORDS: Record<string, string[]> = {
  // Online
  om1: ['digital', 'online marketing', 'promotion', 'advertising'],
  om2: ['website', 'web', 'site', 'crm', 'app', 'software', 'portal'],
  om3: [
    'instagram',
    'facebook',
    'social',
    'insta',
    'fb',
    'posts',
    'reels',
    'smm',
  ],
  om4: ['leads', 'lead', 'enquiries', 'customers', 'funnel', 'sales'],
  om5: ['google', 'gmb', 'maps', 'google my business', 'listing', 'near me'],
  om6: ['seo', 'ads', 'google ads', 'ranking', 'search', 'ppc', 'adwords'],
  om7: ['landing page', 'page', 'website page', 'campaign page'],
  om8: ['whatsapp', 'wa', 'chat', 'automation', 'bulk message', 'broadcast'],
  om9: ['influencer', 'creator', 'blogger', 'celebrity', 'collab', 'promotion'],
  om10: ['tv', 'television', 'theater', 'theatre', 'cinema', 'movie ad'],
  om11: ['shoot', 'photography', 'photoshoot', 'video', 'camera', 'photos'],
  om12: ['analytics', 'reports', 'data', 'growth', 'tracking', 'insights'],
  om13: ['ai', 'chatgpt', 'artificial intelligence', 'aeo', 'llm'],
  om14: ['pr', 'press', 'publicity', 'news', 'media coverage', 'article'],
  om15: ['integration', 'offline online', 'sync', 'omnichannel'],

  // Offline
  ofm1: [
    'hoarding',
    'billboard',
    'banner',
    'flex',
    'outdoor board',
    'big board',
  ],
  ofm2: ['outdoor', 'ooh', 'street', 'public advertising'],
  ofm3: ['led', 'digital board', 'screen', 'display screen', 'video wall'],
  ofm4: ['bus', 'auto', 'metro', 'transit', 'vehicle ad', 'train', 'cab'],
  ofm5: ['newspaper', 'print', 'magazine', 'pamphlet', 'flyer', 'brochure'],
  ofm6: ['event', 'launch', 'activation', 'roadshow', 'promotion event'],
  ofm7: ['local', 'community', 'neighbourhood', 'area marketing', 'rwa'],
  ofm8: ['direct', 'mail', 'door to door', 'leaflet', 'sms'],
  ofm9: ['car', 'vehicle', 'van', 'truck', 'branding', 'wrap', 'sticker'],
  ofm10: ['radio', 'fm', 'traditional', 'classic media'],
  ofm11: ['field', 'sales team', 'salesman', 'door to door', 'ground'],
  ofm12: ['call', 'telecalling', 'cold call', 'phone', 'calling'],
  ofm13: ['display', 'standee', 'poster', 'signage', 'board'],
  ofm14: ['exhibition', 'stall', 'expo', 'trade show', 'fair'],
  ofm15: ['corporate', 'b2b', 'business event', 'conference', 'seminar'],
};

/** Things people search for that aren't services */
const TOOL_KEYWORDS = [
  'quotation',
  'quote',
  'invoice',
  'bill',
  'estimate',
  'attendance',
  'staff',
  'employee',
  'salary',
  'register',
  'crm',
  'customer management',
  'leads software',
];

const ALL_SERVICES: {
  item: CategoryItem;
  category: 'online' | 'offline';
}[] = [
  ...onlineMarketing.map((item) => ({ item, category: 'online' as const })),
  ...offlineMarketing.map((item) => ({ item, category: 'offline' as const })),
];

/** Rough closeness — helps "hording" still find "Hoardings" */
function fuzzyScore(needle: string, haystack: string): number {
  if (haystack === needle) return 100;
  if (haystack.startsWith(needle)) return 90;
  if (haystack.includes(needle)) return 70;

  // Every letter present in order? Catches typos and shorthand
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return 40;
  }

  return 0;
}

/**
 * Search everything — services, plans, sector ideas, tools.
 * Returns the best matches first.
 */
export function search(rawQuery: string): SearchResult[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: { result: SearchResult; score: number }[] = [];

  /* ---- Services ---- */
  ALL_SERVICES.forEach(({ item, category }) => {
    const label = item.label.toLowerCase();
    const keywords = KEYWORDS[item.id] || [];

    let best = fuzzyScore(q, label);

    keywords.forEach((k) => {
      // Keywords score slightly below the real label
      best = Math.max(best, fuzzyScore(q, k) - 5);
    });

    if (best > 0) {
      scored.push({
        score: best,
        result: {
          id: item.id,
          label: item.label,
          sublabel:
            category === 'online' ? 'Online Marketing' : 'Offline Marketing',
          icon: item.icon,
          color: item.color,
          kind: 'service',
          action: { type: 'service', service: item, category },
        },
      });
    }
  });

  /* ---- Plans ---- */
  plans.forEach((p) => {
    const score = Math.max(
      fuzzyScore(q, p.title.toLowerCase()),
      fuzzyScore(q, 'plan') - 10,
      fuzzyScore(q, 'package') - 10,
      fuzzyScore(q, p.price.replace(/[₹,]/g, '')) - 5
    );

    if (score > 0) {
      scored.push({
        score,
        result: {
          id: p.id,
          label: `${p.title} Plan`,
          sublabel: `${p.price} · ${p.duration}`,
          icon: 'package-variant-closed',
          color: p.gradient[0],
          kind: 'plan',
          action: { type: 'plan', planId: p.id },
        },
      });
    }
  });

  /* ---- Business ideas by sector ---- */
  businessSectors.forEach((s) => {
    const score = fuzzyScore(q, s.label.toLowerCase());

    if (score > 0 && businessIdeas.some((i) => i.sectorId === s.id)) {
      scored.push({
        score: score - 10, // ideas rank below direct service matches
        result: {
          id: s.id,
          label: `Ideas for ${s.label}`,
          sublabel: 'Business Ideas',
          icon: s.icon,
          color: '#12B3A0',
          kind: 'idea',
          action: { type: 'idea', sectorId: s.id },
        },
      });
    }
  });

  /* ---- Tools ---- */
  const toolScore = Math.max(
    ...TOOL_KEYWORDS.map((k) => fuzzyScore(q, k)),
    fuzzyScore(q, 'tools')
  );

  if (toolScore > 0) {
    scored.push({
      score: toolScore - 8,
      result: {
        id: 'tools',
        label: 'Lasan Tools',
        sublabel: 'Quotations, attendance, CRM',
        icon: 'apps',
        color: '#FF6B35',
        kind: 'tool',
        action: { type: 'tool' },
      },
    });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s) => s.result);
}

/** Shown before anyone types — the things people look for most */
export const POPULAR_SEARCHES = [
  'Hoardings',
  'Instagram',
  'Google Maps',
  'WhatsApp',
  'Leads',
  'Website',
  'Print Media',
  'Events',
];
