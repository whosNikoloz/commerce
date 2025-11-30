"use client"

import type React from "react"
import type { OrderDetail, OrderItem, OrderSummary, TrackingStep, WishlistItem } from "@/types/orderTypes"


import { useEffect, useMemo, useState } from "react"
import {
  UserIcon,
  Package,
  Heart,
  Settings,
  Shield,
  CreditCard,
  Truck,
  Star,
  Eye,
  Trash2,
  ShoppingCart,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPinIcon,
  LogOut,
  TrendingUp,
  Award,
  Bell,
  X,
  CheckCircle2,
} from "lucide-react"

import { OrderStatus } from "@/types/orderTypes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  getMyOrders,
  getWishlist,
  getOrderByIdForClient as getOrderById,
  getTracking,
  downloadInvoiceFile,
  removeFromWishlist,
} from "@/app/api/services/orderService"
import { useUser } from "@/app/context/userContext"

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ")
}
const currency = "GEL"
const fmtMoney = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n ?? 0)

function getStatusName(status: OrderStatus): string {
  return OrderStatus[status] || "Unknown";
}

function NotificationArea({
  notifications,
  onDismiss,
}: {
  notifications: Record<string, string>
  onDismiss: (id: string) => void
}) {
  if (!notifications || Object.keys(notifications).length === 0) return null

  return (
    <div className="mb-6 space-y-3">
      {Object.entries(notifications).map(([orderId, message]) => (
        <div
          key={orderId}
          className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-primary text-sm font-medium text-emerald-900 dark:text-emerald-100">{message}</span>
          </div>
          <Button
            aria-label="Dismiss notification"
            className="h-8 w-8 p-0 rounded-lg"
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(orderId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  desc,
  cta,
}: {
  icon?: React.ReactNode
  title: string
  desc?: string
  cta?: React.ReactNode
}) {
  return (
    <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/30">
      <div className="mx-auto mb-4 h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
      {desc && <p className="font-primary text-sm text-muted-foreground mb-4 max-w-md mx-auto">{desc}</p>}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  )
}

export default function UserPanel() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, isInitializing: _isInitializing, logout } = useUser()
  const [activeTab, setActiveTab] = useState("dashboard")

  // data state
  const [paged, setPaged] = useState<{ page: number; pageSize: number; total: number }>({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  const [orders, setOrders] = useState<(OrderSummary | OrderDetail)[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // ui state
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [errorOrders, setErrorOrders] = useState<string | null>(null)
  const [errorWishlist, setErrorWishlist] = useState<string | null>(null)

  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [orderActions, setOrderActions] = useState<Record<string, boolean>>({})
  const [notifications, setNotifications] = useState<Record<string, string>>({})

  // load orders
  useEffect(() => {
    let mounted = true

      ; (async () => {
        try {
          setLoadingOrders(true)
          setErrorOrders(null)
          const res = await getMyOrders(paged.page, paged.pageSize)

          if (!mounted) return
          setPaged((p) => ({ ...p, total: res.total }))
          setOrders(res.data)
        } catch (e: any) {
          if (!mounted) return
          setErrorOrders(e?.message ?? "Failed to load orders")
        } finally {
          mounted && setLoadingOrders(false)
        }
      })()

    return () => {
      mounted = false
    }
  }, [paged.page, paged.pageSize])

  // load wishlist
  useEffect(() => {
    let mounted = true

      ; (async () => {
        try {
          setLoadingWishlist(true)
          setErrorWishlist(null)
          const items = await getWishlist()

          if (!mounted) return
          setWishlist(items)
        } catch (e: any) {
          if (!mounted) return
          setErrorWishlist(e?.message ?? "Failed to load wishlist")
        } finally {
          mounted && setLoadingWishlist(false)
        }
      })()

    return () => {
      mounted = false
    }
  }, [])

  const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + ((o as OrderDetail)?.total ?? 0), 0), [orders])

  const toggleOrderExpansion = (id: string) =>
    setExpandedOrders((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  // ensure details fetched on first open
  const ensureOrderDetailLoaded = async (orderId: string) => {
    const found = orders.find((o) => o.id === orderId)
    const isDetail = !!(found as OrderDetail)?.orderItems

    if (found && !isDetail) {
      try {
        setOrderActions((a) => ({ ...a, [`load-${orderId}`]: true }))
        const detail = await getOrderById(orderId)

        setOrders((prev) => prev.map((o) => (o.id === orderId ? detail : o)))

        return true
      } catch (err: any) {
        // Surface the error to the user instead of swallowing the click
        setNotifications((p) => ({
          ...p,
          [orderId]: `Failed to load order details: ${String(err?.message || err)}`,
        }))

        return false
      } finally {
        setOrderActions((a) => ({ ...a, [`load-${orderId}`]: false }))
      }
    }

    return true
  }

  const handleTrackPackage = async (orderId: string, trackingNumber?: string | null) => {
    if (!trackingNumber) return

    setOrderActions((p) => ({ ...p, [`track-${orderId}`]: true }))
    try {
      const steps = await getTracking(trackingNumber)

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? ({ ...(o as OrderDetail), trackingSteps: steps } as OrderDetail) : o)),
      )
      setNotifications((p) => ({
        ...p,
        [orderId]: `Tracking updated for ${trackingNumber}`,
      }))
    } catch (e: any) {
      setNotifications((p) => ({
        ...p,
        [orderId]: `Tracking failed: ${String(e?.message || e)}`,
      }))
    } finally {
      setOrderActions((p) => ({ ...p, [`track-${orderId}`]: false }))
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: true }))
    try {
      const { blobUrl, fileName } = await downloadInvoiceFile(orderId)
      const a = document.createElement("a")

      a.href = blobUrl
      a.download = fileName
      a.click()
      setNotifications((p) => ({
        ...p,
        [orderId]: `Invoice downloaded for ${orderId}`,
      }))
      URL.revokeObjectURL(blobUrl)
    } catch (e: any) {
      setNotifications((p) => ({
        ...p,
        [orderId]: `Invoice failed: ${String(e?.message || e)}`,
      }))
    } finally {
      setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: false }))
    }
  }

  const handleLeaveReview = (orderId: string) =>
    setNotifications((p) => ({
      ...p,
      [orderId]: `Review form opened for ${orderId}`,
    }))

  const handleViewOrder = async (orderId: string) => {
    // First load the order details
    await ensureOrderDetailLoaded(orderId)
    // Switch to orders tab
    setActiveTab("orders")
    // Wait for tab transition to complete, then expand the order
    setTimeout(() => {
      // Ensure the order is not already expanded
      if (!expandedOrders.includes(orderId)) {
        toggleOrderExpansion(orderId)
      }
      // Scroll to the order element if possible
      setTimeout(() => {
        const element = document.querySelector(`[data-order-id="${orderId}"]`)

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }, 150)
  }

  const dismissNotification = (orderId: string) =>
    setNotifications((p) => {
      const n = { ...p }

      delete n[orderId]

      return n
    })

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
      setWishlist((prev) => prev.filter((item) => item.id !== productId))
      setNotifications((p) => ({
        ...p,
        [productId]: "Item removed from wishlist",
      }))
    } catch (e: any) {
      setNotifications((p) => ({
        ...p,
        [productId]: `Failed to remove: ${String(e?.message || e)}`,
      }))
    }
  }

  const DashboardStats = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paged.total}</div>
          <p className="font-primary text-xs text-muted-foreground mt-1">All time purchases</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmtMoney(totalSpent)}</div>
          <p className="font-primary text-xs text-muted-foreground mt-1">Lifetime spending</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wishlist.length}</div>
          <p className="font-primary text-xs text-muted-foreground mt-1">Saved for later</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">—</div>
          <p className="font-primary text-xs text-muted-foreground mt-1">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  )

  const RecentOrders = ({
    orders,
    onView,
  }: {
    orders: (OrderSummary | OrderDetail)[]
    onView: (id: string) => void
  }) => {
    if (loadingOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-primary text-sm text-muted-foreground">Loading your orders...</p>
            </div>
          </CardContent>
        </Card>
      )
    }
    if (errorOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-primary text-sm text-destructive">{errorOrders}</p>
          </CardContent>
        </Card>
      )
    }
    if (!orders.length) {
      return (
        <EmptyState
          desc="When you place an order, it will appear here."
          icon={<Package className="h-8 w-8" />}
          title="No orders yet"
        />
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-primary font-semibold text-sm truncate">{order.id}</p>
                    <p className="font-primary text-xs text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Badge
                    variant={
                      order.status === OrderStatus.Delivered ? "default" : order.status === OrderStatus.Shipped ? "secondary" : "outline"
                    }
                  >
                    {getStatusName(order.status)}
                  </Badge>
                  <p className="font-primary font-semibold text-sm">{fmtMoney((order as OrderDetail).total ?? 0)}</p>
                  <Button size="sm" variant="outline" onClick={() => onView(order.id)}>
                    <Eye className="h-4 w-4 sm:mr-2" />
                    <span className="font-primary hidden sm:inline">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const OrderHistory = ({ orders }: { orders: (OrderSummary | OrderDetail)[] }) => {
    if (loadingOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>All your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-primary text-sm text-muted-foreground">Loading your orders...</p>
            </div>
          </CardContent>
        </Card>
      )
    }
    if (errorOrders) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-primary text-sm text-destructive">{errorOrders}</p>
          </CardContent>
        </Card>
      )
    }
    if (!orders.length) {
      return (
        <EmptyState
          desc="You haven't placed any orders yet."
          icon={<Package className="h-8 w-8" />}
          title="No orders to show"
        />
      )
    }

    return (
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View and manage all your orders with detailed tracking</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={paged.page <= 1 || loadingOrders}
              size="sm"
              variant="outline"
              onClick={() => setPaged((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            >
              Prev
            </Button>
            <span className="font-primary text-sm text-muted-foreground whitespace-nowrap px-3">
              {paged.page} / {Math.max(1, Math.ceil(paged.total / paged.pageSize))}
            </span>
            <Button
              disabled={paged.page >= Math.ceil(paged.total / paged.pageSize) || loadingOrders}
              size="sm"
              variant="outline"
              onClick={() => setPaged((p) => ({ ...p, page: Math.min(p.page + 1, Math.ceil(p.total / p.pageSize)) }))}
            >
              Next
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => {
              const expanded = expandedOrders.includes(order.id)
              const isDetail = !!(order as OrderDetail).orderItems
              const detail = order as OrderDetail

              return (
                <Collapsible key={order.id} open={expanded}>
                  <div className="border rounded-lg overflow-hidden" data-order-id={order.id}>
                    <CollapsibleTrigger asChild>
                      <div
                        aria-expanded={expanded}
                        className={cx(
                          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                          expanded && "bg-muted/30",
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={async () => {
                          if (!isDetail) await ensureOrderDetailLoaded(order.id)
                          toggleOrderExpansion(order.id)
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            if (!isDetail) await ensureOrderDetailLoaded(order.id)
                            toggleOrderExpansion(order.id)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-primary font-semibold truncate">{order.id}</p>
                            <p className="font-primary text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                            <p className="font-primary text-sm text-muted-foreground">
                              {order.items} items •{" "}
                              <span className="font-primary font-medium">{fmtMoney((order as OrderDetail).total ?? 0)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <Badge
                            variant={
                              order.status === OrderStatus.Delivered
                                ? "default"
                                : order.status === OrderStatus.Shipped
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {getStatusName(order.status)}
                          </Badge>
                          {expanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      {isDetail ? (
                        <div className="px-4 pb-4 space-y-6 bg-muted/20">
                          <Separator />

                          {/* Items */}
                          <div>
                            <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Order Items
                            </h4>
                            <div className="space-y-2">
                              {detail.orderItems.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-background border rounded-lg">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    alt={item.name}
                                    className="h-16 w-16 object-cover rounded-md"
                                    src={item.image || "/placeholder.png"}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-primary font-medium text-sm truncate">{item.name}</p>
                                    <p className="font-primary text-xs text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-primary font-semibold text-sm">{fmtMoney(item.price)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping */}
                          <div>
                            <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Shipping Information
                            </h4>
                            <div className="bg-background border rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span className="font-primary text-sm">{detail.shippingAddress}</span>
                              </div>
                              {!!detail.trackingNumber && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="font-primary text-sm">
                                    Tracking: <span className="font-primary font-mono font-medium">{detail.trackingNumber}</span>
                                  </span>
                                </div>
                              )}
                              {!!detail.estimatedDelivery && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="font-primary text-sm">
                                    Expected: <span className="font-primary font-medium">{detail.estimatedDelivery}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tracking */}
                          <div>
                            <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              Order Tracking
                            </h4>
                            {detail.trackingSteps.length ? (
                              <div className="space-y-4 bg-background border rounded-lg p-4">
                                {detail.trackingSteps.map((step: TrackingStep, i: number) => {
                                  // Convert numeric status to readable label
                                  const statusValue = typeof step.status === 'string' && !isNaN(Number(step.status))
                                    ? Number(step.status) as OrderStatus
                                    : step.status;
                                  const readableStatus = typeof statusValue === 'number'
                                    ? OrderStatus[statusValue]
                                    : String(statusValue);

                                  return (
                                    <div key={i} className="flex items-start gap-4">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={cx(
                                            "h-5 w-5 rounded-full transition-colors",
                                            step.completed ? "bg-primary" : "bg-muted",
                                          )}
                                        >
                                          {step.completed && <CheckCircle2 className="h-5 w-5 text-primary-foreground" />}
                                        </div>
                                        {i < detail.trackingSteps.length - 1 && (
                                          <div
                                            className={cx("w-0.5 h-12 mt-1", step.completed ? "bg-primary" : "bg-muted")}
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-2">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                          <p
                                            className={cx(
                                              "font-medium text-sm",
                                              !step.completed && "text-muted-foreground",
                                            )}
                                          >
                                            {readableStatus}
                                          </p>
                                          <p className="font-primary text-xs text-muted-foreground">
                                            {new Date(step.date).toLocaleString()}
                                          </p>
                                        </div>
                                        {step.description && (
                                          <p className="font-primary text-xs text-muted-foreground mt-1">{step.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="font-primary text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                                No tracking updates yet.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              className="flex-1 bg-transparent"
                              disabled={orderActions[`track-${detail.id}`] === true || !detail.trackingNumber}
                              size="sm"
                              variant="outline"
                              onClick={() => handleTrackPackage(detail.id, detail.trackingNumber)}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              {orderActions[`track-${detail.id}`] ? "Tracking..." : "Track Package"}
                            </Button>
                            <Button
                              className="flex-1 bg-transparent"
                              disabled={orderActions[`invoice-${detail.id}`] === true}
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(detail.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {orderActions[`invoice-${detail.id}`] ? "Downloading..." : "Invoice"}
                            </Button>
                            {detail.status === OrderStatus.Delivered && (
                              <Button className="flex-1" size="sm" onClick={() => handleLeaveReview(detail.id)}>
                                <Star className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 pb-4 text-sm text-muted-foreground bg-muted/20">
                          {orderActions[`load-${order.id}`] ? (
                            <div className="flex items-center gap-3 py-3">
                              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Loading details…
                            </div>
                          ) : (
                            <p className="font-primary py-3">Click to load order details</p>
                          )}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const WishlistGrid = () => {
    if (loadingWishlist) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>Items you&apos;ve saved for later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-primary text-sm text-muted-foreground">Loading your wishlist...</p>
            </div>
          </CardContent>
        </Card>
      )
    }
    if (errorWishlist) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-primary text-sm text-destructive">{errorWishlist}</p>
          </CardContent>
        </Card>
      )
    }
    if (!wishlist.length) {
      return (
        <EmptyState
          cta={<Button>Browse Products</Button>}
          desc="Save products to compare and buy later."
          icon={<Heart className="h-8 w-8" />}
          title="Your wishlist is empty"
        />
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Items you&apos;ve saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={item.name} className="w-full h-48 object-cover" src={item.image || "/placeholder.png"} />
                  <div className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="h-4 w-4 text-destructive fill-destructive" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-heading font-semibold text-sm truncate">{item.name}</h3>
                    <p className="font-primary text-lg font-bold mt-1">{fmtMoney(item.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemoveFromWishlist(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const AccountForms = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Personal Information</CardTitle>
          </div>
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
          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Manage your password and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" placeholder="••••••••" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" placeholder="••••••••" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" placeholder="••••••••" type="password" />
          </div>
          <Button className="w-full">Update Password</Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Payment Methods</CardTitle>
          </div>
          <CardDescription>Manage your saved payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Visa" className="h-6 w-auto" src="/visa.svg" />
              <p className="font-primary font-medium">**** **** **** 1234</p>
              <Badge variant="secondary">Primary</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="destructive">
                Remove
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Mastercard" className="h-6 w-auto" src="/mastercard.svg" />
              <p className="font-primary font-medium">**** **** **** 5678</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="destructive">
                Remove
              </Button>
            </div>
          </div>
          <Button className="w-full bg-transparent" variant="outline">
            Add New Card
          </Button>
        </CardContent>
      </Card>
    </div>
  )

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
            <p className="font-primary text-center text-muted-foreground">
              You need to be logged in to view your orders, wishlist, and account settings.
            </p>
            <p className="font-primary text-center text-sm text-muted-foreground">
              Click the profile icon in the navigation to log in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl min-h-dvh">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2">
            <AvatarImage alt={user?.userName} src={"/avatars/default.png"} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
              {user?.userName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">Welcome back, {user?.userName || "User"}!</h1>
            <p className="font-primary text-sm text-muted-foreground">Manage your orders and account settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <NotificationArea notifications={notifications} onDismiss={dismissNotification} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">
            <UserIcon className="h-4 w-4 mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="h-4 w-4 mr-2" /> Wishlist
          </TabsTrigger>
          <TabsTrigger value="account">
            <Settings className="h-4 w-4 mr-2" /> Account
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardStats />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentOrders orders={orders} onView={handleViewOrder} />
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-primary font-medium">Password changed successfully</p>
                        <span className="font-primary text-xs text-muted-foreground">1 hour ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-primary font-medium">Order #12345 shipped</p>
                        <span className="font-primary text-xs text-muted-foreground">3 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-primary font-medium">Item added to wishlist</p>
                        <span className="font-primary text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-primary font-medium">New notification received</p>
                        <span className="font-primary text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <OrderHistory orders={orders} />
        </TabsContent>
        <TabsContent value="wishlist">
          <WishlistGrid />
        </TabsContent>
        <TabsContent value="account">
          <AccountForms />
        </TabsContent>
      </Tabs>
    </div>
  )
}
