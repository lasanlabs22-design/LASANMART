/**
 * Everything that talks to the Lasan Mart backend lives here.
 * Screens call these functions and never touch fetch directly.
 */

/* ------------------------------------------------------------------
   The address of the backend.

   LOCAL DEVELOPMENT:
     Use your computer's IP on the local network — NOT localhost,
     because "localhost" on a phone means the phone itself.
     Find it in the Expo terminal next to the QR code.

   PRODUCTION:
     Replace with the Railway URL once deployed, e.g.
     https://lasanmart-api.up.railway.app
------------------------------------------------------------------- */
const API_URL = 'http://10.0.2.2:3000';

/** How long to wait before giving up on a request */
const TIMEOUT_MS = 15000;

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
 * fetch with a timeout — without this, a request to an unreachable
 * server can hang for over a minute with the user staring at a spinner.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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
 */
export async function fetchRequests(phone: string): Promise<SavedRequest[]> {
  const digits = phone.replace(/\D/g, '').slice(-10);

  let response: Response;

  try {
    response = await fetchWithTimeout(
      `${API_URL}/requests?phone=${digits}`
    );
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

/** Quick check that the backend is alive — useful while developing */
export async function pingApi(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(API_URL);
    return res.ok;
  } catch {
    return false;
  }
}