import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights and performance metrics for your ecommerce business</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
