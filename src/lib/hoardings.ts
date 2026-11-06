import { Hoarding } from '../api/client';

/** ₹1,25,000 — Indian grouping */
export function rupees(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function sizeLabel(h: Pick<Hoarding, 'width_ft' | 'height_ft'>) {
  if (!h.width_ft || !h.height_ft) return null;
  return `${h.width_ft} × ${h.height_ft} ft`;
}

/** "12 Dec 2026" from YYYY-MM-DD */
export function dateLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Straight-line distance in km between two points */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function distanceLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}
