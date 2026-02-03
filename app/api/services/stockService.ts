import { apiFetch } from "../client/fetcher";

import { ProductStock, ProductSales, RecordSaleRequest } from "@/types/stock";

const STOCK_API_BASE = process.env.NEXT_PUBLIC_API_URL + "Stock";

/**
 * Get stock information for a specific product
 */
export async function getProductStock(productId: string): Promise<ProductStock> {
  return apiFetch<ProductStock>(`${STOCK_API_BASE}/get-stock/${productId}`);
}

/**
 * Get all product stocks
 */
export async function getAllStocks(): Promise<ProductStock[]> {
  return apiFetch<ProductStock[]>(`${STOCK_API_BASE}/get-all-stocks`);
}

/**
 * Get products with low stock (below threshold)
 * @param threshold - Stock level threshold (default: 10)
 */
export async function getLowStockProducts(
  threshold: number = 10
): Promise<ProductStock[]> {
  return apiFetch<ProductStock[]>(`${STOCK_API_BASE}/low-stock/${threshold}`);
}

/**
 * Get products that are out of stock
 */
export async function getOutOfStockProducts(): Promise<ProductStock[]> {
  return apiFetch<ProductStock[]>(`${STOCK_API_BASE}/out-of-stock`);
}

/**
 * Update stock quantity for a product (sets exact quantity)
 */
export async function updateStock(
  productId: string,
  quantity: number
): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/update-stock/${productId}`, {
    method: "PUT",
    body: JSON.stringify(quantity),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

/**
 * Add to existing stock quantity
 */
export async function addStock(
  productId: string,
  quantity: number
): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/add-stock/${productId}`, {
    method: "POST",
    body: JSON.stringify(quantity),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

/**
 * Remove from existing stock quantity
 */
export async function removeStock(
  productId: string,
  quantity: number
): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/remove-stock/${productId}`, {
    method: "POST",
    body: JSON.stringify(quantity),
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
export async function getTopSellingProducts(
  count: number = 10
): Promise<ProductSales[]> {
  return apiFetch<ProductSales[]>(`${STOCK_API_BASE}/top-selling/${count}`);
}

/**
 * Record a sale for a product
 */
export async function recordSale(
  productId: string,
  data: RecordSaleRequest
): Promise<void> {
  return apiFetch<void>(`${STOCK_API_BASE}/record-sale/${productId}`, {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}
