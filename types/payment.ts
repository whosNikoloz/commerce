// ====================================
// Payment Provider Types
// ====================================

export type PaymentProvider = "bog" | "tbc";

// ====================================
// TBC Payment Types
// ====================================

export interface TBCPaymentAmount {
  currency: string;
  total: number;
}

export interface TBCCreatePaymentRequest {
  amount: TBCPaymentAmount;
  currency: string;
  returnUrl: string;
  extraInfo?: string;
  language: string;
  merchantPaymentId?: string;
  methods?: number[];
}

export interface TBCPaymentCreationResult {
  paymentId: string;
  redirectUrl: string;
  success: boolean;
  errorMessage?: string;
}

export interface TBCPaymentDetails {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentMethod: string;
  recurringCard?: TBCRecurringCard;
  developerMessage?: string;
  userMessage?: string;
}

export interface TBCRecurringCard {
  recurringId: string;
  cardMask: string;
  expiryDate: string;
}

export interface TBCCancelPaymentRequest {
  amount: number;
}

// ====================================
// BOG Payment Types
// ====================================

export interface BOGPaymentItem {
  product_id: string;
  quantity: number;
  amount: string;
  description: string;
}

export interface BOGPurchaseUnit {
  amount: {
    currency_code: string;
    value: string;
  };
}

export interface BOGCreatePaymentRequest {
  intent: string;
  items: BOGPaymentItem[];
  purchase_units: BOGPurchaseUnit[];
  shop_order_id: string;
  redirect_url: string;
  callback_url: string;
  locale: string;
  show_shop_order_id_on_extract: boolean;
}

export interface BOGPaymentCreationResult {
  orderId: string;
  redirectUrl: string;
  success: boolean;
  errorMessage?: string;
}

export interface BOGPaymentDetails {
  order_id: string;
  status: string;
  intent: string;
  purchase_units: BOGPurchaseUnit[];
  links?: BOGPaymentLink[];
  _links?: BOGPaymentLink[];
  shop_order_id?: string;
}

export interface BOGPaymentLink {
  href: string;
  rel: string;
  method?: string;
}

export interface BOGCancelPaymentRequest {
  orderId: string;
}

// ====================================
// SignalR Payment Hub Types
// ====================================

export interface PaymentStatusUpdate {
  status: string;
  message: string;
}

// ====================================
// Order Session Types (Backend Integration)
// ====================================

export interface OrderSessionItem {
  productId: string;
  qty: number;
  unitPrice: number;
  name?: string;
}

export interface CreateOrderSessionInput {
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  currency: "GEL";
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  cart: OrderSessionItem[];
  bank?: {
    bogOrderId?: string;
    tbcPayId?: string;
  };
}

export interface CompleteOrderInput {
  provider: PaymentProvider;
  bankId: string;
  bankStatus: string;
  bankResponse?: any;
}

export interface FailOrderInput {
  provider: PaymentProvider;
  bankId: string;
  reason: string;
  bankResponse?: any;
}

// ====================================
// Legacy Payment Types (for existing checkout)
// ====================================

export interface CreateOrderItem {
  productId: string;
  qty: number;
  unitPrice: number;
  name?: string;
}

export interface CreateOrderPayload {
  orderId: string;
  currency: "GEL";
  amount: number;
  items: CreateOrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    line1: string;
    city: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  billingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}
