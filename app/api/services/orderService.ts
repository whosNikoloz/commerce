import type { ApiEnvelope } from "./authService";

import { apiFetch } from "../client/fetcher";

import { OrderDetail, OrderSummary, PagedResult, TrackingStep, UpdateOrderStatusModel, WishlistItem, OrderStatus } from "@/types/orderTypes";
import { CreateOrderRequest, CreateOrderResponse, PaymentType } from "@/types/payment";

const ORDER_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Order/";
const WISHLIST_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Wishlist/";

async function getUserIdFromToken(): Promise<string> {
  const res = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Not authenticated");

  const { user } = await res.json();

  if (!user?.id) throw new Error("Not authenticated");

  return user.id;
}

// Helper to convert OrderStatus string from C# to enum number
function convertOrderStatus(status: string | number): OrderStatus {
  if (typeof status === 'number') return status as OrderStatus;

  // Map string names to enum values
  const statusMap: Record<string, OrderStatus> = {
    'Pending': OrderStatus.Pending,
    'Paid': OrderStatus.Paid,
    'Processing': OrderStatus.Processing,
    'Shipped': OrderStatus.Shipped,
    'Delivered': OrderStatus.Delivered,
    'Cancelled': OrderStatus.Cancelled,
    'Refunded': OrderStatus.Refunded,
  };

  return statusMap[status] ?? OrderStatus.Pending;
}

function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      let value = toCamelCase(obj[key]);

      // Convert status field to enum number
      if (camelKey === 'status' && typeof value === 'string') {
        value = convertOrderStatus(value);
      }

      result[camelKey] = value;
    }
  }

  return result;
}

// ====================================
// Create Order with Payment
// ====================================

export interface CreateOrderWithPaymentParams {
  orderItems: { productId: string; quantity: number; variant?: string }[];
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  customerNotes?: string;
  currency?: "GEL" | "USD" | "EUR";
  paymentType: PaymentType;
  paymentReturnUrl: string;
  // Buyer info
  buyerFullName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  // Delivery
  deliveryAmount?: number;
  // Payment options
  applicationTypes?: "web" | "mobile";
  paymentMethods?: ("card")[];
  paymentTimeoutMinutes?: number;
}

/**
 * Create an order with payment - unified endpoint that creates order and initiates payment
 * Returns order details with paymentRedirectUrl to redirect user to payment gateway
 */
export async function createOrderWithPayment(
  params: CreateOrderWithPaymentParams
): Promise<CreateOrderResponse> {
  const url = `${ORDER_BASE}create-order`;

  const requestPayload: CreateOrderRequest = {
    orderItems: params.orderItems,
    shippingAddress: params.shippingAddress,
    shippingCity: params.shippingCity,
    shippingState: params.shippingState,
    shippingZipCode: params.shippingZipCode,
    shippingCountry: params.shippingCountry,
    customerNotes: params.customerNotes,
    currency: params.currency || "GEL",
    paymentType: params.paymentType,
    paymentReturnUrl: params.paymentReturnUrl,
    buyerFullName: params.buyerFullName,
    buyerEmail: params.buyerEmail,
    buyerPhone: params.buyerPhone,
    deliveryAmount: params.deliveryAmount,
    applicationTypes: params.applicationTypes || "web",
    paymentMethods: params.paymentMethods,
    paymentTimeoutMinutes: params.paymentTimeoutMinutes,
  };

  const res = await apiFetch<CreateOrderResponse>(url, {
    method: "POST",
    body: JSON.stringify(requestPayload),
    requireAuth: true,
    failIfUnauthenticated: true,
  } as any);

  // Check if payment was successful
  if (!res.paymentSuccess) {
    throw new Error(res.paymentErrorMessage || "Payment initiation failed");
  }

  return res;
}

// ====================================
// Legacy createOrder (keeping for backward compatibility)
// ====================================

export interface CreateOrderPayload {
  orderItems: {
    productId: string;
    quantity: number;
    variant?: string;
  }[];
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  customerNotes?: string;
  currency?: string;
  paymentReturnUrl?: string;
}

/** @deprecated Use createOrderWithPayment instead */
export async function createOrder(
  payload: CreateOrderPayload,
  userId: string
) {
  const url = `${ORDER_BASE}create-order?userId=${encodeURIComponent(userId)}`;

  const requestPayload = {
    ...payload,
    currency: payload.currency || "GEL",
  };

  const res = await apiFetch<ApiEnvelope<OrderDetail>>(url, {
    method: "POST",
    body: JSON.stringify(requestPayload),
  } as any);

  if (res.successful && res.response) return res.response;

  throw new Error(res.error || "Failed to create order");
}

// ====================================
// Order Retrieval
// ====================================

