import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    trend: "+20.1%",
    icon: DollarSign,
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
  {
    title: "Total Orders",
    value: "1,234",
    trend: "+15%",
    icon: ShoppingCart,
    color: "text-brand-primarydark",
    bgColor: "bg-brand-primarydark/10",
  },
  {
    title: "Total Customers",
    value: "456",
    trend: "+12%",
    icon: Users,
    color: "text-text-light dark:text-text-lightdark",
    bgColor: "bg-brand-muted dark:bg-brand-muteddark",
  },
  {
    title: "Total Products",
    value: "789",
    trend: "+25%",
    icon: Package,
    color: "text-brand-primary",
    bgColor: "bg-brand-primary/10",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 w-full">
      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-text-light dark:text-text-lightdark">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-light dark:text-text-lightdark">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs font-medium text-brand-primary mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.trend} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders + Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4 border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-text-light dark:text-text-lightdark">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-sm text-text-subtle dark:text-text-subtledark">
                  Latest customer orders and transactions
                </CardDescription>
              </div>
              <Button
                className="border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
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
                },
                {
                  id: "#1235",
                  name: "Jane Smith",
                  product: "Smart Watch",
                  price: "$149.99",
                },
                {
                  id: "#1236",
                  name: "Bob Johnson",
                  product: "Coffee Maker",
                  price: "$79.99",
                },
              ].map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {order.id.replace("#", "")}
                    </span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-semibold text-text-light dark:text-text-lightdark">
                      Order {order.id}
                    </p>
                    <p className="text-sm text-text-subtle dark:text-text-subtledark">
                      {order.name} – {order.product}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-brand-primary">+{order.price}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-text-light dark:text-text-lightdark">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm text-text-subtle dark:text-text-subtledark">
              Manage your store efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-3">
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-brand-primary bg-brand-primary/10 p-5 text-sm hover:bg-brand-primary/20 text-brand-primary transition-all duration-200">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-brand-primarydark bg-brand-primarydark/10 p-5 text-sm hover:bg-brand-primarydark/20 text-brand-primarydark transition-all duration-200">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Process Orders
              </Button>
              <Button className="flex items-center justify-center rounded-xl border-2 border-dashed border-brand-primary bg-brand-primary/10 p-5 text-sm hover:bg-brand-primary/20 text-brand-primary transition-all duration-200">
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
