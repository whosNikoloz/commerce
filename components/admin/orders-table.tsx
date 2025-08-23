"use client";

import { useState } from "react";
import { Eye, Edit, Truck, Package, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  shippingMethod: string;
  orderDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const initialOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    items: [
      { name: "Wireless Headphones", quantity: 1, price: 99.99 },
      { name: "Phone Case", quantity: 2, price: 19.99 },
    ],
    total: 139.97,
    status: "processing",
    paymentStatus: "paid",
    shippingMethod: "Standard Shipping",
    orderDate: "2024-01-15",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    items: [{ name: "Smart Watch", quantity: 1, price: 299.99 }],
    total: 299.99,
    status: "shipped",
    paymentStatus: "paid",
    shippingMethod: "Express Shipping",
    orderDate: "2024-01-14",
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Bob Johnson",
      email: "bob@example.com",
    },
    items: [
      { name: "Coffee Maker", quantity: 1, price: 149.99 },
      { name: "Coffee Beans", quantity: 3, price: 12.99 },
    ],
    total: 188.96,
    status: "pending",
    paymentStatus: "pending",
    shippingMethod: "Standard Shipping",
    orderDate: "2024-01-13",
    shippingAddress: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
    },
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: {
      name: "Alice Brown",
      email: "alice@example.com",
    },
    items: [{ name: "Running Shoes", quantity: 1, price: 79.99 }],
    total: 79.99,
    status: "delivered",
    paymentStatus: "paid",
    shippingMethod: "Standard Shipping",
    orderDate: "2024-01-12",
    shippingAddress: {
      street: "321 Elm St",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA",
    },
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: {
      name: "Charlie Wilson",
      email: "charlie@example.com",
    },
    items: [{ name: "Laptop Stand", quantity: 2, price: 39.99 }],
    total: 79.98,
    status: "cancelled",
    paymentStatus: "refunded",
    shippingMethod: "Express Shipping",
    orderDate: "2024-01-11",
    shippingAddress: {
      street: "654 Maple Dr",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "USA",
    },
  },
];

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <RefreshCw className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orderStats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orderStats.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Processing
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orderStats.processing}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Shipped
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orderStats.shipped}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Delivered
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orderStats.delivered}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Orders</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Manage and track customer orders
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                className="w-64"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue className="text-slate-900 dark:text-slate-100" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-900 dark:text-slate-100">Order</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Customer</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Items</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Total</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Status</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Payment</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Date</TableHead>
                <TableHead className="text-right text-slate-900 dark:text-slate-100">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                        {order.shippingMethod}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                        {order.customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900 dark:text-slate-100">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-900 dark:text-slate-100">
                    {order.orderDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100">
                              Order Details - {order.orderNumber}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400">
                              Complete order information and management
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs className="w-full" defaultValue="details">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger
                                className="text-slate-900 dark:text-slate-100"
                                value="details"
                              >
                                Details
                              </TabsTrigger>
                              <TabsTrigger
                                className="text-slate-900 dark:text-slate-100"
                                value="items"
                              >
                                Items
                              </TabsTrigger>
                              <TabsTrigger
                                className="text-slate-900 dark:text-slate-100"
                                value="shipping"
                              >
                                Shipping
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent className="space-y-4" value="details">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                    Customer Information
                                  </h4>
                                  <p className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                                    {order.customer.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                                    {order.customer.email}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                    Order Status
                                  </h4>
                                  <Select
                                    value={order.status}
                                    onValueChange={(value: Order["status"]) =>
                                      updateOrderStatus(order.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue className="text-slate-900 dark:text-slate-100" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent className="space-y-4" value="items">
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 border rounded border-slate-200 dark:border-slate-700"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900 dark:text-slate-100">
                                        {item.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center p-2 border-t font-medium border-slate-200 dark:border-slate-700">
                                  <span className="text-slate-900 dark:text-slate-100">Total</span>
                                  <span className="text-slate-900 dark:text-slate-100">
                                    ${order.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent className="space-y-4" value="shipping">
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                  Shipping Address
                                </h4>
                                <div className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                                  <p>{order.shippingAddress.street}</p>
                                  <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zip}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                  Shipping Method
                                </h4>
                                <p className="text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                                  {order.shippingMethod}
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
