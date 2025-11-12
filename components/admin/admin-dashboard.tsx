import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight, Eye, BarChart3, Plus } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    titleKey: "admin.revenue",
    value: "$45,231.89",
    trend: "+20.1%",
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
  },
  {
    titleKey: "admin.orders",
    value: "1,234",
    trend: "+15%",
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800/50",
  },
  {
    titleKey: "admin.customers",
    value: "456",
    trend: "+12%",
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800/50",
  },
  {
    titleKey: "admin.products",
    value: "789",
    trend: "+25%",
    icon: Package,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800/50",
  },
];

const translations: Record<string, string> = {
  "admin.revenue": "Revenue",
  "admin.orders": "Orders",
  "admin.customers": "Customers",
  "admin.products": "Products",
  "admin.recentOrders": "Recent Orders",
};

export default function AdminDashboard() {
  const t = (key: string, fallback?: string) => translations[key] || fallback || key;

  return (
    <div className="space-y-8 w-full">
      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
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
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {t(stat.titleKey) || stat.titleKey}
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
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4 border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-lg" />
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl font-bold">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  {t('admin.recentOrders', 'Recent Orders')}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  Latest customer orders and transactions
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
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {[
                {
                  id: "#1234",
                  name: "John Doe",
                  product: "Wireless Headphones",
                  price: "$299.99",
                  status: "completed",
                  avatar: "JD",
                },
                {
                  id: "#1235",
                  name: "Jane Smith",
                  product: "Smart Watch",
                  price: "$149.99",
                  status: "processing",
                  avatar: "JS",
                },
                {
                  id: "#1236",
                  name: "Bob Johnson",
                  product: "Coffee Maker",
                  price: "$79.99",
                  status: "shipped",
                  avatar: "BJ",
                },
              ].map((order) => (
                <div key={order.id} className="flex items-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800/70 dark:hover:to-slate-800/50 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ring-2 ring-white dark:ring-slate-800">
                    <span className="text-sm font-bold text-white">
                      {order.avatar}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Order {order.id}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                      {order.name} • {order.product}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{order.price}</span>
                    <Badge
                      className={`text-xs font-bold px-3 py-1 ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                      }`}
                      variant="secondary"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-lg" />
          <CardHeader className="pb-4 relative">
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl font-bold">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {t('admin.quickActions', 'Quick Actions')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Manage your store efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <Button
              className="w-full justify-start h-auto p-4 border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/20 hover:from-emerald-100 hover:to-emerald-50 dark:hover:from-emerald-900/40 dark:hover:to-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm"
              variant="outline"
            >
              <div className="flex items-center w-full">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-emerald-200 dark:ring-emerald-800/50">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-bold text-base">{t('admin.addProduct', 'Add New Product')}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Create and manage inventory</div>
                </div>
              </div>
            </Button>

            <Button
              className="w-full justify-start h-auto p-4 border-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-900/40 dark:hover:to-blue-900/30 text-blue-700 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm"
              variant="outline"
            >
              <div className="flex items-center w-full">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-blue-200 dark:ring-blue-800/50">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-bold text-base">Process Orders</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">Manage pending orders</div>
                </div>
              </div>
            </Button>

            <Button
              className="w-full justify-start h-auto p-4 border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/20 hover:from-purple-100 hover:to-purple-50 dark:hover:from-purple-900/40 dark:hover:to-purple-900/30 text-purple-700 dark:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group shadow-sm hover:shadow-lg backdrop-blur-sm"
              variant="outline"
            >
              <div className="flex items-center w-full">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 ring-2 ring-purple-200 dark:ring-purple-800/50">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-bold text-base">{t('admin.analytics', 'View Analytics')}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">Track performance metrics</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
