export type InfluencerProfile = {
  id: string;
  name: string;
  handle: string;
  followers: string;
  category: string;
  avatarUrl: string;
};

export const influencers: InfluencerProfile[] = [
  { id: 'inf1', name: 'Ananya Rao', handle: '@ananya.style', followers: '245K', category: 'Fashion', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: 'inf2', name: 'Rahul Mehta', handle: '@rahul.fit', followers: '512K', category: 'Fitness', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { id: 'inf3', name: 'Priya Sharma', handle: '@priya.eats', followers: '178K', category: 'Food', avatarUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200' },
  { id: 'inf4', name: 'Karthik Iyer', handle: '@karthik.tech', followers: '389K', category: 'Tech', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { id: 'inf5', name: 'Sneha Reddy', handle: '@sneha.travels', followers: '620K', category: 'Travel', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
  { id: 'inf6', name: 'Arjun Nair', handle: '@arjun.comedy', followers: '890K', category: 'Comedy', avatarUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=200' },
  { id: 'inf7', name: 'Divya Krishnan', handle: '@divya.beauty', followers: '334K', category: 'Beauty', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200' },
  { id: 'inf8', name: 'Vikram Singh', handle: '@vikram.business', followers: '156K', category: 'Business', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200' },
  { id: 'inf9', name: 'Meera Pillai', handle: '@meera.dance', followers: '445K', category: 'Dance', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200' },
  { id: 'inf10', name: 'Aditya Kapoor', handle: '@aditya.gaming', followers: '723K', category: 'Gaming', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200' },
];