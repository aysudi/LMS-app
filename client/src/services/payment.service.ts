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
    course: string | Record<string, unknown>;
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
  paymentDetails?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
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
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  paymentIntentId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data: {
    order: Order;
    enrollment?: unknown;
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
      orderId: request.orderId,
    });
    return response.data;
  }

  async createCheckoutSession(request: {
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const response = await api.post("/api/payments/create-checkout-session", {
      orderId: request.orderId,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
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
      }
    );
    return response.data;
  }
}

export default new PaymentService();
