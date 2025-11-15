"use client";

import { useState } from "react";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Eye, Download, Building2, Shield, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import Image from "next/image";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface BankConfig {
  enabled: boolean;
  merchantId: string;
  apiKey: string;
  secretKey: string;
  environment: "sandbox" | "production";
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
  const [bankConfigs, setBankConfigs] = useState<{
    bog: BankConfig;
    tbc: BankConfig;
  }>({
    bog: {
      enabled: false,
      merchantId: "",
      apiKey: "",
      secretKey: "",
      environment: "sandbox",
    },
    tbc: {
      enabled: false,
      merchantId: "",
      apiKey: "",
      secretKey: "",
      environment: "sandbox",
    },
  });

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

  const handleBankConfigChange = (
    bank: "bog" | "tbc",
    field: keyof BankConfig,
    value: string | boolean
  ) => {
    setBankConfigs((prev) => ({
      ...prev,
      [bank]: {
        ...prev[bank],
        [field]: value,
      },
    }));
  };

  const testConnection = (bank: "bog" | "tbc") => {
    alert(
      `Testing ${bank.toUpperCase()} connection... This would validate credentials in real implementation.`
    );
  };

  const saveMerchantConfig = () => {
    // TODO: Implement API call to save merchant configuration
    alert("Merchant configuration saved successfully!");
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
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingUp className="inline h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              Transaction Fees
            </CardTitle>
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${totalFees.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
              <TrendingDown className="inline h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              -2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              Successful Payments
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "completed").length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
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
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
              Failed Payments
            </CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transactions.filter((t) => t.status === "failed").length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
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
          <TabsTrigger className="text-slate-900 dark:text-slate-100" value="merchant">
            Merchant Setup
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
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {methods.map((method) => (
                  <Card key={method.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          {getMethodIcon(method.type)}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {method.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={method.status === "active"}
                          className="data-[state=checked]:bg-blue-600 flex-shrink-0"
                          onCheckedChange={() => toggleMethodStatus(method.id)}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Badge className="text-slate-900 dark:text-slate-100 text-xs" variant="outline">
                            {method.type.replace("_", " ")}
                          </Badge>
                          <Badge
                            className="text-xs"
                            variant={method.status === "active" ? "default" : "secondary"}
                          >
                            {method.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {method.transactionFee}% + $0.30
                        </span>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900 dark:text-slate-100">
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    View and manage payment transactions
                  </CardDescription>
                </div>
                <Button className="w-full sm:w-auto" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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

        <TabsContent value="merchant">
          <div className="space-y-4 md:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                  Merchant Gateway Configuration
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure and manage payment gateway integrations for BOG and TBC banks
                </p>
              </div>
              <Badge
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 w-fit"
                variant="outline"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {(bankConfigs.bog.enabled ? 1 : 0) + (bankConfigs.tbc.enabled ? 1 : 0)} Active
              </Badge>
            </div>

            {/* BOG Configuration */}
            <Card className="border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-2xl flex items-center justify-center border-2 border-red-200 dark:border-red-800/50 shadow-md">
                        <Image
                                    alt="Bank of Georgia logo"
                                    className="rounded bg-white object-contain"
                                    height={32}
                                    src={"/logos/bog.png"}
                                    width={32}
                                  />
                      </div>
                      {bankConfigs.bog.enabled && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                          <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                        <span className="truncate">Bank of Georgia</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded flex-shrink-0">
                          BOG
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Primary payment gateway for Georgian customers
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 w-fit">
                    <Label
                      className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
                      htmlFor="bog-enabled"
                    >
                      {bankConfigs.bog.enabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      checked={bankConfigs.bog.enabled}
                      className="data-[state=checked]:bg-emerald-600"
                      id="bog-enabled"
                      onCheckedChange={(checked) =>
                        handleBankConfigChange("bog", "enabled", checked)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              {bankConfigs.bog.enabled && (
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="bog-merchant-id"
                      >
                        <Building2 className="h-4 w-4 text-slate-500" />
                        Merchant ID
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        id="bog-merchant-id"
                        placeholder="Enter BOG Merchant ID"
                        type="text"
                        value={bankConfigs.bog.merchantId}
                        onChange={(e) =>
                          handleBankConfigChange("bog", "merchantId", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="bog-api-key"
                      >
                        <Shield className="h-4 w-4 text-slate-500" />
                        API Key
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        id="bog-api-key"
                        placeholder="••••••••••••••••"
                        type="password"
                        value={bankConfigs.bog.apiKey}
                        onChange={(e) =>
                          handleBankConfigChange("bog", "apiKey", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="bog-secret-key"
                      >
                        <Shield className="h-4 w-4 text-slate-500" />
                        Secret Key
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        id="bog-secret-key"
                        placeholder="••••••••••••••••"
                        type="password"
                        value={bankConfigs.bog.secretKey}
                        onChange={(e) =>
                          handleBankConfigChange("bog", "secretKey", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="bog-environment"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Environment
                      </Label>
                      <Select
                        value={bankConfigs.bog.environment}
                        onValueChange={(value) =>
                          handleBankConfigChange("bog", "environment", value)
                        }
                      >
                        <SelectTrigger
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          id="bog-environment"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              Sandbox (Testing)
                            </div>
                          </SelectItem>
                          <SelectItem value="production">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              Production (Live)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                        onClick={() => testConnection("bog")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Test Connection
                      </Button>
                      <div className="flex items-center gap-2 flex-wrap">
                        {bankConfigs.bog.environment === "production" && (
                          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Production Mode
                          </Badge>
                        )}
                        {bankConfigs.bog.environment === "sandbox" && (
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            Sandbox Mode
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* TBC Configuration */}
            <Card className="border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl flex items-center justify-center border-2 border-blue-200 dark:border-blue-800/50 shadow-md">
                        <Image
                                    alt="TBC Bank logo"
                                    className="rounded bg-white object-contain"
                                    height={32}
                                    src={"/logos/tbc.png"}
                                    width={32}
                                  />
                      </div>
                      {bankConfigs.tbc.enabled && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                          <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                        <span className="truncate">TBC Bank</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded flex-shrink-0">
                          TBC
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Alternative payment gateway for Georgian customers
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 w-fit">
                    <Label
                      className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
                      htmlFor="tbc-enabled"
                    >
                      {bankConfigs.tbc.enabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      checked={bankConfigs.tbc.enabled}
                      className="data-[state=checked]:bg-emerald-600"
                      id="tbc-enabled"
                      onCheckedChange={(checked) =>
                        handleBankConfigChange("tbc", "enabled", checked)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              {bankConfigs.tbc.enabled && (
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="tbc-merchant-id"
                      >
                        <Building2 className="h-4 w-4 text-slate-500" />
                        Merchant ID
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        id="tbc-merchant-id"
                        placeholder="Enter TBC Merchant ID"
                        type="text"
                        value={bankConfigs.tbc.merchantId}
                        onChange={(e) =>
                          handleBankConfigChange("tbc", "merchantId", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="tbc-api-key"
                      >
                        <Shield className="h-4 w-4 text-slate-500" />
                        API Key
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        id="tbc-api-key"
                        placeholder="••••••••••••••••"
                        type="password"
                        value={bankConfigs.tbc.apiKey}
                        onChange={(e) =>
                          handleBankConfigChange("tbc", "apiKey", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="tbc-secret-key"
                      >
                        <Shield className="h-4 w-4 text-slate-500" />
                        Secret Key
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        id="tbc-secret-key"
                        placeholder="••••••••••••••••"
                        type="password"
                        value={bankConfigs.tbc.secretKey}
                        onChange={(e) =>
                          handleBankConfigChange("tbc", "secretKey", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        htmlFor="tbc-environment"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Environment
                      </Label>
                      <Select
                        value={bankConfigs.tbc.environment}
                        onValueChange={(value) =>
                          handleBankConfigChange("tbc", "environment", value)
                        }
                      >
                        <SelectTrigger
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          id="tbc-environment"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              Sandbox (Testing)
                            </div>
                          </SelectItem>
                          <SelectItem value="production">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              Production (Live)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                        onClick={() => testConnection("tbc")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Test Connection
                      </Button>
                      <div className="flex items-center gap-2 flex-wrap">
                        {bankConfigs.tbc.environment === "production" && (
                          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Production Mode
                          </Badge>
                        )}
                        {bankConfigs.tbc.environment === "sandbox" && (
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            Sandbox Mode
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Save Configuration */}
            <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 backdrop-blur">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        Save Configuration Changes
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Apply merchant gateway settings to your platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Button
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex-1 sm:flex-none"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-none"
                      onClick={saveMerchantConfig}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Save Configuration</span>
                      <span className="sm:hidden">Save</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
