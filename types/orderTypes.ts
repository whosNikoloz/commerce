// Enum matching DomainLayer.Common.Enums.OrderStatus from C# backend
export enum OrderStatus {
    Pending = 0,      // Order created, awaiting payment
    Paid = 1,         // Payment successful
    Processing = 2,   // Order being prepared/packaged
    Shipped = 3,      // Order shipped to customer
    Delivered = 4,    // Order delivered successfully
    Cancelled = 5,    // Order cancelled by customer/admin
    Refunded = 6      // Payment refunded to customer
}

export interface OrderItem {
    id: string;             // OrderItem ID (Guid from backend)
    productId?: string | null;  // Product ID (Guid from backend)
    name: string;
    image?: string | null;
    price: number;          // numeric; format in UI
    quantity: number;
    sku?: string | null;
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

export interface UserModel {
    id : string;
    firstName : string;
    lastName : string;
    userName : string;
    phoneNumber : string;
    email : string;
}

export interface OrderDetail extends OrderSummary {
    orderItems: OrderItem[];
    shippingAddress: string;
    trackingNumber?: string | null;
    estimatedDelivery?: string | null;
    trackingSteps: TrackingStep[];
    user : UserModel;
    currency: string;
}

export interface PagedResult<T> {
    page: number;
    pageSize: number;
    total: number;
    data: T[];
}

export interface WishlistItem {
    id: string;              // ProductId from backend
    productId?: string;      // Alias for id (for compatibility)
    name: string;
    image?: string | null;
    price: number;
    currency: string;
}


export interface UpdateOrderStatusModel {
    orderId: string;
    status: OrderStatus;
    description?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
}