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
    Loader,
    CalendarDays,
    ShoppingBag,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getMyOrders,
} from "@/app/api/services/orderService";
import { OrderSummary, OrderStatus } from "@/types/orderTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/app/context/dictionary-provider";
import { cn } from "@/lib/utils";
import { defaultLocale } from "@/i18n.config";
import Pagination from "@/components/ui/Pagination";

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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                <div className="flex flex-col gap-1 sm:gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black dark:text-white tracking-tight uppercase">
                        {dict?.profile?.orders?.title || "My Orders"}
                    </h1>
                    {/* <p className="text-muted-foreground text-xs sm:text-sm font-medium italic">
                        {dict?.profile?.orders?.subtitle || "Review and track your purchase history"}
                    </p> */}
                </div>

                <div className="hidden sm:flex bg-white/40 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-border dark:border-white/10 shadow-sm">
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

            <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <Input
                    className="pl-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/20 transition-all font-bold text-sm shadow-sm"
                    placeholder={dict?.profile?.orders?.searchPlaceholder || "Search by Order ID..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                <div className="grid gap-3 sm:gap-4">
                    {filteredOrders.map((order) => {
                        const statusStyle = getStatusColor(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <Link
                                key={order.id}
                                href={getLink(`/profile/orders/${order.id}`)}
                                className="group relative block bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-brand-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-[0.995] transition-all duration-300"
                            >
                                {/* Status accent bar */}
                                <div className={cn("absolute top-0 left-0 w-1 sm:w-1.5 h-full rounded-l-2xl sm:rounded-l-3xl", statusStyle.dot)} />

                                <div className="pl-4 sm:pl-6 pr-3 sm:pr-5 py-3.5 sm:py-5">
                                    {/* Top row: Order ID + Status badge */}
                                    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200/50 dark:ring-white/10">
                                                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-sm sm:text-base dark:text-white tracking-tight">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-bold uppercase tracking-wide flex-shrink-0", statusStyle.badge)}>
                                            <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                            {getStatusName(order.status)}
                                        </div>
                                    </div>

                                    {/* Middle: Product images */}
                                    {order.images && order.images.length > 0 && (
                                        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none mb-3 sm:mb-4 -mx-1 px-1 py-0.5">
                                            {order.images.slice(0, 5).map((img, idx) => (
                                                <div
                                                    key={img.id || idx}
                                                    className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex-shrink-0 ring-1 ring-black/[0.03] dark:ring-white/5 group-hover:ring-brand-primary/20 transition-all"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        alt="Product"
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        src={img.imagePath}
                                                    />
                                                </div>
                                            ))}
                                            {order.images.length > 5 && (
                                                <div className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs sm:text-sm font-bold text-muted-foreground flex-shrink-0 border border-gray-200 dark:border-white/10">
                                                    +{order.images.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Bottom row: Meta info + CTA */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 sm:gap-1.5">
                                                <Package className="h-3.5 w-3.5" />
                                                <span className="font-semibold">{order.items}</span> {dict?.profile?.orders?.orderItems || "items"}
                                            </span>
                                            <span className="hidden xs:flex items-center gap-1 sm:gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {new Date(order.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="font-extrabold text-sm sm:text-base text-foreground dark:text-white">
                                                {fmtMoney(order.total || 0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-primary group-hover:gap-2 transition-all">
                                            <span className="hidden sm:inline">{dict?.profile?.orders?.details || "Details"}</span>
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {filteredOrders.map((order) => {
                        const statusStyle = getStatusColor(order.status);
                        const StatusIcon = statusStyle.icon;

                        return (
                            <Link
                                key={order.id}
                                href={getLink(`/profile/orders/${order.id}`)}
                                className="group relative flex flex-col bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-brand-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-[0.995] transition-all duration-300"
                            >
                                {/* Status accent bar */}
                                <div className={cn("absolute top-0 left-0 right-0 h-1 sm:h-1.5", statusStyle.dot)} />

                                <div className="p-4 sm:p-5 pt-5 sm:pt-6 flex flex-col flex-1">
                                    {/* Header: ID + Badge */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200/50 dark:ring-white/10">
                                                <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <span className="font-bold text-sm dark:text-white tracking-tight">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide flex-shrink-0", statusStyle.badge)}>
                                            <StatusIcon className="h-3 w-3" />
                                            {getStatusName(order.status)}
                                        </div>
                                    </div>

                                    {/* Product images */}
                                    {order.images && order.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3 -mx-0.5 px-0.5 py-0.5">
                                            {order.images.slice(0, 4).map((img, idx) => (
                                                <div key={img.id || idx} className="h-14 w-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex-shrink-0 ring-1 ring-black/[0.03] dark:ring-white/5 group-hover:ring-brand-primary/20 transition-all">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img alt="Product" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" src={img.imagePath} />
                                                </div>
                                            ))}
                                            {order.images.length > 4 && (
                                                <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0 border border-gray-200 dark:border-white/10">
                                                    +{order.images.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Meta info */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Package className="h-3.5 w-3.5" />
                                            {order.items} {dict?.profile?.orders?.orderItems || "items"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {new Date(order.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Footer: Price + CTA */}
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                                        <span className="font-extrabold text-base dark:text-white">
                                            {fmtMoney(order.total || 0)}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:gap-2 transition-all">
                                            {dict?.profile?.orders?.details || "Details"}
                                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <Pagination
                currentPage={paged.page}
                totalPages={Math.max(1, Math.ceil(paged.total / paged.pageSize))}
                onPageChange={(page) => setPaged(p => ({ ...p, page }))}
            />
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
                <div className="grid gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-muted dark:bg-white/10 rounded-l-2xl sm:rounded-l-3xl" />
                            <div className="pl-4 sm:pl-6 pr-3 sm:pr-5 py-3.5 sm:py-5 space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-muted dark:bg-white/10" />
                                        <div className="h-4 w-28 bg-muted dark:bg-white/10 rounded-lg" />
                                    </div>
                                    <div className="h-6 w-20 bg-muted dark:bg-white/10 rounded-full" />
                                </div>
                                <div className="flex gap-2 sm:gap-2.5">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] rounded-xl sm:rounded-2xl bg-muted dark:bg-white/10" />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-3.5 w-16 bg-muted dark:bg-white/10 rounded" />
                                        <div className="h-3.5 w-20 bg-muted dark:bg-white/10 rounded" />
                                    </div>
                                    <div className="h-4 w-12 bg-muted dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-muted dark:bg-white/10" />
                            <div className="p-4 sm:p-5 pt-5 sm:pt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-xl bg-muted dark:bg-white/10" />
                                        <div className="h-4 w-24 bg-muted dark:bg-white/10 rounded-lg" />
                                    </div>
                                    <div className="h-6 w-20 bg-muted dark:bg-white/10 rounded-full" />
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="h-14 w-14 rounded-xl bg-muted dark:bg-white/10" />
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-3.5 w-14 bg-muted dark:bg-white/10 rounded" />
                                    <div className="h-3.5 w-16 bg-muted dark:bg-white/10 rounded" />
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                                    <div className="h-5 w-16 bg-muted dark:bg-white/10 rounded" />
                                    <div className="h-4 w-14 bg-muted dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
