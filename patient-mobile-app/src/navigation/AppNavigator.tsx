import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationPreferencesScreen from '../screens/profile/NotificationPreferencesScreen';
import LinkedAccountsScreen from '../screens/profile/LinkedAccountsScreen';

// Booking Flow Screens
import SelectServiceScreen from '../screens/booking/SelectServiceScreen';
import SelectProviderScreen from '../screens/booking/SelectProviderScreen';
import SelectDateTimeScreen from '../screens/booking/SelectDateTimeScreen';
import ConfirmBookingScreen from '../screens/booking/ConfirmBookingScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';

// Appointment Screens
import RescheduleScreen from '../screens/appointments/RescheduleScreen';

import { useAuth } from '../contexts/AuthContextWithToast';
import { TabBar } from '../components/TabBar';
import { Appointment } from '../types/shared';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  SelectService: undefined;
  SelectProvider: { serviceId: string };
  SelectDateTime: { serviceId: string; providerId: string };
  ConfirmBooking: { serviceId: string; providerId: string; date: string; time: string };
  BookingSuccess: { appointmentId: string };
  Reschedule: { appointment: Appointment };
  EditProfile: undefined;
  NotificationPreferences: undefined;
  LinkedAccounts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  Booking: undefined;
  Appointments: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Services" component={ServicesScreen} />
    <Tab.Screen name="Booking" component={BookingScreen} />
    <Tab.Screen name="Appointments" component={AppointmentsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="SelectService" component={SelectServiceScreen} />
            <Stack.Screen name="SelectProvider" component={SelectProviderScreen} />
            <Stack.Screen name="SelectDateTime" component={SelectDateTimeScreen} />
            <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="Reschedule" component={RescheduleScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
            <Stack.Screen name="LinkedAccounts" component={LinkedAccountsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
