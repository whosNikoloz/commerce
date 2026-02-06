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

export default function OrderDetailPage() {
    const { lang, orderid } = useParams();
    const dict = useDictionary();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                    <Package className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">
                    {dict?.profile?.orderDetails?.notFound || "Order not found"}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {error || (dict?.profile?.orderDetails?.notFoundDesc || "The requested order could not be loaded.")}
                </p>
                <Button variant="outline" className="mt-6 font-black uppercase tracking-widest text-xs h-12 px-8 rounded-2xl" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> {dict?.profile?.orderDetails?.backToOrders || "Back to Orders"}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-2xl h-12 w-12 sm:h-14 sm:w-14 border-border dark:border-white/10 bg-white/40 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-brand-primary hover:text-white transition-all duration-500"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black dark:text-white tracking-tighter uppercase">
                                {dict?.profile?.orderDetails?.title || "Order"} #{order.id.slice(0, 12)}
                            </h1>
                            <Badge
                                className={cn(
                                    "uppercase font-black tracking-widest px-4 py-1 rounded-full border-none shadow-sm text-[10px]",
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
                        <p className="text-muted-foreground text-sm mt-1 font-bold">
                            {dict?.profile?.orders?.placedOn || "Placed on"} {new Date(order.date).toLocaleDateString(lang as string || undefined, { dateStyle: 'full' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 border-border dark:border-white/10 font-bold tracking-tight bg-white/40 backdrop-blur-md" onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
                        <Download className="h-4 w-4 mr-2" /> {downloadingInvoice ? (dict?.profile?.orderDetails?.generating || "Generating...") : (dict?.profile?.orderDetails?.invoice || "Invoice")}
                    </Button>
                    {order.status === OrderStatus.Delivered && (
                        <Button className="rounded-2xl h-12 px-6 font-bold tracking-tight shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white">
                            <Star className="h-4 w-4 mr-2" /> {dict?.profile?.orderDetails?.review || "Review"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content - Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                        <div className="p-8 border-b border-border dark:border-white/10 flex items-center justify-between bg-white/20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="h-5 w-5 text-brand-primary" />
                                </div>
                                <h3 className="text-xl font-black dark:text-white tracking-tight">
                                    {dict?.profile?.orderDetails?.itemsTitle || "Order Items"} ({order.orderItems?.length || 0})
                                </h3>
                            </div>
                        </div>
                        <div className="divide-y divide-border dark:divide-white/10">
                            {order.orderItems?.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="p-8 flex items-center gap-6 group hover:bg-white/40 transition-colors">
                                    <div className="h-24 w-24 rounded-3xl overflow-hidden bg-brand-surface dark:bg-white/5 shrink-0 border border-border dark:border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                            src={item.image || "/placeholder.png"}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-lg truncate dark:text-white tracking-tight">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground mt-1 font-bold">
                                            {dict?.profile?.orderDetails?.quantity || "Quantity"}: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl dark:text-white tracking-tight">{fmtMoney(item.price)}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                                            {dict?.profile?.orderDetails?.unitPrice || "Unit Price"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-black/5 dark:bg-white/5 space-y-4">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-muted-foreground uppercase tracking-widest">
                                    {dict?.profile?.orderDetails?.subtotal || "Subtotal"}
                                </span>
                                <span className="dark:text-white">{fmtMoney(order.total || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-muted-foreground uppercase tracking-widest">
                                    {dict?.profile?.orderDetails?.shipping || "Shipping"}
                                </span>
                                <span className="text-emerald-500 font-black">
                                    {dict?.profile?.orderDetails?.complementary || "Complementary"}
                                </span>
                            </div>
                            <div className="h-px bg-border dark:bg-white/10 my-4" />
                            <div className="flex justify-between items-center">
                                <span className="font-black text-xl dark:text-white tracking-tight uppercase">
                                    {dict?.profile?.orders?.totalAmount || "Total Amount"}
                                </span>
                                <span className="font-black text-3xl text-brand-primary tracking-tighter">{fmtMoney(order.total || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Shipping & Tracking */}
                <div className="space-y-8">
                    {/* Shipping Info */}
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-black/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-black dark:text-white tracking-tight">
                                {dict?.profile?.orderDetails?.deliveryDetails || "Delivery Details"}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                                        {dict?.profile?.orderDetails?.destination || "Destination"}
                                    </p>
                                    <p className="text-sm font-bold dark:text-white leading-relaxed">{order.shippingAddress || "No address provided"}</p>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <Receipt className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                                            {dict?.profile?.orderDetails?.trackingId || "Tracking ID"}
                                        </p>
                                        <p className="text-sm font-black text-brand-primary font-mono select-all bg-brand-primary/5 px-2 py-0.5 rounded-lg border border-brand-primary/10 inline-block">{order.trackingNumber}</p>
                                    </div>
                                </div>
                            )}

                            {order.estimatedDelivery && (
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                                            {dict?.profile?.orderDetails?.estimatedArrival || "Estimated Arrival"}
                                        </p>
                                        <p className="text-sm dark:text-white font-black">{order.estimatedDelivery}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-black/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-black dark:text-white tracking-tight">
                                {dict?.profile?.orderDetails?.timeline || "Timeline"}
                            </h3>
                        </div>

                        <div className="space-y-8">
                            {order.trackingSteps && order.trackingSteps.length > 0 ? (
                                order.trackingSteps.map((step, i) => (
                                    <div key={i} className="flex gap-5 relative">
                                        {i < order.trackingSteps.length - 1 && (
                                            <div className={cn(
                                                "absolute left-[13px] top-8 w-[2px] h-[calc(100%-12px)]",
                                                step.completed ? "bg-brand-primary" : "bg-muted"
                                            )} />
                                        )}
                                        <div className={cn(
                                            "h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                                            step.completed ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110" : "bg-muted text-muted-foreground"
                                        )}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1 pt-0.5">
                                            <p className={cn(
                                                "text-sm font-black tracking-tight",
                                                step.completed ? "dark:text-white text-brand-primary" : "text-muted-foreground"
                                            )}>
                                                {typeof step.status === 'number' ? getStatusName(step.status) : step.status}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                {new Date(step.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                            {step.description && (
                                                <p className="text-xs text-muted-foreground font-medium italic mt-2 bg-black/5 dark:bg-white/5 p-3 rounded-2xl leading-relaxed">{step.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="text-sm text-muted-foreground font-medium italic">
                                        {dict?.profile?.orderDetails?.trackingPending || "Tracking information is pending for this order history."}
                                    </p>
                                </div>
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
