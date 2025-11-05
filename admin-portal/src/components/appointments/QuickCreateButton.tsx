"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateAppointmentDialog from './CreateAppointmentDialog';

interface QuickCreateButtonProps {
  onAppointmentCreated?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function QuickCreateButton({ 
  onAppointmentCreated, 
  variant = 'default',
  size = 'default',
  className = ''
}: QuickCreateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Plus className="h-4 w-4" />
        New Appointment
      </Button>

      <CreateAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAppointmentCreated={onAppointmentCreated}
      />
    </>
  );
}