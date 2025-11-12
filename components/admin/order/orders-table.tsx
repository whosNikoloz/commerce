"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Truck, Package, CheckCircle, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useDisclosure } from "@heroui/modal";

import OrderDetailsModal from "./view-order-dialog";

import { OrderDetail, OrderSummary, OrderStatus, PagedResult, UpdateOrderStatusModel } from "@/types/orderTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getAllOrders,
  getOrderByIdForAdmin as getOrderById,
  updateOrderStatus as updateOrderStatusApi,
  cancelOrder as cancelOrderApi,
} from "@/app/api/services/orderService";
import { toast } from "sonner";

const STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Paid,
  OrderStatus.Processing,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
  OrderStatus.Refunded,
];

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Pending: return <Clock className="h-4 w-4" />;
    case OrderStatus.Processing: return <RefreshCw className="h-4 w-4" />;
    case OrderStatus.Shipped: return <Truck className="h-4 w-4" />;
    case OrderStatus.Delivered: return <CheckCircle className="h-4 w-4" />;
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded: return <XCircle className="h-4 w-4" />;
    case OrderStatus.Paid: return <CheckCircle className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
}
function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Pending: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case OrderStatus.Processing:
    case OrderStatus.Shipped: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case OrderStatus.Delivered:
    case OrderStatus.Paid: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800";
  }
}
function statusKey(s: OrderStatus): string {
  return typeof s === "number" ? OrderStatus[s] : String(s);
}
function statusLabel(s: OrderStatus): string {
  return typeof s === "number" ? OrderStatus[s] : String(s);
}

export default function OrdersTable() {
  const isMobile = useIsMobile();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<PagedResult<OrderSummary>>({
    page: 1, pageSize: 10, total: 0, data: []
  });

  const [statusFilterKey, setStatusFilterKey] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "items" | "shipping">("details");

  const [updating, setUpdating] = useState(false);

  // list fetch
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllOrders(page, pageSize);

        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load orders");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [page, pageSize]);

  // detail fetch
  useEffect(() => {
    if (!openId || !isOpen) {
      setDetail(null);
      setDetailError(null);
      setActiveTab("details");

      return;
    }
    let alive = true;

    (async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const d = await getOrderById(openId);

        if (!alive) return;
        setDetail(d);
      } catch (e: any) {
        if (!alive) return;
        setDetailError(e?.message ?? "Failed to load order details");
      } finally {
        if (alive) setDetailLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [openId, isOpen]);

  const filtered = useMemo(() => {
    const byStatus = statusFilterKey === "all"
      ? data.data
      : data.data.filter(o => statusKey(o.status) === statusFilterKey);
    const q = searchTerm.trim().toLowerCase();

    if (!q) return byStatus;

    return byStatus.filter(o =>
      o.id.toLowerCase().includes(q) ||
      statusKey(o.status).toLowerCase().includes(q) ||
      o.date.toLowerCase().includes(q)
    );
  }, [data, statusFilterKey, searchTerm]);

  const stats = useMemo(() => {
    const count = (s: OrderStatus) => data.data.filter(o => o.status === s).length;
    const total = data.total;

    return {
      total,
      pending: count(OrderStatus.Pending),
      processing: count(OrderStatus.Processing),
      shipped: count(OrderStatus.Shipped),
      delivered: count(OrderStatus.Delivered),
    };
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  async function onUpdateStatus(
    orderId: string,
    newStatus: OrderStatus,
    description: string,
    trackingNumber: string,
    estimatedDelivery: string
  ) {
    const payload: UpdateOrderStatusModel = {
      orderId,
      status: newStatus,
      description,
      trackingNumber,
      estimatedDelivery,
    };

    try {
      await updateOrderStatusApi(payload);
      setData(prev => ({
        ...prev,
        data: prev.data.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      }));
      if (openId === orderId) {
        setDetail(d => (d ? { ...d, status: newStatus, trackingNumber, estimatedDelivery } : d));
      }
      toast.success(`${orderId} order status updated to ${statusLabel(newStatus)}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update status");
    }
  }

  async function onCancel(orderId: string) {
    const reason = typeof window !== "undefined" ? (prompt("Cancellation reason?") ?? "") : "";

    setUpdating(true);
    try {
      await cancelOrderApi(orderId, "", reason);
      setData(prev => ({
        ...prev,
        data: prev.data.map(o => (o.id === orderId ? { ...o, status: OrderStatus.Cancelled } : o))
      }));
      if (openId === orderId) setDetail(d => (d ? { ...d, status: OrderStatus.Cancelled } : d));
      toast.success(`${orderId} order has been cancelled`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.processing}</div></CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.shipped}</div></CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.delivered}</div></CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage and track customer orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="w-64"
                placeholder="Search by ID / status / date…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="h-9 w-44 rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-slate-900 dark:text-slate-100"
                value={statusFilterKey}
                onChange={(e) => setStatusFilterKey(e.target.value)}
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(s => {
                  const key = statusKey(s);

                  return <option key={key} value={key}>{statusLabel(s)}</option>;
                })}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o.id} className="border-slate-200 dark:border-slate-700">
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{new Date(o.date).toLocaleString()}</TableCell>
                      <TableCell>{o.items}</TableCell>
                      <TableCell>
                        {o.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(o.status)}
                          <Badge className={getStatusColor(o.status)}>{statusLabel(o.status)}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25 text-white"
                            size="sm"
                            variant="outline"
                            onClick={() => { setOpenId(o.id); onOpen(); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell className="text-center text-muted-foreground py-10" colSpan={6}>
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {data.page} of {totalPages} • {data.total} total
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page <= 1 || loading}
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    disabled={page >= totalPages || loading}
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal
        activeTab={activeTab}
        detail={detail}
        detailError={detailError}
        detailLoading={detailLoading}
        isMobile={isMobile}
        open={isOpen}
        setActiveTab={setActiveTab}
        updating={updating}
        onCancel={onCancel}
        onClose={() => { onClose(); setOpenId(null); }}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
