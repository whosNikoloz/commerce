// Stock management types

export interface ProductStock {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

export interface ProductSales {
  id: string;
  productId: string;
  totalSold: number;
  totalRevenue: number;
  lastSaleDate: string;
}

export interface UpdateStockRequest {
  productId: string;
  quantity: number;
}

export interface AddStockRequest {
  productId: string;
  quantity: number;
}

export interface RemoveStockRequest {
  productId: string;
  quantity: number;
}
