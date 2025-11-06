"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Shield, Heart, AlertCircle, Stethoscope, Clock, CheckCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
} from '@/components/ui/standardized-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { createDocument, getServices, getProviders } from '@/lib/firebase/firestore';
import type { UserProfile, Service, Provider } from '@/types/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

interface CreatePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: () => void;
}

interface PatientFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
}

interface AppointmentData {
  createAppointment: boolean;
  serviceId: string;
  providerId: string;
  appointmentDate: string;
  startTime: string;
  notes: string;
}

export default function CreatePatientDialog({ 
  open, 
  onOpenChange, 
  onPatientCreated 
}: CreatePatientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: [],
      notes: '',
    },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [emergencyCountryCode, setEmergencyCountryCode] = useState('+91');
  
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    createAppointment: false,
    serviceId: '',
    providerId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '',
    notes: '',
  });

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

  // Validation helpers
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    // Validates phone number (10 digits minimum, allows spaces and dashes)
    const phoneRegex = /^[0-9\s\-]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

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
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleEmergencyPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ 
      ...prev, 
      emergencyContact: { ...prev.emergencyContact, phone: formatted }
    }));
  };

  useEffect(() => {
    if (open) {
      loadServicesAndProviders();
    }
  }, [open]);

  const loadServicesAndProviders = async () => {
    try {
      const [servicesData, providersData] = await Promise.all([
        getServices(),
        getProviders()
      ]);
      setServices(servicesData);
      setProviders(providersData);
    } catch (error) {
      console.error('Error loading services and providers:', error);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      medicalHistory: {
        allergies: [],
        medications: [],
        conditions: [],
        notes: '',
      },
    });
    setAppointmentData({
      createAppointment: false,
      serviceId: '',
      providerId: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '',
      notes: '',
    });
    setAllergyInput('');
    setMedicationInput('');
    setConditionInput('');
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const generateConfirmationNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `APT${timestamp}${random}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate appointment if creating one
    if (appointmentData.createAppointment) {
      if (!appointmentData.serviceId || !appointmentData.providerId || !appointmentData.startTime) {
        toast.error('Please fill in all appointment fields');
        return;
      }
    }

    try {
      setLoading(true);

      // Generate a unique UID for the patient
      const patientUid = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const patientData: any = {
        uid: patientUid,
        fullName: formData.fullName,
        email: formData.email,
        phone: `${countryCode} ${formData.phone}`,
        role: 'patient',
        emailVerified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add optional fields only if they have values
      if (formData.dateOfBirth) {
        patientData.dateOfBirth = Timestamp.fromDate(new Date(formData.dateOfBirth));
      }

      if (formData.gender) {
        patientData.gender = formData.gender;
      }

      if (formData.address.street) {
        patientData.address = formData.address;
      }

      if (formData.insurance.provider) {
        patientData.insurance = formData.insurance;
      }

      if (formData.emergencyContact.name) {
        patientData.emergencyContact = {
          ...formData.emergencyContact,
          phone: formData.emergencyContact.phone ? `${emergencyCountryCode} ${formData.emergencyContact.phone}` : ''
        };
      }

      if (formData.medicalHistory.allergies.length > 0 || 
          formData.medicalHistory.medications.length > 0 || 
          formData.medicalHistory.conditions.length > 0 || 
          formData.medicalHistory.notes) {
        patientData.medicalHistory = formData.medicalHistory;
      }

      await createDocument('users', patientData);
      
      // Create appointment if requested
      if (appointmentData.createAppointment) {
        const selectedService = services.find(s => s.id === appointmentData.serviceId);
        const selectedProvider = providers.find(p => p.id === appointmentData.providerId);
        
        if (selectedService && selectedProvider) {
          const duration = selectedService.duration || 60;
          const endTime = calculateEndTime(appointmentData.startTime, duration);
          const appointmentDate = new Date(appointmentData.appointmentDate);

          const appointment = {
            userId: patientUid,
            userEmail: formData.email,
            userName: formData.fullName,
            userPhone: `${countryCode} ${formData.phone}`,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            providerId: selectedProvider.id,
            providerName: selectedProvider.name,
            appointmentDate: Timestamp.fromDate(appointmentDate),
            startTime: appointmentData.startTime,
            endTime: endTime,
            status: 'confirmed' as const,
            notes: appointmentData.notes || '',
            confirmationNumber: generateConfirmationNumber(),
            createdBy: 'admin',
            appointmentType: 'checkup' as const,
            paymentStatus: 'pending' as const,
            paymentAmount: 0,
            paymentType: 'service_payment' as const,
            servicePaymentStatus: 'pending' as const,
            servicePaymentAmount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await createDocument('appointments', appointment);
          toast.success('Patient profile and appointment created successfully!');
        }
      } else {
        toast.success('Patient profile created successfully!');
      }
      
      onPatientCreated?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Failed to create patient profile');
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          allergies: [...prev.medicalHistory.allergies, allergyInput.trim()]
        }
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        allergies: prev.medicalHistory.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const addMedication = () => {
    if (medicationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          medications: [...prev.medicalHistory.medications, medicationInput.trim()]
        }
      }));
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: prev.medicalHistory.medications.filter((_, i) => i !== index)
      }
    }));
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          conditions: [...prev.medicalHistory.conditions, conditionInput.trim()]
        }
      }));
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        conditions: prev.medicalHistory.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const formatTimeTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter patient's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="patient@example.com"
                    className={formData.email && isValidEmail(formData.email) ? 'pr-10' : ''}
                  />
                  {formData.email && isValidEmail(formData.email) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-red-600">Please enter a valid email address</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
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
                            <span className="text-xs text-muted-foreground">({item.country})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="98765 43210"
                      className={formData.phone && isValidPhone(formData.phone) ? 'pr-10' : ''}
                      maxLength={11}
                    />
                    {formData.phone && isValidPhone(formData.phone) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
                {formData.phone && !isValidPhone(formData.phone) && (
                  <p className="text-xs text-red-600">Please enter a valid phone number (min 10 digits)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  placeholder="Maharashtra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  placeholder="400001"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Insurance Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insurance.provider}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { ...prev.insurance, provider: e.target.value }
                    }))}
                    placeholder="Insurance Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={formData.insurance.policyNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { ...prev.insurance, policyNumber: e.target.value }
                    }))}
                    placeholder="POL123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupNumber">Group Number</Label>
                  <Input
                    id="groupNumber"
                    value={formData.insurance.groupNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { ...prev.insurance, groupNumber: e.target.value }
                    }))}
                    placeholder="GRP123456"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select 
                  value={formData.emergencyContact.relationship} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
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
                            <span className="text-xs text-muted-foreground">({item.country})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="emergencyPhone"
                    className="flex-1"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={11}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Medical History
            </h4>
            
            {/* Allergies */}
            <div className="space-y-3">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <Button type="button" onClick={addAllergy} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalHistory.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <Label>Current Medications</Label>
              <div className="flex gap-2">
                <Input
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  placeholder="Add medication"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMedication();
                    }
                  }}
                />
                <Button type="button" onClick={addMedication} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalHistory.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {medication}
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-3">
              <Label>Medical Conditions</Label>
              <div className="flex gap-2">
                <Input
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  placeholder="Add medical condition"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCondition();
                    }
                  }}
                />
                <Button type="button" onClick={addCondition} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalHistory.conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="ml-2 text-yellow-500 hover:text-yellow-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Additional Medical Notes</Label>
              <Textarea
                id="medicalNotes"
                value={formData.medicalHistory.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  medicalHistory: { ...prev.medicalHistory, notes: e.target.value }
                }))}
                placeholder="Any additional medical information..."
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Initial Appointment (Optional)
              </h4>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="createAppointment"
                  checked={appointmentData.createAppointment}
                  onCheckedChange={(checked) => setAppointmentData(prev => ({ 
                    ...prev, 
                    createAppointment: checked as boolean 
                  }))}
                />
                <Label htmlFor="createAppointment" className="cursor-pointer">
                  Create appointment for today's visit
                </Label>
              </div>
            </div>

            {appointmentData.createAppointment && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service *</Label>
                    <Select 
                      value={appointmentData.serviceId} 
                      onValueChange={(value) => setAppointmentData(prev => ({ ...prev, serviceId: value }))}
                    >
                      <SelectTrigger>
                <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {service.duration} min
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider *</Label>
                    <Select 
                      value={appointmentData.providerId} 
                      onValueChange={(value) => setAppointmentData(prev => ({ ...prev, providerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div>
                              <div className="font-medium">{provider.name}</div>
                              <div className="text-sm text-muted-foreground">{provider.specialty}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={appointmentData.appointmentDate}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Time *</Label>
                    <Select 
                      value={appointmentData.startTime} 
                      onValueChange={(value) => setAppointmentData(prev => ({ ...prev, startTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {formatTimeTo12Hour(slot)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="appointmentNotes">Appointment Notes</Label>
                    <Textarea
                      id="appointmentNotes"
                      value={appointmentData.notes}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes about today's visit..."
                      rows={2}
                    />
                  </div>
                </div>

                {appointmentData.serviceId && appointmentData.providerId && appointmentData.startTime && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Appointment Summary</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <div className="font-medium">
                        {services.find(s => s.id === appointmentData.serviceId)?.name} with{' '}
                        {providers.find(p => p.id === appointmentData.providerId)?.name}
                      </div>
                      <div className="text-xs mt-1">
                        {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {formatTimeTo12Hour(appointmentData.startTime)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!appointmentData.createAppointment && (
              <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  You can skip this step and create an appointment later from the Appointments section.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Address & Insurance';
      case 3: return 'Emergency Contact';
      case 4: return 'Medical History';
      case 5: return 'Initial Appointment';
      default: return '';
    }
  };

  return (
    <StandardizedDialog open={open} onOpenChange={onOpenChange}>
      <StandardizedDialogContent size="4xl" className="max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <StandardizedDialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0">
          <StandardizedDialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New Patient - {getStepTitle()}
          </StandardizedDialogTitle>
        </StandardizedDialogHeader>

        <StandardizedDialogBody className="flex-1 overflow-y-auto px-6 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {renderStep()}
        </StandardizedDialogBody>

        {/* Footer with Navigation */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : prevStep}
              disabled={loading}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.fullName || !formData.email || !formData.phone ||
                         (appointmentData.createAppointment && (!appointmentData.serviceId || !appointmentData.providerId || !appointmentData.startTime))}
              >
                {loading ? 'Creating...' : appointmentData.createAppointment ? 'Create Patient & Appointment' : 'Create Patient'}
              </Button>
            )}
          </div>
        </div>
      </StandardizedDialogContent>
    </StandardizedDialog>
  );
}
