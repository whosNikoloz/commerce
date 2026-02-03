'use client'


import React, { useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Eye, MousePointer, Package, MapPin, Smartphone } from 'lucide-react'

import { currencyFmt } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const chartData = [
  {
    date: 'Jan 1',
    revenue: 4200,
    orders: 240,
    customers: 2400,
    conversionRate: 2.8,
    visits: 8500,
  },
  {
    date: 'Jan 8',
    revenue: 3800,
    orders: 221,
    customers: 2210,
    conversionRate: 2.6,
    visits: 8300,
  },
  {
    date: 'Jan 15',
    revenue: 5200,
    orders: 229,
    customers: 2290,
    conversionRate: 2.9,
    visits: 9100,
  },
  {
    date: 'Jan 22',
    revenue: 4700,
    orders: 200,
    customers: 2000,
    conversionRate: 2.4,
    visits: 8200,
  },
  {
    date: 'Jan 29',
    revenue: 6100,
    orders: 320,
    customers: 2808,
    conversionRate: 3.2,
    visits: 10200,
  },
  {
    date: 'Feb 5',
    revenue: 5800,
    orders: 300,
    customers: 2800,
    conversionRate: 3.0,
    visits: 9800,
  },
  {
    date: 'Feb 12',
    revenue: 7200,
    orders: 278,
    customers: 2908,
    conversionRate: 3.1,
    visits: 9500,
  },
]

const topProducts = [
  { name: 'Pro Wireless Headphones', sales: 1240, revenue: 18600, rating: 4.8 },
  { name: 'Smart Watch Elite', sales: 892, revenue: 16450, rating: 4.7 },
  { name: '4K Webcam Pro', sales: 756, revenue: 14280, rating: 4.6 },
  { name: 'Mechanical Keyboard', sales: 623, revenue: 9345, rating: 4.9 },
  { name: 'USB-C Hub 7-in-1', sales: 482, revenue: 5786, rating: 4.5 },
]

const geoData = [
  { region: 'United States', sales: 12450, percentage: 42 },
  { region: 'Canada', sales: 4230, percentage: 14 },
  { region: 'United Kingdom', sales: 3890, percentage: 13 },
  { region: 'Australia', sales: 2870, percentage: 10 },
  { region: 'Other', sales: 4560, percentage: 21 },
]

const trafficSources = [
  { name: 'Organic Search', value: 35, color: '#3b82f6' },
  { name: 'Direct', value: 28, color: '#10b981' },
  { name: 'Social Media', value: 18, color: '#f59e0b' },
  { name: 'Email', value: 12, color: '#8b5cf6' },
  { name: 'Referral', value: 7, color: '#ec4899' },
]

const deviceData = [
  { name: 'Mobile', value: 45 },
  { name: 'Desktop', value: 38 },
  { name: 'Tablet', value: 17 },
]

const retentionData = [
  { cohort: 'Jan', retention: 100 },
  { cohort: 'Feb', retention: 85 },
  { cohort: 'Mar', retention: 72 },
  { cohort: 'Apr', retention: 65 },
  { cohort: 'May', retention: 58 },
  { cohort: 'Jun', retention: 52 },
]

const productCategoryData = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Fashion', value: 25, color: '#8b5cf6' },
  { name: 'Home', value: 20, color: '#ec4899' },
  { name: 'Sports', value: 15, color: '#f59e0b' },
  { name: 'Books', value: 5, color: '#10b981' },
]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')

  const metrics = [
    {
      label: 'Total Revenue',
      value: '₾46,900',
      change: '+12.5%',
      icon: DollarSign,
      trend: 'up',
      subtext: 'vs last period',
    },
    {
      label: 'Total Orders',
      value: '1,888',
      change: '+8.2%',
      icon: ShoppingCart,
      trend: 'up',
      subtext: 'vs last period',
    },
    {
      label: 'Total Visitors',
      value: '64,231',
      change: '+15.3%',
      icon: Eye,
      trend: 'up',
      subtext: 'vs last period',
    },
    {
      label: 'Avg Order Value',
      value: '₾24.85',
      change: '-1.2%',
      icon: TrendingUp,
      trend: 'down',
      subtext: 'vs last period',
    },
    {
      label: 'Conversion Rate',
      value: '2.9%',
      change: '+0.4%',
      icon: MousePointer,
      trend: 'up',
      subtext: 'vs last period',
    },
    {
      label: 'New Customers',
      value: '324',
      change: '+22.1%',
      icon: Users,
      trend: 'up',
      subtext: 'vs last period',
    },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Analytics</h1>
          <p className="font-primary text-muted-foreground mt-1">Track your commerce performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics - Extended to 6 columns */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon

          return (
            <Card key={index} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  <span className="font-primary text-xs">{metric.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-primary text-xl font-bold text-foreground">{metric.value}</p>
                  <p
                    className={`text-xs font-medium ${metric.trend === 'up' ? 'text-chart-2' : 'text-chart-3'
                      }`}
                  >
                    {metric.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Primary Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300} width="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Area
                  dataKey="revenue"
                  fill="url(#colorRevenue)"
                  fillOpacity={1}
                  isAnimationActive={true}
                  stroke="#3b82f6"
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Sales by Category</CardTitle>
            <CardDescription>Product distribution %</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Pie
                  cx="50%"
                  cy="50%"
                  data={productCategoryData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {productCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders and Conversion Rate */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Orders & Conversion Rate</CardTitle>
            <CardDescription>Order volume and conversion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                <Line
                  dataKey="orders"
                  dot={false}
                  name="Orders"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  type="monotone"
                  yAxisId="left"
                />
                <YAxis orientation="right" stroke="var(--muted-foreground)" yAxisId="right" />
                <Line
                  dataKey="conversionRate"
                  dot={false}
                  name="Conversion %"
                  stroke="#10b981"
                  strokeWidth={2}
                  type="monotone"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Pie
                  cx="50%"
                  cy="50%"
                  data={trafficSources}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {trafficSources.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-primary text-foreground">{item.name}</span>
                  </div>
                  <span className="font-primary font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Top Performing Products</CardTitle>
          <CardDescription>Your best-selling items this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-primary font-medium text-foreground">{product.name}</p>
                    <p className="font-primary text-xs text-muted-foreground">{product.sales} sales</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-primary font-semibold text-foreground">{currencyFmt(product.revenue)}</p>
                    <p className="font-primary text-xs text-chart-2">⭐ {product.rating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic and Device Data */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Geographic Regions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Sales by Region</CardTitle>
            <CardDescription>Geographic performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geoData.map((geo, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-primary text-sm font-medium text-foreground">{geo.region}</span>
                    </div>
                    <span className="font-primary font-semibold text-foreground">{currencyFmt(geo.sales)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Visitors by Device</CardTitle>
            <CardDescription>Device type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-primary text-sm font-medium text-foreground">{device.name}</span>
                    </div>
                    <span className="font-primary font-semibold text-foreground">{device.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${device.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Retention */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Customer Retention Rate</CardTitle>
          <CardDescription>Cohort retention over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={retentionData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="cohort" stroke="var(--muted-foreground)" />
              <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                activeDot={{ r: 7 }}
                dataKey="retention"
                dot={{ fill: '#10b981', r: 5 }}
                name="Retention Rate"
                stroke="#10b981"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Export and Actions */}
      <div className="flex justify-end gap-2">
        <Button className="border-border" variant="outline">
          Download CSV
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Export Report
        </Button>
      </div>
    </div>
  )
}
