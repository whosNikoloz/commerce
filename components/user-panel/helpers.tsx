import { CheckCircle, Clock, Package2, Truck, AlertCircle } from "lucide-react";

export type OrderItem = { name: string; quantity: number; price: string; image?: string };
export type TrackingStep = {
  status: string;
  date: string;
  completed: boolean;
  description: string;
};
export type Order = {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | string;
  total: string;
  items: number;
  trackingNumber: string;
  estimatedDelivery: string;
  shippingAddress: string;
  orderItems: OrderItem[];
  trackingSteps: TrackingStep[];
};
export type WishlistItem = { id: number; name: string; price: string; image?: string };

export function StatusIcon({ status, completed }: { status: string; completed: boolean }) {
  if (completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
  switch (status) {
    case "Processing":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "Shipped":
      return <Package2 className="h-4 w-4 text-blue-500" />;
    case "Out for Delivery":
      return <Truck className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
}

export const demoOrders: Order[] = [
  {
    id: "#12345",
    date: "2024-01-15",
    status: "Delivered",
    total: "$89.99",
    items: 3,
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-16",
    shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
    orderItems: [
      {
        name: "Wireless Headphones",
        quantity: 1,
        price: "$59.99",
        image: "/wireless-headphones.png",
      },
      {
        name: "Phone Case",
        quantity: 2,
        price: "$15.00",
        image: "/colorful-phone-case-display.png",
      },
    ],
    trackingSteps: [
      {
        status: "Order Placed",
        date: "2024-01-15 10:30 AM",
        completed: true,
        description: "Your order has been confirmed",
      },
      {
        status: "Processing",
        date: "2024-01-15 2:15 PM",
        completed: true,
        description: "Order is being prepared",
      },
      {
        status: "Shipped",
        date: "2024-01-15 6:45 PM",
        completed: true,
        description: "Package dispatched from warehouse",
      },
      {
        status: "Out for Delivery",
        date: "2024-01-16 8:00 AM",
        completed: true,
        description: "Package is on the delivery truck",
      },
      {
        status: "Delivered",
        date: "2024-01-16 2:30 PM",
        completed: true,
        description: "Package delivered successfully",
      },
    ],
  },
  {
    id: "#12344",
    date: "2024-01-10",
    status: "Shipped",
    total: "$156.50",
    items: 2,
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-12",
    shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
    orderItems: [
      { name: "Smart Watch", quantity: 1, price: "$299.99", image: "/smartwatch-lifestyle.png" },
      { name: "Charging Cable", quantity: 1, price: "$25.00", image: "/charging-cable.jpg" },
    ],
    trackingSteps: [
      {
        status: "Order Placed",
        date: "2024-01-10 9:15 AM",
        completed: true,
        description: "Your order has been confirmed",
      },
      {
        status: "Processing",
        date: "2024-01-10 1:30 PM",
        completed: true,
        description: "Order is being prepared",
      },
      {
        status: "Shipped",
        date: "2024-01-11 11:20 AM",
        completed: true,
        description: "Package dispatched from warehouse",
      },
      {
        status: "Out for Delivery",
        date: "2024-01-12 7:30 AM",
        completed: false,
        description: "Package will be on the delivery truck",
      },
      {
        status: "Delivered",
        date: "Expected by 6:00 PM",
        completed: false,
        description: "Package will be delivered",
      },
    ],
  },
  {
    id: "#12343",
    date: "2024-01-05",
    status: "Processing",
    total: "$45.00",
    items: 1,
    trackingNumber: "TRK456789123",
    estimatedDelivery: "2024-01-08",
    shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
    orderItems: [
      { name: "Laptop Stand", quantity: 1, price: "$45.00", image: "/laptop-stand.png" },
    ],
    trackingSteps: [
      {
        status: "Order Placed",
        date: "2024-01-05 3:45 PM",
        completed: true,
        description: "Your order has been confirmed",
      },
      {
        status: "Processing",
        date: "2024-01-06 10:00 AM",
        completed: true,
        description: "Order is being prepared",
      },
      {
        status: "Shipped",
        date: "Expected by 2024-01-07",
        completed: false,
        description: "Package will be dispatched",
      },
      {
        status: "Out for Delivery",
        date: "Expected by 2024-01-08",
        completed: false,
        description: "Package will be on the delivery truck",
      },
      {
        status: "Delivered",
        date: "Expected by 2024-01-08",
        completed: false,
        description: "Package will be delivered",
      },
    ],
  },
];

export const demoWishlist: WishlistItem[] = [
  { id: 1, name: "Wireless Headphones", price: "$199.99", image: "/wireless-headphones.png" },
  { id: 2, name: "Smart Watch", price: "$299.99", image: "/smartwatch-lifestyle.png" },
  { id: 3, name: "Laptop Stand", price: "$49.99", image: "/laptop-stand.png" },
];
