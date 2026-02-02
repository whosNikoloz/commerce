// Stock management types

export interface ProductStock {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

export interface ProductSales {
  id: string;
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  lastSaleDate: string;
}

export interface RecordSaleRequest {
  quantity: number;
  unitPrice: number;
}
