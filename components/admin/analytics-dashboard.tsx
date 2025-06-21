"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const salesData = [
  { month: "Jan", revenue: 12500, orders: 145, customers: 89 },
  { month: "Feb", revenue: 15200, orders: 178, customers: 102 },
  { month: "Mar", revenue: 18900, orders: 210, customers: 125 },
  { month: "Apr", revenue: 16800, orders: 195, customers: 118 },
  { month: "May", revenue: 21300, orders: 245, customers: 142 },
  { month: "Jun", revenue: 19600, orders: 225, customers: 135 },
]

const topProducts = [
  { name: "Wireless Headphones", sales: 245, revenue: 24500, growth: 12.5 },
  { name: "Smart Watch", sales: 189, revenue: 56700, growth: 8.3 },
  { name: "Coffee Maker", sales: 156, revenue: 23400, growth: -2.1 },
  { name: "Running Shoes", sales: 134, revenue: 10720, growth: 15.7 },
  { name: "Laptop Stand", sales: 98, revenue: 3920, growth: 5.2 },
]

const customerSegments = [
  { segment: "VIP Customers", count: 45, percentage: 15, revenue: 125000 },
  { segment: "Gold Customers", count: 89, percentage: 30, revenue: 89000 },
  { segment: "Silver Customers", count: 134, percentage: 45, revenue: 45000 },
  { segment: "Bronze Customers", count: 30, percentage: 10, revenue: 12000 },
]

export function AnalyticsDashboard() {
  const currentMonth = salesData[salesData.length - 1]
  const previousMonth = salesData[salesData.length - 2]

  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
  const ordersGrowth = ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100
  const customersGrowth = ((currentMonth.customers - previousMonth.customers) / previousMonth.customers) * 100

  const totalRevenue = salesData.reduce((sum, month) => sum + month.revenue, 0)
  const totalOrders = salesData.reduce((sum, month) => sum + month.orders, 0)
  const totalCustomers = customerSegments.reduce((sum, segment) => sum + segment.count, 0)
  const avgOrderValue = totalRevenue / totalOrders

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {revenueGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span
                className={
                  revenueGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }
              >
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {ordersGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span
                className={
                  ordersGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }
              >
                {Math.abs(ordersGrowth).toFixed(1)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {customersGrowth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span
                className={
                  customersGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }
              >
                {Math.abs(customersGrowth).toFixed(1)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Avg Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Monthly Revenue Trend</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Revenue performance over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((month, index) => {
                    const maxRevenue = Math.max(...salesData.map((m) => m.revenue))
                    const percentage = (month.revenue / maxRevenue) * 100
                    return (
                      <div key={month.month} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium">{month.month}</div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                        </div>
                        <div className="w-20 text-sm font-medium text-right">${month.revenue.toLocaleString()}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Monthly Orders Trend</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Order volume over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((month) => {
                    const maxOrders = Math.max(...salesData.map((m) => m.orders))
                    const percentage = (month.orders / maxOrders) * 100
                    return (
                      <div key={month.month} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium">{month.month}</div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                        </div>
                        <div className="w-16 text-sm font-medium text-right">{month.orders}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Top Performing Products</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Best selling products by revenue and growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <div className="flex items-center">
                        {product.growth > 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-xs ${product.growth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {Math.abs(product.growth).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Customer Segments</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Customer distribution by spending tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment) => (
                  <div key={segment.segment} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{segment.segment}</h4>
                        <Badge variant="secondary">{segment.count} customers</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          ${segment.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{segment.percentage}% of total</p>
                      </div>
                    </div>
                    <Progress value={segment.percentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
