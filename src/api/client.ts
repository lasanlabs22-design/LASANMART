import { getAuthToken } from '../lib/phoneAuth';

/**
 * Everything that talks to the Lasan Mart backend lives here.
 * Screens call these functions and never touch fetch directly.
 *
 * Identity comes from the Firebase token attached to every request —
 * the backend reads the phone number out of it and ignores anything
 * the app claims, so nobody can read or write someone else's data.
 */

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

/**
 * The saved details behind a verified phone number.
 * Same camelCase shape the app sends up in SubmitRequestPayload,
 * so a profile form can read it and post it straight back.
 */
export type MyContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  companyDescription: string | null;
  sector: string | null;
  city: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
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
  like_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  created_at: string;
};

export type MyReel = ApiReel & { status: 'live' | 'pending' | 'hidden' };

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
 * Thrown specifically when the backend says this creator already has
 * an open request from this contact. Carries what the app needs to
 * point the user at that existing request instead of retrying.
 */
export class DuplicateRequestError extends ApiError {
  existingRequestId: string;
  existingStatus: string;
  matchedCreator: string | null;

  constructor(
    message: string,
    existingRequestId: string,
    existingStatus: string,
    matchedCreator: string | null = null
  ) {
    super(message);
    this.name = 'DuplicateRequestError';
    this.existingRequestId = existingRequestId;
    this.existingStatus = existingStatus;
    this.matchedCreator = matchedCreator;
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

  // Checked before the generic !response.ok branch, since 409 is
  // still a "failed" status but needs different handling
  if (response.status === 409 && data?.error === 'already_requested') {
    throw new DuplicateRequestError(
      data.message || 'You already have an open request for this.',
      data.existingRequestId,
      data.existingStatus,
      data.matchedCreator ?? null
    );
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

/**
 * The saved details behind the verified number — so someone signing in
 * on a new phone gets their name and email back, not an empty profile.
 *
 * Returns null rather than throwing: a profile screen with nothing to
 * prefill is a normal first-time state, not an error worth showing.
 * Signed out, offline, or a brand new number all land here the same way.
 */
export async function fetchMyContact(): Promise<MyContact | null> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/requests/contact`);

    if (!res.ok) return null;

    const data = await res.json();
    return (data?.contact as MyContact) || null;
  } catch (err: any) {
    console.log('Could not load saved contact:', err?.message);
    return null;
  }
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
    if (!res.ok) return 0;
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

/**
 * Tells the backend which device belongs to this person.
 * True only when it was actually saved — before someone's first
 * request there is no contact to attach it to, so it's worth retrying.
 */
export async function registerPushToken(token: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/notifications/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => null);
    return res.ok && data?.success === true;
  } catch (err: any) {
    // Not worth surfacing — the in-app bell still works
    console.log('Could not register push token:', err?.message);
    return false;
  }
}

/* ---------------- Lasan Vibes ---------------- */

/** The reels feed. Public, but a token also marks what you've liked. */
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

/** Fire-and-forget view counter */
export async function markReelViewed(id: string): Promise<void> {
  try {
    await fetchWithTimeout(`${API_URL}/reels/${id}/view`, { method: 'POST' });
  } catch {
    // Never worth surfacing
  }
}

/** Toggles a like. Returns the new state and count. */
export async function toggleReelLike(
  id: string
): Promise<{ liked: boolean; likeCount: number }> {
  const res = await fetchWithTimeout(`${API_URL}/reels/${id}/like`, {
    method: 'POST',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data?.error || 'Could not update like.');
  }

  return { liked: data.liked, likeCount: data.likeCount };
}

/** Edit your own caption */
export async function updateReelCaption(
  id: string,
  caption: string
): Promise<void> {
  const res = await fetchWithTimeout(`${API_URL}/reels/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.error || 'Could not update the caption.');
  }
}

/** Delete your own reel */
export async function deleteReel(id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_URL}/reels/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.error || 'Could not delete the reel.');
  }
}

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: string;
  signature: string;
};

/**
 * Asks our backend to sign an upload, so only people it approves can
 * put files in our Cloudinary — reels need Vibes access.
 *
 * Returns null only when this backend doesn't offer signing yet (an
 * older deploy), so the upload can fall back to the open preset.
 * A refusal is thrown, never quietly worked around.
 */
