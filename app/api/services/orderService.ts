import type { ApiEnvelope } from "./authService";

import { jwtDecode } from "jwt-decode";

import { apiFetch } from "../client/fetcher";

import { OrderDetail, OrderSummary, PagedResult, TrackingStep, WishlistItem } from "@/types/orderTypes";

const SHOP_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Shop/";
const ORDER_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Order/";
const WISHLIST_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Wishlist/";

function getUserIdFromToken(): string {
  if (typeof window === "undefined") throw new Error("Not authenticated");

  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) throw new Error("Not authenticated");

  try {
    const decoded = jwtDecode<{ id: string }>(accessToken);

    return decoded.id;
  } catch {
    throw new Error("Invalid token");
  }
}

// Helper to convert C# model property names (PascalCase) to TypeScript (camelCase)
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);

      result[camelKey] = toCamelCase(obj[key]);
    }
  }

  return result;
}


export interface CreateOrderPayload {
    orderItems: {
        productId: string
        quantity: number
        variant?: string
    }[]
    shippingAddress: string
    shippingCity?: string
    shippingState?: string
    shippingZipCode?: string
    shippingCountry?: string
    customerNotes?: string
    currency?: string
}

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


export async function getMyOrders(page = 1, pageSize = 10): Promise<PagedResult<OrderSummary>> {

    const userId = getUserIdFromToken();
    const url = `${ORDER_BASE}get-user-orders?userId=${encodeURIComponent(userId)}&page=${page}&pageSize=${pageSize}`;

    const res = await apiFetch<any>(url, {
        method: "GET",
    } as any);

    // Convert PascalCase from C# to camelCase for TypeScript
    return toCamelCase(res) as PagedResult<OrderSummary>;
}

export async function getOrderById(id: string): Promise<OrderDetail> {

    const userId = getUserIdFromToken();
    const url = `${ORDER_BASE}get-order-by-${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`;

    const res = await apiFetch<any>(url, { method: "GET" } as any);

    // Convert PascalCase from C# to camelCase for TypeScript
    return toCamelCase(res) as OrderDetail;
}

export async function getTracking(trackingNumber: string): Promise<TrackingStep[]> {
    // Note: This endpoint might not exist in your backend yet
    // You may need to implement it or adjust the tracking retrieval logic
    const url = `${ORDER_BASE}track/${encodeURIComponent(trackingNumber)}`;
    const res = await apiFetch<ApiEnvelope<{ steps: TrackingStep[] }>>(url, { method: "GET" } as any);

    if (res.successful && res.response) return res.response.steps ?? [];
    throw new Error(res.error || "Failed to load tracking");
}

export async function cancelOrder(orderId: string): Promise<void> {
    const userId = getUserIdFromToken();
    const url = `${ORDER_BASE}cancel-order-${encodeURIComponent(orderId)}?userId=${encodeURIComponent(userId)}`;

    await apiFetch<{ message: string }>(url, { method: "POST" } as any);
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


export async function getWishlist(): Promise<WishlistItem[]> {

    const userId = getUserIdFromToken();
    const url = `${WISHLIST_BASE}get-wishlist?userId=${encodeURIComponent(userId)}`;

    const res = await apiFetch<any>(url, { method: "GET" } as any);

    // Convert PascalCase from C# to camelCase for TypeScript
    return toCamelCase(res) as WishlistItem[];
}

export async function addToWishlist(productId: string): Promise<void> {
    const userId = getUserIdFromToken();
    const url = `${WISHLIST_BASE}add-to-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

    await apiFetch<{ message: string }>(url, { method: "POST" } as any);
}

export async function removeFromWishlist(productId: string): Promise<void> {
    const userId = getUserIdFromToken();
    const url = `${WISHLIST_BASE}remove-from-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

    await apiFetch<{ message: string }>(url, { method: "DELETE" } as any);
}

export async function isInWishlist(productId: string): Promise<boolean> {
    const userId = getUserIdFromToken();
    const url = `${WISHLIST_BASE}is-in-wishlist-${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`;

    const res = await apiFetch<{ inWishlist: boolean }>(url, { method: "GET" } as any);

    return res.inWishlist;
}

export async function clearWishlist(): Promise<void> {
    const userId = getUserIdFromToken();
    const url = `${WISHLIST_BASE}clear-wishlist?userId=${encodeURIComponent(userId)}`;

    await apiFetch<{ message: string }>(url, { method: "DELETE" } as any);
}