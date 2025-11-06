"use client";

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePatientDialog from './CreatePatientDialog';

interface QuickCreatePatientButtonProps {
  onPatientCreated?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function QuickCreatePatientButton({ 
  onPatientCreated, 
  variant = 'default',
  size = 'default',
  className = ''
}: QuickCreatePatientButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <UserPlus className="h-4 w-4" />
        New Patient
      </Button>

      <CreatePatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPatientCreated={onPatientCreated}
      />
    </>
  );
}
