"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  User, Calendar, FileText, Edit, Save, X, 
  Mail, Phone, MapPin, Heart, Shield, AlertCircle,
  Loader2, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProfile, updateUserProfile, getAppointments } from '@/lib/firebase/firestore';
import type { UserProfile, Appointment } from '@/types/shared';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { AppointmentsSection } from '@/components/dashboard/AppointmentsSection';
import { WaitlistSection } from '@/components/dashboard/WaitlistSection';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyCountryCode, setEmergencyCountryCode] = useState('+91');
  const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  ];

  // Phone formatting helper
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as 12345 12345 (5 digits, space, 5 digits)
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 5)} ${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)} ${numbers.slice(5, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  const handleEmergencyPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setEmergencyPhoneNumber(formatted);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user profile
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setEditedProfile(userProfile);
        
        // Parse phone number to extract country code
        if (userProfile.phone) {
          const phoneMatch = userProfile.phone.match(/^(\+\d+)\s*(.+)$/);
          if (phoneMatch) {
            setCountryCode(phoneMatch[1]);
            setPhoneNumber(phoneMatch[2]);
          } else {
            setPhoneNumber(userProfile.phone);
          }
        }
        
        // Parse emergency contact phone
        if (userProfile.emergencyContact?.phone) {
          const emergencyPhoneMatch = userProfile.emergencyContact.phone.match(/^(\+\d+)\s*(.+)$/);
          if (emergencyPhoneMatch) {
            setEmergencyCountryCode(emergencyPhoneMatch[1]);
            setEmergencyPhoneNumber(emergencyPhoneMatch[2]);
          } else {
            setEmergencyPhoneNumber(userProfile.emergencyContact.phone);
          }
        }
      }

      // Load appointments
      const userAppointments = await getAppointments(user.uid);
      const processedAppointments = userAppointments.map(apt => ({
        ...apt,
        patientId: apt.userId,
        patientName: apt.userName,
        patientEmail: apt.userEmail,
        patientPhone: apt.userPhone,
        serviceDuration: 30, // Default duration
        reminderSent: false,
        confirmationSent: false,
        appointmentDate: apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate.toDate() 
          : new Date(apt.appointmentDate),
        createdAt: apt.createdAt instanceof Timestamp 
          ? apt.createdAt.toDate() 
          : new Date(apt.createdAt),
        updatedAt: apt.updatedAt instanceof Timestamp 
          ? apt.updatedAt.toDate() 
          : new Date(apt.updatedAt),
      }));
      setAppointments(processedAppointments as Appointment[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;

    try {
      setSaving(true);
      
      // Combine country code with phone number
      const updatedProfile = {
        ...editedProfile,
        phone: phoneNumber ? `${countryCode} ${phoneNumber}` : editedProfile.phone,
        emergencyContact: editedProfile.emergencyContact ? {
          ...editedProfile.emergencyContact,
          phone: emergencyPhoneNumber ? `${emergencyCountryCode} ${emergencyPhoneNumber}` : editedProfile.emergencyContact.phone
        } : undefined
      };
      
      await updateUserProfile(user.uid, updatedProfile);
      setProfile({ ...profile, ...updatedProfile } as UserProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile || {});
    
    // Reset phone numbers to original values
    if (profile?.phone) {
      const phoneMatch = profile.phone.match(/^(\+\d+)\s*(.+)$/);
      if (phoneMatch) {
        setCountryCode(phoneMatch[1]);
        setPhoneNumber(phoneMatch[2]);
      } else {
        setPhoneNumber(profile.phone);
      }
    }
    
    if (profile?.emergencyContact?.phone) {
      const emergencyPhoneMatch = profile.emergencyContact.phone.match(/^(\+\d+)\s*(.+)$/);
      if (emergencyPhoneMatch) {
        setEmergencyCountryCode(emergencyPhoneMatch[1]);
        setEmergencyPhoneNumber(emergencyPhoneMatch[2]);
      } else {
        setEmergencyPhoneNumber(profile.emergencyContact.phone);
      }
    }
    
    setEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.appointmentDate >= new Date() && (apt.status === 'pending' || apt.status === 'confirmed')
  );

  const pastAppointments = appointments.filter(
    apt => apt.appointmentDate < new Date() || apt.status === 'completed' || apt.status === 'cancelled'
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and appointments</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="waitlist">
            <Clock className="h-4 w-4 mr-2" />
            Waitlist
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact details</CardDescription>
              </div>
              {!editing ? (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {editing ? (
                    <Input
                      id="fullName"
                      value={editedProfile.fullName || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {profile?.fullName || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile?.email || user.email}
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed as it's linked to your account</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {editing ? (
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              <span className="flex items-center gap-2">
                                <span>{item.flag}</span>
                                <span>{item.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        className="flex-1"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={11}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {profile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {editing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={
                        editedProfile.dateOfBirth instanceof Timestamp
                          ? editedProfile.dateOfBirth.toDate().toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => setEditedProfile({ 
                        ...editedProfile, 
                        dateOfBirth: Timestamp.fromDate(new Date(e.target.value))
                      })}
                    />
                  ) : (
                    <div className="text-sm">
                      {profile?.dateOfBirth instanceof Timestamp
                        ? profile.dateOfBirth.toDate().toLocaleDateString()
                        : 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {editing ? (
                    <Select 
                      value={editedProfile.gender || ''} 
                      onValueChange={(value) => setEditedProfile({ ...editedProfile, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm">
                      {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={editedProfile.address?.street || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        address: { ...editedProfile.address, street: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editedProfile.address?.city || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        address: { ...editedProfile.address, city: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editedProfile.address?.state || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        address: { ...editedProfile.address, state: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={editedProfile.address?.zipCode || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        address: { ...editedProfile.address, zipCode: e.target.value } as any
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  {profile?.address ? (
                    <>
                      <p>{profile.address.street}</p>
                      <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No address provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={editedProfile.insurance?.provider || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        insurance: { ...editedProfile.insurance, provider: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={editedProfile.insurance?.policyNumber || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        insurance: { ...editedProfile.insurance, policyNumber: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input
                      id="groupNumber"
                      value={editedProfile.insurance?.groupNumber || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        insurance: { ...editedProfile.insurance, groupNumber: e.target.value } as any
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm space-y-2">
                  {profile?.insurance ? (
                    <>
                      <div>
                        <span className="font-medium">Provider:</span> {profile.insurance.provider}
                      </div>
                      <div>
                        <span className="font-medium">Policy Number:</span> {profile.insurance.policyNumber}
                      </div>
                      <div>
                        <span className="font-medium">Group Number:</span> {profile.insurance.groupNumber}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No insurance information provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Name</Label>
                    <Input
                      id="emergencyName"
                      value={editedProfile.emergencyContact?.name || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergencyContact: { ...editedProfile.emergencyContact, name: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={editedProfile.emergencyContact?.relationship || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergencyContact: { ...editedProfile.emergencyContact, relationship: e.target.value } as any
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone</Label>
                    <div className="flex gap-2">
                      <Select value={emergencyCountryCode} onValueChange={setEmergencyCountryCode}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              <span className="flex items-center gap-2">
                                <span>{item.flag}</span>
                                <span>{item.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        className="flex-1"
                        value={emergencyPhoneNumber}
                        onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm space-y-2">
                  {profile?.emergencyContact ? (
                    <>
                      <div>
                        <span className="font-medium">Name:</span> {profile.emergencyContact.name}
                      </div>
                      <div>
                        <span className="font-medium">Relationship:</span> {profile.emergencyContact.relationship}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {profile.emergencyContact.phone}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No emergency contact provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={editedProfile.medicalHistory?.allergies?.join(', ') || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        medicalHistory: {
                          ...editedProfile.medicalHistory,
                          allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        } as any
                      })}
                      placeholder="e.g., Penicillin, Latex"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications (comma-separated)</Label>
                    <Input
                      id="medications"
                      value={editedProfile.medicalHistory?.medications?.join(', ') || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        medicalHistory: {
                          ...editedProfile.medicalHistory,
                          medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        } as any
                      })}
                      placeholder="e.g., Aspirin, Metformin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
                    <Input
                      id="conditions"
                      value={editedProfile.medicalHistory?.conditions?.join(', ') || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        medicalHistory: {
                          ...editedProfile.medicalHistory,
                          conditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        } as any
                      })}
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalNotes">Additional Notes</Label>
                    <Textarea
                      id="medicalNotes"
                      value={editedProfile.medicalHistory?.notes || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        medicalHistory: { ...editedProfile.medicalHistory, notes: e.target.value } as any
                      })}
                      rows={4}
                      placeholder="Any additional medical information..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm space-y-3">
                  {profile?.medicalHistory ? (
                    <>
                      {profile.medicalHistory.allergies && profile.medicalHistory.allergies.length > 0 && (
                        <div>
                          <span className="font-medium">Allergies:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {profile.medicalHistory.allergies.map((allergy, idx) => (
                              <Badge key={idx} variant="outline" className="bg-red-50">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.medicalHistory.medications && profile.medicalHistory.medications.length > 0 && (
                        <div>
                          <span className="font-medium">Medications:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {profile.medicalHistory.medications.map((med, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.medicalHistory.conditions && profile.medicalHistory.conditions.length > 0 && (
                        <div>
                          <span className="font-medium">Conditions:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {profile.medicalHistory.conditions.map((condition, idx) => (
                              <Badge key={idx} variant="outline" className="bg-yellow-50">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.medicalHistory.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1 text-muted-foreground">{profile.medicalHistory.notes}</p>
                        </div>
                      )}
                      {!profile.medicalHistory.allergies?.length &&
                       !profile.medicalHistory.medications?.length &&
                       !profile.medicalHistory.conditions?.length &&
                       !profile.medicalHistory.notes && (
                        <p className="text-muted-foreground">No medical history provided</p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No medical history provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <AppointmentsSection appointments={appointments} />
        </TabsContent>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Waitlist</CardTitle>
              <CardDescription>
                View and manage your waitlist entries for fully booked appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WaitlistSection userId={user.uid} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

