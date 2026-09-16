export type FreelancerService = {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  colour: string;
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
    asks: ['What needs shooting?', 'Roughly how many shots?'],
  },
  {
    id: 'fl2',
    label: 'Videography',
    blurb: 'Shoots, coverage, reels, ads',
    icon: 'video-outline',
    colour: '#C13584',
    asks: ['What are we filming?', 'How long should the final video be?'],
  },
  {
    id: 'fl3',
    label: 'Video Editing',
    blurb: 'Cutting, colour, subtitles, reels',
    icon: 'movie-edit-outline',
    colour: '#7B3FC4',
    asks: ['Do you have the footage already?', 'What format do you need?'],
  },
  {
    id: 'fl4',
    label: 'Digital Marketing',
    blurb: 'Social media, ads, content, SEO',
    icon: 'chart-line',
    colour: '#0EA97A',
    asks: ['Which platforms?', 'Ongoing or a one-off campaign?'],
  },
];
