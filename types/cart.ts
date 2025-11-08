import { ReactNode } from "react";

export interface CartItemType {
  discount: any;
  originalPrice?: ReactNode;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedFacets?: Record<string, string>;
}
