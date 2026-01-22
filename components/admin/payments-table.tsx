"use client";

import { useState } from "react";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Eye, Download, Filter, Search } from "lucide-react";
import { useDictionary } from "@/app/context/dictionary-provider";
import { currencyFmt } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  fee: number;
}

// Mock data - will be replaced with real API data
const transactions: Transaction[] = [
  {
    id: "TXN001",
    orderId: "ORD-1234",
    customer: "John Doe",
    amount: 299.99,
    method: "Credit Card",
    status: "completed",
    date: "2024-01-15",
    fee: 8.7,
  },
  {
    id: "TXN002",
    orderId: "ORD-1235",
    customer: "Jane Smith",
    amount: 149.99,
    method: "PayPal",
    status: "completed",
    date: "2024-01-15",
    fee: 5.23,
  },
  {
    id: "TXN003",
    orderId: "ORD-1236",
    customer: "Bob Johnson",
    amount: 79.99,
    method: "Credit Card",
    status: "pending",
    date: "2024-01-14",
    fee: 2.32,
  },
  {
    id: "TXN004",
    orderId: "ORD-1237",
    customer: "Alice Brown",
    amount: 199.99,
    method: "TBC",
    status: "failed",
    date: "2024-01-14",
    fee: 0,
  },
  {
    id: "TXN005",
    orderId: "ORD-1238",
    customer: "Charlie Wilson",
    amount: 89.99,
    method: "BOG",
    status: "refunded",
    date: "2024-01-13",
    fee: -3.14,
  },
];

export function PaymentsTable() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const dict = useDictionary();
  const t = dict.admin.payments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return t.table.statuses[status as keyof typeof t.table.statuses] || status;
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesSearch = searchQuery === "" ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalFees = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.fee, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.stats.totalRevenue}
            </CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currencyFmt(totalRevenue)}
            </div>
            <p className="font-primary text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingUp className="inline h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              {t.stats.trend.replace("{value}", "12")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.stats.fees}
            </CardTitle>
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currencyFmt(totalFees)}
            </div>
            <p className="font-primary text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingDown className="inline h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              {t.stats.trend.replace("{value}", "-2")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.stats.successful}
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "completed").length}
            </div>
            <p className="font-primary text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              {t.stats.successRate.replace("{rate}", (
                (transactions.filter((t) => t.status === "completed").length /
                  transactions.length) *
                100
              ).toFixed(1))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.stats.failed}
            </CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "failed").length}
            </div>
            <p className="font-primary text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              {t.stats.failureRate.replace("{rate}", (
                (transactions.filter((t) => t.status === "failed").length / transactions.length) *
                100
              ).toFixed(1))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                {t.table.title}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                {t.table.subtitle}
              </CardDescription>
            </div>
            <Button className="w-full sm:w-auto" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t.table.export}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t.table.searchPlaceholder}
                className="pl-9 bg-white dark:bg-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-800">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t.table.filterStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.table.allStatuses}</SelectItem>
                <SelectItem value="completed">{t.table.statuses.completed}</SelectItem>
                <SelectItem value="pending">{t.table.statuses.pending}</SelectItem>
                <SelectItem value="failed">{t.table.statuses.failed}</SelectItem>
                <SelectItem value="refunded">{t.table.statuses.refunded}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {transaction.id}
                      </p>
                      <p className="font-primary font-semibold text-slate-900 dark:text-slate-100">
                        {transaction.customer}
                      </p>
                      <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                        {t.table.headers.order}: {transaction.orderId}
                      </p>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-primary text-lg font-bold text-slate-900 dark:text-slate-100">
                        {currencyFmt(transaction.amount)}
                      </p>
                      <p className="font-primary text-xs text-slate-500">
                        {transaction.method} • {transaction.date}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900 dark:text-slate-100">
                    {t.table.headers.id}
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.order}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.customer}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.amount}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.method}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.status}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.date}</TableHead>
                  <TableHead className="text-slate-900 dark:text-slate-100">{t.table.headers.fee}</TableHead>
                  <TableHead className="text-right text-slate-900 dark:text-slate-100">
                    {t.table.headers.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-slate-200 dark:border-slate-700"
                  >
                    <TableCell className="font-mono text-sm text-slate-900 dark:text-slate-100">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      {transaction.orderId}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      {transaction.customer}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {currencyFmt(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      {transaction.method}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      {transaction.date}
                    </TableCell>
                    <TableCell
                      className={
                        transaction.fee < 0
                          ? "text-red-600"
                          : transaction.fee > 0
                            ? "text-gray-600"
                            : "text-slate-900 dark:text-slate-100"
                      }
                    >
                      {transaction.fee === 0 ? "-" : currencyFmt(transaction.fee)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t.table.noTransactions}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
