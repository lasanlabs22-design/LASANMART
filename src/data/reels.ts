export type Reel = {
  id: string;
  username: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
};

// Placeholder sample videos — swap videoUrl/thumbnailUrl with real Lasan Vibes content later
export const reels: Reel[] = [
  {
    id: 'r1',
    username: '@lasanmart',
    caption: 'Behind the scenes at our flash shoot 🎬',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'r2',
    username: '@lasan_ads',
    caption: 'New hoarding campaign live now 🚀',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'r3',
    username: '@lasanmart',
    caption: 'Client success story ⭐',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'r4',
    username: '@lasan_events',
    caption: 'Exhibition setup timelapse',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'r5',
    username: '@lasan_studio',
    caption: 'Product shoot day for a local brand 📸',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=500&h=750&fit=crop',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  },
  {
    id: 'r6',
    username: '@lasan_ads',
    caption: 'Auto branding rollout across the city 🛺',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&h=750&fit=crop',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'r7',
    username: '@lasan_creators',
    caption: 'Creator collab that hit 1M views 🔥',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=750&fit=crop',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'r8',
    username: '@lasanmart',
    caption: 'Inside our LED board install 💡',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&h=750&fit=crop',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];