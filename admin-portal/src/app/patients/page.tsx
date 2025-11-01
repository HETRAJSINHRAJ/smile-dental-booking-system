"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

interface PatientWithAppointments {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  lastAppointment?: Date;
  appointments: Appointment[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientWithAppointments[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithAppointments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAppointments | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const appointments = await getAllDocuments<Appointment>('appointments');
      
      const processedAppointments = appointments.map(apt => ({
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

      // Group appointments by patient
      const patientMap = new Map<string, PatientWithAppointments>();

      processedAppointments.forEach(apt => {
        const key = apt.patientEmail;
        
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientEmail: apt.patientEmail,
            patientPhone: apt.patientPhone,
            totalAppointments: 0,
            completedAppointments: 0,
            upcomingAppointments: 0,
            appointments: [],
          });
        }

        const patient = patientMap.get(key)!;
        patient.appointments.push(apt);
        patient.totalAppointments++;

        if (apt.status === 'completed') {
          patient.completedAppointments++;
        }

        const now = new Date();
        if (apt.appointmentDate >= now && (apt.status === 'pending' || apt.status === 'confirmed')) {
          patient.upcomingAppointments++;
        }

        // Update last appointment date
        if (!patient.lastAppointment || apt.appointmentDate > patient.lastAppointment) {
          patient.lastAppointment = apt.appointmentDate;
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      patient =>
        patient.patientName.toLowerCase().includes(term) ||
        patient.patientEmail.toLowerCase().includes(term) ||
        patient.patientPhone.toLowerCase().includes(term)
    );

    setFilteredPatients(filtered);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
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
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">View and manage patient records</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Total: {patients.length}
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No patients found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search term'
              : 'No patients have booked appointments yet'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Info</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Upcoming</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.patientEmail}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.patientName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {patient.patientEmail}
                      </div>
                      {patient.patientPhone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.patientPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.totalAppointments}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      {patient.completedAppointments}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {patient.upcomingAppointments}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.lastAppointment ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(patient.lastAppointment)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{selectedPatient.patientName}</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.patientEmail}</span>
                  </div>
                  {selectedPatient.patientPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.patientPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{selectedPatient.totalAppointments}</div>
                  <div className="text-sm text-muted-foreground">Total Appointments</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{selectedPatient.completedAppointments}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{selectedPatient.upcomingAppointments}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
              </div>

              {/* Appointment History */}
              <div>
                <h4 className="font-semibold mb-3">Appointment History</h4>
                <div className="space-y-3">
                  {selectedPatient.appointments
                    .sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime())
                    .map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{apt.serviceName}</div>
                          <div className="text-sm text-muted-foreground">
                            with {apt.providerName}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatDate(apt.appointmentDate)} at {formatTime(apt.startTime)}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            apt.status === 'completed'
                              ? 'bg-green-500/10 text-green-500'
                              : apt.status === 'confirmed'
                              ? 'bg-blue-500/10 text-blue-500'
                              : apt.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                          }
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}