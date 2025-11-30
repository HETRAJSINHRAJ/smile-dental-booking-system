module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
    localeDetection: true,
  },
  fallbackLng: {
    default: ['en'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
