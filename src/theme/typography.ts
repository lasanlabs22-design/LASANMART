export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  body: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const type = {
  // Big screen titles — "My Account", "Lasan Mart"
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.8,
  },
  // Section headings — "Digital Plans", "Online Marketing"
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 21,
    letterSpacing: -0.6,
  },
  sectionSub: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  cardTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
};