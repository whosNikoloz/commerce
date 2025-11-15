import { apiFetch } from "../client/fetcher";

import { CustomerModel, UpdateCustomerDto } from "@/types/customer";
import { PagedList } from "@/types/pagination";
import { OrderSummary, PagedResult } from "@/types/orderTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "api/Customer";
const ORDER_BASE = process.env.NEXT_PUBLIC_API_URL + "Order/";

export async function getAllCustomers(
  page: number = 1,
  pageSize: number = 10
): Promise<PagedList<CustomerModel>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  return apiFetch<PagedList<CustomerModel>>(
    `${API_BASE}?${params.toString()}`
  );
}

export async function getCustomerById(id: string): Promise<CustomerModel> {
  return apiFetch<CustomerModel>(`${API_BASE}/${id}`);
}

export async function updateCustomer(
  data: UpdateCustomerDto
): Promise<CustomerModel> {
  return apiFetch<CustomerModel>(`${API_BASE}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

// Helper to convert to camelCase
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

export async function getCustomerOrders(
  customerId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<OrderSummary>> {
  const url = `${ORDER_BASE}get-user-orders?userId=${encodeURIComponent(customerId)}&page=${page}&pageSize=${pageSize}`;

  const res = await apiFetch<any>(url, {
    method: "GET",
    requireAuth: true,
    failIfUnauthenticated: true,
  });

  return toCamelCase(res) as PagedResult<OrderSummary>;
}
