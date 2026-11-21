import { api } from "./api";

export interface CreateOrderRequest {
  items: {
    course: string;
    price?: number;
    discountPrice?: number;
  }[];
  billingAddress?: {
    fullName?: string;
    email?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
  couponCode?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: {
    course: any;
    price: number;
    discountPrice?: number;
    actualPrice: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentDetails?: any;
  billingAddress?: any;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
}

export interface PaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  paymentIntentId: string;
  paymentMethodId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data: {
    order: Order;
    enrollment?: any;
  };
}

class PaymentService {
  async createOrder(
    orderData: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  }

  async getUserOrders(page = 1, limit = 10) {
    const response = await api.get(`/api/orders?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getOrderById(orderId: string) {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: string) {
    const response = await api.patch(`/api/orders/${orderId}/cancel`);
    return response.data;
  }

  async createPaymentIntent(
    request: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    const response = await api.post("/api/payments/create-payment-intent", {
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency || "usd",
      metadata: {
        orderId: request.orderId,
      },
    });
    return response.data;
  }

  async createCheckoutSession(request: {
    orderId: string;
    lineItems: any[];
    successUrl: string;
    cancelUrl: string;
  }) {
    const response = await api.post("/api/payments/create-checkout-session", {
      lineItems: request.lineItems,
      mode: "payment",
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
      metadata: {
        orderId: request.orderId,
      },
    });
    return response.data;
  }

  async confirmPayment(
    request: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    const response = await api.post(
      `/api/orders/${request.orderId}/confirm-payment`,
      {
        paymentIntentId: request.paymentIntentId,
        paymentMethodId: request.paymentMethodId,
      }
    );
    return response.data;
  }
}

export default new PaymentService();
