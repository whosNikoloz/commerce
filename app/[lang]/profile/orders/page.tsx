"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Package,
    Eye,
    ChevronRight,
    Search,
    Filter,
    LayoutGrid,
    List
} from "lucide-react";
import {
    getMyOrders,
} from "@/app/api/services/orderService";
import { OrderSummary, OrderStatus } from "@/types/orderTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
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

    const filteredOrders = useMemo(() => {
        return orders.filter(order =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    if (loading && orders.length === 0) {
        return <OrdersSkeleton viewMode={viewMode} dict={dict} />;
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
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "list" ? "bg-brand-primary text-white shadow-lg" : "text-muted-foreground hover:bg-brand-primary/5 hover:text-brand-primary"
                        )}
                    >
                        <List className="h-4 w-4" /> {dict?.profile?.orders?.viewMode?.list || "List"}
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "grid" ? "bg-brand-primary text-white shadow-lg" : "text-muted-foreground hover:bg-brand-primary/5 hover:text-brand-primary"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" /> {dict?.profile?.orders?.viewMode?.grid || "Grid"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white/40 dark:bg-white/5 p-6 rounded-[2rem] border border-border dark:border-white/10 shadow-xl shadow-black/5">
                <div className="relative w-full sm:max-w-xs group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                    <Input
                        placeholder={dict?.profile?.orders?.searchPlaceholder || "Search by Order ID..."}
                        className="pl-12 h-12 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 transition-all font-bold"
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
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-10 border-border dark:border-white/10"
                            disabled={paged.page <= 1}
                            onClick={() => setPaged(p => ({ ...p, page: p.page - 1 }))}
                        >
                            {dict?.profile?.orders?.pagination?.prev || "Prev"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-10 border-border dark:border-white/10"
                            disabled={paged.page >= Math.ceil(paged.total / paged.pageSize)}
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
                <div className="flex flex-col items-center justify-center py-24 bg-white/40 dark:bg-white/5 rounded-[3rem] border border-dashed border-border dark:border-white/10">
                    <div className="h-20 w-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 animate-pulse">
                        <Package className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white tracking-tight">
                        {dict?.profile?.orders?.empty || "No orders found"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2 font-medium">
                        {searchQuery
                            ? (dict?.profile?.orders?.emptySearch || "Try a different search query.")
                            : (dict?.profile?.orders?.emptyDesc || "When you place an order, it will appear here.")}
                    </p>
                </div>
            ) : viewMode === "list" ? (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => {
                        return (
                            <Link
                                key={order.id}
                                href={getLink(`/profile/orders/${order.id}`)}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/60 dark:bg-white/5 border border-border dark:border-white/10 rounded-[2rem] hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="relative h-20 w-20 flex-shrink-0">
                                            <div className="h-full w-full rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                                                <Package className="h-10 w-10 transition-colors" />
                                            </div>
                                        </div>
                                        {order.images && order.images.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap max-w-[80px]">
                                                {order.images.slice(0, 4).map((img, idx) => (
                                                    <div key={img.id || idx} className="h-9 w-9 rounded-lg overflow-hidden border border-border dark:border-white/10">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            alt="Product"
                                                            className="h-full w-full object-cover"
                                                            src={img.imagePath}
                                                        />
                                                    </div>
                                                ))}
                                                {order.images.length > 4 && (
                                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        +{order.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-lg tracking-tighter dark:text-white uppercase">#{order.id.slice(0, 8)}</span>
                                            <Badge
                                                className={cn(
                                                    "text-[10px] uppercase font-black tracking-widest py-0.5 px-3 rounded-full border-none shadow-sm",
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
                                        <p className="text-xs text-muted-foreground mt-1 font-black uppercase tracking-widest">
                                            {new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} • {order.items} {dict?.profile?.orders?.orderItems || "Items"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-10 mt-8 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">
                                            {dict?.profile?.orders?.totalAmount || "Total Amount"}
                                        </p>
                                        <p className="text-2xl font-black dark:text-white tracking-tight text-brand-primary">{fmtMoney(order.total || 0)}</p>
                                    </div>
                                    <div className="h-14 w-14 rounded-full border border-border dark:border-white/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:translate-x-1 transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-brand-primary/20">
                                        <ChevronRight className="h-7 w-7 text-muted-foreground group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredOrders.map((order) => {
                        return (
                            <Link
                                key={order.id}
                                href={getLink(`/profile/orders/${order.id}`)}
                                className="group bg-white/60 dark:bg-white/5 border border-border dark:border-white/10 rounded-[2.5rem] p-8 hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 flex flex-col gap-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-3">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                                            <Package className="h-8 w-8" />
                                        </div>
                                        {order.images && order.images.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap max-w-[64px]">
                                                {order.images.slice(0, 4).map((img, idx) => (
                                                    <div key={img.id || idx} className="h-7 w-7 rounded-md overflow-hidden border border-border dark:border-white/10">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            alt="Product"
                                                            className="h-full w-full object-cover"
                                                            src={img.imagePath}
                                                        />
                                                    </div>
                                                ))}
                                                {order.images.length > 4 && (
                                                    <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                                        +{order.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Badge
                                        className={cn(
                                            "text-[10px] uppercase font-black tracking-widest py-1 px-4 rounded-full border-none shadow-sm",
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

                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">#{order.id.slice(0, 8)}</h3>
                                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                                        {new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-border/50 dark:border-white/5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">
                                            {dict?.profile?.orders?.orderItems || "Items"}: {order.items}
                                        </p>
                                        <p className="text-3xl font-black text-brand-primary tracking-tighter">{fmtMoney(order.total || 0)}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-[1rem] bg-brand-surface dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                                        <ChevronRight className="h-6 w-6" />
                                    </div>
                                </div>
                            </Link>
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

            <div className="h-24 w-full bg-muted dark:bg-white/5 rounded-[2rem] border border-border dark:border-white/10" />

            {viewMode === "list" ? (
                <div className="grid gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 w-full bg-muted dark:bg-white/10 rounded-[2rem] border border-border dark:border-white/10" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-[4/3] w-full bg-muted dark:bg-white/10 rounded-[2.5rem] border border-border dark:border-white/10" />
                    ))}
                </div>
            )}
        </div>
    );
}
