"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Eye, Clock, FileText, Hash, MapPin, Shield, AlertCircle, Heart, Cake } from 'lucide-react';
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
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
} from '@/components/ui/standardized-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAllDocuments, getDocument } from '@/lib/firebase/firestore';
import type { Appointment, UserProfile } from '@/types/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

interface PatientWithAppointments {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  lastAppointment?: Timestamp;
  appointments: Appointment[];
  profile?: UserProfile; // Full patient profile data
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

      // Group appointments by patient
      const patientMap = new Map<string, PatientWithAppointments>();

      appointments.forEach(apt => {
        const key = apt.userEmail;

        if (!patientMap.has(key)) {
          patientMap.set(key, {
            userId: apt.userId,
            userName: apt.userName,
            userEmail: apt.userEmail,
            userPhone: apt.userPhone || '',
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
        const aptDate = apt.appointmentDate.toDate();
        if (aptDate >= now && (apt.status === 'pending' || apt.status === 'confirmed')) {
          patient.upcomingAppointments++;
        }

        // Update last appointment date
        if (!patient.lastAppointment || apt.appointmentDate.toMillis() > patient.lastAppointment.toMillis()) {
          patient.lastAppointment = apt.appointmentDate;
        }
      });

      // Fetch user profiles for each patient
      const patientsArray = Array.from(patientMap.values());
      await Promise.all(
        patientsArray.map(async (patient) => {
          try {
            const profile = await getDocument<UserProfile>('users', patient.userId);
            if (profile) {
              patient.profile = profile;
            }
          } catch (error) {
            console.error(`Error fetching profile for user ${patient.userId}:`, error);
            // Continue even if profile fetch fails
          }
        })
      );

      setPatients(patientsArray);
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
        (patient.userName && patient.userName.toLowerCase().includes(term)) ||
        (patient.userEmail && patient.userEmail.toLowerCase().includes(term)) ||
        (patient.userPhone && patient.userPhone.toLowerCase().includes(term))
    );

    setFilteredPatients(filtered);
  };

  const formatDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleDateString('en-US', {
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
                <TableRow key={patient.userEmail}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.userName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {patient.userEmail}
                      </div>
                      {patient.userPhone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.userPhone}
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
      <StandardizedDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <StandardizedDialogContent size="3xl" className="max-h-[90vh] overflow-hidden flex flex-col p-0">
          <StandardizedDialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <StandardizedDialogTitle>Patient Profile</StandardizedDialogTitle>
          </StandardizedDialogHeader>

          {selectedPatient && (
            <StandardizedDialogBody className="overflow-y-auto flex-1 px-6 py-4">
              <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium">{selectedPatient.profile?.fullName || selectedPatient.userName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedPatient.userEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedPatient.profile?.phone || selectedPatient.userPhone || 'Not provided'}
                      </p>
                    </div>
                    {selectedPatient.profile?.dateOfBirth && (
                      <div>
                        <p className="text-muted-foreground mb-1">Date of Birth</p>
                        <p className="font-medium flex items-center gap-2">
                          <Cake className="h-4 w-4" />
                          {selectedPatient.profile.dateOfBirth.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              {selectedPatient.profile?.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{selectedPatient.profile.address.street}</p>
                    <p>{selectedPatient.profile.address.city}, {selectedPatient.profile.address.state} {selectedPatient.profile.address.zipCode}</p>
                  </CardContent>
                </Card>
              )}

              {/* Insurance Information */}
              {selectedPatient.profile?.insurance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Provider</p>
                        <p className="font-medium">{selectedPatient.profile.insurance.provider}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Policy Number</p>
                        <p className="font-medium font-mono">{selectedPatient.profile.insurance.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Group Number</p>
                        <p className="font-medium font-mono">{selectedPatient.profile.insurance.groupNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emergency Contact */}
              {selectedPatient.profile?.emergencyContact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertCircle className="h-5 w-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Name</p>
                        <p className="font-medium">{selectedPatient.profile.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Relationship</p>
                        <p className="font-medium">{selectedPatient.profile.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedPatient.profile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical History */}
              {selectedPatient.profile?.medicalHistory && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPatient.profile.medicalHistory.allergies && selectedPatient.profile.medicalHistory.allergies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.profile.medicalHistory.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.profile.medicalHistory.medications && selectedPatient.profile.medicalHistory.medications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Current Medications</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.profile.medicalHistory.medications.map((med, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.profile.medicalHistory.conditions && selectedPatient.profile.medicalHistory.conditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Medical Conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.profile.medicalHistory.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPatient.profile.medicalHistory.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                        <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedPatient.profile.medicalHistory.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator />

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
                    .sort((a, b) => b.appointmentDate.toMillis() - a.appointmentDate.toMillis())
                    .map((apt) => (
                      <div key={apt.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-muted/30">
                          <div className="flex-1">
                            <div className="font-medium text-base">{apt.serviceName}</div>
                            <div className="text-sm text-muted-foreground">
                              with {apt.providerName}
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

                        <div className="p-3 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(apt.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</span>
                          </div>
                          {apt.confirmationNumber && (
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono">{apt.confirmationNumber}</span>
                            </div>
                          )}
                          {apt.notes && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Patient Notes</div>
                                  <div className="text-sm text-gray-900">{apt.notes}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          {apt.adminNotes && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                  <div className="text-xs font-medium text-blue-600 uppercase mb-1">Admin Notes</div>
                                  <div className="text-sm text-gray-900 bg-blue-50 p-2 rounded border border-blue-200">{apt.adminNotes}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Created: {formatDate(apt.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              </div>
            </StandardizedDialogBody>
          )}
        </StandardizedDialogContent>
      </StandardizedDialog>
    </div>
  );
}