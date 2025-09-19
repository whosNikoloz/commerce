// components/user-panel/helpers.tsx

import { WishlistItem, OrderItem, TrackingStep, OrderDetail } from "@/types/orderTypes";


// Keep your StatusIcon as-is, just export it:
export function StatusIcon({ completed }: { completed: boolean }) {
  return (
    <div className={`h-4 w-4 rounded-full ${completed ? "bg-green-500" : "bg-gray-300"}`} />
  );
}

// Demo wishlist using canonical type (id as string, price as number)
export const demoWishlist: WishlistItem[] = [
  {
    id: "w1",
    name: "Noise-canceling Headphones",
    image: "/placeholder.png",
    price: 199.99,
    currency: "GEL",
  },
  {
    id: "w2",
    name: "Ergonomic Chair",
    image: "/placeholder.png",
    price: 349,
    currency: "GEL",
  },
];

const sampleItems: OrderItem[] = [
  {
    name: "Running Shoes", quantity: 1, price: 89.99, image: "/placeholder.png", variant: null,
    productId: ""
  },
  {
    name: "Water Bottle", quantity: 2, price: 15, image: "/placeholder.png",
    productId: ""
  },
];

const tracking: TrackingStep[] = [
  { status: "Order Placed", completed: true, date: new Date().toISOString(), description: "We received your order." },
  { status: "Processing", completed: true, date: new Date().toISOString() },
  { status: "Shipped", completed: false, date: new Date().toISOString() },
];

export const demoOrders: OrderDetail[] = [
  {
    id: "ORD-1001",
    date: new Date().toISOString(),
    status: "Shipped",
    items: sampleItems.reduce((a, i) => a + i.quantity, 0),
    total: sampleItems.reduce((a, i) => a + i.price * i.quantity, 0),
    orderItems: sampleItems,
    shippingAddress: "123 Main St, City",
    trackingNumber: "TRK12345",
    estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    trackingSteps: tracking,
    currency: "GEL",
  },
];
