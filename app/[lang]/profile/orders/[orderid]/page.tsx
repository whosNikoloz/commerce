"use client";

import React, { useEffect, useState } from "react";
import {
    Package,
    ArrowLeft,
    Truck,
    MapPin,
    Clock,
    CheckCircle2,
    Download,
    Star,
    ShoppingCart,
    Receipt
} from "lucide-react";
import {
    getOrderByIdForClient as getOrderById,
    getTracking,
    downloadInvoiceFile
} from "@/app/api/services/orderService";
import { OrderDetail, OrderItem, TrackingStep, OrderStatus } from "@/types/orderTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useDictionary } from "@/app/context/dictionary-provider";
import { defaultLocale } from "@/i18n.config";

export default function OrderDetailPage() {
    const { lang, orderid } = useParams();
    const dict = useDictionary();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    const getLink = (path: string) => lang === defaultLocale ? path : `/${lang}${path}`;

    const fmtMoney = (n: number) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "GEL"
        }).format(n ?? 0).replace("GEL", "₾");
    };

    function getStatusName(status: OrderStatus): string {
        const statuses = dict?.profile?.status;
        if (!statuses) return OrderStatus[status] || "Unknown";

        switch (status) {
            case OrderStatus.Delivered: return statuses.Delivered;
            case OrderStatus.Shipped: return statuses.Shipped;
            case OrderStatus.Processing: return statuses.Processing;
            case OrderStatus.Pending: return statuses.Pending;
            case OrderStatus.Paid: return statuses.Paid;
            default: return statuses.Unknown;
        }
    }

    useEffect(() => {
        if (!orderid) return;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const detail = await getOrderById(orderid as string);
                setOrder(detail);
            } catch (err: any) {
                setError(err?.message || "Failed to load order details");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderid]);

    const handleDownloadInvoice = async () => {
        if (!order) return;
        try {
            setDownloadingInvoice(true);
            const { blobUrl, fileName } = await downloadInvoiceFile(order.id);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Failed to download invoice", err);
        } finally {
            setDownloadingInvoice(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
                    <Package className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold dark:text-white">
                    {dict?.profile?.orderDetails?.notFound || "Order not found"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {error || (dict?.profile?.orderDetails?.notFoundDesc || "The requested order could not be loaded.")}
                </p>
                <Button variant="outline" className="mt-4 text-xs font-bold h-9 px-4 rounded-xl" onClick={() => router.back()}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> {dict?.profile?.orderDetails?.backToOrders || "Back to Orders"}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-9 w-9 border-border dark:border-white/10 hover:bg-brand-primary hover:text-white transition-all"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-black dark:text-white tracking-tight">
                                {dict?.profile?.orderDetails?.title || "Order"} #{order.id.slice(0, 12)}
                            </h1>
                            <Badge
                                className={cn(
                                    "uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border-none text-[10px]",
                                    order.status === OrderStatus.Delivered && "bg-emerald-500 text-white",
                                    order.status === OrderStatus.Shipped && "bg-blue-500 text-white",
                                    order.status === OrderStatus.Processing && "bg-amber-500 text-white",
                                    order.status === OrderStatus.Pending && "bg-muted text-muted-foreground",
                                    order.status === OrderStatus.Paid && "bg-brand-primary text-white"
                                )}
                            >
                                {getStatusName(order.status)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            {dict?.profile?.orders?.placedOn || "Placed on"} {new Date(order.date).toLocaleDateString(lang as string || undefined, { dateStyle: 'medium' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-9 px-4 border-border dark:border-white/10 text-xs font-bold" onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
                        <Download className="h-3.5 w-3.5 mr-1.5" /> {downloadingInvoice ? (dict?.profile?.orderDetails?.generating || "...") : (dict?.profile?.orderDetails?.invoice || "Invoice")}
                    </Button>
                    {order.status === OrderStatus.Delivered && (
                        <Button className="rounded-xl h-9 px-4 text-xs font-bold bg-brand-primary hover:bg-brand-primary/90 text-white">
                            <Star className="h-3.5 w-3.5 mr-1.5" /> {dict?.profile?.orderDetails?.review || "Review"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                {/* Main Content - Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-border/60 dark:border-white/10 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-brand-primary" />
                            <h3 className="text-sm font-bold dark:text-white">
                                {dict?.profile?.orderDetails?.itemsTitle || "Order Items"} ({order.orderItems?.length || 0})
                            </h3>
                        </div>
                        <div className="divide-y divide-border/60 dark:divide-white/10">
                            {order.orderItems?.map((item: OrderItem, idx: number) => (
                                <Link key={idx} href={item.productId ? getLink(`/product/${item.productId}`) : "#"} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-brand-surface dark:bg-white/5 shrink-0 border border-border/60 dark:border-white/10">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                            src={item.image || "/placeholder.png"}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate dark:text-white">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {dict?.profile?.orderDetails?.quantity || "Qty"}: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-bold text-sm dark:text-white">{fmtMoney(item.price)}</p>
                                </Link>
                            ))}
                        </div>
                        <div className="px-5 py-3 bg-black/[0.02] dark:bg-white/5 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{dict?.profile?.orderDetails?.subtotal || "Subtotal"}</span>
                                <span className="dark:text-white">{fmtMoney(order.total || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{dict?.profile?.orderDetails?.shipping || "Shipping"}</span>
                                <span className="text-emerald-500 font-semibold">{dict?.profile?.orderDetails?.complementary || "Free"}</span>
                            </div>
                            <div className="h-px bg-border/60 dark:bg-white/10" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold dark:text-white">{dict?.profile?.orders?.totalAmount || "Total"}</span>
                                <span className="font-black text-lg text-brand-primary">{fmtMoney(order.total || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Shipping & Tracking */}
                <div className="space-y-5">
                    {/* Shipping Info */}
                    <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-brand-primary" />
                            <h3 className="text-sm font-bold dark:text-white">
                                {dict?.profile?.orderDetails?.deliveryDetails || "Delivery Details"}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{dict?.profile?.orderDetails?.destination || "Destination"}</p>
                                    <p className="text-sm font-medium dark:text-white">{order.shippingAddress || "No address provided"}</p>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="flex gap-3">
                                    <Receipt className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">{dict?.profile?.orderDetails?.trackingId || "Tracking ID"}</p>
                                        <p className="text-sm font-semibold text-brand-primary font-mono select-all">{order.trackingNumber}</p>
                                    </div>
                                </div>
                            )}

                            {order.estimatedDelivery && (
                                <div className="flex gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">{dict?.profile?.orderDetails?.estimatedArrival || "Estimated Arrival"}</p>
                                        <p className="text-sm font-medium dark:text-white">{order.estimatedDelivery}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-brand-primary" />
                            <h3 className="text-sm font-bold dark:text-white">
                                {dict?.profile?.orderDetails?.timeline || "Timeline"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {order.trackingSteps && order.trackingSteps.length > 0 ? (
                                order.trackingSteps.map((step, i) => (
                                    <div key={i} className="flex gap-3 relative">
                                        {i < order.trackingSteps.length - 1 && (
                                            <div className={cn(
                                                "absolute left-[9px] top-6 w-[2px] h-[calc(100%-4px)]",
                                                step.completed ? "bg-brand-primary" : "bg-muted"
                                            )} />
                                        )}
                                        <div className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5",
                                            step.completed ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            <CheckCircle2 className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-sm font-semibold",
                                                step.completed ? "dark:text-white text-brand-primary" : "text-muted-foreground"
                                            )}>
                                                {typeof step.status === 'number' ? getStatusName(step.status) : step.status}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(step.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                            {step.description && (
                                                <p className="text-xs text-muted-foreground italic mt-1 bg-black/[0.03] dark:bg-white/5 p-2 rounded-lg">{step.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic text-center py-3">
                                    {dict?.profile?.orderDetails?.trackingPending || "Tracking information is pending."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
