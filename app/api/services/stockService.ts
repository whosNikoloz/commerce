import { apiFetch } from "../client/fetcher";
import {
  ProductStock,
  ProductSales,
  UpdateStockRequest,
  AddStockRequest,
  RemoveStockRequest,
} from "@/types/stock";

const STOCK_API_BASE = process.env.NEXT_PUBLIC_API_URL + "Stock";

/**
 * Get stock information for a specific product
 */
export async function getProductStock(productId: string): Promise<ProductStock> {
  return apiFetch<ProductStock>(`${STOCK_API_BASE}/product/${productId}`);
}

/**
 * Get all product stocks
 */
export async function getAllStocks(): Promise<ProductStock[]> {
  return apiFetch<ProductStock[]>(`${STOCK_API_BASE}/all`);
}

/**
 * Get products with low stock (below threshold)
 * @param threshold - Stock level threshold (default: 10)
 */
export async function getLowStockProducts(threshold: number = 10): Promise<ProductStock[]> {
  return apiFetch<ProductStock[]>(`${STOCK_API_BASE}/low-stock?threshold=${threshold}`);
}

/**
 * Update stock quantity for a product (Admin/Moderator only)
 */
export async function updateStock(data: UpdateStockRequest): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/update`, {
    method: "PUT",
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

/**
 * Add to existing stock quantity (Admin/Moderator only)
 */
export async function addStock(data: AddStockRequest): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/add`, {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

/**
 * Remove from existing stock quantity (Admin/Moderator only)
 */
export async function removeStock(data: RemoveStockRequest): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/remove`, {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

/**
 * Get sales statistics for a specific product
 */
export async function getProductSales(productId: string): Promise<ProductSales> {
  return apiFetch<ProductSales>(`${STOCK_API_BASE}/sales/${productId}`);
}

/**
 * Get top selling products
 * @param count - Number of products to return (default: 10)
 */
export async function getTopSellingProducts(count: number = 10): Promise<ProductSales[]> {
  return apiFetch<ProductSales[]>(`${STOCK_API_BASE}/top-selling?count=${count}`);
}
