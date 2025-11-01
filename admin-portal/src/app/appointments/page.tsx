"use client";

import { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Clock, User, Phone, Mail, CheckCircle2, XCircle, AlertCircle, FileText, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogDescription,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
} from '@/components/ui/standardized-dialog';
import { Badge } from '@/components/ui/badge';
import { getAllDocuments, updateAppointment, getDocument } from '@/lib/firebase/firestore';
import type { Appointment, UserProfile } from '@/types/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  no_show: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const statusIcons: Record<AppointmentStatus, any> = {
  pending: AlertCircle,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
  no_show: XCircle,
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments<Appointment>('appointments');

      // Data is already in the correct format from Firestore
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        apt =>
          (apt.userName && apt.userName.toLowerCase().includes(term)) ||
          (apt.userEmail && apt.userEmail.toLowerCase().includes(term)) ||
          (apt.providerName && apt.providerName.toLowerCase().includes(term)) ||
          (apt.serviceName && apt.serviceName.toLowerCase().includes(term)) ||
          (apt.confirmationNumber && apt.confirmationNumber.toLowerCase().includes(term))
      );
    }

    setFilteredAppointments(filtered);
  };

  const loadPatientProfile = async (userId: string) => {
    try {
      const profile = await getDocument<UserProfile>('users', userId);
      setSelectedPatientProfile(profile);
    } catch (error) {
      console.error('Error loading patient profile:', error);
      // Don't show error toast - profile is optional
      setSelectedPatientProfile(null);
    }
  };

  const handleAppointmentClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
    // Load patient profile in background
    await loadPatientProfile(appointment.userId);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setUpdating(true);
      await updateAppointment(appointmentId, { status: newStatus });

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      toast.success(`Appointment ${newStatus} successfully`);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleDateString('en-US', {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage all patient appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Total: {appointments.length}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, provider, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No appointments have been scheduled yet'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Confirmation #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => {
                const StatusIcon = statusIcons[appointment.status];
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.userName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          {appointment.userEmail}
                        </div>
                        {appointment.userPhone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.userPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.serviceName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {appointment.providerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {appointment.confirmationNumber || (
                          <span className="text-muted-foreground italic">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[appointment.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <StandardizedDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <StandardizedDialogContent size="3xl" className="max-h-[90vh] overflow-hidden flex flex-col p-0">
          {selectedAppointment && (
            <>
              {/* CRITICAL: Medical Alert Banner - Minimal, professional style */}
              {selectedPatientProfile?.medicalHistory?.allergies && selectedPatientProfile.medicalHistory.allergies.length > 0 && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-1">Allergies</p>
                      <p className="text-sm text-red-800">
                        {selectedPatientProfile.medicalHistory.allergies.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header - Clean, minimal */}
              <StandardizedDialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="space-y-4">
                  {/* Patient Name & Key Info */}
                  <div>
                    <StandardizedDialogTitle className="text-xl font-semibold text-gray-900 mb-1">
                      {selectedAppointment.userName}
                    </StandardizedDialogTitle>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {selectedPatientProfile?.dateOfBirth && (
                        <span>
                          {selectedPatientProfile.dateOfBirth.toDate().toLocaleDateString()}
                          {' '}(Age {new Date().getFullYear() - selectedPatientProfile.dateOfBirth.toDate().getFullYear()})
                        </span>
                      )}
                      {selectedAppointment.confirmationNumber && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="font-mono">#{selectedAppointment.confirmationNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details - Clean grid */}
                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Service</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Provider</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.providerName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedAppointment.appointmentDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Time</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <Badge variant="outline" className={statusColors[selectedAppointment.status]}>
                      {selectedAppointment.status}
                    </Badge>
                    <div className="flex-1"></div>
                    <div className="flex gap-2">
                      {selectedAppointment.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                          disabled={updating}
                          size="sm"
                        >
                          Confirm
                        </Button>
                      )}
                      {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                            disabled={updating}
                            size="sm"
                          >
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                            disabled={updating}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedAppointment.id, 'no_show')}
                          disabled={updating}
                          size="sm"
                        >
                          No Show
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </StandardizedDialogHeader>

              {/* Scrollable Content Area */}
              <StandardizedDialogBody className="overflow-y-auto flex-1 px-8 py-6">
                {/* Two-column layout for wider dialog */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Medical Information - Minimal */}
                    {selectedPatientProfile?.medicalHistory && (
                      selectedPatientProfile.medicalHistory.medications?.length > 0 ||
                      selectedPatientProfile.medicalHistory.conditions?.length > 0 ||
                      selectedPatientProfile.medicalHistory.notes
                    ) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          Medical Information
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          {selectedPatientProfile.medicalHistory.medications && selectedPatientProfile.medicalHistory.medications.length > 0 && (
                            <div>
                              <p className="text-gray-600 mb-1">Medications</p>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                {selectedPatientProfile.medicalHistory.medications.join(', ')}
                              </p>
                            </div>
                          )}
                          {selectedPatientProfile.medicalHistory.conditions && selectedPatientProfile.medicalHistory.conditions.length > 0 && (
                            <div>
                              <p className="text-gray-600 mb-1">Conditions</p>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                {selectedPatientProfile.medicalHistory.conditions.join(', ')}
                              </p>
                            </div>
                          )}
                          {selectedPatientProfile.medicalHistory.notes && (
                            <div>
                              <p className="text-gray-600 mb-1">Medical Notes</p>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                {selectedPatientProfile.medicalHistory.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Contact Information
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Phone</p>
                          <p className="text-gray-900">{selectedAppointment.userPhone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Email</p>
                          <p className="text-gray-900">{selectedAppointment.userEmail}</p>
                        </div>

                        {selectedPatientProfile?.emergencyContact && (
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="font-semibold text-gray-900">Emergency Contact</span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-gray-600 mb-1">Name</p>
                                <p className="text-gray-900">
                                  {selectedPatientProfile.emergencyContact.name}
                                  {selectedPatientProfile.emergencyContact.relationship && (
                                    <span className="text-gray-500 ml-1">({selectedPatientProfile.emergencyContact.relationship})</span>
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Phone</p>
                                <p className="text-gray-900">{selectedPatientProfile.emergencyContact.phone}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Insurance Information */}
                    {selectedPatientProfile?.insurance && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          Insurance
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Provider</p>
                            <p className="text-gray-900">{selectedPatientProfile.insurance.provider}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Policy Number</p>
                            <p className="font-mono text-gray-900">{selectedPatientProfile.insurance.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Group Number</p>
                            <p className="font-mono text-gray-900">{selectedPatientProfile.insurance.groupNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {(selectedAppointment.notes || selectedAppointment.adminNotes) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          Notes
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          {selectedAppointment.notes && (
                            <div>
                              <p className="text-gray-600 mb-1">Patient Notes</p>
                              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                {selectedAppointment.notes}
                              </p>
                            </div>
                          )}
                          {selectedAppointment.adminNotes && (
                            <div>
                              <p className="text-gray-600 mb-1">Admin Notes</p>
                              <p className="text-gray-900 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                                {selectedAppointment.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="text-xs text-gray-500 pt-6 mt-6 border-t border-gray-200">
                  Created: {formatDate(selectedAppointment.createdAt)}
                </div>
              </StandardizedDialogBody>
            </>
          )}
        </StandardizedDialogContent>
      </StandardizedDialog>
    </div>
  );
}