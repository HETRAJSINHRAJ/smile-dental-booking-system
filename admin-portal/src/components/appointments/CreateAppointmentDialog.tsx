"use client";

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope, FileText, Search, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
} from '@/components/ui/standardized-dialog';

import { 
  getAllDocuments, 
  getServices, 
  getProviders, 
  createDocument,
  getAvailableTimeSlots
} from '@/lib/firebase/firestore';
import type { Service, Provider, UserProfile } from '@/types/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated?: () => void;
}

interface NewAppointment {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  appointmentType: 'checkup' | 'follow_up' | 'consultation' | 'treatment' | 'emergency';
  notes: string;
  adminNotes: string;
}

export default function CreateAppointmentDialog({ 
  open, 
  onOpenChange, 
  onAppointmentCreated 
}: CreateAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<UserProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);

  const [appointment, setAppointment] = useState<Partial<NewAppointment>>({
    appointmentType: 'checkup',
    notes: '',
    adminNotes: '',
  });

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedService(null);
    setSelectedProvider(null);
    setSelectedDate('');
    setSelectedTime('');
    setSearchPatient('');
    setAppointment({
      appointmentType: 'checkup',
      notes: '',
      adminNotes: '',
    });
    setAvailableSlots([]);
    setAllTimeSlots([]);
  };

  useEffect(() => {
    if (open) {
      loadInitialData();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    // Filter patients based on search
    if (searchPatient.trim()) {
      const filtered = patients.filter(patient => 
        patient.fullName.toLowerCase().includes(searchPatient.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchPatient.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchPatient))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients.slice(0, 10)); // Show first 10 patients
    }
  }, [searchPatient, patients]);

  useEffect(() => {
    // Load available time slots when date and provider are selected - Same as patient portal
    if (selectedDate && selectedProvider) {
      loadAvailableTimeSlots();
    } else {
      setAvailableSlots([]);
      setAllTimeSlots([]);
    }
  }, [selectedDate, selectedProvider, selectedService]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servicesData, providersData, patientsData] = await Promise.all([
        getServices(),
        getProviders(),
        getAllDocuments<UserProfile>('users')
      ]);

      setServices(servicesData);
      setProviders(providersData);
      setPatients(patientsData);
      setFilteredPatients(patientsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTimeSlots = async () => {
    if (!selectedDate || !selectedProvider) {
      return;
    }

    try {
      setLoadingSlots(true);
      
      const duration = selectedService?.duration || 60;
      const appointmentDate = new Date(selectedDate);
      
      const slots = await getAvailableTimeSlots(
        selectedProvider.id,
        appointmentDate,
        duration
      );
      
      setAvailableSlots(slots);

      // Generate all possible time slots (same as patient portal)
      const allSlots = generateAllTimeSlots();
      setAllTimeSlots(allSlots);

      if (slots.length === 0) {
        toast.info('No available slots for this date. Please select another date.');
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Failed to load available time slots');
      setAvailableSlots([]);
      setAllTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const formatTimeTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const generateConfirmationNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `APT${timestamp}${random}`;
  };

  const generateAllTimeSlots = () => {
    // Generate all possible time slots for display (same as patient portal)
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }

    return slots;
  };

  const handlePatientSelect = (patient: UserProfile) => {
    setSelectedPatient(patient);
    setSearchPatient(''); // Clear search to hide dropdown
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
    // Clear time selection when service changes
    setSelectedTime('');
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    setSelectedProvider(provider || null);
    // Clear time selection when provider changes
    setSelectedTime('');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Clear time selection when date changes
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPatient || !selectedService || !selectedProvider || 
        !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const duration = selectedService.duration || 60;
      const endTime = calculateEndTime(selectedTime, duration);
      const appointmentDate = new Date(selectedDate);

      const appointmentData = {
        userId: selectedPatient.uid,
        userEmail: selectedPatient.email,
        userName: selectedPatient.fullName,
        userPhone: selectedPatient.phone || '',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        appointmentDate: Timestamp.fromDate(appointmentDate),
        startTime: selectedTime,
        endTime: endTime,
        status: 'confirmed' as const,
        notes: appointment.notes || '',
        adminNotes: appointment.adminNotes || '',
        confirmationNumber: generateConfirmationNumber(),
        // Additional fields for admin-created appointments
        createdBy: 'admin',
        appointmentType: appointment.appointmentType || 'checkup',
        paymentStatus: 'pending' as const,
        paymentAmount: 0,
        paymentType: 'service_payment' as const,
        servicePaymentStatus: 'pending' as const,
        servicePaymentAmount: 0,
      };

      await createDocument('appointments', appointmentData);
      
      toast.success('Appointment created successfully!');
      onAppointmentCreated?.();
      onOpenChange(false);
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const appointmentTypes = [
    { value: 'checkup', label: 'Regular Checkup' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'emergency', label: 'Emergency' },
  ];

  // Generate next 30 days for date selection (excluding today and Sundays) - Same as patient portal
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i < 31; i++) { // Start from tomorrow (i = 1)
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          fullDate: date,
        });
      }
    }

    return dates;
  };

  const dates = generateDates();

  return (
    <StandardizedDialog open={open} onOpenChange={onOpenChange}>
      <StandardizedDialogContent size="3xl" className="max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <StandardizedDialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0">
          <StandardizedDialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Appointment
          </StandardizedDialogTitle>
        </StandardizedDialogHeader>

        <StandardizedDialogBody className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Patient & Service Selection */}
            <div className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Patient *
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchPatient && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg bg-white shadow-sm">
                    <div className="divide-y">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.uid}
                          onClick={() => handlePatientSelect(patient)}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-gray-900">{patient.fullName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </span>
                            {patient.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredPatients.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No patients found
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedPatient && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Selected Patient</span>
                    </div>
                    <div className="font-semibold text-green-900">{selectedPatient.fullName}</div>
                    <div className="text-sm text-green-700 mt-1">{selectedPatient.email}</div>
                    {selectedPatient.phone && (
                      <div className="text-sm text-green-700">{selectedPatient.phone}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Appointment Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Appointment Type *</Label>
                <Select 
                  value={appointment.appointmentType} 
                  onValueChange={(value: any) => setAppointment(prev => ({ ...prev, appointmentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Service *
                </Label>
                <Select value={selectedService?.id || ''} onValueChange={handleServiceSelect}>
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

              {/* Provider Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Provider *
                </Label>
                <Select value={selectedProvider?.id || ''} onValueChange={handleProviderSelect}>
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
            </div>

            {/* Right Column - Date & Time Selection */}
            <div className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </Label>
                <div className="border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-3 gap-2 p-3 max-h-64 overflow-y-auto">
                    {dates.map((date) => {
                      const isSelected = selectedDate === date.value;
                      
                      return (
                        <button
                          key={date.value}
                          type="button"
                          onClick={() => handleDateSelect(date.value)}
                          className={`p-3 rounded-lg border text-center transition-all hover:shadow-sm ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {date.fullDate.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold mb-1">
                            {date.fullDate.getDate()}
                          </div>
                          <div className="text-xs opacity-75">
                            {date.fullDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time *
                </Label>
                {!selectedDate || !selectedProvider ? (
                  <div className="p-8 text-center text-muted-foreground border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Please select date and provider first</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="p-8 text-center border rounded-lg">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading available times...</p>
                  </div>
                ) : allTimeSlots.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No slots available</p>
                    <p className="text-xs mt-1">Please select another date</p>
                  </div>
                ) : (
                  <>
                    {/* Legend - Same as patient portal */}
                    <div className="flex items-center gap-4 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10"></div>
                        <span className="text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border-2 border-muted-foreground/30 bg-muted/50"></div>
                        <span className="text-muted-foreground">Booked</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-2">
                      {allTimeSlots.map((slot) => {
                        const isAvailable = availableSlots.includes(slot);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => isAvailable && handleTimeSelect(slot)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary'
                                : isAvailable
                                  ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                                  : 'border-muted-foreground/30 bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                            }`}
                          >
                            {formatTimeTo12Hour(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Selected Time Display */}
              {selectedTime && selectedService && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Selected Time</span>
                  </div>
                  <div className="font-semibold text-blue-900">
                    {formatTimeTo12Hour(selectedTime)} - {formatTimeTo12Hour(calculateEndTime(selectedTime, selectedService.duration))}
                  </div>
                  {selectedDate && (
                    <div className="text-sm text-blue-700 mt-1">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Patient Notes
              </Label>
              <Textarea
                placeholder="Any notes from the patient or about the appointment..."
                value={appointment.notes}
                onChange={(e) => setAppointment(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Admin Notes
              </Label>
              <Textarea
                placeholder="Internal notes for staff..."
                value={appointment.adminNotes}
                onChange={(e) => setAppointment(prev => ({ ...prev, adminNotes: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </StandardizedDialogBody>

        {/* Fixed Footer with Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedPatient || !selectedService || 
                       !selectedProvider || !selectedDate || !selectedTime}
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </div>
        </div>
      </StandardizedDialogContent>
    </StandardizedDialog>
  );
}