import { getAuthToken } from '../lib/phoneAuth';

/**
 * Everything that talks to the Lasan Mart backend lives here.
 * Screens call these functions and never touch fetch directly.
 */

/* ------------------------------------------------------------------
   The address of the backend.

   LOCAL DEVELOPMENT:
     10.0.2.2 is the Android emulator's alias for "the computer I'm
     running on". A real device would need your machine's LAN IP.

   PRODUCTION:
     Replace with the Railway URL once deployed.
------------------------------------------------------------------- */
const API_URL = 'https://lasanmartapihono-production-a721.up.railway.app';

/** How long to wait before giving up on a request */
const TIMEOUT_MS = 15000;

/* Cloudinary — the app uploads videos straight there, then tells our
   backend the URL. The file never passes through our server. */
const CLOUDINARY_CLOUD = 'tpd2optn';
const CLOUDINARY_PRESET = 'lasan_reels';

/* ---------------- Types ---------------- */

export type RequestType = 'service' | 'custom' | 'plan' | 'influencer';

export type SubmitRequestPayload = {
  type: RequestType;
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  companyDescription?: string;
  sector?: string;
  city?: string;
  title?: string;
  description?: string;
  descriptionLabel?: string;
  details?: Record<string, any>;
};

export type SubmitRequestResult = {
  success: true;
  requestId: string;
  contactId: string;
  emailSent: boolean;
  createdAt: string;
};

export type SavedRequest = {
  id: string;
  type: RequestType;
  title: string | null;
  description: string | null;
  details: Record<string, any> | null;
  status: string;
  created_at: string;
};

export type AppNotification = {
  id: string;
  request_id: string | null;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ApiReel = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  username: string;
  source: 'team' | 'user';
  duration: string | null;
  view_count: number;
  created_at: string;
};

export type UploadResult = {
  videoUrl: string;
  thumbnailUrl: string;
  publicId: string;
  duration: number;
};

/**
 * An error we can show the user directly.
 * `isNetwork` lets screens say "check your connection" rather than
 * showing a technical message.
 */
export class ApiError extends Error {
  isNetwork: boolean;

  constructor(message: string, isNetwork = false) {
    super(message);
    this.name = 'ApiError';
    this.isNetwork = isNetwork;
  }
}

/**
 * fetch with a timeout, and the user's Firebase token attached.
 *
 * Without this, the backend has no way to know who is asking —
 * and it now refuses anything that touches personal data.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = await getAuthToken();

  try {
    return await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- Requests ---------------- */

/**
 * Send a request to the backend. It gets saved and emailed to the team.
 */
export async function submitRequest(
  payload: SubmitRequestPayload
): Promise<SubmitRequestResult> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    // Couldn't reach the server at all — wrong URL, no wifi, server down
    console.log('Network error submitting request:', err?.message);
    throw new ApiError(
      "Couldn't reach our servers. Check your internet connection and try again.",
      true
    );
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Server replied with something that wasn't JSON
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error || 'Something went wrong. Please try again.'
    );
  }

  return data as SubmitRequestResult;
}

/**
 * Fetch everything this person has submitted, newest first.
 * Powers the My Requests tab.
 *
 * Who "this person" is comes from the Firebase token attached by
 * fetchWithTimeout — the backend no longer accepts a phone here.
 */
export async function fetchRequests(): Promise<SavedRequest[]> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/requests`);
  } catch (err: any) {
    console.log('Network error fetching requests:', err?.message);
    throw new ApiError(
      "Couldn't reach our servers. Check your internet connection.",
      true
    );
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(data?.error || 'Could not load your requests.');
  }

  return (data?.requests || []) as SavedRequest[];
}

/* ---------------- Notifications ---------------- */

/** Everything this person has been told, newest first */
export async function fetchNotifications(): Promise<{
  notifications: AppNotification[];
  unread: number;
}> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/notifications`);
  } catch (err: any) {
    console.log('Network error fetching notifications:', err?.message);
    throw new ApiError("Couldn't reach our servers.", true);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(data?.error || 'Could not load notifications.');
  }

  return {
    notifications: data?.notifications || [],
    unread: data?.unread || 0,
  };
}

