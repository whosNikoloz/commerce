import type {
  StoreModel,
  CreateStoreRequest,
  UpdateStoreRequest,
  ProductStockModel,
  TransferProductRequest,
  TransferHistoryModel,
} from "@/types/store";

import { apiFetch } from "../client/fetcher";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Product";

export const mockTransferHistory: TransferHistoryModel[] = [
  {
    id: "transfer-001",
    productId: "prod-001",
    fromStoreId: "store-001",
    toStoreId: "store-002",
    quantity: 20,
    notes: "Replenishment request",
    transferredBy: "admin",
    createdAt: new Date("2024-02-05T12:30:00"),
  },
  {
    id: "transfer-002",
    productId: "prod-002",
    fromStoreId: "store-002",
    toStoreId: "store-001",
    quantity: 10,
    notes: "Urgent restock",
    transferredBy: "system",
    createdAt: new Date("2024-03-01T09:15:00"),
  },
  {
    id: "transfer-003",
    productId: "prod-003",
    fromStoreId: "store-003",
    toStoreId: "store-001",
    quantity: 6,
    notes: "Store 3 low activity",
    transferredBy: "manager",
    createdAt: new Date("2024-03-10T17:45:00"),
  },
];

export const mockProductStock: ProductStockModel[] = [
  // Product A
  {
    id: "stock-001",
    productId: "prod-001",
    storeId: "store-001",
    quantity: 120,
  },
  {
    id: "stock-002",
    productId: "prod-001",
    storeId: "store-002",
    quantity: 55,
  },
  {
    id: "stock-003",
    productId: "prod-001",
    storeId: "store-003",
    quantity: 0,
  },

  // Product B
  {
    id: "stock-004",
    productId: "prod-002",
    storeId: "store-001",
    quantity: 200,
  },
  {
    id: "stock-005",
    productId: "prod-002",
    storeId: "store-002",
    quantity: 88,
  },
  {
    id: "stock-006",
    productId: "prod-002",
    storeId: "store-003",
    quantity: 12,
  },

  // Product C
  {
    id: "stock-007",
    productId: "prod-003",
    storeId: "store-001",
    quantity: 30,
  },
  {
    id: "stock-008",
    productId: "prod-003",
    storeId: "store-002",
    quantity: 0,
  },
  {
    id: "stock-009",
    productId: "prod-003",
    storeId: "store-003",
    quantity: 6,
  },
];


export const mockStores: StoreModel[] = [
  {
    id: "store-001",
    name: "Central Warehouse",
    address: "Rustaveli Ave 23",
    phone: "+995 599 123 456",
    email: "central@store.ge",
    city: "Tbilisi",
    country: "Georgia",
    manager: "Giorgi K.",
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "store-002",
    name: "Saburtalo Branch",
    address: "Kazbegi Ave 45",
    phone: "+995 577 987 654",
    email: "saburtalo@store.ge",
    city: "Tbilisi",
    country: "Georgia",
    manager: "Ana M.",
    isActive: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-14"),
  },
  {
    id: "store-003",
    name: "Batumi Store",
    address: "Chavchavadze St 68",
    phone: "+995 593 000 111",
    email: "batumi@store.ge",
    city: "Batumi",
    country: "Georgia",
    manager: "Lasha P.",
    isActive: false,
    createdAt: new Date("2023-10-12"),
    updatedAt: new Date("2024-01-20"),
  },
];



export async function getAllStores(): Promise<StoreModel[]> {
  return mockStores;

  // return apiFetch<StoreModel[]>(`${API_BASE}/Store/get-all-stores`, {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" },
  // });
}

export async function getStoreById(id: string): Promise<StoreModel> {
  return apiFetch<StoreModel>(`${API_BASE}/Store/get-store/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function createStore(store: CreateStoreRequest): Promise<StoreModel> {
  return apiFetch<StoreModel>(`${API_BASE}/Store/create-store`, {
    method: "POST",
    body: JSON.stringify(store),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateStore(store: UpdateStoreRequest): Promise<StoreModel> {
  return apiFetch<StoreModel>(`${API_BASE}/Store/update-store/${store.id}`, {
    method: "PUT",
    body: JSON.stringify(store),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteStore(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE}/Store/delete-store/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}

export async function getProductStock(productId: string): Promise<ProductStockModel[]> {
  return apiFetch<ProductStockModel[]>(`${API_BASE}/Store/product-stock/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function getStoreStock(storeId: string): Promise<ProductStockModel[]> {
  return apiFetch<ProductStockModel[]>(`${API_BASE}/Store/store-stock/${storeId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateProductStock(
  productId: string,
  storeId: string,
  quantity: number
): Promise<ProductStockModel> {
  return apiFetch<ProductStockModel>(`${API_BASE}/Store/update-stock`, {
    method: "PUT",
    body: JSON.stringify({ productId, storeId, quantity }),
    headers: { "Content-Type": "application/json" },
  });
}

// Transfer operations
export async function transferProduct(
  transfer: TransferProductRequest
): Promise<TransferHistoryModel> {
  return apiFetch<TransferHistoryModel>(`${API_BASE}/Store/transfer-product`, {
    method: "POST",
    body: JSON.stringify(transfer),
    headers: { "Content-Type": "application/json" },
  });
}

export async function getTransferHistory(
  productId?: string
): Promise<TransferHistoryModel[]> {
  const url = productId
    ? `${API_BASE}/Store/transfer-history?productId=${productId}`
    : `${API_BASE}/Store/transfer-history`;

  return apiFetch<TransferHistoryModel[]>(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
