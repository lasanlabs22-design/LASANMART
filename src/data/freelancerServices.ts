import { ImageSourcePropType } from 'react-native';

export type FreelancerService = {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  colour: string;
  /** Banner artwork: objects on the right, dark space on the left */
  image: ImageSourcePropType;
  /** Prompts shown once this is picked, so the brief is useful */
  asks: string[];
};

/**
 * Must match FREELANCER_SKILLS in Lasan Hub, character for character.
 */
export const freelancerServices: FreelancerService[] = [
  {
    id: 'fl1',
    label: 'Photography',
    blurb: 'Products, interiors, food, events',
    icon: 'camera-outline',
    colour: '#3A86FF',
    image: require('../../assets/freelancers/photography.jpg'),
    asks: ['What needs shooting?', 'Roughly how many shots?'],
  },
  {
    id: 'fl2',
    label: 'Videography',
    blurb: 'Shoots, coverage, reels, ads',
    icon: 'video-outline',
    colour: '#C13584',
    image: require('../../assets/freelancers/videography.jpg'),
    asks: ['What are we filming?', 'How long should the final video be?'],
  },
  {
    id: 'fl3',
    label: 'Video Editing',
    blurb: 'Cutting, colour, subtitles, reels',
    icon: 'movie-edit-outline',
    colour: '#7B3FC4',
    image: require('../../assets/freelancers/video-editing.jpg'),
    asks: ['Do you have the footage already?', 'What format do you need?'],
  },
  {
    id: 'fl4',
    label: 'Digital Marketing',
    blurb: 'Social media, ads, content, SEO',
    icon: 'chart-line',
    colour: '#0EA97A',
    image: require('../../assets/freelancers/digital-marketing.jpg'),
    asks: ['Which platforms?', 'Ongoing or a one-off campaign?'],
  },
  {
    id: 'fl5',
    label: 'Software Development',
    blurb: 'Websites, apps, tools, automation',
    icon: 'code-tags',
    colour: '#FF6B35',
    image: require('../../assets/freelancers/software-development.jpg'),
    asks: ['What should it do?', 'Website, app, or something else?'],
  },
];
