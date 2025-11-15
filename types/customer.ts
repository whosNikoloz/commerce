export interface CustomerModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  status: string;
  joinDate: string;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
