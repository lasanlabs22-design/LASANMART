import { ImageSourcePropType } from 'react-native';

export type FreelancerService = {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  colour: string;
  /** Fixed package price, shown as a tag on the box */
  price?: string;
  /** Box artwork: 3:2 (720x480), objects centred on a dark backdrop */
  image?: ImageSourcePropType;
  /** Wide banner artwork (1100x472): objects on the right, dark space
   *  on the left. Used when the service runs full width. */
  bannerImage?: ImageSourcePropType;
  /** Prompts shown once this is picked, so the brief is useful */
  asks: string[];
};

/**
 * Should match FREELANCER_SKILLS in Lasan Hub, character for character:
 * the admin console lists freelancers whose skills match first.
 */
export const freelancerServices: FreelancerService[] = [
  {
    id: 'fl6',
    label: 'iPhone Photography',
    blurb: 'Quick, sharp phone shoots',
    icon: 'cellphone',
    colour: '#3A86FF',
    price: '₹1,999 · 1 hr',
    image: require('../../assets/freelancers/iphone-photography.jpg'),
    asks: ['What needs shooting?', 'Roughly how many photos?'],
  },
  {
    id: 'fl2',
    label: 'Camera & Videography',
    blurb: 'Pro photo and video shoots',
    icon: 'video-outline',
    colour: '#C13584',
    price: '₹4,999 · 4 hrs',
    image: require('../../assets/freelancers/camera-videography.jpg'),
    asks: ['Photos, video or both?', 'Where is the shoot, and how long?'],
  },
  {
    id: 'fl7',
    label: 'Cinematic Drone Photo & Video',
    blurb: 'Aerial photos and video',
    icon: 'quadcopter',
    colour: '#0891B2',
    price: '₹6,999 · 4 hrs',
    image: require('../../assets/freelancers/drone.jpg'),
    asks: ['Where should we fly?', 'Photos, video or both?'],
  },
  {
    id: 'fl3',
    label: 'Video Editing',
    blurb: 'Cutting, colour, subtitles',
    icon: 'movie-edit-outline',
    colour: '#7B3FC4',
    image: require('../../assets/freelancers/video-editing.jpg'),
    asks: ['Do you have the footage already?', 'What format do you need?'],
  },
  {
    id: 'fl8',
    label: 'Creatives & Brochures',
    blurb: 'Posts, flyers, brochures',
    icon: 'palette-swatch-outline',
    colour: '#E8AE00',
    image: require('../../assets/freelancers/creatives-brochures.jpg'),
    asks: ['What do you need designed?', 'For print, online or both?'],
  },
  {
    id: 'fl9',
    label: 'Theatre Ads',
    blurb: 'Your ad on cinema screens',
    icon: 'theater',
    colour: '#E63946',
    image: require('../../assets/freelancers/theatre-ads.jpg'),
    asks: ['Which city or theatres?', 'Do you already have the ad video?'],
  },
  {
    id: 'fl5',
    label: 'Software Development',
    blurb: 'Websites, apps, automation',
    icon: 'code-tags',
    colour: '#FF6B35',
    bannerImage: require('../../assets/freelancers/software-development.jpg'),
    asks: ['What should it do?', 'Website, app, or something else?'],
  },
];
