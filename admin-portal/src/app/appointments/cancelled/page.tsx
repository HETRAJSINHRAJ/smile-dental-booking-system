"use client";

import { useState, useEffect } from 'react';
import { CalendarX, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/firebase';
import { toast } from 'sonner';

export default function CancelledAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCancelledAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search term
    if (searchTerm.trim()) {
      const filtered = appointments.filter(appointment =>
        appointment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.providerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [searchTerm, appointments]);

  const loadCancelledAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await getAllDocuments<Appointment>('appointments');
      
      // Filter only cancelled appointments
      const cancelledAppointments = allAppointments.filter(
        appointment => appointment.status === 'cancelled'
      );
      
      // Sort by appointment date (most recent first)
      cancelledAppointments.sort((a, b) => {
        const dateA = a.appointmentDate?.toDate?.() || new Date(a.appointmentDate);
        const dateB = b.appointmentDate?.toDate?.() || new Date(b.appointmentDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAppointments(cancelledAppointments);
      setFilteredAppointments(cancelledAppointments);
    } catch (error) {
      console.error('Error loading cancelled appointments:', error);
      toast.error('Failed to load cancelled appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    const dateObj = date?.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarX className="h-8 w-8 text-red-600" />
            Cancelled Appointments
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage cancelled appointments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cancelled</CardTitle>
            <CalendarX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              All time cancellations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {appointments.filter(apt => {
                const aptDate = apt.appointmentDate?.toDate?.() || new Date(apt.appointmentDate);
                const now = new Date();
                return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month cancellations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(apt => {
                const aptDate = apt.appointmentDate?.toDate?.() || new Date(apt.appointmentDate);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return aptDate >= weekAgo && aptDate <= now;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days cancellations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cancelled Appointments</CardTitle>
              <CardDescription>
                {filteredAppointments.length} cancelled appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, email, service, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Appointments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Cancelled Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No cancelled appointments found matching your search.' : 'No cancelled appointments found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.userName}</div>
                          <div className="text-sm text-muted-foreground">{appointment.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appointment.serviceName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appointment.providerName}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {appointment.updatedAt ? formatDate(appointment.updatedAt) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          Cancelled
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}