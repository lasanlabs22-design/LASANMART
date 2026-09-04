export type InfluencerProfile = {
  id: string;
  name: string;
  handle: string;
  /** Per-post rate in rupees */
  price: number;
};

/** Rate bands, used for the filter chips */
export const priceBands = [
  { key: 'all', label: 'All', min: 0, max: Infinity },
  { key: 'budget', label: 'Under ₹5K', min: 0, max: 4999 },
  { key: 'mid', label: '₹5K–10K', min: 5000, max: 10000 },
  { key: 'premium', label: 'Above ₹10K', min: 10001, max: Infinity },
];

export const influencers: InfluencerProfile[] = [
  {
    id: 'inf1',
    name: 'Lakshman Polisetty',
    handle: '@lakshman_polisetty',
    price: 4000,
  },
  {
    id: 'inf2',
    name: 'Prasad',
    handle: '@prasaduu6_',
    price: 6000,
  },
  {
    id: 'inf3',
    name: 'Mahammad Arshad',
    handle: '@harshadd.3242',
    price: 12000,
  },
  {
    id: 'inf4',
    name: 'Priya Prathap',
    handle: '@priyaprathap_pvt',
    price: 4000,
  },
  {
    id: 'inf5',
    name: 'Ramya',
    handle: '@ramya_volley_queen',
    price: 6000,
  },
  {
    id: 'inf6',
    name: 'Y Hemanth',
    handle: '@teddyfoodie9',
    price: 10000,
  },
  {
    id: 'inf7',
    name: 'Akhila Polisetty',
    handle: '@akhila_royal20',
    price: 5000,
  },
  {
    id: 'inf8',
    name: 'Bhavitha Yadav',
    handle: '@bhavitha_yadav.25',
    price: 6000,
  },
  {
    id: 'inf9',
    name: 'Yershad Shaik',
    handle: '@yersh_vlogs',
    price: 15000,
  },
  {
    id: 'inf10',
    name: 'Bhavyasree',
    handle: '@bhavyasree166',
    price: 6000,
  },
  {
    id: 'inf11',
    name: 'Sindhu Naidu',
    handle: '@sindhunaidu._',
    price: 4000,
  },
  {
    id: 'inf12',
    name: 'Yashu Reddy',
    handle: '@yashureddyyyy',
    price: 6000,
  },
  {
    id: 'inf13',
    name: 'Ashu Chowdhary',
    handle: '@ashu_chowdhary__',
    price: 5000,
  },
  {
    id: 'inf14',
    name: 'Sowmya Rai',
    handle: '@_sowmya_rai_4',
    price: 4000,
  },
  {
    id: 'inf15',
    name: 'Swetha',
    handle: '@swetha_nagin',
    price: 8000,
  },
  {
    id: 'inf16',
    name: 'Sai',
    handle: '@sa_ilu522',
    price: 7000,
  },
  {
    id: 'inf17',
    name: 'Sweety Naidu',
    handle: '@sweety_naidu_24',
    price: 4000,
  },
  {
    id: 'inf18',
    name: 'Yuva Sri',
    handle: '@yuva__srii',
    price: 7000,
  },
  {
    id: 'inf19',
    name: 'Tiruttani Updates',
    handle: '@tiruttani__updates',
    price: 4000,
  },
  {
    id: 'inf20',
    name: 'Tiruttani Talkies',
    handle: '@tiruttanitalkies',
    price: 3000,
  },
  {
    id: 'inf21',
    name: 'Sneha',
    handle: '@sneha__bujji_13',
    price: 6000,
  },
  {
    id: 'inf22',
    name: 'Explore Tiruttani',
    handle: '@explore_tiruttani',
    price: 4000,
  },
  {
    id: 'inf23',
    name: 'Arakkonam Dudess',
    handle: '@arakkonam_dudess',
    price: 6000,
  },
  {
    id: 'inf24',
    name: 'Our Arakkonam',
    handle: '@our_arakkonamm',
    price: 6000,
  },
  {
    id: 'inf25',
    name: 'Kavipriya',
    handle: '@kavipriya_',
    price: 15000,
  },
  {
    id: 'inf26',
    name: 'MJ Charan',
    handle: '@mj_charan',
    price: 5000,
  },
  {
    id: 'inf27',
    name: 'Its My Tirupati',
    handle: '@itsmytirupati',
    price: 12000,
  },
  {
    id: 'inf28',
    name: 'Beautiful Tirupathi',
    handle: '@beautifultirupathi',
    price: 12000,
  },
  {
    id: 'inf29',
    name: 'USG Royal',
    handle: '@usg_royal',
    price: 7000,
  },
  {
    id: 'inf30',
    name: 'Tirupati Pilla Sweety',
    handle: '@__tirupati__pilla__sweety',
    price: 5000,
  },
  {
    id: 'inf31',
    name: 'Mahima Chirag',
    handle: '@mahimachirag',
    price: 15000,
  },
  {
    id: 'inf32',
    name: 'Manu',
    handle: '@mann_u2006',
    price: 4000,
  },
  {
    id: 'inf33',
    name: 'Siri',
    handle: '@_siri__queen_',
    price: 6000,
  },
  {
    id: 'inf34',
    name: 'Sara Srinivas',
    handle: '@sara_srinivas___',
    price: 10000,
  },
  {
    id: 'inf35',
    name: 'Hasin Nayak',
    handle: '@hasin___nayak_0.2',
    price: 3000,
  },
  {
    id: 'inf36',
    name: 'Anchor Divya Reddy',
    handle: '@anchordivyareddy_',
    price: 5000,
  },
  {
    id: 'inf37',
    name: 'Sivangi Bhargavi',
    handle: '@sivangi_bhargavi',
    price: 4000,
  },
  {
    id: 'inf38',
    name: 'Duke Tej',
    handle: '@duke_tej__',
    price: 10000,
  },
  {
    id: 'inf39',
    name: 'Neha Chowdary',
    handle: '@nehachowdaryyy___',
    price: 70000,
  },
  {
    id: 'inf40',
    name: 'Ram Sunny',
    handle: '@ram_sunny',
    price: 4000,
  },
  {
    id: 'inf41',
    name: 'Siri Shetty',
    handle: '@siri__shetty',
    price: 7000,
  },
  {
    id: 'inf42',
    name: 'Thanuja',
    handle: '@vibe_with_thanujaa',
    price: 6000,
  },
  {
    id: 'inf43',
    name: 'Simran',
    handle: '@simrantastic',
    price: 5000,
  },
  {
    id: 'inf44',
    name: 'Foodie Paapa',
    handle: '@foodie_paapa',
    price: 6000,
  },
  {
    id: 'inf45',
    name: 'Anchor Sravani',
    handle: '@anchorsravani',
    price: 15000,
  },
  {
    id: 'inf46',
    name: 'Anchor Matangi Divya',
    handle: '@anchormatangidivya',
    price: 8000,
  },
];

/** '₹4,000' */
export const formatPrice = (n: number) => '₹' + n.toLocaleString('en-IN');
