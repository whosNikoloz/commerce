import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "+20.1% from last month",
    icon: DollarSign,
    trend: "+20.1%",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    title: "Total Orders",
    value: "1,234",
    description: "+15% from last month",
    icon: ShoppingCart,
    trend: "+15%",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Total Customers",
    value: "456",
    description: "+12% from last month",
    icon: Users,
    trend: "+12%",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Total Products",
    value: "789",
    description: "+25% from last month",
    icon: Package,
    trend: "+25%",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 w-full">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.trend} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">Recent Orders</CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Latest customer orders and transactions
                </CardDescription>
              </div>
              <Button
                className="border-slate-300 dark:border-slate-600"
                size="sm"
                variant="outline"
              >
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-6">
              {[
                {
                  id: "#1234",
                  name: "John Doe",
                  product: "Wireless Headphones",
                  price: "$299.99",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  id: "#1235",
                  name: "Jane Smith",
                  product: "Smart Watch",
                  price: "$149.99",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  id: "#1236",
                  name: "Bob Johnson",
                  product: "Coffee Maker",
                  price: "$79.99",
                  color: "from-orange-500 to-orange-600",
                },
              ].map((order, index) => (
                <div key={order.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${order.color} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-xs font-medium text-white">#{index + 1}</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Order {order.id}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {order.name} – {order.product}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">
                    +{order.price}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              Manage your store efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-3">
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-5 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-all duration-200">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-all duration-200">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Process Orders
              </Button>
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-5 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 transition-all duration-200">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
