import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enCommon from '../locales/en/common.json';
import enBooking from '../locales/en/booking.json';
import enAppointments from '../locales/en/appointments.json';
import enAuth from '../locales/en/auth.json';
import enNotifications from '../locales/en/notifications.json';

import hiCommon from '../locales/hi/common.json';
import hiBooking from '../locales/hi/booking.json';
import hiAppointments from '../locales/hi/appointments.json';
import hiAuth from '../locales/hi/auth.json';
import hiNotifications from '../locales/hi/notifications.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: {
    common: enCommon,
    booking: enBooking,
    appointments: enAppointments,
    auth: enAuth,
    notifications: enNotifications,
  },
  hi: {
    common: hiCommon,
    booking: hiBooking,
    appointments: hiAppointments,
    auth: hiAuth,
    notifications: hiNotifications,
  },
};

// Language detector for React Native
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback('en');
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      console.log('Language cached:', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

// Export function to change language
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    console.log('Language changed to:', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'booking', 'appointments', 'auth', 'notifications'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
