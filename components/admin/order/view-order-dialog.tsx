"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import Image from "next/image";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Truck,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoBackButton } from "@/components/go-back-button";
import { OrderDetail, OrderStatus } from "@/types/orderTypes";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Pending:
      return <Clock className="h-4 w-4" />;
    case OrderStatus.Processing:
      return <RefreshCw className="h-4 w-4" />;
    case OrderStatus.Shipped:
      return <Truck className="h-4 w-4" />;
    case OrderStatus.Delivered:
      return <CheckCircle className="h-4 w-4" />;
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return <XCircle className="h-4 w-4" />;
    case OrderStatus.Paid:
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Pending:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ";
    case OrderStatus.Processing:
    case OrderStatus.Shipped:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case OrderStatus.Delivered:
    case OrderStatus.Paid:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function statusKey(s: OrderStatus): string {
  return typeof s === "number" ? OrderStatus[s] : String(s);
}
function statusLabel(s: OrderStatus): string {
  return typeof s === "number" ? OrderStatus[s] : String(s);
}
function keyToStatus(key: string): OrderStatus {
  const numeric = Number(key);

  if (!Number.isNaN(numeric) && (OrderStatus as any)[numeric] !== undefined)
    return numeric as OrderStatus;
  const fromKey = (OrderStatus as any)[key];

  if (fromKey !== undefined) return fromKey as OrderStatus;
  const found = (Object.values(OrderStatus) as unknown[]).find(
    (v) => String(v) === key
  );

  return (found ?? key) as OrderStatus;
}

function fullName(u?: OrderDetail["user"] | null) {
  if (!u) return "-";
  const f = (u.firstName || "").trim();
  const l = (u.lastName || "").trim();

  return (f || l) ? `${f}${f && l ? " " : ""}${l}` : (u.userName || "-");
}
function safe(v?: string | null) {
  return (v ?? "").trim() || "-";
}

function currencyFmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
function parseDateSafe(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);

  return isNaN(d.getTime()) ? null : d;
}
function formatDateTimeLocal(iso?: string | null) {
  const d = parseDateSafe(iso);

  return d ? d.toLocaleString() : "-";
}
function formatDateLocal(iso?: string | null) {
  const d = parseDateSafe(iso);

  return d ? d.toLocaleDateString() : "-";
}
function normalizeStatus(s: OrderStatus | string): OrderStatus {
  if (typeof s !== "string") return s;
  const byKey = (OrderStatus as any)[s];

  if (byKey !== undefined) return byKey as OrderStatus;
  const found = (Object.values(OrderStatus) as unknown[]).find(
    (v) => String(v) === s
  );

  return (found ?? s) as OrderStatus;
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------

type TabKey = "details" | "items" | "shipping";

type Props = {
  open: boolean;
  isMobile: boolean;
  detail: OrderDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  updating: boolean;
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    newStatus: OrderStatus,
    description: string,
    trackingNumber: string,
    estimatedDelivery: string
  ) => Promise<void> | void;
  onCancel: (orderId: string) => Promise<void> | void;
};

const STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Paid,
  OrderStatus.Processing,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
  OrderStatus.Refunded,
];

