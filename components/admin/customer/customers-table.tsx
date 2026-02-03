"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, Edit, Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllCustomers, getCustomerOrders, updateCustomer } from "@/app/api/services/customerService";
import { CustomerModel, UpdateCustomerDto } from "@/types/customer";
import { OrderSummary, OrderStatus, OrderDetail } from "@/types/orderTypes";
import { getOrderByIdForAdmin } from "@/app/api/services/orderService";
import { useDictionary } from "@/app/context/dictionary-provider";
import { currencyFmt } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
  }[];
}

// Helper function to map backend CustomerModel to local Customer interface
function mapCustomerModelToCustomer(model: CustomerModel): Customer {
  return {
    id: model.id,
    name: `${model.firstName} ${model.lastName}`,
    email: model.email,
    phone: model.phone,
    avatar: "/placeholder.png?height=40&width=40",
    joinDate: new Date(model.joinDate).toISOString().split('T')[0],
    totalOrders: model.ordersCount,
    totalSpent: model.totalSpent,
    status: model.status.toLowerCase() as "active" | "inactive",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    recentOrders: [],
  };
}

// Helper function to convert OrderStatus enum to readable string
function getOrderStatusLabel(status: OrderStatus, dict: any): string {
  const key = (typeof status === "number" ? OrderStatus[status] : String(status)).toLowerCase();

  return dict.admin.orders.statuses[key] || key;
}


// Helper function to get status badge variant
function getOrderStatusVariant(
  status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case OrderStatus.Delivered:
      return "default";
    case OrderStatus.Shipped:
    case OrderStatus.Processing:
      return "secondary";
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return "destructive";
    default:
      return "outline";
  }
}

