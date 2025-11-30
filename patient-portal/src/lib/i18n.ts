import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideTranslations = async (locale: string, namespaces: string[] = ['common']) => {
  return await serverSideTranslations(locale, namespaces);
};

export const defaultNamespaces = ['common', 'booking', 'appointments', 'auth', 'notifications'];
