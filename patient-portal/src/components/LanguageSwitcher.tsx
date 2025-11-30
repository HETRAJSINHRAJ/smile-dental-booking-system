"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Get current language from localStorage or user profile
    const savedLanguage = localStorage.getItem('language');
    const profileLanguage = userProfile?.preferences?.language;
    const language = profileLanguage || savedLanguage || 'en';
    setCurrentLanguage(language);
  }, [userProfile]);

  const changeLanguage = async (languageCode: string) => {
    if (languageCode === currentLanguage || isChanging) return;

    setIsChanging(true);
    try {
      // Save to localStorage
      localStorage.setItem('language', languageCode);
      setCurrentLanguage(languageCode);

      // Trigger storage event for same-window updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'language',
        newValue: languageCode,
        oldValue: currentLanguage,
      }));

      // Save to user profile if logged in
      if (user && userProfile) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          'preferences.language': languageCode,
          updatedAt: new Date(),
        });
      }
      
      toast.success(`Language changed to ${languages.find(l => l.code === languageCode)?.name}`);
      
      // Refresh the page to apply language changes
      router.refresh();
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    } finally {
      setIsChanging(false);
    }
  };

  const currentLang = languages.find(l => l.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={currentLanguage === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.nativeName}</span>
            {currentLanguage === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