export default function OrderDetailsModal({
  open,
  isMobile,
  detail,
  detailLoading,
  detailError,
  updating,
  onClose,
  onUpdateStatus,
}: Props) {
  // ---------------- memoized order ----------------
  const normalizedDetail = useMemo(
    () =>
      detail
        ? { ...detail, status: normalizeStatus(detail.status) as OrderStatus }
        : null,
    [detail]
  );

  // ---------------- quick model ----------------
  const [quickModel, setQuickModel] = useState({
    orderId: "",
    status: null as OrderStatus | null,
    description: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });
  const lastInitRef = useRef("");

  useEffect(() => {
    if (!open || !normalizedDetail) return;
    const key =
      normalizedDetail.id +
      "|" +
      normalizedDetail.status +
      "|" +
      (normalizedDetail.trackingNumber ?? "") +
      "|" +
      (normalizedDetail.estimatedDelivery ?? "");

    if (lastInitRef.current === key) return;

    const d = normalizedDetail.estimatedDelivery
      ? new Date(normalizedDetail.estimatedDelivery)
      : null;

    setQuickModel({
      orderId: normalizedDetail.id,
      status: normalizeStatus(normalizedDetail.status),
      description: "",
      trackingNumber: normalizedDetail.trackingNumber ?? "",
      estimatedDelivery: d
        ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10)
        : "",
    });
    lastInitRef.current = key;
  }, [
    open,
    normalizedDetail?.id,
    normalizedDetail?.status,
    normalizedDetail?.trackingNumber,
    normalizedDetail?.estimatedDelivery,
  ]);

  const itemsSubtotal = useMemo(
    () =>
      normalizedDetail
        ? normalizedDetail.orderItems.reduce(
            (s, it) => s + it.price * it.quantity,
            0
          )
        : 0,
    [normalizedDetail]
  );
  const totalUnits = useMemo(
    () =>
      normalizedDetail
        ? normalizedDetail.orderItems.reduce((s, it) => s + it.quantity, 0)
        : 0,
    [normalizedDetail]
  );

  const statusId = useId();
  const trackingId = useId();
  const etdId = useId();
  const descId = useId();

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  return (
    <Modal
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-lg",
        base: "rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-2xl",
      }}
      hideCloseButton={isMobile}
      isOpen={open}
      placement="center"
      size={isMobile ? "full" : "4xl"}
      onClose={onClose}
      onOpenChange={(next) => { if (!next) onClose(); }}
    >
      <ModalContent key={normalizedDetail?.id ?? "none"}>
        {() => (
          <>
            <ModalHeader className="flex justify-between items-center ">
              <div className="flex items-center gap-2 ">
                {isMobile && <GoBackButton onClick={onClose} />}
                <h2 className="font-heading text-xl font-bold">Order Details</h2>
              </div>
              {normalizedDetail && (
                <Badge className={getStatusColor(normalizedDetail.status)}>
                  {getStatusIcon(normalizedDetail.status)}
                  <span className="font-primary ml-1">{statusLabel(normalizedDetail.status)}</span>
                </Badge>
              )}
            </ModalHeader>

            <ModalBody className="overflow-y-auto max-h-[80vh] px-5 py-4">
              {detailLoading && (
                <div className="py-6 text-center text-muted-foreground">
                  Loading…
                </div>
              )}
              {detailError && (
                <div className="text-red-600 font-medium">{detailError}</div>
              )}

              {normalizedDetail && (
                <div className="space-y-5">
                  {/* --------- ORDER INFO --------- */}
                  <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                    <h3 className="font-heading font-bold text-lg mb-2">Order Information</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>Date: {formatDateTimeLocal(normalizedDetail.date)}</div>
                      <div>
                        Total:{" "}
                        {currencyFmt(
                          normalizedDetail.total,
                          normalizedDetail.currency
                        )}
                      </div>
                      <div>Lines: {normalizedDetail.items}</div>
                      <div>Units: {totalUnits}</div>
                      <div className="col-span-2">
                        Subtotal:{" "}
                        {currencyFmt(itemsSubtotal, normalizedDetail.currency)}
                      </div>
                    </div>
                  </div>

                  {/* --------- CUSTOMER --------- */}
                  <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                    <h3 className="font-heading font-bold text-lg mb-2">Customer</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <div className="text-slate-500">Name</div>
                        <div className="font-medium">{fullName(normalizedDetail?.user)}</div>
                      </div>

                      <div>
                        <div className="text-slate-500">Username</div>
                        <div className="font-medium">{safe(normalizedDetail?.user?.userName)}</div>
                      </div>

                      <div>
                        <div className="text-slate-500">Email</div>
                        {normalizedDetail?.user?.email ? (
                          <a className="font-primary font-medium text-blue-600 hover:underline"
                            href={`mailto:${normalizedDetail.user.email}`}
                          >
                            {normalizedDetail.user.email}
                          </a>
                        ) : (
                          <div className="font-medium">-</div>
                        )}
                      </div>

                      <div>
                        <div className="text-slate-500">Phone</div>
                        {normalizedDetail?.user?.phoneNumber ? (
                          <a className="font-primary font-medium text-blue-600 hover:underline"
                            href={`tel:${normalizedDetail.user.phoneNumber}`}
                          >
                            {normalizedDetail.user.phoneNumber}
                          </a>
                        ) : (
                          <div className="font-medium">-</div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <div className="text-slate-500">User ID</div>
                        <div className="font-mono text-xs break-all">
                          {safe(normalizedDetail?.user?.id)}
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* --------- QUICK UPDATE --------- */}
                  <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                    <h3 className="font-heading font-bold text-lg mb-3">Quick Update</h3>

                    <label className="font-primary text-xs" htmlFor={statusId}>
                      Status
                    </label>
                    <select
                      className="w-full border rounded-md px-2 py-1 text-sm mb-2"
                      id={statusId}
                      value={quickModel.status !== null ? statusKey(quickModel.status) : ""}
                      onChange={(e) =>
                        setQuickModel((m) => ({
                          ...m,
                          status: keyToStatus(e.target.value),
                        }))
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={statusKey(s)}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>

                    <label className="font-primary text-xs" htmlFor={trackingId}>
                      Tracking Number
                    </label>
                    <input
                      className="w-full border rounded-md px-2 py-1 text-sm mb-2"
                      id={trackingId}
                      value={quickModel.trackingNumber}
                      onChange={(e) =>
                        setQuickModel((m) => ({
                          ...m,
                          trackingNumber: e.target.value,
                        }))
                      }
                    />

                    <label className="font-primary text-xs" htmlFor={etdId}>
                      Estimated Delivery
                    </label>
                    <input
                      className="w-full border rounded-md px-2 py-1 text-sm mb-2"
                      id={etdId}
                      type="date"
                      value={quickModel.estimatedDelivery}
                      onChange={(e) =>
                        setQuickModel((m) => ({
                          ...m,
                          estimatedDelivery: e.target.value,
                        }))
                      }
                    />

                    <label className="font-primary text-xs" htmlFor={descId}>
                      Description
                    </label>
                    <textarea
                      className="w-full border rounded-md px-2 py-1 text-sm mb-3 resize-y"
                      id={descId}
                      placeholder="Optional note..."
                      rows={3}
                      value={quickModel.description}
                      onChange={(e) =>
                        setQuickModel((m) => ({
                          ...m,
                          description: e.target.value,
                        }))
                      }
                    />

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={updating || !quickModel.status}
                        onClick={() => {
                          const isoEtd = quickModel.estimatedDelivery
                            ? new Date(quickModel.estimatedDelivery).toISOString()
                            : "";

                          onUpdateStatus(
                            quickModel.orderId,
                            quickModel.status!,
                            quickModel.description.trim(),
                            quickModel.trackingNumber.trim(),
                            isoEtd
                          );
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => {
                          if (!normalizedDetail) return;
                          const d = normalizedDetail.estimatedDelivery
                            ? new Date(normalizedDetail.estimatedDelivery)
                            : null;

                          setQuickModel({
                            orderId: normalizedDetail.id,
                            status: normalizeStatus(normalizedDetail.status),
                            description: "",
                            trackingNumber:
                              normalizedDetail.trackingNumber ?? "",
                            estimatedDelivery: d
                              ? new Date(
                                  d.getTime() - d.getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 10)
                              : "",
                          });
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  

                  {/* --------- PRODUCTS --------- */}
                  <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                    <h3 className="font-heading font-bold text-lg mb-3">Products</h3>
                    {normalizedDetail.orderItems.map((it) => (
                      <div
                        key={it.id}
                        className="flex gap-3 border-b border-slate-200 dark:border-slate-700 py-2 last:border-none"
                      >
                        <div className="relative w-16 h-16">
                          <Image
                            fill
                            alt={it.name}
                            className="object-cover rounded-md border border-slate-200 dark:border-slate-700"
                            src={it.image || "/placeholder.png"}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-slate-500">
                            SKU: {it.sku || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            Qty: {it.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {currencyFmt(it.price * it.quantity, normalizedDetail.currency)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Unit: {currencyFmt(it.price, normalizedDetail.currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* --------- TRACKING HISTORY --------- */}
                  {normalizedDetail.trackingSteps?.length > 0 && (
                    <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                      <h3 className="font-heading font-bold text-lg mb-3">Tracking History</h3>
                      <div className="space-y-2">
                        {normalizedDetail.trackingSteps.map((t, i) => {
                          // Convert numeric status to readable label
                          const statusValue = typeof t.status === 'string' && !isNaN(Number(t.status))
                            ? Number(t.status) as OrderStatus
                            : t.status;
                          const readableStatus = typeof statusValue === 'number'
                            ? OrderStatus[statusValue]
                            : String(statusValue);

                          return (
                            <div key={i} className="flex gap-3 items-start">
                              <div
                                className={`w-2 h-2 mt-1 rounded-full ${
                                  t.completed ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              <div>
                                <div className="font-medium text-sm">{readableStatus}</div>
                                {t.description && (
                                  <div className="text-xs text-slate-500">
                                    {t.description}
                                  </div>
                                )}
                                <div className="text-xs text-slate-400">
                                  {formatDateTimeLocal(t.date)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* --------- SHIPPING --------- */}
                  <div className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">
                    <h3 className="font-heading font-bold text-lg mb-3">Shipping</h3>
                    <p className="font-primary text-sm whitespace-pre-wrap mb-2">
                      {normalizedDetail.shippingAddress}
                    </p>
                    {normalizedDetail.trackingNumber && (
                      <p className="font-primary text-sm">
                        <strong>Tracking:</strong>{" "}
                        {normalizedDetail.trackingNumber}
                      </p>
                    )}
                    {normalizedDetail.estimatedDelivery && (
                      <p className="font-primary text-sm">
                        <strong>Estimated Delivery:</strong>{" "}
                        {formatDateLocal(normalizedDetail.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
