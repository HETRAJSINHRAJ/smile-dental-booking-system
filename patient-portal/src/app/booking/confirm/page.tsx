"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getService,
  getProvider,
  createAppointment,
} from "@/lib/firebase/firestore";
import { Timestamp } from "firebase/firestore";
import type { Service, Provider } from "@/types/firebase";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  Info,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/localization/useCurrency";
import { PaymentComponent } from "@/components/payment/PaymentComponent";
import {
  getPaymentConfig,
  formatPaymentBreakdown,
  getPaymentDescription,
} from "@/lib/payment/paymentConfig";
import { paymentAuditService } from "@/lib/payment/paymentAudit";

function ConfirmBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("serviceId");
  const providerId = searchParams.get("providerId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const { user, userProfile, loading: authLoading } = useAuth();
  const { formatCurrency } = useCurrency();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payment configuration
  const paymentConfig = getPaymentConfig();
  const paymentBreakdown = service
    ? formatPaymentBreakdown(service.price, paymentConfig)
    : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/booking");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!serviceId || !providerId || !date || !time) {
      router.push("/booking");
      return;
    }

    loadData();
  }, [serviceId, providerId, date, time]);

  async function loadData() {
    try {
      setLoading(true);

      const [serviceData, providerData] = await Promise.all([
        getService(serviceId!),
        getProvider(providerId!),
      ]);

      if (!serviceData || !providerData) {
        toast.error("Service or provider not found");
        router.push("/booking");
        return;
      }

      setService(serviceData);
      setProvider(providerData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    if (!agreeToPolicy) {
      toast.error("Please agree to the cancellation policy");
      return;
    }

    if (!user || !service || !provider) {
      toast.error("Missing required information");
      return;
    }

    // Show payment component for appointment reservation fee only
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    setPaymentResponse(response);
    setPaymentError(null);

    if (!user || !service || !provider || !paymentBreakdown) {
      toast.error("Missing required information");
      return;
    }

    setSubmitting(true);

    try {
      // Calculate end time
      const [hours, minutes] = time!.split(":").map(Number);
      const durationNum = service.duration;
      const endMinutes = hours * 60 + minutes + durationNum;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

      // Convert date string to timestamp
      const appointmentDate = new Date(date! + "T" + time + ":00");

      // Extract transaction ID from payment response
      const transactionId =
        response.razorpay_payment_id ||
        response.transaction_id ||
        response.paymentIntent?.id ||
        "N/A";

      // Create appointment with confirmed status (payment already processed)
      const appointmentData = {
        userId: user.uid,
        userEmail: user.email || "",
        userName: userProfile?.fullName || user.displayName || "",
        userPhone: userProfile?.phone || "",
        serviceId: service.id,
        serviceName: service.name,
        providerId: provider.id,
        providerName: provider.name,
        appointmentDate: Timestamp.fromDate(appointmentDate),
        startTime: time!,
        endTime,
        status: "confirmed" as const,
        notes,
        paymentStatus: "reservation_paid" as const,
        paymentAmount: paymentBreakdown.appointmentTotal,
        paymentTransactionId: transactionId,
        paymentType: "appointment_reservation" as const,
        paymentDate: Timestamp.now(),
        paymentMethod: response.payment_method || "online",
        servicePaymentStatus: "pending" as const,
        servicePaymentAmount: paymentBreakdown.serviceTotal,
      };

      const appointmentId = await createAppointment(appointmentData);

      // Log successful payment completion
      await paymentAuditService.logPaymentEvent({
        appointmentId,
        patientId: user.uid,
        patientName:
          userProfile?.fullName || user.displayName || "Not provided",
        patientEmail: user.email || "Not provided",
        serviceName: service.name,
        providerName: provider.name,
        paymentType: "appointment_reservation",
        action: "payment_success",
        amount: paymentBreakdown.appointmentTotal,
        currency: "INR",
        paymentMethod: response.payment_method || "online",
        transactionId: transactionId,
        gatewayResponse: response,
      });

      toast.success("Appointment confirmed successfully!");

      // Redirect to success page with appointment data
      const successUrl = new URLSearchParams({
        appointmentId,
        transactionId,
        serviceName: service.name,
        providerName: provider.name,
        date: date!,
        time: time!,
        amount: paymentBreakdown.appointmentTotal.toString(),
        reservationFee: paymentBreakdown.appointmentReservationFee.toString(),
        tax: paymentBreakdown.appointmentTax.toString(),
        paymentMethod: response.payment_method || "online",
        paymentDate: new Date().toISOString(),
        ...(!paymentConfig.enableServicePaymentOnline
          ? {
              serviceAmount: paymentBreakdown.servicePrice.toString(),
              serviceTax: paymentBreakdown.serviceTax.toString(),
              serviceTotal: paymentBreakdown.serviceTotal.toString(),
            }
          : {}),
      });

      router.push(`/booking/success?${successUrl.toString()}`);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentResponse(null);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentError(null);
    setPaymentResponse(null);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {showPayment ? "Complete Payment" : "Confirm Appointment"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {showPayment
                  ? "Secure payment processing"
                  : "Review your booking details"}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Provider</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Date & Time</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <span className="text-sm font-medium">Confirm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Appointment Details */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>

            <div className="space-y-4">
              {/* Service */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-medium">{service?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service?.duration} min •{" "}
                    {formatCurrency(service?.price || 0)}
                  </p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="font-medium">{provider?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {provider?.title}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {time ? formatTimeTo12Hour(time) : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-3">Your Information</p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {user?.displayName || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">
                    {userProfile?.phone || user?.phoneNumber || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 pt-6 border-t">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
                placeholder="Any specific concerns or requests?"
              />
            </div>
          </div>

          {/* Right Column - Policy & Payment */}
          <div className="space-y-6">
            {/* Payment Breakdown Section */}
            {!showPayment && paymentBreakdown && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Payment Information</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Reservation Fee:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        paymentBreakdown.appointmentReservationFee,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span className="font-medium">
                      {formatCurrency(paymentBreakdown.appointmentTax)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-semibold">
                    <span>Total Payable Now:</span>
                    <span className="text-primary text-lg">
                      {formatCurrency(paymentBreakdown.appointmentTotal)}
                    </span>
                  </div>

                  {!paymentConfig.enableServicePaymentOnline && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs">
                        <strong>Service Payment:</strong> The service fee of{" "}
                        {formatCurrency(paymentBreakdown.serviceTotal)} will be
                        collected at the clinic during your visit.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {!showPayment && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    Important Information
                  </h2>
                </div>

                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold flex-shrink-0">
                      •
                    </span>
                    <span>
                      Please arrive 10 minutes early to complete necessary
                      paperwork
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold flex-shrink-0">
                      •
                    </span>
                    <span>
                      Cancellations must be made at least 24 hours in advance
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold flex-shrink-0">
                      •
                    </span>
                    <span>Late cancellations or no-shows may incur a fee</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold flex-shrink-0">
                      •
                    </span>
                    <span>
                      You'll receive a confirmation email and reminder before
                      your appointment
                    </span>
                  </li>
                </ul>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      checked={agreeToPolicy}
                      onChange={(e) => setAgreeToPolicy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="agreeToPolicy" className="text-sm">
                      I understand and agree to the cancellation policy
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Component */}
            {showPayment && paymentBreakdown && (
              <div className="bg-card border rounded-lg p-6">
                <PaymentComponent
                  amount={paymentBreakdown.appointmentTotal}
                  serviceName={`${service?.name} with ${provider?.name}`}
                  customerDetails={{
                    name: user?.displayName || "Not provided",
                    email: user?.email || "",
                    phone:
                      userProfile?.phone || user?.phoneNumber || "Not provided",
                  }}
                  paymentDescription={`Appointment Reservation Fee - ${service?.name}`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />

                {/* Payment Status Messages */}
                {paymentError && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive">{paymentError}</p>
                  </div>
                )}

                {paymentResponse && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Payment successful! Processing your appointment...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!showPayment && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg font-medium border-2 border-border hover:bg-muted/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={!agreeToPolicy || submitting}
              className="px-8 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay & Confirm Booking
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Force dynamic rendering to prevent prerendering
export const dynamic = "force-dynamic";

export default function ConfirmBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmBookingContent />
    </Suspense>
  );
}
