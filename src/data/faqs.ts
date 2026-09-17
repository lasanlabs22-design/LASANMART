export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: 'requests' | 'account' | 'vibes' | 'tools' | 'general';
};

export const faqCategories = [
  { key: 'general', label: 'General', icon: 'help-circle-outline' },
  { key: 'requests', label: 'Requests', icon: 'clipboard-text-outline' },
  { key: 'account', label: 'Account', icon: 'account-outline' },
  { key: 'vibes', label: 'Lasan Vibes', icon: 'play-circle-outline' },
  { key: 'tools', label: 'Tools', icon: 'apps' },
] as const;

export const faqs: Faq[] = [
  /* ---------- General ---------- */
  {
    id: 'g1',
    question: 'What is Lasan Mart?',
    answer:
      'Lasan Mart connects your business with marketing services — both online (social media, ads, websites) and offline (hoardings, print, events). You tell us what you need, and our team handles the rest.',
    category: 'general',
  },
  {
    id: 'g2',
    question: 'Is the app free to use?',
    answer:
      'Yes. Browsing services, posting requests and using Lasan Vibes are all free. You only pay for the marketing work you decide to go ahead with, and we agree that cost with you beforehand.',
    category: 'general',
  },
  {
    id: 'g3',
    question: 'Which areas do you cover?',
    answer:
      'We are based in Tirupati and work across Andhra Pradesh, with partners in nearby regions. Some offline services like hoardings depend on availability in your area — tell us your city when you post a request and we will confirm what we can do.',
    category: 'general',
  },
  {
    id: 'g4',
    question: 'Do you do the work yourselves?',
    answer:
      'Some of it. For hoardings, printing, shoots and events we use partners we have checked and verified, and our team manages them for you. You deal with us throughout — we handle the coordination, the cost and the quality.',
    category: 'general',
  },
  {
    id: 'g5',
    question: 'I provide these services. Can I work with you?',
    answer:
      'Yes — that is what Lasan Hub is for. It is a separate app for creators, vendors and freelancers who want work from businesses using Lasan Mart. Call our support team and we will get you set up.',
    category: 'general',
  },

  /* ---------- Requests ---------- */
  {
    id: 'r1',
    question: 'How long until someone contacts me?',
    answer:
      'Our team reviews every request and usually responds within 4 to 6 hours during working hours. Requests posted late in the evening are picked up the next morning.',
    category: 'requests',
  },
  {
    id: 'r2',
    question: 'How do I track my request?',
    answer:
      'Open the My Requests tab. Every request shows its current status — Received, Contacted, In Progress, or Completed. Your phone will also buzz whenever the status changes, and you can see the history behind the bell icon on the Home screen.',
    category: 'requests',
  },
  {
    id: 'r3',
    question: 'Can I change or cancel a request?',
    answer:
      'Not from the app yet. Call or WhatsApp our support team with your request details and we will update it for you.',
    category: 'requests',
  },
  {
    id: 'r4',
    question: 'Do I have to know exactly what I need?',
    answer:
      'No. Describe your goal in your own words and our team will suggest what fits. If you are unsure where to start, try the Business Ideas section — it suggests what works for your sector.',
    category: 'requests',
  },
  {
    id: 'r5',
    question: 'What if the service I want is not listed?',
    answer:
      'Use the Custom Requirement option on the Home screen. Tell us what you need and our team will come back with a tailored plan.',
    category: 'requests',
  },
  {
    id: 'r6',
    question: 'My request says a partner is working on it. Who are they?',
    answer:
      'Someone from our verified network doing the work on the ground. We stay in the middle throughout, so anything you need — a change, an update, a problem — comes to us and we handle it. You never have to chase them.',
    category: 'requests',
  },
  {
    id: 'r7',
    question: 'Why are you asking me how it went?',
    answer:
      'Once work is finished we ask whether it went well. It takes one tap, it is seen only by our team, and it decides who we send your next job to. It is the main way we keep quality up.',
    category: 'requests',
  },

  /* ---------- Account ---------- */
  {
    id: 'a1',
    question: 'Why do you need to verify my phone number?',
    answer:
      'Your phone number is how we keep your requests private. Verifying it with a one-time code means only you can see what you have submitted — nobody else can look up your requests by guessing your number.',
    category: 'account',
  },
  {
    id: 'a2',
    question: 'Do I need to create an account?',
    answer:
      'No password, no sign-up form. You can browse straight away. The first time you post a request we ask for your name and email, and send a code to your phone to confirm it is yours. After that you are not asked again.',
    category: 'account',
  },
  {
    id: 'a3',
    question: 'What can I sign in with?',
    answer:
      'You can continue as a guest, sign in with Google, or sign in with your phone number. Whichever you choose, we verify your phone number before your first request — that is what keeps your request history private.',
    category: 'account',
  },
  {
    id: 'a4',
    question: 'I did not receive the verification code.',
    answer:
      'Wait for the timer to finish and tap "Send a new code". Check your number is correct and that you have signal. If it still does not arrive, message our support team and we will help.',
    category: 'account',
  },
  {
    id: 'a5',
    question: 'I already have an account on another phone.',
    answer:
      'Tap "Already have an account? Sign in" on the login screen and verify the number you used before. Your details and request history come back automatically.',
    category: 'account',
  },
  {
    id: 'a6',
    question: 'I changed my phone number. What happens to my requests?',
    answer:
      'Your requests stay linked to the number you used when posting them. Verify the new number and you will start a fresh history — contact support if you need earlier requests moved across.',
    category: 'account',
  },
  {
    id: 'a7',
    question: 'Someone else used my phone. How do I clear their details?',
    answer:
      'Go to Settings and tap Log Out. That clears the saved profile from this device, and the next person can enter and verify their own number.',
    category: 'account',
  },

  /* ---------- Lasan Vibes ---------- */
  {
    id: 'v1',
    question: 'What is Lasan Vibes?',
    answer:
      'A short-video feed where our team and other businesses share campaigns, shoots and stories from the ground. Watch as much as you like — posting is opening soon.',
    category: 'vibes',
  },
  {
    id: 'v2',
    question: 'Why can I not post a video?',
    answer:
      'Posting is not open yet. We are putting the finishing touches to it, and it will arrive in an update — you will be able to share what your business is up to with everyone using the app.',
    category: 'vibes',
  },
  {
    id: 'v3',
    question: 'Who will see the reels I post?',
    answer:
      'Everyone using Lasan Mart. Reels are public, so only post content you are happy to share widely.',
    category: 'vibes',
  },
  {
    id: 'v4',
    question: 'What will the video limits be?',
    answer:
      'Up to 90 seconds and under 60MB. Portrait videos look best, since the feed is full screen.',
    category: 'vibes',
  },

  /* ---------- Tools ---------- */
  {
    id: 't1',
    question: 'What is Quotation Generation?',
    answer:
      'A free tool for creating professional quotations with your company logo as a watermark. Fill in your services and rates, then share the PDF on WhatsApp or by email. Add your logo in My Account first so it appears on the document.',
    category: 'tools',
  },
  {
    id: 't2',
    question: 'Are my quotations saved?',
    answer:
      'Not yet. Generate the PDF and save or send it before leaving the screen. Quotation history is planned for a future update.',
    category: 'tools',
  },
  {
    id: 't3',
    question: 'How do Attendance and CRM work?',
    answer:
      'These are custom builds rather than ready-made apps. Tell us how your business runs and our team scopes something that fits, including setup, training and support.',
    category: 'tools',
  },
  {
    id: 't4',
    question: 'How does influencer marketing work?',
    answer:
      'Open the Influencers section and browse our verified creators — you can see what they post about, their following, their city and their rate. Pick as many as you like and send the request. Our team then handles the brief, the negotiating and the campaign.',
    category: 'tools',
  },
  {
    id: 't5',
    question: 'Can I hire a photographer or video editor?',
    answer:
      'Yes. The Freelancers section covers photography, videography, video editing and digital marketing. Pick what you need — more than one is fine — describe the work, and our team finds the right person and comes back with a quote.',
    category: 'tools',
  },
];
