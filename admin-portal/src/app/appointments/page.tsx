"use client";

import { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Clock, User, Phone, Mail, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
  StandardizedDialogFooter,
  StandardizedDialogBody,
} from '@/components/ui/standardized-dialog';
import { Badge } from '@/components/ui/badge';
import { getAllDocuments, updateAppointment } from '@/lib/firebase/firestore';
import type { Appointment, AppointmentStatus } from '@/types';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

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
      
      const processedData = data.map(apt => ({
        ...apt,
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

      setAppointments(processedData);
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
          apt.patientName.toLowerCase().includes(term) ||
          apt.patientEmail.toLowerCase().includes(term) ||
          apt.providerName.toLowerCase().includes(term) ||
          apt.serviceName.toLowerCase().includes(term)
      );
    }

    setFilteredAppointments(filtered);
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
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" />
                          {appointment.patientEmail}
                        </div>
                        {appointment.patientPhone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.patientPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.serviceDuration} minutes
                        </div>
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
                      <Badge variant="outline" className={statusColors[appointment.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setDialogOpen(true);
                        }}
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
        <StandardizedDialogContent size="lg">
          <StandardizedDialogHeader>
            <StandardizedDialogTitle>Manage Appointment</StandardizedDialogTitle>
            <StandardizedDialogDescription>
              Update the status of this appointment
            </StandardizedDialogDescription>
          </StandardizedDialogHeader>

          {selectedAppointment && (
            <StandardizedDialogBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Patient</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Service</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppointment.serviceName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Status</p>
                  <Badge variant="outline" className={statusColors[selectedAppointment.status]}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
            </StandardizedDialogBody>
          )}

          <StandardizedDialogFooter>
            {selectedAppointment?.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                disabled={updating}
                className="px-6"
              >
                Confirm
              </Button>
            )}
            {(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                  disabled={updating}
                  className="px-6"
                >
                  Mark Completed
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                  disabled={updating}
                  className="px-6"
                >
                  Cancel
                </Button>
              </>
            )}
            {selectedAppointment?.status === 'confirmed' && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(selectedAppointment.id, 'no_show')}
                disabled={updating}
                className="px-6"
              >
                Mark No Show
              </Button>
            )}
          </StandardizedDialogFooter>
        </StandardizedDialogContent>
      </StandardizedDialog>
    </div>
  );
}