export async function getMyOrders(page = 1, pageSize = 10): Promise<PagedResult<OrderSummary>> {
  const userId = await getUserIdFromToken();
  const url = `${ORDER_BASE}get-user-orders?userId=${encodeURIComponent(userId)}&page=${page}&pageSize=${pageSize}`;

  const res = await apiFetch<any>(url, {
    method: "GET",
  } as any);

  return toCamelCase(res) as PagedResult<OrderSummary>;
}

export async function getOrderByIdForClient(id: string): Promise<OrderDetail> {
  const userId = await getUserIdFromToken();
  const url = `${ORDER_BASE}get-order-by-${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`;

  const res = await apiFetch<any>(url, { method: "GET", requireAuth: false, failIfUnauthenticated: false } as any);

  return toCamelCase(res) as OrderDetail;
}

export async function getOrderByIdForAdmin(id: string): Promise<OrderDetail> {
  const url = `${ORDER_BASE}get-order-by-${encodeURIComponent(id)}`;

  const res = await apiFetch<any>(url, { method: "GET", requireAuth: true, failIfUnauthenticated: true } as any);

  return toCamelCase(res) as OrderDetail;
}

export async function getTracking(trackingNumber: string): Promise<TrackingStep[]> {
  const url = `${ORDER_BASE}track/${encodeURIComponent(trackingNumber)}`;
  const res = await apiFetch<ApiEnvelope<{ steps: TrackingStep[] }>>(url, { method: "GET" } as any);

  if (res.successful && res.response) return res.response.steps ?? [];
  throw new Error(res.error || "Failed to load tracking");
}

export async function downloadInvoiceFile(id: string) {
  const url = `${ORDER_BASE}${encodeURIComponent(id)}/invoice`;
  const r = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {},
  });

  if (!r.ok) throw new Error(`Invoice error ${r.status}`);
  const blob = await r.blob();
  const fname = (r.headers.get("Content-Disposition") ?? "").match(/filename="?([^"]+)"?/)?.[1] || `invoice-${id}.pdf`;
  const blobUrl = URL.createObjectURL(blob);

  return { blobUrl, fileName: fname };
}

// ====================================
// Order Management
// ====================================

export async function updateOrderStatus(statusModel: UpdateOrderStatusModel): Promise<void> {
  const url = `${ORDER_BASE}update-order-status`;

  const payload = {
    OrderId: statusModel.orderId,
    Status: statusModel.status,
    Description: statusModel.description || null,
    TrackingNumber: statusModel.trackingNumber || null,
    EstimatedDelivery: statusModel.estimatedDelivery || null
  };

  await apiFetch<{ message: string }>(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    requireAuth: true,
    failIfUnauthenticated: true
  } as any);
}

export async function getAllOrders(page = 1, pageSize = 10): Promise<PagedResult<OrderSummary>> {
  const url = `${ORDER_BASE}get-all-orders?page=${page}&pageSize=${pageSize}`;
  const res = await apiFetch<any>(url, {
    method: "GET",
    requireAuth: true,
  } as any);

  return toCamelCase(res) as PagedResult<OrderSummary>;
}

export async function cancelOrder(
  id: string,
  userId: string,
  reason: string
): Promise<{ message: string }> {
  const url =
    `${ORDER_BASE}cancel-order-${encodeURIComponent(id)}` +
    `?userId=${encodeURIComponent(userId)}&reason=${encodeURIComponent(reason)}`;

  try {
    const res = await apiFetch<any>(url, { method: "POST", requireAuth: true, failIfUnauthenticated: true } as any);

    return toCamelCase(res) as { message: string };
  } catch (err: any) {
    const msg =
      err?.message ||
      err?.response?.message ||
      "Failed to cancel order. Please try again.";

    throw new Error(msg);
  }
}

// ====================================
// Wishlist Functions
// ====================================

export async function getWishlist(): Promise<WishlistItem[]> {
  const userId = await getUserIdFromToken();
  const url = `${WISHLIST_BASE}get-wishlist?userId=${encodeURIComponent(userId)}`;

  const res = await apiFetch<any>(url, { method: "GET" } as any);

  return toCamelCase(res) as WishlistItem[];
}

export async function addToWishlist(productId: string): Promise<void> {
  const userId = await getUserIdFromToken();
  const url = `${WISHLIST_BASE}add-to-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

  await apiFetch<{ message: string }>(url, { method: "POST" } as any);
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const userId = await getUserIdFromToken();
  const url = `${WISHLIST_BASE}remove-from-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

  await apiFetch<{ message: string }>(url, { method: "DELETE" } as any);
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const userId = await getUserIdFromToken();
  const url = `${WISHLIST_BASE}is-in-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

  const res = await apiFetch<{ inWishlist: boolean }>(url, { method: "GET" } as any);

  return res.inWishlist;
}

export async function clearWishlist(): Promise<void> {
  const userId = await getUserIdFromToken();
  const url = `${WISHLIST_BASE}clear-wishlist?userId=${encodeURIComponent(userId)}`;

  await apiFetch<{ message: string }>(url, { method: "DELETE" } as any);
}
