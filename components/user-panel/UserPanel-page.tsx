// components/account/UserPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User as UserIcon,
  Package,
  Heart,
  Settings,
  Shield,
  CreditCard,
  MapPin,
  Truck,
  Star,
  Eye,
  Trash2,
  ShoppingCart,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin as MapPinIcon,
  LogIn,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getMyOrders, getWishlist, getOrderById, getTracking, downloadInvoiceFile } from "@/app/api/services/orderService";
import { OrderDetail, OrderItem, OrderSummary, TrackingStep, WishlistItem } from "@/types/orderTypes";
import { useUser } from "@/app/context/userContext";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}
const currency = "GEL";
const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    n ?? 0
  );


function NotificationArea({
  notifications,
  onDismiss,
}: {
  notifications: Record<string, string>;
  onDismiss: (id: string) => void;
}) {
  if (!notifications || Object.keys(notifications).length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {Object.entries(notifications).map(([orderId, message]) => (
        <div
          key={orderId}
          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center">
              ✅
            </span>
            <span className="text-sm text-green-800">{message}</span>
          </div>
          <Button
            aria-label="Dismiss notification"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(orderId)}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  cta,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

export default function UserPanel() {
  const { user, simulateLogin, logout } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");

  // data state
  const [paged, setPaged] = useState<{ page: number; pageSize: number; total: number }>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [orders, setOrders] = useState<(OrderSummary | OrderDetail)[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // ui state
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [errorWishlist, setErrorWishlist] = useState<string | null>(null);

  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Record<string, string>>({});

  // load orders
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingOrders(true);
        setErrorOrders(null);
        const res = await getMyOrders(paged.page, paged.pageSize);

        if (!mounted) return;
        setPaged((p) => ({ ...p, total: res.total }));
        setOrders(res.data);
      } catch (e: any) {
        if (!mounted) return;
        setErrorOrders(e?.message ?? "Failed to load orders");
      } finally {
        mounted && setLoadingOrders(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [paged.page, paged.pageSize]);

  // load wishlist
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingWishlist(true);
        setErrorWishlist(null);
        const items = await getWishlist();

        if (!mounted) return;
        setWishlist(items);
      } catch (e: any) {
        if (!mounted) return;
        setErrorWishlist(e?.message ?? "Failed to load wishlist");
      } finally {
        mounted && setLoadingWishlist(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const totalSpent = useMemo(
    () =>
      orders.reduce((acc, o) => acc + ((o as OrderDetail)?.total ?? 0), 0),
    [orders]
  );

  const toggleOrderExpansion = (id: string) =>
    setExpandedOrders((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  // ensure details fetched on first open
  const ensureOrderDetailLoaded = async (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    const isDetail = !!(found as OrderDetail)?.orderItems;

    if (found && !isDetail) {
      try {
        setOrderActions((a) => ({ ...a, [`load-${orderId}`]: true }));
        const detail = await getOrderById(orderId);

        setOrders((prev) => prev.map((o) => (o.id === orderId ? detail : o)));
      } finally {
        setOrderActions((a) => ({ ...a, [`load-${orderId}`]: false }));
      }
    }
  };

  const handleTrackPackage = async (
    orderId: string,
    trackingNumber?: string | null
  ) => {
    if (!trackingNumber) return;

    setOrderActions((p) => ({ ...p, [`track-${orderId}`]: true }));
    try {
      const steps = await getTracking(trackingNumber);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? ({ ...(o as OrderDetail), trackingSteps: steps } as OrderDetail)
            : o
        )
      );
      setNotifications((p) => ({
        ...p,
        [orderId]: `Tracking updated for ${trackingNumber}`,
      }));
    } catch (e: any) {
      setNotifications((p) => ({
        ...p,
        [orderId]: `Tracking failed: ${String(e?.message || e)}`,
      }));
    } finally {
      setOrderActions((p) => ({ ...p, [`track-${orderId}`]: false }));
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: true }));
    try {
      const { blobUrl, fileName } = await downloadInvoiceFile(orderId);
      const a = document.createElement("a");

      a.href = blobUrl;
      a.download = fileName;
      a.click();
      setNotifications((p) => ({
        ...p,
        [orderId]: `Invoice downloaded for ${orderId}`,
      }));
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      setNotifications((p) => ({
        ...p,
        [orderId]: `Invoice failed: ${String(e?.message || e)}`,
      }));
    } finally {
      setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: false }));
    }
  };

  const handleLeaveReview = (orderId: string) =>
    setNotifications((p) => ({
      ...p,
      [orderId]: `Review form opened for ${orderId}`,
    }));

  const handleViewOrder = async (orderId: string) => {
    setActiveTab("orders");
    await ensureOrderDetailLoaded(orderId);
    setTimeout(() => toggleOrderExpansion(orderId), 60);
  };

  const dismissNotification = (orderId: string) =>
    setNotifications((p) => {
      const n = { ...p };

      delete n[orderId];

      return n;
    });

  // —————————————————————————————————————————————————————————————
  // Inner sections (kept in-file to avoid extra files)
  // —————————————————————————————————————————————————————————————
  const DashboardStats = () => (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{paged.total}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{fmtMoney(totalSpent)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Wishlist Items</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{wishlist.length}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Saved for later</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Reward Points</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">—</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );

  const RecentOrders = ({
    orders,
    onView,
  }: {
    orders: (OrderSummary | OrderDetail)[];
    onView: (id: string) => void;
  }) => {
    if (loadingOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      );
    }
    if (errorOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{errorOrders}</p>
          </CardContent>
        </Card>
      );
    }
    if (!orders.length) {
      return (
        <EmptyState
          desc="When you place an order, it will appear here."
          icon={<Package />}
          title="No orders yet"
        />
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{order.id}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
                  <Badge
                    variant={
                      order.status === "Delivered"
                        ? "default"
                        : order.status === "Shipped"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {order.status}
                  </Badge>
                  <p className="font-medium text-sm md:text-base">
                    {fmtMoney((order as OrderDetail).total ?? 0)}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => onView(order.id)} className="shrink-0">
                    <Eye className="h-3 w-3 md:h-4 md:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrderHistory = ({
    orders,
  }: {
    orders: (OrderSummary | OrderDetail)[];
  }) => {
    if (loadingOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>All your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      );
    }
    if (errorOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{errorOrders}</p>
          </CardContent>
        </Card>
      );
    }
    if (!orders.length) {
      return (
        <EmptyState
          desc="You haven’t placed any orders yet."
          icon={<Package />}
          title="No orders to show"
        />
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle className="text-lg md:text-xl">Order History</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              View and manage all your orders with detailed tracking
            </CardDescription>
          </div>
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <Button
              disabled={paged.page <= 1 || loadingOrders}
              size="sm"
              variant="outline"
              onClick={() => setPaged((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            >
              Prev
            </Button>
            <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
              Page {paged.page} / {Math.max(1, Math.ceil(paged.total / paged.pageSize))}
            </span>
            <Button
              disabled={paged.page >= Math.ceil(paged.total / paged.pageSize) || loadingOrders}
              size="sm"
              variant="outline"
              onClick={() =>
                setPaged((p) => ({ ...p, page: Math.min(p.page + 1, Math.ceil(p.total / p.pageSize)) }))
              }
            >
              Next
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => {
              const expanded = expandedOrders.includes(order.id);
              const isDetail = !!(order as OrderDetail).orderItems;
              const detail = order as OrderDetail;

              return (
                <Collapsible key={order.id} open={expanded}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div
                        aria-expanded={expanded}
                        className={cx(
                          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-6 cursor-pointer transition-colors",
                          expanded ? "bg-muted/50" : "hover:bg-muted/50"
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={async () => {
                          if (!isDetail) await ensureOrderDetailLoaded(order.id);
                          toggleOrderExpansion(order.id);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!isDetail) await ensureOrderDetailLoaded(order.id);
                            toggleOrderExpansion(order.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                          <div className="p-2 bg-muted rounded-lg shrink-0">
                            <Package className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-base md:text-lg truncate">{order.id}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {order.items} items • {fmtMoney((order as OrderDetail).total ?? 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "default"
                                : order.status === "Shipped"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                          {expanded ? (
                            <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      {isDetail ? (
                        <div className="px-6 pb-6 space-y-6">
                          <Separator />

                          {/* Items */}
                          <div>
                            <h4 className="font-semibold mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {detail.orderItems.map((item: OrderItem, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                                >
                                  <img
                                    alt={item.name}
                                    className="h-12 w-12 object-cover rounded"
                                    src={item.image || "/placeholder.png"}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity}
                                      {item.variant ? ` • ${item.variant}` : ""}
                                    </p>
                                  </div>
                                  <p className="font-semibold">{fmtMoney(item.price)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping */}
                          <div>
                            <h4 className="font-semibold mb-3">Shipping Information</h4>
                            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{detail.shippingAddress}</span>
                              </div>
                              {!!detail.trackingNumber && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    Tracking: {detail.trackingNumber}
                                  </span>
                                </div>
                              )}
                              {!!detail.estimatedDelivery && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    Expected: {detail.estimatedDelivery}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tracking */}
                          <div>
                            <h4 className="font-semibold mb-3">Order Tracking</h4>
                            {detail.trackingSteps.length ? (
                              <div className="space-y-4">
                                {detail.trackingSteps.map(
                                  (step: TrackingStep, i: number) => (
                                    <div key={i} className="flex items-start gap-4">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={cx(
                                            "h-4 w-4 rounded-full",
                                            step.completed ? "bg-green-500" : "bg-gray-300"
                                          )}
                                        />
                                        {i < detail.trackingSteps.length - 1 && (
                                          <div
                                            className={cx(
                                              "w-0.5 h-8 mt-2",
                                              step.completed ? "bg-green-500" : "bg-gray-200"
                                            )}
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between">
                                          <p
                                            className={cx(
                                              "font-medium",
                                              step.completed
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                            )}
                                          >
                                            {step.status}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(step.date).toLocaleString()}
                                          </p>
                                        </div>
                                        {step.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {step.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No tracking updates yet.
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                            <Button
                              className="flex-1 bg-transparent text-xs md:text-sm"
                              size="sm"
                              disabled={
                                orderActions[`track-${detail.id}`] === true ||
                                !detail.trackingNumber
                              }
                              variant="outline"
                              onClick={() =>
                                handleTrackPackage(detail.id, detail.trackingNumber)
                              }
                            >
                              <Truck className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                              {orderActions[`track-${detail.id}`]
                                ? "Tracking..."
                                : "Track Package"}
                            </Button>
                            <Button
                              className="flex-1 bg-transparent text-xs md:text-sm"
                              size="sm"
                              disabled={orderActions[`invoice-${detail.id}`] === true}
                              variant="outline"
                              onClick={() => handleDownloadInvoice(detail.id)}
                            >
                              <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                              <span className="hidden sm:inline">{orderActions[`invoice-${detail.id}`]
                                ? "Downloading..."
                                : "Download Invoice"}</span>
                              <span className="sm:hidden">Invoice</span>
                            </Button>
                            {detail.status === "Delivered" && (
                              <Button
                                className="flex-1 bg-transparent text-xs md:text-sm"
                                size="sm"
                                variant="outline"
                                onClick={() => handleLeaveReview(detail.id)}
                              >
                                <Star className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                <span className="hidden sm:inline">Leave Review</span>
                                <span className="sm:hidden">Review</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="px-6 pb-6 text-sm text-muted-foreground">
                          {orderActions[`load-${order.id}`] ? "Loading details…" : "Open to load details"}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const WishlistGrid = () => {
    if (loadingWishlist) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>Items you&apos;ve saved for later</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      );
    }
    if (errorWishlist) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{errorWishlist}</p>
          </CardContent>
        </Card>
      );
    }
    if (!wishlist.length) {
      return (
        <EmptyState
          cta={<Button>Add products</Button>}
          desc="Save products to compare and buy later."
          icon={<Heart />}
          title="Your wishlist is empty"
        />
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Items you&apos;ve saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <img
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md"
                  src={item.image || "/placeholder.png"}
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-lg font-bold text-primary">
                    {fmtMoney(item.price)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="icon" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AccountForms = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Your first name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Your last name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" type="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+995 5xx xxx xxx" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Manage your delivery addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Home</p>
              <p className="text-sm text-muted-foreground">
                123 Main St, Apt 4B
                <br />
                City, ZIP
              </p>
            </div>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
          <Button className="w-full bg-transparent" variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">•••• •••• •••• 1234</p>
              <p className="text-sm text-muted-foreground">Expires 12/26</p>
            </div>
            <Badge>Default</Badge>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
          <Button className="w-full bg-transparent" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Add New Card
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive order updates
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Privacy Settings</p>
                <p className="text-sm text-muted-foreground">Control your data</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // —————————————————————————————————————————————————————————————
  // Login Required Screen
  // —————————————————————————————————————————————————————————————
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Login Required</CardTitle>
            <CardDescription>
              Please log in to access your user panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You need to be logged in to view your orders, wishlist, and account settings.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Click the profile icon in the navigation to log in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // —————————————————————————————————————————————————————————————
  // Render
  // —————————————————————————————————————————————————————————————
  return (
    <div className="min-h-screen mt-10 md:mt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-20">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="h-12 w-12 md:h-16 md:w-16">
              <AvatarImage src={user.picture} />
              <AvatarFallback>{user.firstName[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {user.email} • {user.role}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={logout}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        <NotificationArea
          notifications={notifications}
          onDismiss={dismissNotification}
        />

        <Tabs className="space-y-4 md:space-y-6" value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-5 lg:w-fit bg-inherit">
            <TabsTrigger className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2" value="dashboard">
              <UserIcon className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-[10px] md:text-sm">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2" value="orders">
              <Package className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-[10px] md:text-sm">Orders</span>
            </TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2" value="wishlist">
              <Heart className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-[10px] md:text-sm">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2" value="account">
              <Settings className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-[10px] md:text-sm">Account</span>
            </TabsTrigger>
            <TabsTrigger className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2" value="support">
              <Shield className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-[10px] md:text-sm">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent className="space-y-6" value="dashboard">
            <DashboardStats />
            <RecentOrders orders={orders} onView={handleViewOrder} />
          </TabsContent>

          {/* Orders */}
          <TabsContent className="space-y-6" value="orders">
            <OrderHistory orders={orders} />
          </TabsContent>

          {/* Wishlist */}
          <TabsContent className="space-y-6" value="wishlist">
            <WishlistGrid />
          </TabsContent>

          {/* Account */}
          <TabsContent className="space-y-6" value="account">
            <AccountForms />
          </TabsContent>

          {/* Support */}
          <TabsContent className="space-y-6" value="support">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Help Center</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Order & Shipping
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment & Billing
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Returns & Refunds
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                      id="message"
                      placeholder="Describe your issue..."
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
