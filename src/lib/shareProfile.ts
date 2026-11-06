import { Share, Alert } from 'react-native';
import { UserProfile } from '../context/AuthContext';
import { cityFrom } from '../components/HomeHeader';

const APP_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.lasanmart.app';

/** '@sharmabakes', 'sharmabakes' or a full link -> a tappable link */
function socialLink(value: string, site: 'instagram.com' | 'facebook.com') {
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.toLowerCase().startsWith(site)) return `https://${v}`;
  return `https://${site}/${v.replace(/^@/, '')}`;
}

/** The profile as a business card, one detail per line, empty ones left out */
export function profileCardText(profile: UserProfile) {
  const company = [profile.companyName.trim(), profile.sector.trim()]
    .filter(Boolean)
    .join(' · ');
  const city = cityFrom(profile.address);

  const lines = [
    `👤 ${profile.name.trim()}`,
    company && `🏢 ${company}`,
    profile.companyDescription.trim() && `📝 ${profile.companyDescription.trim()}`,
    profile.phone.trim() && `📞 ${profile.phone.trim()}`,
    profile.email.trim() && `✉️ ${profile.email.trim()}`,
    profile.instagramId.trim() &&
      `📸 ${socialLink(profile.instagramId, 'instagram.com')}`,
    profile.facebookId.trim() &&
      `👍 ${socialLink(profile.facebookId, 'facebook.com')}`,
    city && `📍 ${city}`,
  ].filter(Boolean);

  return `${lines.join('\n')}\n\nShared from LasanMart\n${APP_STORE_URL}`;
}

/** Opens the phone's share sheet with the business card */
export async function shareProfile(profile: UserProfile) {
  if (!profile.name.trim()) {
    Alert.alert(
      'Add your name first',
      'Fill in your name (and ideally your company) and save, then share your profile.'
    );
    return;
  }

  try {
    await Share.share({ message: profileCardText(profile) });
  } catch {
    // Closing the sheet or a missing app isn't worth an error
  }
}
