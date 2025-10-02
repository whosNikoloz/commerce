export type OrderStatus =
    | "Pending"
    | "Paid"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Refunded";

export interface OrderItem {
    productId?: string;
    name: string;
    image?: string | null;
    price: number;          // numeric; format in UI
    quantity: number;
    sku?: string | null;
    variant?: string | null; // OPTIONAL
}

export interface TrackingStep {
    status: string;
    description?: string;   // OPTIONAL
    date: string;           // ISO
    completed: boolean;
}

export interface OrderSummary {
    id: string;             // use string everywhere
    date: string;           // ISO
    status: OrderStatus;
    items: number;
    total: number;          // numeric
}

export interface OrderDetail extends OrderSummary {
    orderItems: OrderItem[];
    shippingAddress: string;
    trackingNumber?: string | null;
    estimatedDelivery?: string | null;
    trackingSteps: TrackingStep[];
    currency: string;
}

export interface PagedResult<T> {
    page: number;
    pageSize: number;
    total: number;
    data: T[];
}

export interface WishlistItem {
    id: string;
    name: string;
    image?: string | null;
    price: number;
    currency: string;
}
