declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature?: string;
  }

  interface RazorpayError {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
    message?: string;
  }

  class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<RazorpayResponse>;
  }

  export default RazorpayCheckout;
}