/** Just the badge number — cheap enough to call whenever Home appears */
export async function fetchUnreadCount(): Promise<number> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/notifications/count`);
    const data = await res.json();
    return data?.unread || 0;
  } catch {
    // A failed badge check is not worth surfacing
    return 0;
  }
}

/** Mark one as read, or all of them if no id is given */
export async function markNotificationsRead(id?: string): Promise<void> {
  try {
    await fetchWithTimeout(`${API_URL}/notifications/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch (err: any) {
    console.log('Could not mark notifications read:', err?.message);
  }
}

/* ---------------- Lasan Vibes ---------------- */

/** The reels feed */
export async function fetchReels(): Promise<ApiReel[]> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/reels`);
  } catch (err: any) {
    console.log('Network error fetching reels:', err?.message);
    throw new ApiError("Couldn't reach our servers.", true);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(data?.error || 'Could not load reels.');
  }

  return (data?.reels || []) as ApiReel[];
}

/** Fire-and-forget view counter */
export async function markReelViewed(id: string): Promise<void> {
  try {
    await fetchWithTimeout(`${API_URL}/reels/${id}/view`, { method: 'POST' });
  } catch {
    // Never worth surfacing
  }
}

/**
 * Uploads a video to Cloudinary and reports progress as it goes.
 * XMLHttpRequest rather than fetch, because it's the only way to
 * get upload progress — and a 40MB video needs a progress bar.
 */
export function uploadVideo(
  uri: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();

    form.append('file', {
      uri,
      type: 'video/mp4',
      name: 'reel.mp4',
    } as any);

    form.append('upload_preset', CLOUDINARY_PRESET);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        // e.loaded can exceed e.total because of multipart overhead,
        // so clamp it. We stop at 99% — the last step is Cloudinary
        // transcoding, which finishes when onload fires.
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (onProgress) onProgress(100);

      if (xhr.status !== 200) {
        reject(new ApiError('Upload failed. Please try again.'));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);

        resolve({
          videoUrl: data.secure_url,
          // Cloudinary makes a thumbnail if you ask for .jpg instead
          thumbnailUrl: data.secure_url.replace(/\.\w+$/, '.jpg'),
          publicId: data.public_id,
          duration: data.duration,
        });
      } catch {
        reject(new ApiError('Upload failed. Please try again.'));
      }
    };

    xhr.onerror = () =>
      reject(new ApiError('Upload failed. Check your connection.', true));

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`
    );
    xhr.send(form);
  });
}

/** Tells our backend about a video that's already on Cloudinary */
export async function postReel(payload: {
  videoUrl: string;
  thumbnailUrl?: string;
  publicId?: string;
  duration?: number;
  caption?: string;
}): Promise<void> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError("Couldn't reach our servers.", true);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(data?.error || 'Could not post your reel.');
  }
}
export type MyReel = ApiReel & { status: 'live' | 'pending' | 'hidden' };

/** Everything this person has posted */
export async function fetchMyReels(): Promise<{
  reels: MyReel[];
  total: number;
  totalViews: number;
}> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/reels/mine`);
  } catch (err: any) {
    console.log('Network error fetching your reels:', err?.message);
    throw new ApiError("Couldn't reach our servers.", true);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new ApiError(data?.error || 'Could not load your reels.');
  }

  return {
    reels: data?.reels || [],
    total: data?.total || 0,
    totalViews: data?.totalViews || 0,
  };
}

/** Tells the backend which device belongs to this person */
export async function registerPushToken(
  phone: string,
  token: string
): Promise<void> {
  const digits = phone.replace(/\D/g, '').slice(-10);

  try {
    await fetchWithTimeout(`${API_URL}/notifications/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits, token }),
    });
  } catch (err: any) {
    // Not worth surfacing — the in-app bell still works
    console.log('Could not register push token:', err?.message);
  }
}
