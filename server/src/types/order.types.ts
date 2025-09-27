import { Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
}

export interface OrderItem {
  course: Types.ObjectId | string;
  price: number;
  discountPrice?: number;
  actualPrice: number;
}

export interface PaymentDetails {
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  last4?: string;
  cardBrand?:
    | "visa"
    | "mastercard"
    | "amex"
    | "discover"
    | "diners"
    | "jcb"
    | "unionpay"
    | "unknown";
  transactionId: string;
  receiptUrl?: string;
  refundId?: string;
}

export interface BillingAddress {
  fullName?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

export interface OrderMetadata {
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId | string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentDetails?: PaymentDetails;
  billingAddress?: BillingAddress;
  couponCode?: string;
  notes?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  failureReason?: string;
  metadata?: OrderMetadata;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  itemsCount: number;

  // Methods
  canBeCancelled(): boolean;
  canBeRefunded(): boolean;
}

// Request/Response types for API
export interface CreateOrderRequest {
  items: Array<{
    course: string;
    price: number;
    discountPrice?: number;
  }>;
  billingAddress?: BillingAddress;
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data?: {
    order: IOrder;
    clientSecret?: string; // For Stripe payment
  };
  message?: string;
}

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethodId: string;
  billingAddress: BillingAddress;
}

export interface ProcessPaymentResponse {
  success: boolean;
  data?: {
    order: IOrder;
    requiresAction?: boolean;
    clientSecret?: string;
  };
  message?: string;
}

export interface OrderListResponse {
  success: boolean;
  data?: {
    orders: IOrder[];
    total: number;
    page: number;
    totalPages: number;
  };
  message?: string;
}

export interface OrderDetailsResponse {
  success: boolean;
  data?: IOrder;
  message?: string;
}

export interface RefundOrderRequest {
  orderId: string;
  amount?: number; // If not provided, full refund
  reason?: string;
}

export interface RefundOrderResponse {
  success: boolean;
  data?: {
    order: IOrder;
    refundId: string;
    refundAmount: number;
  };
  message?: string;
}

// Stripe webhook types
export interface StripeWebhookEvent {
  id: string;
  object: "event";
  type: string;
  data: {
    object: any;
  };
}

export interface PaymentIntentSucceeded {
  id: string;
  amount: number;
  currency: string;
  metadata: {
    orderId: string;
    userId: string;
  };
  charges: {
    data: Array<{
      id: string;
      receipt_url: string;
      payment_method_details: {
        card: {
          last4: string;
          brand: string;
        };
      };
    }>;
  };
}
