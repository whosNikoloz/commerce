"use client"

import { useState } from "react"
import { Eye, Edit, Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  recentOrders: {
    id: string
    orderNumber: string
    date: string
    total: number
    status: string
  }[]
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-06-15",
    totalOrders: 12,
    totalSpent: 1299.87,
    status: "active",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    recentOrders: [
      { id: "1", orderNumber: "ORD-2024-001", date: "2024-01-15", total: 139.97, status: "processing" },
      { id: "2", orderNumber: "ORD-2024-010", date: "2024-01-10", total: 89.99, status: "delivered" },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-08-22",
    totalOrders: 8,
    totalSpent: 756.43,
    status: "active",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA",
    },
    recentOrders: [{ id: "3", orderNumber: "ORD-2024-002", date: "2024-01-14", total: 299.99, status: "shipped" }],
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-12-01",
    totalOrders: 3,
    totalSpent: 234.56,
    status: "active",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
    },
    recentOrders: [{ id: "4", orderNumber: "ORD-2024-003", date: "2024-01-13", total: 188.96, status: "pending" }],
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-04-10",
    totalOrders: 15,
    totalSpent: 2145.32,
    status: "active",
    address: {
      street: "321 Elm St",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA",
    },
    recentOrders: [
      { id: "5", orderNumber: "ORD-2024-004", date: "2024-01-12", total: 79.99, status: "delivered" },
      { id: "6", orderNumber: "ORD-2024-008", date: "2024-01-08", total: 159.99, status: "delivered" },
    ],
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-11-18",
    totalOrders: 1,
    totalSpent: 79.98,
    status: "inactive",
    address: {
      street: "654 Maple Dr",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "USA",
    },
    recentOrders: [{ id: "7", orderNumber: "ORD-2024-005", date: "2024-01-11", total: 79.98, status: "cancelled" }],
  },
]

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const customerStats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue:
      customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0),
  }

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 2000)
      return { label: "VIP", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" }
    if (totalSpent >= 1000)
      return { label: "Gold", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
    if (totalSpent >= 500)
      return { label: "Silver", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" }
    return { label: "Bronze", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">{customerStats.active} active customers</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">VIP</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter((c) => c.totalSpent >= 2000).length}</div>
            <p className="text-xs text-muted-foreground">$2000+ lifetime value</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Customers</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Manage your customer base and relationships
              </CardDescription>
            </div>
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const tier = getCustomerTier(customer.totalSpent)
                return (
                  <TableRow key={customer.id} className="border-slate-200 dark:border-slate-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                          <AvatarFallback>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900 dark:text-slate-100">
                          <Mail className="mr-1 h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.totalOrders} orders</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      ${customer.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={tier.color}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">{customer.joinDate}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Customer Details - {customer.name}</DialogTitle>
                              <DialogDescription>Complete customer information and order history</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="profile" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="address">Address</TabsTrigger>
                              </TabsList>
                              <TabsContent value="profile" className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16 ring-2 ring-blue-500/20">
                                    <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                                    <AvatarFallback className="text-lg">
                                      {customer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                      {customer.name}
                                    </h3>
                                    <p className="text-muted-foreground">{customer.email}</p>
                                    <p className="text-muted-foreground">{customer.phone}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Customer Since</h4>
                                    <p className="text-sm text-muted-foreground">{customer.joinDate}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Customer Tier</h4>
                                    <Badge className={tier.color}>{tier.label}</Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Total Orders</h4>
                                    <p className="text-sm text-muted-foreground">{customer.totalOrders} orders</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Lifetime Value</h4>
                                    <p className="text-sm text-muted-foreground">${customer.totalSpent.toFixed(2)}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="orders" className="space-y-4">
                                <div className="space-y-2">
                                  {customer.recentOrders.map((order) => (
                                    <div
                                      key={order.id}
                                      className="flex justify-between items-center p-3 border rounded"
                                    >
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                          {order.orderNumber}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{order.date}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                          ${order.total.toFixed(2)}
                                        </p>
                                        <Badge className="text-xs">{order.status}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                              <TabsContent value="address" className="space-y-4">
                                <div>
                                  <h4 className="font-medium flex items-center text-slate-900 dark:text-slate-100">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Shipping Address
                                  </h4>
                                  <div className="text-sm text-muted-foreground mt-2">
                                    <p>{customer.address.street}</p>
                                    <p>
                                      {customer.address.city}, {customer.address.state} {customer.address.zip}
                                    </p>
                                    <p>{customer.address.country}</p>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
