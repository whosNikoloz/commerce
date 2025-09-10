export type PaymentProvider = "bog" | "tbc";

export type CreateOrderItem = {
  productId: string;
  qty: number;
  unitPrice: number; // GEL
  name?: string; // optional, used for BOG description
};

export type CreateOrderPayload = {
  orderId: string; // your internal id/uuid
  currency: "GEL";
  amount: number; // total (2 decimals)
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
};
