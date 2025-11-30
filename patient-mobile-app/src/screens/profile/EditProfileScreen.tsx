import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContextWithToast';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phone || '');
      setGender(userProfile.gender || '');
      
      if (userProfile.address) {
        setStreet(userProfile.address.street || '');
        setCity(userProfile.address.city || '');
        setState(userProfile.address.state || '');
        setZipCode(userProfile.address.zipCode || '');
      }
      
      if (userProfile.emergencyContact) {
        setEmergencyName(userProfile.emergencyContact.name || '');
        setEmergencyRelationship(userProfile.emergencyContact.relationship || '');
        setEmergencyPhone(userProfile.emergencyContact.phone || '');
      }
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
      };

      if (gender) {
        updateData.gender = gender;
      }

      // Only include address if at least one field is filled
      if (street || city || state || zipCode) {
        updateData.address = {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        };
      }

      // Only include emergency contact if at least name is filled
      if (emergencyName) {
        updateData.emergencyContact = {
          name: emergencyName.trim(),
          relationship: emergencyRelationship.trim(),
          phone: emergencyPhone.trim(),
        };
      }

      await updateUserProfile(updateData);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Card style={styles.card}>
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                leftIcon="person-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="Gender"
                value={gender}
                onChangeText={setGender}
                placeholder="Male / Female / Other"
                leftIcon="male-female-outline"
              />
            </Card>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Card style={styles.card}>
              <Input
                label="Street Address"
                value={street}
                onChangeText={setStreet}
                placeholder="Enter street address"
                leftIcon="home-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                leftIcon="location-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="State"
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
                leftIcon="map-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="ZIP Code"
                value={zipCode}
                onChangeText={setZipCode}
                placeholder="Enter ZIP code"
                keyboardType="numeric"
                leftIcon="pin-outline"
              />
            </Card>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <Card style={styles.card}>
              <Input
                label="Contact Name"
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="Enter contact name"
                leftIcon="person-add-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="Relationship"
                value={emergencyRelationship}
                onChangeText={setEmergencyRelationship}
                placeholder="e.g., Spouse, Parent, Sibling"
                leftIcon="people-outline"
              />
              <View style={styles.inputSpacing} />
              <Input
                label="Phone Number"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            </Card>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.neutral.white} />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color={colors.neutral.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  card: {
    ...shadows.small,
  },
  inputSpacing: {
    height: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.titleMedium,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
