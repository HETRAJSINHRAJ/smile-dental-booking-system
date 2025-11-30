/**
 * Dental Booking System - Patient Mobile App
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/contexts/AuthContextWithToast';
import { ToastProvider } from './src/contexts/ToastContext';
import { AlertProvider } from './src/components/AlertProvider';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/onboarding/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import { setupNotificationHandlers, PDFDownloadManager } from './src/utils/pdfDownloadManager';
import { initSentry } from './sentry.config';
import { initAnalytics } from './src/lib/analytics';
import { markAppReady } from './src/lib/performanceMonitoring';
import './src/i18n/config'; // Initialize i18n

const ONBOARDING_KEY = '@onboarding_completed';

// Initialize Sentry error tracking
initSentry();

// Initialize Firebase Analytics
initAnalytics();

// Initialize notification handlers
setupNotificationHandlers();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkOnboarding();
    
    // Initialize PDF download manager
    PDFDownloadManager.initialize().catch(error => {
      console.error('Failed to initialize PDF download manager:', error);
    });
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    setIsReady(true);
    // Mark app as ready for performance tracking
    markAppReady();
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarding && isReady) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <ToastProvider>
          <AuthProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppNavigator />
          </AuthProvider>
        </ToastProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

export default App;
