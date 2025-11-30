"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppointment } from "@/lib/firebase/firestore";
import type { Appointment } from "@/types/shared";
import {
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  Home,
  Loader2,
  FileText,
  Clock,
  User,
  Stethoscope,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReceiptDocument } from "@/components/payment/PaymentReceiptPDF";
import { analyticsService } from "@/lib/analytics/analyticsService";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");
  const reservationFee = searchParams.get("reservationFee");
  const tax = searchParams.get("tax");

  const loadAppointment = React.useCallback(async () => {
    try {
      const data = await getAppointment(appointmentId!);
      if (!data) {
        toast.error("Appointment not found");
        router.push("/booking");
        return;
      }
      setAppointment(data);
      
      // Track booking completed event
      analyticsService.trackBookingCompleted(
        appointmentId!,
        data.serviceId,
        data.providerId,
        data.paymentAmount
      );
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast.error("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, router]);

  useEffect(() => {
    if (!appointmentId) {
      router.push("/booking");
      return;
    }

    loadAppointment();
  }, [appointmentId, router, loadAppointment]);

  const handleAddToCalendar = () => {
    if (!appointment) return;

    const appointmentDate = appointment.appointmentDate.toDate();
    const startDateTime = new Date(
      `${appointmentDate.toISOString().split("T")[0]}T${appointment.startTime}`,
    );
    const endDateTime = new Date(
      `${appointmentDate.toISOString().split("T")[0]}T${appointment.endTime}`,
    );

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:Dental Appointment - ${appointment.serviceName}
DESCRIPTION:Appointment with ${appointment.providerName} at Smile Dental Practice
LOCATION:Smile Dental Practice
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dental-appointment.ics";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar event downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find your appointment details.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = appointment.appointmentDate
    .toDate()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const confirmationNumber =
    appointment.confirmationNumber ||
    appointmentId!.substring(0, 8).toUpperCase();

  const appointmentData = appointment
    ? {
        id: appointmentId || "",
        serviceName: appointment.serviceName || "",
        providerName: appointment.providerName || "",
        date: appointment.appointmentDate?.toDate().toISOString() || "",
        time: `${appointment.startTime} - ${appointment.endTime}`,
        patientName: appointment.userName || "",
        patientEmail: appointment.userEmail || "",
        patientPhone: appointment.userPhone || "",
      }
    : null;

  const paymentData =
    transactionId && amount
      ? {
          transactionId: transactionId || "N/A",
          amount: parseFloat(reservationFee || "0"),
          taxAmount: parseFloat(tax || "0"),
          totalAmount: parseFloat(amount || "0"),
          paymentMethod: "online",
          paymentDate: new Date().toISOString(),
          paymentDescription: "Appointment Reservation Fee",
        }
      : null;

  const servicePaymentInfo = appointment?.servicePaymentAmount
    ? {
        serviceAmount: appointment.servicePaymentAmount / 1.18,
        serviceTax: (appointment.servicePaymentAmount * 0.18) / 1.18,
        serviceTotal: appointment.servicePaymentAmount,
        paymentDue: "At the clinic during your visit",
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed</h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully scheduled
          </p>
        </div>

        {/* Main Content - 2 Column Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Appointment Details */}
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Appointment Details
              </h2>

              {/* Confirmation Number */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Confirmation Number
                </p>
                <p className="text-2xl font-mono font-bold tracking-wide">
                  {confirmationNumber}
                </p>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{appointment.serviceName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{appointment.providerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t space-y-3">
              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Add to Calendar
              </button>

              {appointmentData && paymentData ? (
                <PDFDownloadLink
                  document={
                    <ReceiptDocument
                      appointmentData={appointmentData}
                      paymentData={paymentData}
                      servicePaymentInfo={servicePaymentInfo}
                    />
                  }
                  fileName={`receipt-${transactionId || "appointment"}.pdf`}
                  className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary px-4 py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  {({ loading }) => (
                    <>
                      <FileText className="w-4 h-4" />
                      {loading ? "Preparing..." : "Download Receipt"}
                    </>
                  )}
                </PDFDownloadLink>
              ) : null}
            </div>
          </div>

          {/* Right Column - Important Information & Contact */}
          <div className="space-y-6">
            {/* Important Information */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Important Information
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-green-600 dark:text-green-500 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span>
                    A confirmation email has been sent to{" "}
                    <span className="font-medium">{appointment.userEmail}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 dark:text-green-500 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span>
                    Please arrive 10 minutes early to complete necessary
                    paperwork
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 dark:text-green-500 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span>Bring your insurance card and a valid ID</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 dark:text-green-500 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span>
                    You'll receive a reminder 24 hours before your appointment
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Need to Make Changes?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                To cancel or reschedule, please contact us at least 24 hours in
                advance
              </p>
              <div className="space-y-3">
                <a
                  href="tel:+15551234567"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call Us</p>
                    <p className="font-medium">(555) 123-4567</p>
                  </div>
                </a>

                <a
                  href="mailto:info@smiledental.com"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Us</p>
                    <p className="font-medium">info@smiledental.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium border-2 border-border hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/booking"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
