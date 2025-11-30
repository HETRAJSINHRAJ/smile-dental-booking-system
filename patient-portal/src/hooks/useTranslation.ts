"use client";

import { useEffect, useState } from 'react';

type Translations = Record<string, any>;

const translationsCache: Record<string, Translations> = {};

export function useTranslation(namespace: string = 'common') {
  const [translations, setTranslations] = useState<Translations>({});
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    // Get current language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLocale(savedLanguage);

    // Load translations
    loadTranslations(savedLanguage, namespace);

    // Listen for language changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue) {
        setLocale(e.newValue);
        loadTranslations(e.newValue, namespace);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [namespace]);

  const loadTranslations = async (lang: string, ns: string) => {
    const cacheKey = `${lang}-${ns}`;
    
    // Check cache first
    if (translationsCache[cacheKey]) {
      setTranslations(translationsCache[cacheKey]);
      return;
    }

    try {
      const response = await fetch(`/locales/${lang}/${ns}.json`);
      if (response.ok) {
        const data = await response.json();
        translationsCache[cacheKey] = data;
        setTranslations(data);
      } else {
        console.warn(`Translation file not found: /locales/${lang}/${ns}.json`);
      }
    } catch (error) {
      console.error(`Error loading translations for ${lang}/${ns}:`, error);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters like {{name}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return { t, locale };
}
