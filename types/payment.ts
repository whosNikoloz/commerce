// ====================================
// Payment Type Enum
// ====================================

export enum PaymentType {
  TBC = 10,           // TBC Bank - Standard
  BOG = 11,           // Bank of Georgia - Standard
  TBCSplitPay = 12,   // TBC Split Pay
  BOGInstallment = 21, // Bank of Georgia - Installment
  Flitt = 13,         // Flitt Payment
  FlittInstallment = 20, // Flitt Installment (TBC)
}

// ====================================
// Create Order Request Types
// ====================================

export interface OrderItemModel {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface CreateOrderRequest {
  // Order Items
  orderItems: OrderItemModel[];

  // Shipping Information
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;

  // Order Details
  customerNotes?: string;
  currency: "GEL" | "USD" | "EUR";

  // Payment Configuration
  paymentReturnUrl: string;
  paymentType: PaymentType;

  // Buyer Information (Optional - for BOG/Flitt)
  buyerFullName?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  // Delivery (Optional - for BOG)
  deliveryAmount?: number;

  // Payment Options (Optional)
  applicationTypes?: "web" | "mobile";
  paymentMethods?: ("card")[];
  paymentTimeoutMinutes?: number;
  captureType?: "automatic" | "manual";

  // Campaign/Discount Options (Optional - for BOG)
  loanType?: string;
  loanMonths?: number;
  campaignCardType?: string;
  campaignType?: string;
  accountTag?: string;

  // Wallet Tokens (Optional)
  googlePayToken?: string;
  enableExternalGooglePay?: boolean;
  enableExternalApplePay?: boolean;
}

// ====================================
// Order Response Types
// ====================================

export interface OrderItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  quantity: number;

  // Payment Information
  paymentId: string;
  paymentRedirectUrl: string;
  paymentSuccess: boolean;
  paymentErrorMessage?: string;

  // Order Items
  orderItems: OrderItemResponse[];
}

// ====================================
// Order Status Enum
// ====================================

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Paid = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Refunded = 6,
}

// ====================================
// Payment Status Types (from Gateway)
// ====================================

// BOG Payment Statuses
export type BOGPaymentStatus =
  | "created"
  | "processing"
  | "completed"
  | "rejected"
  | "expired"
  | "refunded"
  | "refunded_partially"
  | "blocked";

// Flitt Payment Statuses
export type FlittPaymentStatus =
  | "created"
  | "processing"
  | "approved"
  | "declined"
  | "expired";

// ====================================
// SignalR Payment Hub Types
// ====================================

export interface PaymentStatusUpdate {
  status: string;
  message: string;
  paymentId: string;
  success: boolean;
}

// ====================================
// Payment Return URL Parameters
// ====================================

export interface PaymentReturnParams {
  status: "success" | "failed";
  orderId?: string;
  paymentId?: string;
  error?: string;
}

// ====================================
// Error Response Types
// ====================================

export interface PaymentErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ====================================
// Payment Provider Info (for UI)
// ====================================

export interface PaymentProviderOption {
  type: PaymentType;
  name: string;
  description: string;
  icon?: string;
  isInstallment?: boolean;
}

export const PAYMENT_PROVIDERS: PaymentProviderOption[] = [
  {
    type: PaymentType.TBC,
    name: "TBC Bank",
    description: "Pay with card via TBC",
    isInstallment: false,
  },
  {
    type: PaymentType.BOG,
    name: "Bank of Georgia",
    description: "Pay with card via BOG",
    isInstallment: false,
  },
  {
    type: PaymentType.BOGInstallment,
    name: "BOG Installment",
    description: "Pay in installments via BOG",
    isInstallment: true,
  },
  {
    type: PaymentType.Flitt,
    name: "Flitt",
    description: "Pay with Flitt",
    isInstallment: false,
  },
  {
    type: PaymentType.FlittInstallment,
    name: "Flitt Installment",
    description: "Pay in installments via Flitt (TBC)",
    isInstallment: true,
  },
];
