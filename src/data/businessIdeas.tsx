export type BusinessIdea = {
  sectorId: string;      // matches businessSectors id
  headline: string;
  overview: string;
  opportunities: string[];
  bestServices: string[];
  budgetNote: string;
};

export const businessIdeas: BusinessIdea[] = [
  {
    sectorId: 'bs1',
    headline: 'Turn footfall into a following',
    overview:
      'Retail shops lose most of their customers the moment they walk out — nobody captures who came in or why. The businesses that grow are the ones that stay in touch after the sale.',
    opportunities: [
      'Collect numbers at billing and send offers on WhatsApp',
      'Post daily new-stock reels — inventory is free content',
      'Own "near me" searches with a complete Google profile',
      'Run festive offers two weeks before, not on the day',
    ],
    bestServices: ['GMB Optimization', 'WhatsApp Automation', 'Social Media'],
    budgetNote: 'Most retail wins come from ₹10–25K a month, not big campaigns.',
  },
  {
    sectorId: 'bs2',
    headline: 'People eat with their eyes first',
    overview:
      'Restaurants live and die on photos and reviews. A customer decides in about six seconds of scrolling whether your food looks worth the trip.',
    opportunities: [
      'One professional food shoot beats a year of phone photos',
      'Reply to every review — silence reads as indifference',
      'Food creators bring crowds faster than any ad',
      'Time posts to hunger hours: 12pm and 7pm',
    ],
    bestServices: ['Flash Shoot', 'Influencer Marketing', 'GMB Optimization'],
    budgetNote: 'A shoot plus 3 creator visits usually costs less than one hoarding.',
  },
  {
    sectorId: 'bs3',
    headline: 'Sell the life, not the layout',
    overview:
      'Real estate buyers research for months before they call. Your job is to be the name they keep seeing during that long, quiet decision.',
    opportunities: [
      'Walkthrough videos qualify buyers before they visit',
      'Hoardings near the site catch people already in the area',
      'Lead forms with follow-up beat waiting for calls',
      'Show the neighbourhood, not just the flat',
    ],
    bestServices: ['Hoardings', 'Lead Generation', 'Flash Shoot'],
    budgetNote: 'High ticket size justifies heavier spend — ₹1L+ campaigns pay back on one sale.',
  },
  {
    sectorId: 'bs4',
    headline: 'Trust is the whole product',
    overview:
      'Patients choose clinics on reputation and convenience. Marketing here is less about persuasion and more about being visible, credible and easy to reach.',
    opportunities: [
      'Doctor credentials and patient reviews prominently displayed',
      'Online appointment booking removes the phone-call barrier',
      'Health awareness content builds authority without selling',
      'Local search dominance — people rarely travel far for care',
    ],
    bestServices: ['GMB Optimization', 'Website & CRM', 'Local Engagement'],
    budgetNote: 'Steady modest spend works better than campaign bursts.',
  },
  {
    sectorId: 'bs5',
    headline: 'Results are your best advertisement',
    overview:
      'Coaching and education sell on outcomes. Parents and students want proof that people like them succeeded here.',
    opportunities: [
      'Student result posts around exam season',
      'Free demo classes as the entry offer',
      'Hoardings near schools and colleges during admission months',
      'Alumni testimonials on video, not text',
    ],
    bestServices: ['Social Media', 'Hoardings', 'Lead Generation'],
    budgetNote: 'Concentrate 70% of annual spend into admission season.',
  },
  {
    sectorId: 'bs6',
    headline: 'Win the service relationship',
    overview:
      'Cars are bought rarely and serviced often. The money is in staying attached to the customer between purchases.',
    opportunities: [
      'Service reminders via WhatsApp automation',
      'Vehicle branding on your own fleet',
      'Video walkarounds of stock for online buyers',
      'Exchange offers targeted at 4–5 year old models',
    ],
    bestServices: ['Vehicle Branding', 'WhatsApp Automation', 'Lead Generation'],
    budgetNote: 'Service-side marketing costs little and drives repeat revenue.',
  },
  {
    sectorId: 'bs7',
    headline: 'Post like a brand, not a shop',
    overview:
      'Fashion moves fast and visually. Consistency of look matters more than volume of posts — customers follow an aesthetic, not a catalogue.',
    opportunities: [
      'Weekly lookbook shoots with the same styling language',
      'Micro-influencers wearing your pieces in real settings',
      'Reels of new arrivals within hours of unboxing',
      'Story polls to test demand before you stock deeply',
    ],
    bestServices: ['Social Media', 'Influencer Marketing', 'Flash Shoot'],
    budgetNote: 'Creator barter deals stretch a small budget a long way.',
  },
  {
    sectorId: 'bs8',
    headline: 'Before-and-after does the selling',
    overview:
      'Salons and beauty services have the most persuasive content built into the work itself. Most simply never film it.',
    opportunities: [
      'Transformation reels with client permission',
      'Booking links in bio — remove the DM step',
      'Local area targeting; nobody travels far for a haircut',
      'Off-peak slot offers to fill weekday afternoons',
    ],
    bestServices: ['Social Media', 'GMB Optimization', 'WhatsApp Automation'],
    budgetNote: 'Under ₹15K a month is usually enough for a single location.',
  },
  {
    sectorId: 'bs9',
    headline: 'Sell the community, not the equipment',
    overview:
      'Gyms compete on price and lose. The ones that hold members sell belonging — people stay for the people, not the machines.',
    opportunities: [
      'Member transformation stories with real numbers',
      'Trainer-led content that builds personal following',
      'January and post-festival joining campaigns',
      'Referral offers — members recruit better than ads',
    ],
    bestServices: ['Social Media', 'Local Engagement', 'Lead Generation'],
    budgetNote: 'Front-load spend into January and June joining seasons.',
  },
  {
    sectorId: 'bs10',
    headline: 'Inspire the trip, then close it',
    overview:
      'Travel is an emotional purchase researched rationally. You need beautiful content to start the dream and easy booking to finish it.',
    opportunities: [
      'Property and destination films, not still photos',
      'Review management across every booking platform',
      'Seasonal packages announced early',
      'Creator stays in exchange for content',
    ],
    bestServices: ['Flash Shoot', 'Influencer Marketing', 'SEO & Ads'],
    budgetNote: 'Spend heaviest 6–8 weeks before each travel season.',
  },
  {
    sectorId: 'bs11',
    headline: 'Occasion-led, not always-on',
    overview:
      'Jewellery sells around weddings and festivals. The rest of the year is for building the trust that makes you the obvious choice when the occasion comes.',
    opportunities: [
      'Wedding season campaigns starting two months ahead',
      'Craftsmanship films — process is fascinating content',
      'Hoardings in premium retail corridors',
      'Private appointment booking for high-value clients',
    ],
    bestServices: ['Hoardings', 'Flash Shoot', 'Social Media'],
    budgetNote: 'Concentrate spend around Akshaya Tritiya, Diwali and wedding months.',
  },
  {
    sectorId: 'bs12',
    headline: 'Compete on service, not on price',
    overview:
      'Electronics buyers compare prices online and buy where they trust the after-sales. Say that out loud in your marketing.',
    opportunities: [
      'Demo and comparison videos for big-ticket items',
      'Warranty and service promises made explicit',
      'EMI offers communicated clearly upfront',
      'Festive bundles rather than flat discounts',
    ],
    bestServices: ['SEO & Ads', 'Social Media', 'WhatsApp Automation'],
    budgetNote: 'Push hard in the 3 weeks before Diwali; that window carries the year.',
  },
  {
    sectorId: 'bs13',
    headline: 'Show finished spaces, not products',
    overview:
      'Interior customers cannot picture a sofa in isolation. Completed project photography converts far better than product listings.',
    opportunities: [
      'Full project shoots with the client as testimonial',
      'Room makeover reels with cost breakdowns',
      'Tie-ups with builders and architects for referrals',
      'Exhibitions where customers can touch materials',
    ],
    bestServices: ['Flash Shoot', 'Exhibitions', 'Social Media'],
    budgetNote: 'One strong project shoot fuels three months of content.',
  },
  {
    sectorId: 'bs14',
    headline: 'B2B runs on credibility',
    overview:
      'Manufacturing buyers care about capacity, quality and reliability. Consumer-style marketing wastes money here.',
    opportunities: [
      'Facility walkthrough films showing scale',
      'Certifications and client logos front and centre',
      'Trade exhibitions where buyers actually are',
      'Direct outreach to procurement contacts',
    ],
    bestServices: ['Exhibitions', 'Corporate Events', 'Website & CRM'],
    budgetNote: 'Two good trade shows often outperform a year of digital ads.',
  },
  {
    sectorId: 'bs15',
    headline: 'Reach farmers where they already are',
    overview:
      'Agricultural buyers trust demonstration and word of mouth over advertising. Marketing works best when it looks like education.',
    opportunities: [
      'Field demonstration days in target villages',
      'Regional-language video content on WhatsApp',
      'Local dealer and mandi display boards',
      'Seasonal timing around sowing and harvest',
    ],
    bestServices: ['Field Sales', 'Display Boards', 'WhatsApp Automation'],
    budgetNote: 'Ground activity outperforms digital spend in most rural markets.',
  },
  {
    sectorId: 'bs16',
    headline: 'Prove it before you pitch it',
    overview:
      'Software buyers want evidence. Case studies and demos move deals; feature lists do not.',
    opportunities: [
      'Case studies with real, specific outcomes',
      'Product demo videos on the landing page',
      'Content that ranks for problems, not product names',
      'LinkedIn presence for founders and key staff',
    ],
    bestServices: ['Landing Pages', 'SEO & Ads', 'Lead Generation'],
    budgetNote: 'Content compounds — budget for 6 months before judging results.',
  },
  {
    sectorId: 'bs17',
    headline: 'Clarity beats cleverness',
    overview:
      'Financial services sell on trust and simplicity. Customers who do not understand your offer will not buy it.',
    opportunities: [
      'Explainer content that simplifies, not impresses',
      'Advisor profiles with credentials visible',
      'Calculators and tools that capture leads naturally',
      'Local seminars for high-value client segments',
    ],
    bestServices: ['Website & CRM', 'Lead Generation', 'Corporate Events'],
    budgetNote: 'Compliance review adds time — plan campaigns 4 weeks ahead.',
  },
  {
    sectorId: 'bs18',
    headline: 'Your past work is your portfolio',
    overview:
      'Event and wedding clients book on emotion. Every event you run should generate content that books the next three.',
    opportunities: [
      'Cinematic highlight films from every event',
      'Vendor network referrals — photographers, venues, caterers',
      'Wedding exhibition presence in season',
      'Instagram as the primary discovery channel',
    ],
    bestServices: ['Flash Shoot', 'Exhibitions', 'Social Media'],
    budgetNote: 'Reinvest a fixed share of each booking into filming it well.',
  },
  {
    sectorId: 'bs19',
    headline: 'Reliability is the pitch',
    overview:
      'Logistics buyers switch for dependability and rates. Visibility matters less than being findable when something goes wrong with their current provider.',
    opportunities: [
      'Fleet branding — your trucks are moving billboards',
      'Tracking and transparency as a selling point',
      'Direct outreach to warehouse and factory managers',
      'Presence in industrial-corridor advertising',
    ],
    bestServices: ['Vehicle Branding', 'Field Sales', 'Telecalling'],
    budgetNote: 'Fleet branding is a one-time cost with multi-year returns.',
  },
  {
    sectorId: 'bs20',
    headline: 'Start with the fundamentals',
    overview:
      'Whatever your sector, the first three moves are the same: be findable, be reachable, and be visibly active.',
    opportunities: [
      'Complete your Google Business profile properly',
      'Set up instant WhatsApp replies to enquiries',
      'Post consistently, even if imperfectly',
      'Ask every happy customer for a review',
    ],
    bestServices: ['GMB Optimization', 'WhatsApp Automation', 'Social Media'],
    budgetNote: 'These four cost almost nothing and are skipped by most businesses.',
  },
];

export const findIdea = (sectorId: string) =>
  businessIdeas.find((i) => i.sectorId === sectorId);