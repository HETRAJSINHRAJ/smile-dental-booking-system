"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Receipt,
} from 'lucide-react';
import Image from 'next/image';
import type { Appointment } from '@/types/firebase';


interface AppointmentsSectionProps {
  appointments: Appointment[];
}

interface AppointmentGroup {
  title: string;
  appointments: Appointment[];
  color: string;
  collapsed: boolean;
}

export function AppointmentsSection({ appointments }: AppointmentsSectionProps) {
  const [groups, setGroups] = useState<AppointmentGroup[]>(() => {
    // Sort all appointments by date first
    const sorted = [...appointments].sort((a, b) => {
      const dateA = a.appointmentDate?.toDate ? a.appointmentDate.toDate() : new Date(a.appointmentDate);
      const dateB = b.appointmentDate?.toDate ? b.appointmentDate.toDate() : new Date(b.appointmentDate);
      return dateA.getTime() - dateB.getTime();
    });

    const upcoming = sorted.filter(
      apt => apt.status === 'confirmed' || apt.status === 'pending'
    );
    const finished = sorted.filter(
      apt => apt.status === 'completed' || apt.status === 'cancelled'
    );
    const noShow = sorted.filter(apt => apt.status === 'no_show');

    const result: AppointmentGroup[] = [];
    if (upcoming.length > 0) {
      result.push({
        title: 'Upcoming',
        appointments: upcoming,
        color: 'bg-blue-500',
        collapsed: false,
      });
    }
    if (finished.length > 0) {
      result.push({
        title: 'Finished',
        appointments: finished,
        color: 'bg-green-500',
        collapsed: false,
      });
    }
    if (noShow.length > 0) {
      result.push({
        title: 'No Show',
        appointments: noShow,
        color: 'bg-red-500',
        collapsed: false,
      });
    }
    return result;
  });

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'reservation' | 'bill'>('reservation');

  const toggleGroup = (index: number) => {
    setGroups(prev => prev.map((group, i) =>
      i === index ? { ...group, collapsed: !group.collapsed } : group
    ));
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getVisitNumber = (appointment: Appointment) => {
    const allAppointments = groups.flatMap(g => g.appointments);
    const sorted = allAppointments.sort((a, b) => {
      const dateA = a.appointmentDate?.toDate ? a.appointmentDate.toDate() : new Date(a.appointmentDate);
      const dateB = b.appointmentDate?.toDate ? b.appointmentDate.toDate() : new Date(b.appointmentDate);
      return dateA.getTime() - dateB.getTime();
    });
    return sorted.findIndex(apt => apt.id === appointment.id) + 1;
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't booked any appointments yet.
          </p>
          <Button>Book an Appointment</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {groups.map((group, groupIndex) => (
          <Card key={group.title}>
            <CardContent className="p-6">
              {/* Section Header */}
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="flex items-center justify-between w-full mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${group.color}`} />
                  <h3 className="text-lg font-semibold">
                    {group.title} ({group.appointments.length})
                  </h3>
                </div>
                {group.collapsed ? (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Appointments List */}
              {!group.collapsed && (
                <div className="space-y-4">
                  {group.appointments.map((apt, index) => {
                    const date = apt.appointmentDate?.toDate ? apt.appointmentDate.toDate() : new Date(apt.appointmentDate);
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const isLast = index === group.appointments.length - 1;

                    return (
                      <div key={apt.id} className="flex gap-4">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full ${group.color} flex flex-col items-center justify-center text-white text-xs font-semibold`}>
                            <div className="text-[10px]">{month}</div>
                            <div className="text-base">{day}</div>
                          </div>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>

                        {/* Appointment Card */}
                        <Card 
                          className="flex-1 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setActiveTab('reservation');
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="text-sm font-medium">
                                {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                #{apt.confirmationNumber || `RSVT${apt.id.slice(-5).toUpperCase()}`}
                              </div>
                            </div>

                            <h4 className="font-semibold mb-2">{apt.serviceName}</h4>

                            <div className="text-sm text-muted-foreground mb-2">
                              Visit #{getVisitNumber(apt)} - {apt.serviceName}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Building2 className="h-4 w-4" />
                              <span>{apt.providerName}</span>
                            </div>

                            {apt.status === 'completed' && apt.servicePaymentStatus === 'pending' && (
                              <div className="flex items-center justify-between pt-3 border-t">
                                <div>
                                  <div className="text-xs text-muted-foreground">Total payment</div>
                                  <div className="text-lg font-bold">₹{apt.servicePaymentAmount.toFixed(2)}</div>
                                </div>
                                <Button size="sm">Pay</Button>
                              </div>
                            )}

                            {apt.status === 'completed' && apt.servicePaymentStatus === 'paid' && (
                              <div className="pt-3 border-t">
                                <span className="text-sm font-semibold text-green-600">+ PAID</span>
                              </div>
                            )}

                            {apt.status === 'cancelled' && (
                              <div className="pt-3 border-t">
                                <span className="text-sm font-semibold text-red-600">+ CANCELLED</span>
                              </div>
                            )}

                            {apt.status === 'no_show' && (
                              <>
                                <div className="pt-3 border-t">
                                  <span className="text-sm font-semibold text-red-600">+ NO SHOW</span>
                                </div>
                                <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border-l-2 border-red-500 rounded text-xs text-muted-foreground">
                                  <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                  <span>
                                    You missed this appointment. Please contact us to reschedule or if you have any questions.
                                  </span>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {formatDate(selectedAppointment.appointmentDate)} (
                  {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)})
                </DialogTitle>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reservation' | 'bill')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reservation">Reservation detail</TabsTrigger>
                  <TabsTrigger value="bill">Bill detail</TabsTrigger>
                </TabsList>

                <TabsContent value="reservation" className="space-y-6 mt-6">
                  {/* Confirmation Number & Status */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{selectedAppointment.confirmationNumber || `RSVT${selectedAppointment.id.slice(-5).toUpperCase()}`}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {selectedAppointment.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Provider Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAppointment.providerName}</h3>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Appointment Information</h4>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="font-semibold mb-1">{selectedAppointment.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{selectedAppointment.paymentAmount.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Visit Number</span>
                      <span className="font-medium">#{getVisitNumber(selectedAppointment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium">{selectedAppointment.providerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Patient Name</span>
                      <span className="font-medium">{selectedAppointment.userName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Patient Email</span>
                      <span className="font-medium">{selectedAppointment.userEmail}</span>
                    </div>
                    {selectedAppointment.userPhone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Patient Phone</span>
                        <span className="font-medium">{selectedAppointment.userPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Appointment Date</span>
                      <span className="font-medium">{formatFullDate(selectedAppointment.appointmentDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Slot</span>
                      <span className="font-medium">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium capitalize">{selectedAppointment.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created On</span>
                      <span className="font-medium">
                        {(selectedAppointment.createdAt?.toDate ? selectedAppointment.createdAt.toDate() : new Date(selectedAppointment.createdAt)).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="border-t pt-6">
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">{selectedAppointment.notes}</div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bill" className="space-y-6 mt-6">
                  {/* Confirmation Number & Status */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{selectedAppointment.confirmationNumber || `RSVT${selectedAppointment.id.slice(-5).toUpperCase()}`}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {selectedAppointment.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Payment Summary</h4>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium">{selectedAppointment.serviceName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Appointment Fee</span>
                          <span className="font-medium">₹{selectedAppointment.paymentAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Status</span>
                          <Badge 
                            variant="outline"
                            className={
                              selectedAppointment.paymentStatus === 'fully_paid' ? 'bg-green-50 text-green-700' :
                              selectedAppointment.paymentStatus === 'reservation_paid' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }
                          >
                            {selectedAppointment.paymentStatus === 'fully_paid' ? 'Fully Paid' :
                             selectedAppointment.paymentStatus === 'reservation_paid' ? 'Reservation Paid' :
                             selectedAppointment.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                          </Badge>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Payment Amount</span>
                            <span className="font-medium">₹{selectedAppointment.servicePaymentAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Service Payment Status</span>
                            <Badge 
                              variant="outline"
                              className={
                                selectedAppointment.servicePaymentStatus === 'paid' ? 'bg-green-50 text-green-700' :
                                selectedAppointment.servicePaymentStatus === 'waived' ? 'bg-blue-50 text-blue-700' :
                                'bg-red-50 text-red-700'
                              }
                            >
                              {selectedAppointment.servicePaymentStatus === 'paid' ? 'Paid' :
                               selectedAppointment.servicePaymentStatus === 'waived' ? 'Waived' : 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="font-semibold">Total Amount</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{(selectedAppointment.paymentAmount + selectedAppointment.servicePaymentAmount).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Receipt Button */}
                        {selectedAppointment.receiptUrl && (
                          <div className="border-t pt-4 mt-4">
                            <Button 
                              onClick={() => window.open(selectedAppointment.receiptUrl, '_blank')}
                              className="w-full"
                              variant="outline"
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              View Receipt
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
