"use client";

import { useState } from 'react';
import { CalendarPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CreateAppointmentDialog from '@/components/appointments/CreateAppointmentDialog';
import { useRouter } from 'next/navigation';

export default function CreateAppointmentPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const router = useRouter();

  const handleDialogClose = () => {
    setDialogOpen(false);
    router.push('/appointments');
  };

  const handleAppointmentCreated = () => {
    // Redirect to appointments page after successful creation
    router.push('/appointments');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/appointments')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarPlus className="h-8 w-8 text-primary" />
              Create New Appointment
            </h1>
            <p className="text-muted-foreground mt-2">
              Schedule a new appointment for a patient
            </p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Follow these steps to create a new appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium">Select Patient</h3>
                <p className="text-sm text-muted-foreground">Search and choose the patient</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium">Choose Service</h3>
                <p className="text-sm text-muted-foreground">Select the required service</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium">Pick Provider</h3>
                <p className="text-sm text-muted-foreground">Assign a healthcare provider</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium">Schedule Time</h3>
                <p className="text-sm text-muted-foreground">Choose date and time slot</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Fallback content if dialog is closed */}
      {!dialogOpen && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Create New Appointment</h3>
            <p className="text-muted-foreground text-center mb-4">
              Click the button below to open the appointment creation dialog
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}