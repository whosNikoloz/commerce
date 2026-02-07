"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Package,
    ChevronRight,
    Search,
    LayoutGrid,
    List,
    CheckCircle,
    Truck,
    Clock,
    CreditCard,
    Loader
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getMyOrders,
} from "@/app/api/services/orderService";
import { OrderSummary, OrderStatus } from "@/types/orderTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/app/context/dictionary-provider";
import { cn } from "@/lib/utils";
import { defaultLocale } from "@/i18n.config";

export default function OrdersPage() {
    const { lang } = useParams();
    const dict = useDictionary();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [paged, setPaged] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const getLink = (path: string) => {
        if (lang === defaultLocale) {
            return path;
        }

        return `/${lang}${path}`;
    };

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
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await getMyOrders(paged.page, paged.pageSize);

                setOrders(res.data);
                setPaged((p) => ({ ...p, total: res.total }));
            } catch (err: any) {
                setError(err?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [paged.page, paged.pageSize]);

    function getStatusColor(status: OrderStatus) {
        switch (status) {
            case OrderStatus.Delivered: return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", icon: CheckCircle };
            case OrderStatus.Shipped: return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800", icon: Truck };
            case OrderStatus.Processing: return { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800", icon: Loader };
            case OrderStatus.Paid: return { dot: "bg-brand-primary", badge: "bg-brand-primary/10 text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:border-brand-primary/30", icon: CreditCard };
            case OrderStatus.Pending: default: return { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700", icon: Clock };
        }
    }

    const filteredOrders = useMemo(() => {
        return orders.filter(order =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    if (loading && orders.length === 0) {
        return <OrdersSkeleton dict={dict} viewMode={viewMode} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase">
                        {dict?.profile?.orders?.title || "My Orders"}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium italic">
                        {dict?.profile?.orders?.subtitle || "Review and track your purchase history"}
                    </p>
                </div>

                <div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                    <button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "list" ? "bg-brand-primary text-white shadow-lg" : "text-muted-foreground hover:bg-brand-primary/5 hover:text-brand-primary"
                        )}
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4" /> {dict?.profile?.orders?.viewMode?.list || "List"}
                    </button>
                    <button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "grid" ? "bg-brand-primary text-white shadow-lg" : "text-muted-foreground hover:bg-brand-primary/5 hover:text-brand-primary"
                        )}
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" /> {dict?.profile?.orders?.viewMode?.grid || "Grid"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between backdrop-blur-xl bg-white/40 dark:bg-white/5 p-4 rounded-2xl border border-border dark:border-white/10 shadow-xl shadow-black/5">
                <div className="relative w-full sm:max-w-xs group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                    <Input
                        className="pl-10 h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 transition-all font-bold text-sm"
                        placeholder={dict?.profile?.orders?.searchPlaceholder || "Search by Order ID..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground px-2 uppercase tracking-widest">
                        {dict?.profile?.orders?.pagination?.page || "Page"} {paged.page} / {Math.max(1, Math.ceil(paged.total / paged.pageSize))}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            className="rounded-xl h-10 border-border dark:border-white/10"
                            disabled={paged.page <= 1}
                            size="sm"
                            variant="outline"
                            onClick={() => setPaged(p => ({ ...p, page: p.page - 1 }))}
                        >
                            {dict?.profile?.orders?.pagination?.prev || "Prev"}
                        </Button>
                        <Button
                            className="rounded-xl h-10 border-border dark:border-white/10"
                            disabled={paged.page >= Math.ceil(paged.total / paged.pageSize)}
                            size="sm"
                            variant="outline"
                            onClick={() => setPaged(p => ({ ...p, page: p.page + 1 }))}
                        >
                            {dict?.profile?.orders?.pagination?.next || "Next"}
                        </Button>
                    </div>
                </div>
            </div>

            {error ? (
                <Card className="rounded-[2.5rem] border-destructive/20 bg-destructive/5 overflow-hidden">
                    <CardContent className="py-10">
                        <p className="text-destructive text-center font-bold tracking-tight">{error}</p>
                    </CardContent>
                </Card>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-border dark:border-white/10">
                    <div className="h-14 w-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 animate-pulse">
                        <Package className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold dark:text-white tracking-tight">
                        {dict?.profile?.orders?.empty || "No orders found"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2 font-medium">
                        {searchQuery
                            ? (dict?.profile?.orders?.emptySearch || "Try a different search query.")
                            : (dict?.profile?.orders?.emptyDesc || "When you place an order, it will appear here.")}
                    </p>
                </div>
            ) : viewMode === "list" ? (
                <div className="grid gap-3">
                    {filteredOrders.map((order) => {
                        const statusStyle = getStatusColor(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <div
                                key={order.id}
                                className="group bg-white dark:bg-gray-900 border border-border dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", statusStyle.dot)} />
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-sm dark:text-white">
                                                    {dict?.profile?.orders?.orderLabel || "Order"} #{order.id.slice(0, 6)}
                                                </span>
                                                <span className="font-bold text-sm dark:text-white">
                                                    {dict?.profile?.orders?.priceLabel || "Price"}: {fmtMoney(order.total || 0)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                                <span>{dict?.profile?.orders?.productsLabel || "Products"}: {order.items}</span>
                                                <span>·</span>
                                                <span>{dict?.profile?.orders?.dateLabel || "Date"}: {new Date(order.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(order.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                {/* <span className="flex items-center gap-1">
                                                    <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                                                    {dict?.profile?.orders?.statusLabel || "Status"}: {getStatusName(order.status)}
                                                </span> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0", statusStyle.badge)}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {getStatusName(order.status)}
                                    </div>
                                </div>

                                {/* Product images */}
                                {order.images && order.images.length > 0 && (
                                    <div className="px-5 pb-3 flex gap-2">
                                        {order.images.slice(0, 5).map((img, idx) => (
                                            <Link key={img.id || idx} href={getLink(`/product/${img.productId}`)} className="h-14 w-14 rounded-lg overflow-hidden border border-border dark:border-white/10 bg-gray-50 dark:bg-white/5 flex-shrink-0 hover:ring-2 hover:ring-brand-primary/40 transition-all">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    alt="Product"
                                                    className="h-full w-full object-cover"
                                                    src={img.imagePath}
                                                />
                                            </Link>
                                        ))}
                                        {order.images.length > 5 && (
                                            <div className="h-14 w-14 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                                                +{order.images.length - 5}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Details link */}
                                <div className="px-5 pb-4 pt-1">
                                    <Link
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                                        href={getLink(`/profile/orders/${order.id}`)}
                                    >
                                        {dict?.profile?.orders?.details || "Details"}
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredOrders.map((order) => {
                        const statusStyle = getStatusColor(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <div
                                key={order.id}
                                className="group bg-white dark:bg-gray-900 border border-border dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("h-2 w-2 rounded-full flex-shrink-0 mt-1.5", statusStyle.dot)} />
                                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm dark:text-white">
                                                #{order.id.slice(0, 6)} · {fmtMoney(order.total || 0)}
                                            </span>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {order.items} {dict?.profile?.orders?.orderItems || "Items"} · {new Date(order.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold flex-shrink-0", statusStyle.badge)}>
                                        <StatusIcon className="h-3 w-3" />
                                        {getStatusName(order.status)}
                                    </div>
                                </div>

                                {/* Product images */}
                                {order.images && order.images.length > 0 && (
                                    <div className="px-4 pb-2 flex gap-1.5">
                                        {order.images.slice(0, 4).map((img, idx) => (
                                            <Link key={img.id || idx} href={getLink(`/product/${img.productId}`)} className="h-12 w-12 rounded-lg overflow-hidden border border-border dark:border-white/10 bg-gray-50 dark:bg-white/5 flex-shrink-0 hover:ring-2 hover:ring-brand-primary/40 transition-all">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img alt="Product" className="h-full w-full object-cover" src={img.imagePath} />
                                            </Link>
                                        ))}
                                        {order.images.length > 4 && (
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                                                +{order.images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Details link */}
                                <div className="px-4 pb-3 pt-1">
                                    <Link
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                                        href={getLink(`/profile/orders/${order.id}`)}
                                    >
                                        {dict?.profile?.orders?.details || "Details"}
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function OrdersSkeleton({ viewMode, dict }: { viewMode: "list" | "grid", dict: any }) {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="h-10 w-48 bg-muted dark:bg-white/10 rounded-xl" />
                    <div className="h-4 w-64 bg-muted dark:bg-white/5 rounded-lg" />
                </div>
                <div className="h-14 w-32 bg-muted dark:bg-white/10 rounded-2xl" />
            </div>

            <div className="h-16 w-full bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/10" />

            {viewMode === "list" ? (
                <div className="grid gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[140px] w-full bg-muted dark:bg-white/10 rounded-2xl border border-border dark:border-white/10" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[140px] w-full bg-muted dark:bg-white/10 rounded-2xl border border-border dark:border-white/10" />
                    ))}
                </div>
            )}
        </div>
    );
}
