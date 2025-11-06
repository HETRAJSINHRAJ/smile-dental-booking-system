"use client";

import { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CreatePatientDialog from '@/components/patients/CreatePatientDialog';
import { useRouter } from 'next/navigation';

export default function CreatePatientPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const router = useRouter();

  const handleDialogClose = () => {
    setDialogOpen(false);
    router.push('/patients');
  };

  const handlePatientCreated = () => {
    // Redirect to patients page after successful creation
    router.push('/patients');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/patients')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-primary" />
              Create New Patient
            </h1>
            <p className="text-muted-foreground mt-2">
              Register a new patient profile for walk-in appointments
            </p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Registration Guide</CardTitle>
          <CardDescription>
            Follow these steps to create a comprehensive patient profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium">Personal Info</h3>
                <p className="text-sm text-muted-foreground">Basic patient details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium">Address & Insurance</h3>
                <p className="text-sm text-muted-foreground">Contact and insurance info</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium">Emergency Contact</h3>
                <p className="text-sm text-muted-foreground">Emergency contact details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium">Medical History</h3>
                <p className="text-sm text-muted-foreground">Allergies and conditions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Patient Dialog */}
      <CreatePatientDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onPatientCreated={handlePatientCreated}
      />

      {/* Fallback content if dialog is closed */}
      {!dialogOpen && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Create New Patient</h3>
            <p className="text-muted-foreground text-center mb-4">
              Click the button below to open the patient registration form
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Patient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
