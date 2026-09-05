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
    question: 'I changed my phone number. What happens to my requests?',
    answer:
      'Your requests stay linked to the number you used when posting them. Verify the new number and you will start a fresh history — contact support if you need earlier requests moved across.',
    category: 'account',
  },
  {
    id: 'a6',
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
      'A short-video feed where our team and other businesses share campaigns, shoots and stories from the ground. Anyone using the app can post.',
    category: 'vibes',
  },
  {
    id: 'v2',
    question: 'Who can see the reels I post?',
    answer:
      'Everyone using Lasan Mart. Reels are public, so only post content you are happy to share widely.',
    category: 'vibes',
  },
  {
    id: 'v3',
    question: 'How do I edit or delete a reel I posted?',
    answer:
      'Open the reel in the feed. On your own posts you will see Edit and Delete on the right-hand side — Edit changes the caption, Delete removes the video for everyone. You can also find all your posts by tapping the profile icon at the top of Lasan Vibes.',
    category: 'vibes',
  },
  {
    id: 'v4',
    question: 'What are the video limits?',
    answer:
      'Up to 90 seconds and under 60MB. Portrait videos look best, since the feed is full screen.',
    category: 'vibes',
  },
  {
    id: 'v5',
    question: 'Where can I see how my reels are doing?',
    answer:
      'Tap the profile icon at the top of Lasan Vibes to open My Vibes. It shows everything you have posted, along with total views and how many are live.',
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
      "We're building a verified network of local creators, launching soon. In the meantime, post a custom requirement telling us what you need and our team will arrange creators for your campaign.",
    category: 'tools',
  },
];
