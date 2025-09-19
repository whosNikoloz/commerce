import { OrderDetail, OrderSummary, PagedResult, TrackingStep, WishlistItem } from "@/types/orderTypes";
import { apiFetch } from "../client/fetcher";
import type { ApiEnvelope } from "./authService";

const SHOP_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Shop/";
const ORDER_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Order/";
const ACCOUNT_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Account/";

export async function getMyOrders(page = 1, pageSize = 10) {
    const url = `${ORDER_BASE}my?page=${page}&pageSize=${pageSize}`;
    const res = await apiFetch<ApiEnvelope<PagedResult<OrderSummary>>>(url, {
        method: "GET",
    } as any);
    if (res.successful && res.response) return res.response;
    throw new Error(res.error || "Failed to load orders");
}

export async function getOrderById(id: string) {
    const url = `${ORDER_BASE}${encodeURIComponent(id)}`;
    const res = await apiFetch<ApiEnvelope<OrderDetail>>(url, { method: "GET" } as any);
    if (res.successful && res.response) return res.response;
    throw new Error(res.error || "Failed to load order");
}

export async function getTracking(trackingNumber: string) {
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


export async function getWishlist() {
    const url = `${ACCOUNT_BASE}wishlist`;
    const res = await apiFetch<ApiEnvelope<{ items: WishlistItem[] }>>(url, { method: "GET" } as any);
    if (res.successful && res.response) return res.response.items;
    throw new Error(res.error || "Failed to load wishlist");
}