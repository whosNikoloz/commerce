export interface StoreModel {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  manager?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateStoreRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  manager?: string;
  isActive: boolean;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  id: string;
}

export interface ProductStockModel {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransferProductRequest {
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  notes?: string;
}

export interface TransferHistoryModel {
  id: string;
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  notes?: string;
  transferredBy?: string;
  createdAt: Date;
}