export function CustomersTable() {
  const dict = useDictionary();
  const t = dict.admin.customers;
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<OrderSummary[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await getAllCustomers(1, 10);
        const mappedCustomers = response.items.map(mapCustomerModelToCustomer);

        setCustomers(mappedCustomers);
      } catch {
        // Failed to fetch customers
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedCustomer) {
        setCustomerOrders([]);

        return;
      }

      try {
        setIsLoadingOrders(true);
        const response = await getCustomerOrders(selectedCustomer.id, 1, 10);

        setCustomerOrders(response.data);
      } catch {
        // Failed to fetch orders
        setCustomerOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [selectedCustomer]);

  const handleOrderClick = async (orderId: string) => {
    try {
      setIsLoadingOrderDetail(true);
      setIsOrderDialogOpen(true);
      const orderDetail = await getOrderByIdForAdmin(orderId);

      setSelectedOrder(orderDetail);
    } catch {
      // Failed to fetch order details
      setSelectedOrder(null);
    } finally {
      setIsLoadingOrderDetail(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    const nameParts = customer.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setEditForm({
      firstName,
      lastName,
      email: customer.email,
      phone: customer.phone,
    });
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setIsUpdating(true);
      const updateData: UpdateCustomerDto = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
      };

      await updateCustomer(updateData);

      // Refresh customers list
      const response = await getAllCustomers(1, 10);
      const mappedCustomers = response.items.map(mapCustomerModelToCustomer);

      setCustomers(mappedCustomers);
      setIsEditDialogOpen(false);
    } catch {
      // Failed to update customer
      alert(t.toasts.updateError);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const customerStats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue:
      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
      customers.reduce((sum, c) => sum + c.totalOrders, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.stats.total}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="font-primary text-xs text-muted-foreground">{customerStats.active} {t.stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.stats.revenue}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFmt(customerStats.totalRevenue)}</div>
            <p className="font-primary text-xs text-muted-foreground">{t.stats.revenueLabel}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.stats.avgOrderValue}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFmt(customerStats.avgOrderValue)}</div>
            <p className="font-primary text-xs text-muted-foreground">{t.stats.perOrder}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">{t.table.title}</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                {t.table.subtitle}
              </CardDescription>
            </div>
            <Input
              aria-label={t.table.searchPlaceholder}
              className="w-full md:w-64"
              placeholder={t.table.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.headers.customer}</TableHead>
                  <TableHead>{t.table.headers.contact}</TableHead>
                  <TableHead>{t.table.headers.orders}</TableHead>
                  <TableHead>{t.table.headers.totalSpent}</TableHead>
                  <TableHead>{t.table.headers.joinDate}</TableHead>
                  <TableHead>{t.table.headers.status}</TableHead>
                  <TableHead className="text-right">{t.table.headers.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell className="py-8 text-center" colSpan={7}>
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                        <span className="font-primary ml-2 text-muted-foreground">{t.table.loading}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8 text-center text-muted-foreground" colSpan={7}>
                      {t.table.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsDialogOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                            <AvatarImage
                              alt={customer.name}
                              src={customer.avatar || "/placeholder.png"}
                            />
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {customer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{t.detailsModal.labels.id}: {customer.id}</div>
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
                        <Badge variant="secondary">{customer.totalOrders} {t.table.ordersCount}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                        {currencyFmt(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {customer.joinDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {t.table[customer.status as "active" | "inactive"]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <Button
                            aria-label="View customer details"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label="Edit customer"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isDialogOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "3xl"}
        onClose={() => setIsDialogOpen(false)}
      >
        <ModalContent className="h-full">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={() => setIsDialogOpen(false)} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {t.detailsModal.title.replace("{name}", selectedCustomer?.name || "")}
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {t.detailsModal.subtitle}
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {t.detailsModal.fullTitle.replace("{name}", selectedCustomer?.name || "")}
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t.detailsModal.fullSubtitle}
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3">
                {selectedCustomer && (
                  <Tabs className="w-full" defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="profile">{t.detailsModal.tabs.profile}</TabsTrigger>
                      <TabsTrigger value="orders">{t.detailsModal.tabs.orders}</TabsTrigger>
                      <TabsTrigger value="address">{t.detailsModal.tabs.address}</TabsTrigger>
                    </TabsList>

                    <TabsContent className="space-y-4" value="profile">
                      <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                        <h3 className="font-heading font-bold text-lg mb-3">{t.detailsModal.infoTitle}</h3>
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-16 w-16 ring-2 ring-blue-500/20">
                            <AvatarImage
                              alt={selectedCustomer.name}
                              src={selectedCustomer.avatar || "/placeholder.png"}
                            />
                            <AvatarFallback className="text-lg">
                              {selectedCustomer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-heading text-lg font-medium text-slate-900 dark:text-slate-100">
                              {selectedCustomer.name}
                            </h3>
                            <p className="font-primary text-sm text-slate-500">{selectedCustomer.email}</p>
                            <p className="font-primary text-sm text-slate-500">{selectedCustomer.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                        <h3 className="font-heading font-bold text-lg mb-3">{t.detailsModal.statsTitle}</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <div className="text-xs text-slate-500">{t.detailsModal.labels.since}</div>
                            <div className="font-medium">{selectedCustomer.joinDate}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">{t.detailsModal.labels.ordersCount}</div>
                            <div className="font-medium">{selectedCustomer.totalOrders} {t.table.ordersCount}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">{t.detailsModal.labels.ltv}</div>
                            <div className="font-medium">{currencyFmt(selectedCustomer.totalSpent)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">{t.detailsModal.labels.status}</div>
                            <Badge variant={selectedCustomer.status === "active" ? "default" : "secondary"}>
                              {t.table[selectedCustomer.status as "active" | "inactive"]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent className="space-y-4 pr-4" value="orders">
                      {isLoadingOrders ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                          <span className="font-primary ml-2 text-muted-foreground">{t.detailsModal.labels.loadingOrders}</span>
                        </div>
                      ) : customerOrders.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          {t.detailsModal.labels.noOrders}
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                          <h3 className="font-heading font-bold text-lg mb-3">{t.detailsModal.historyTitle}</h3>
                          <div className="space-y-2">
                            {customerOrders.map((order) => (
                              <button
                                key={order.id}
                                className="flex w-full items-center justify-between rounded border border-slate-200 dark:border-slate-700 p-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                type="button"
                                onClick={() => handleOrderClick(order.id)}
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{t.detailsModal.labels.orderPrefix}{order.id.slice(0, 8)}</div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(order.date).toLocaleDateString()} • {order.items} {order.items === 1 ? t.detailsModal.labels.item : t.detailsModal.labels.items}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-sm">{currencyFmt(order.total)}</div>
                                  <Badge className="text-xs mt-1" variant={getOrderStatusVariant(order.status)}>
                                    {getOrderStatusLabel(order.status, dict)}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent className="space-y-4" value="address">
                      <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                        <h3 className="font-heading font-bold text-lg mb-3 flex items-center">
                          <MapPin className="mr-2 h-5 w-5" />
                          {t.detailsModal.shippingTitle}
                        </h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <p>{selectedCustomer.address.street || t.detailsModal.labels.noStreet}</p>
                          <p>
                            {selectedCustomer.address.city || ""}{selectedCustomer.address.city && ", "}{selectedCustomer.address.state || ""}{" "}
                            {selectedCustomer.address.zip || ""}
                          </p>
                          <p>{selectedCustomer.address.country || t.detailsModal.labels.noCountry}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <Button
                  size={isMobile ? "sm" : "default"}
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t.detailsModal.labels.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOrderDialogOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "4xl"}
        onClose={() => setIsOrderDialogOpen(false)}
      >
        <ModalContent className="h-full">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={() => setIsOrderDialogOpen(false)} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {dict.admin.orders.detailsModal.title}
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {dict.admin.orders.detailsModal.subtitle}
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {dict.admin.orders.detailsModal.title}
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {dict.admin.orders.detailsModal.subtitle}
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3">
                {isLoadingOrderDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    <span className="font-primary ml-2 text-muted-foreground">{dict.admin.orders.detailsModal.labels.loading}</span>
                  </div>
                ) : selectedOrder ? (
                  <div className="space-y-6">
                    {/* Order Header */}
                    <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50 sm:grid-cols-2">
                      <div>
                        <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.id}</p>
                        <p className="font-primary font-medium">#{selectedOrder.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.date}</p>
                        <p className="font-primary font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.status}</p>
                        <Badge variant={getOrderStatusVariant(selectedOrder.status)}>
                          {getOrderStatusLabel(selectedOrder.status, dict)}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.total}</p>
                        <p className="font-primary text-lg font-bold">{currencyFmt(selectedOrder.total, selectedOrder.currency)}</p>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                      <h3 className="font-heading mb-2 font-semibold text-slate-900 dark:text-slate-100">{dict.admin.orders.detailsModal.sections.customer}</h3>
                      <div className="rounded-lg border p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.name}</p>
                            <p className="font-primary font-medium">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                          </div>
                          <div>
                            <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.email}</p>
                            <p className="font-primary font-medium">{selectedOrder.user.email}</p>
                          </div>
                          <div>
                            <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.phone}</p>
                            <p className="font-primary font-medium">{selectedOrder.user.phoneNumber || t.detailsModal.labels.n_a}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h3 className="font-heading mb-2 font-semibold text-slate-900 dark:text-slate-100">{dict.admin.orders.detailsModal.sections.shipping}</h3>
                      <div className="rounded-lg border p-4">
                        <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.sections.shipping}</p>
                        <p className="font-primary font-medium">{selectedOrder.shippingAddress}</p>
                        {selectedOrder.trackingNumber && (
                          <div className="mt-2">
                            <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.trackingLabel}</p>
                            <p className="font-primary font-mono text-sm font-medium">{selectedOrder.trackingNumber}</p>
                          </div>
                        )}
                        {selectedOrder.estimatedDelivery && (
                          <div className="mt-2">
                            <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.etdLabel}</p>
                            <p className="font-primary font-medium">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-heading mb-2 font-semibold text-slate-900 dark:text-slate-100">{dict.admin.orders.detailsModal.sections.products}</h3>
                      <div className="space-y-2">
                        {selectedOrder.orderItems.map((item) => (
                          <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3">
                              {item.image && (
                                <Image
                                  alt={item.name}
                                  className="h-12 w-12 rounded object-cover"
                                  height={48}
                                  src={item.image}
                                  width={48}
                                />
                              )}
                              <div>
                                <p className="font-primary font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                                {item.sku && <p className="font-primary text-xs text-muted-foreground">{dict.admin.orders.detailsModal.labels.sku}: {item.sku}</p>}
                                <p className="font-primary text-sm text-muted-foreground">{dict.admin.orders.detailsModal.labels.qty}: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right sm:text-right">
                              <p className="font-primary font-medium">{currencyFmt(item.price, selectedOrder.currency)}</p>
                              <p className="font-primary text-sm text-muted-foreground">
                                {dict.admin.orders.detailsModal.labels.total}: {currencyFmt(item.price * item.quantity, selectedOrder.currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Steps */}
                    {selectedOrder.trackingSteps && selectedOrder.trackingSteps.length > 0 && (
                      <div>
                        <h3 className="font-heading mb-2 font-semibold text-slate-900 dark:text-slate-100">{dict.admin.orders.detailsModal.sections.history}</h3>
                        <div className="space-y-2">
                          {selectedOrder.trackingSteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3 rounded-lg border p-3">
                              <div className={`mt-1 h-3 w-3 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div className="flex-1">
                                <p className="font-primary font-medium text-slate-900 dark:text-slate-100">{step.status}</p>
                                {step.description && (
                                  <p className="font-primary text-sm text-muted-foreground">{step.description}</p>
                                )}
                                <p className="font-primary text-xs text-muted-foreground">
                                  {new Date(step.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    {dict.admin.customers.detailsModal.labels.loadFailed}
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <Button
                  size={isMobile ? "sm" : "default"}
                  variant="outline"
                  onClick={() => setIsOrderDialogOpen(false)}
                >
                  {dict.admin.orders.detailsModal.labels.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isEditDialogOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "2xl"}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <ModalContent className="h-full">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={() => setIsEditDialogOpen(false)} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {t.editModal.title}
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {t.editModal.subtitle}
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {t.editModal.title}
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t.editModal.subtitle}
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="font-primary mb-1 block text-sm font-medium" htmlFor="firstName">
                        {t.editModal.firstName}
                      </label>
                      <Input
                        id="firstName"
                        placeholder={t.editModal.placeholders.firstName}
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-primary mb-1 block text-sm font-medium" htmlFor="lastName">
                        {t.editModal.lastName}
                      </label>
                      <Input
                        id="lastName"
                        placeholder={t.editModal.placeholders.lastName}
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-primary mb-1 block text-sm font-medium" htmlFor="email">
                      {t.editModal.email}
                    </label>
                    <Input
                      id="email"
                      placeholder={t.editModal.placeholders.email}
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="font-primary mb-1 block text-sm font-medium" htmlFor="phone">
                      {t.editModal.phone}
                    </label>
                    <Input
                      id="phone"
                      placeholder={t.editModal.placeholders.phone}
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    {t.editModal.cancel}
                  </Button>
                  <Button
                    disabled={isUpdating}
                    size={isMobile ? "sm" : "default"}
                    onClick={handleUpdateCustomer}
                  >
                    {isUpdating ? t.editModal.saving : t.editModal.save}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
