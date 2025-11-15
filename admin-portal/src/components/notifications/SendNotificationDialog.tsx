'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationSender } from '@/hooks/useNotificationSender';
import { toast } from 'sonner';

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  appointmentId?: string;
}

export const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({
  open,
  onOpenChange,
  userId = '',
  appointmentId = '',
}) => {
  const { sendNotification, loading } = useNotificationSender();
  const [formData, setFormData] = useState({
    userId,
    title: '',
    body: '',
    type: 'general' as any,
    appointmentId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.title || !formData.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await sendNotification(formData);

    if (success) {
      toast.success('Notification sent successfully');
      onOpenChange(false);
      setFormData({
        userId: '',
        title: '',
        body: '',
        type: 'general',
        appointmentId: '',
      });
    } else {
      toast.error('Failed to send notification');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Push Notification</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID *</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type *</Label>
            <Select
              value={formData.type}
              onValueChange={value => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="appointment_confirmed">Appointment Confirmed</SelectItem>
                <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                <SelectItem value="appointment_cancelled">Appointment Cancelled</SelectItem>
                <SelectItem value="appointment_rescheduled">Appointment Rescheduled</SelectItem>
                <SelectItem value="payment_success">Payment Success</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification message"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentId">Appointment ID (Optional)</Label>
            <Input
              id="appointmentId"
              value={formData.appointmentId}
              onChange={e => setFormData({ ...formData, appointmentId: e.target.value })}
              placeholder="Link to appointment"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
