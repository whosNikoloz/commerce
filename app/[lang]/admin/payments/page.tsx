import { PaymentsTable } from "@/components/admin/payments-table";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Monitor transactions and configure payment methods</p>
      </div>
      <PaymentsTable />
    </div>
  );
}
