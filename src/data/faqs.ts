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
    question: 'Which cities do you cover?',
    answer:
      'We work across Andhra Pradesh and Telangana, with partners in most major cities. Some offline services like hoardings depend on availability in your area — tell us your city when you post a request and we will confirm.',
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
      'Open the My Requests tab. Every request shows its current status — Received, Contacted, In Progress, or Completed. You will also get a notification here whenever the status changes.',
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
    question: 'Why do you need my name, phone and email?',
    answer:
      'So our team can get back to you about your request. We only use these details to contact you about work you have asked for — nothing else.',
    category: 'account',
  },
  {
    id: 'a2',
    question: 'Do I need to create an account?',
    answer:
      'No. You can use the app straight away. We only ask for your contact details the first time you post a request, and they are saved on your device so you are not asked again.',
    category: 'account',
  },
  {
    id: 'a3',
    question: 'I changed my phone number. What happens to my requests?',
    answer:
      'Your requests are linked to the number you used when posting them. If you change it in your profile, earlier requests stay under the old number. Contact support and we will move them across.',
    category: 'account',
  },
  {
    id: 'a4',
    question: 'Someone else used my phone. How do I clear their details?',
    answer:
      'Go to Settings and tap Log Out. That clears the saved profile from this device, and the next person can enter their own details.',
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
    question: 'How do I delete a reel I posted?',
    answer:
      'Contact support with the caption or roughly when you posted it, and our team will remove it. In-app deletion is coming in a future update.',
    category: 'vibes',
  },
  {
    id: 'v4',
    question: 'What are the video limits?',
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
];
