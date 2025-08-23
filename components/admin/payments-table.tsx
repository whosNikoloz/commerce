"use client";

import { useState } from "react";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Eye, Download } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentMethod {
  id: string;
  name: string;
  type: "credit_card" | "paypal" | "stripe" | "bank_transfer" | "crypto";
  status: "active" | "inactive";
  transactionFee: number;
  description: string;
}

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

const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    name: "Credit/Debit Cards",
    type: "credit_card",
    status: "active",
    transactionFee: 2.9,
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "2",
    name: "PayPal",
    type: "paypal",
    status: "active",
    transactionFee: 3.49,
    description: "PayPal payments and PayPal Credit",
  },
  {
    id: "3",
    name: "Stripe",
    type: "stripe",
    status: "active",
    transactionFee: 2.9,
    description: "Stripe payment processing",
  },
  {
    id: "4",
    name: "Bank Transfer",
    type: "bank_transfer",
    status: "inactive",
    transactionFee: 0.5,
    description: "Direct bank transfers",
  },
  {
    id: "5",
    name: "Cryptocurrency",
    type: "crypto",
    status: "inactive",
    transactionFee: 1.0,
    description: "Bitcoin, Ethereum, and other cryptocurrencies",
  },
];

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
    method: "Stripe",
    status: "failed",
    date: "2024-01-14",
    fee: 0,
  },
  {
    id: "TXN005",
    orderId: "ORD-1238",
    customer: "Charlie Wilson",
    amount: 89.99,
    method: "PayPal",
    status: "refunded",
    date: "2024-01-13",
    fee: -3.14,
  },
];

export function PaymentsTable() {
  const [methods, setMethods] = useState<PaymentMethod[]>(paymentMethods);

  const toggleMethodStatus = (methodId: string) => {
    setMethods(
      methods.map((method) =>
        method.id === methodId
          ? {
              ...method,
              status: method.status === "active" ? "inactive" : "active",
            }
          : method,
      ),
    );
  };

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

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "credit_card":
      case "stripe":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalFees = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.fee, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Transaction Fees
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${totalFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Successful Payments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              {(
                (transactions.filter((t) => t.status === "completed").length /
                  transactions.length) *
                100
              ).toFixed(1)}
              % success rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Failed Payments
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "failed").length}
            </div>
            <p className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              {(
                (transactions.filter((t) => t.status === "failed").length / transactions.length) *
                100
              ).toFixed(1)}
              % failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs className="space-y-4" defaultValue="methods">
        <TabsList>
          <TabsTrigger className="text-slate-900 dark:text-slate-100" value="methods">
            Payment Methods
          </TabsTrigger>
          <TabsTrigger className="text-slate-900 dark:text-slate-100" value="transactions">
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Payment Methods</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Configure available payment options for your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-900 dark:text-slate-100">Method</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Type</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">
                      Transaction Fee
                    </TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">
                      Description
                    </TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method.id} className="border-slate-200 dark:border-slate-700">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(method.type)}
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-slate-900 dark:text-slate-100" variant="outline">
                          {method.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">
                        {method.transactionFee}% + $0.30
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm text-muted-foreground text-slate-500 dark:text-slate-400">
                          {method.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={method.status === "active"}
                            className="data-[state=checked]:bg-blue-600"
                            onCheckedChange={() => toggleMethodStatus(method.id)}
                          />
                          <Badge
                            className="text-slate-900 dark:text-slate-100"
                            variant={method.status === "active" ? "default" : "secondary"}
                          >
                            {method.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-slate-100">
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    View and manage payment transactions
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-900 dark:text-slate-100">
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Order</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Customer</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Amount</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Method</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Status</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Date</TableHead>
                    <TableHead className="text-slate-900 dark:text-slate-100">Fee</TableHead>
                    <TableHead className="text-right text-slate-900 dark:text-slate-100">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
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
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">
                        {transaction.method}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
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
                        {transaction.fee === 0 ? "-" : `$${Math.abs(transaction.fee).toFixed(2)}`}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
