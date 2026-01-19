"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight, Eye, BarChart3, Plus, FolderTree } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/app/context/tenantContext";
import { useDictionary } from "@/app/context/dictionary-provider";
import { getAllOrders } from "@/app/api/services/orderService";
import { OrderSummary, OrderStatus } from "@/types/orderTypes";

const stats = [
  {
    titleKey: "revenue",
    value: "₾45,231.89",
    trend: "+20.1%",
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
  },
  {
    titleKey: "orders",
    value: "1,234",
    trend: "+15%",
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800/50",
  },
  {
    titleKey: "customers",
    value: "456",
    trend: "+12%",
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800/50",
  },
  {
    titleKey: "products",
    value: "789",
    trend: "+25%",
    icon: Package,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800/50",
  },
];



function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Delivered:
    case OrderStatus.Paid:
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800';
    case OrderStatus.Processing:
    case OrderStatus.Shipped:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800';
    case OrderStatus.Pending:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800';
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800';
  }
}

function getStatusLabel(status: OrderStatus): string {
  return typeof status === 'number' ? OrderStatus[status] : String(status);
}

function formatCurrency(amount: number, currency: string = 'GEL'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

export default function AdminDashboard() {
  const dict = useDictionary();
  const { config } = useTenant();
  const isFinaMerchant = config?.merchantType === "FINA";

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const result = await getAllOrders(1, 4); // Get first page with 4 orders

        setOrders(result.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 w-full">
      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, _index) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.titleKey}
              className={`relative overflow-hidden border ${stat.borderColor}
                bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl
                hover:shadow-2xl hover:shadow-${stat.color.split('-')[1]}-500/20
                transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-1
                cursor-pointer group`}
            >
              <div className={`absolute inset-0 ${stat.bgColor} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                <CardTitle className="text-xl font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {dict.pages?.admin?.dashboard?.[stat.titleKey] || stat.titleKey}
                </CardTitle>
                <div className={`p-3.5 rounded-2xl ${stat.bgColor} shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 ring-2 ring-white/50 dark:ring-slate-800/50`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative pb-6">
                <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${stat.color} bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-xs px-3 py-1.5 font-bold shadow-sm`} variant="secondary">
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                    {stat.trend}
                  </Badge>
                  <span className="font-primary text-xs text-slate-600 dark:text-slate-400 font-medium">{dict.pages?.admin?.dashboard?.vsLastMonth || "vs last month"}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-1 lg:col-span-4 border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-lg" />
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl font-bold">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  {dict.pages?.admin?.dashboard?.recentOrders}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {dict.pages?.admin?.dashboard?.manageYourStoreEfficiently}
                </CardDescription>
              </div>
              <Button
                asChild
                className="border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                size="sm"
                variant="outline"
              >
                <Link href="/admin/orders">
                  <Eye className="mr-2 h-4 w-4" />
                  {dict.pages?.admin?.dashboard?.viewAll || "View All"}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {loadingOrders ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="font-primary text-sm font-medium">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-primary text-sm font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const orderNumber = order.id.slice(0, 8);
                  const initials = orderNumber.slice(0, 2).toUpperCase();

                  return (
                    <Link
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800/70 dark:hover:to-slate-800/50 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md cursor-pointer group gap-4 sm:gap-0"
                      href={`/admin/orders`}
                    >
                      <div className="flex items-center w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ring-2 ring-white dark:ring-slate-800 shrink-0">
                          <span className="font-primary text-sm font-bold text-white">
                            {initials}
                          </span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="font-primary text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            Order #{orderNumber}
                          </p>
                          <p className="font-primary text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            {formatDate(order.date)} • {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 sm:ml-auto w-full sm:w-auto pl-16 sm:pl-0">
                        <span className="font-primary font-bold text-slate-900 dark:text-slate-100 text-base whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </span>
                        <Badge
                          className={`text-xs font-bold px-3 py-1 ${getStatusBadgeClass(order.status)}`}
                          variant="secondary"
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 lg:col-span-3 border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-lg" />
          <CardHeader className="pb-4 relative">
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl font-bold">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {dict.pages?.admin?.dashboard?.quickActions || "Quick Actions"}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              {dict.pages?.admin?.dashboard?.manageYourStoreEfficiently || "Manage your store efficiently"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {/* Add New Product - Disabled for FINA */}
            <Button
              asChild={!isFinaMerchant}
              className="w-full justify-start h-auto p-4 border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/20 hover:from-emerald-100 hover:to-emerald-50 dark:hover:from-emerald-900/40 dark:hover:to-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              disabled={isFinaMerchant}
              variant="outline"
            >
              {isFinaMerchant ? (
                <div className="flex items-center w-full">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 transition-all duration-300 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-800/50 opacity-50 shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 text-left flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewProduct || "Add New Product"}</div>
                  </div>
                </div>
              ) : (
                <Link className="flex items-center w-full" href="/admin/products">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-emerald-200 dark:ring-emerald-800/50 shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 text-left flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewProduct || "Add New Product"}</div>
                  </div>
                </Link>
              )}
            </Button>

            {/* Add Category - Disabled for FINA */}
            <Button
              asChild={!isFinaMerchant}
              className="w-full justify-start h-auto p-4 border-2 border-cyan-200 dark:border-cyan-800/50 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/30 dark:to-cyan-900/20 hover:from-cyan-100 hover:to-cyan-50 dark:hover:from-cyan-900/40 dark:hover:to-cyan-900/30 text-cyan-700 dark:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              disabled={isFinaMerchant}
              variant="outline"
            >
              {isFinaMerchant ? (
                <div className="flex items-center w-full">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 transition-all duration-300 shadow-md ring-2 ring-cyan-200 dark:ring-cyan-800/50 opacity-50 shrink-0">
                    <FolderTree className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 text-left flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewCategory || "Add Category"}</div>
                    <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 truncate">Not available for FINA merchants</div>
                  </div>
                </div>
              ) : (
                <Link className="flex items-center w-full" href="/admin/categories">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 group-hover:from-cyan-600 group-hover:to-cyan-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-cyan-200 dark:ring-cyan-800/50 shrink-0">
                    <FolderTree className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 text-left flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewCategory || "Add Category"}</div>
                  </div>
                </Link>
              )}
            </Button>

            {/* Process Orders - Always Available */}
            <Button
              asChild
              className="w-full justify-start h-auto p-4 border-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-900/40 dark:hover:to-blue-900/30 text-blue-700 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm"
              variant="outline"
            >
              <Link className="flex items-center w-full" href="/admin/orders">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-blue-200 dark:ring-blue-800/50 shrink-0">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewOrder || "Process Orders"}</div>
                </div>
              </Link>
            </Button>

            {/* View Customers - Always Available */}
            <Button
              asChild
              className="w-full justify-start h-auto p-4 border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/20 hover:from-purple-100 hover:to-purple-50 dark:hover:from-purple-900/40 dark:hover:to-purple-900/30 text-purple-700 dark:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm"
              variant="outline"
            >
              <Link className="flex items-center w-full" href="/admin/customers">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-purple-200 dark:ring-purple-800/50 shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <div className="font-bold text-base truncate">{dict.pages?.admin?.dashboard?.addNewCustomer || "View Customers"}</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