async function getUploadSignature(
  kind: 'reel' | 'photo'
): Promise<UploadSignature | null> {
  let res: Response;

  try {
    res = await fetchWithTimeout(`${API_URL}/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind }),
    });
  } catch {
    throw new ApiError("Couldn't reach our servers.", true);
  }

  if (res.status === 404) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.signature) {
    throw new ApiError(data?.error || 'Upload failed. Please try again.');
  }

  return data as UploadSignature;
}

/** Signed fields when we have them, the open preset when we don't */
function addUploadAuth(form: FormData, sig: UploadSignature | null) {
  if (sig) {
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('folder', sig.folder);
    form.append('signature', sig.signature);
  } else {
    form.append('upload_preset', CLOUDINARY_PRESET);
  }
}

/**
 * Uploads a video to Cloudinary and reports progress as it goes.
 * XMLHttpRequest rather than fetch, because it's the only way to
 * get upload progress — and a 40MB video needs a progress bar.
 */
export async function uploadVideo(
  uri: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const sig = await getUploadSignature('reel');
  const cloud = sig?.cloudName || CLOUDINARY_CLOUD;

  return new Promise((resolve, reject) => {
    const form = new FormData();

    form.append('file', {
      uri,
      type: 'video/mp4',
      name: 'reel.mp4',
    } as any);

    addUploadAuth(form, sig);

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

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud}/video/upload`);
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

export type RequestProgress = {
  status: 'accepted' | 'in_progress' | 'completed';
  assigned_at: string;
  completed_at: string | null;
};

/** Where a request has got to with our partner. Null if not placed yet. */
export async function fetchProgress(
  requestId: string
): Promise<RequestProgress | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/requests/${requestId}/progress`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.progress || null;
  } catch {
    return null;
  }
}

/** How the work went. Three answers, not five stars. */
export async function sendFeedback(
  requestId: string,
  verdict: 'good' | 'okay' | 'poor',
  comment?: string
): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_URL}/requests/${requestId}/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, comment }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.error || 'Could not save your feedback.');
  }
}

/**
 * Uploads a photo and returns a public URL.
 *
 * XMLHttpRequest rather than fetch — React Native's fetch can't send
 * a file URI in FormData, which is why uploadVideo uses XHR too.
 */
export async function uploadPhoto(uri: string): Promise<string> {
  // Already a web URL — Google sign-in photos arrive like this
  if (uri.startsWith('http')) return uri;

  const sig = await getUploadSignature('photo');
  const cloud = sig?.cloudName || CLOUDINARY_CLOUD;

  return new Promise((resolve, reject) => {
    const form = new FormData();

    form.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    addUploadAuth(form, sig);

    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.log('Cloudinary rejected the photo:', xhr.responseText);
        reject(new ApiError('Could not upload the photo.'));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText);

        if (!data?.secure_url) {
          reject(new ApiError('Could not upload the photo.'));
          return;
        }

        resolve(data.secure_url);
      } catch {
        reject(new ApiError('Could not upload the photo.'));
      }
    };

    xhr.onerror = () =>
      reject(
        new ApiError('Could not upload the photo. Check your connection.')
      );

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud}/image/upload`);
    xhr.send(form);
  });
}

/** Saves photo URLs against the contact, so they survive a reinstall */
export async function saveContactImages(payload: {
  photoUrl?: string;
  logoUrl?: string;
}): Promise<void> {
  try {
    await fetchWithTimeout(`${API_URL}/requests/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Not worth surfacing — the image still shows on this device
  }
}

export type ApprovedInfluencer = {
  id: string;
  name: string;
  photo_url: string | null;
  instagram_id: string | null;
  followers: string | null;
  category: string | null;
  city: string | null;
  rate_per_post: number | null;
  bio: string | null;
};

/**
 * Approved creators, for the selection screen.
 * Public — no token needed, since someone browsing may not have
 * signed in yet.
 */
export async function fetchApprovedInfluencers(): Promise<{
  influencers: ApprovedInfluencer[];
  categories: string[];
  cities: string[];
}> {
  const res = await fetchWithTimeout(`${API_URL}/influencers/approved`);

  if (!res.ok) {
    throw new ApiError('Could not load creators.');
  }

  const data = await res.json();

  return {
    influencers: data.influencers || [],
    categories: data.categories || [],
    cities: data.cities || [],
  };
}

export type VibesAccess = {
  canPost: boolean;
  requested: boolean;
  declined: boolean;
};

/**
 * Whether this person may post to Vibes, and whether they've asked.
 * Never throws — a failed check just means the button stays hidden.
 */
export async function fetchVibesAccess(): Promise<VibesAccess> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/reels/access`);
    if (!res.ok) return { canPost: false, requested: false, declined: false };
    const data = await res.json();

    return {
      canPost: data?.canPost || false,
      requested: data?.requested || false,
      declined: data?.declined || false,
    };
  } catch {
    return { canPost: false, requested: false, declined: false };
  }
}

/** Asking to be allowed to post */
export async function requestVibesAccess(reason: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_URL}/reels/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.error || 'Could not send your request.');
  }
}
