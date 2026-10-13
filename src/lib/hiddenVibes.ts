import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiReel } from '../api/client';

/**
 * Reels someone reported, and creators they chose not to see, kept on
 * this phone. The feed and the Home row both filter through here, so a
 * reported video disappears for them straight away — before the team
 * has even looked at it.
 */

const KEY = '@lasanmart/hiddenVibes';

type Hidden = { reels: string[]; creators: string[] };

/** A team reel has no contact behind it, so only users can be hidden */
export function creatorKey(reel: ApiReel): string | null {
  if (reel.source !== 'user') return null;
  return reel.contact_id || reel.username || null;
}

async function read(): Promise<Hidden> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      reels: Array.isArray(parsed?.reels) ? parsed.reels : [],
      creators: Array.isArray(parsed?.creators) ? parsed.creators : [],
    };
  } catch {
    return { reels: [], creators: [] };
  }
}

async function write(next: Hidden) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
}

export async function hideReel(id: string) {
  const h = await read();
  if (!h.reels.includes(id)) await write({ ...h, reels: [...h.reels, id] });
}

export async function hideCreator(reel: ApiReel) {
  const key = creatorKey(reel);
  if (!key) return;

  const h = await read();
  if (!h.creators.includes(key)) {
    await write({ ...h, creators: [...h.creators, key] });
  }
}

/** Drops anything this person has reported or hidden */
export async function withoutHidden(reels: ApiReel[]): Promise<ApiReel[]> {
  const h = await read();
  if (h.reels.length === 0 && h.creators.length === 0) return reels;

  return reels.filter((r) => {
    if (h.reels.includes(r.id)) return false;
    const key = creatorKey(r);
    return !(key && h.creators.includes(key));
  });
}

/** Called on logout, so the next person starts with a clean feed */
export async function clearHidden() {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}
