export default function PaymentSuccess() {
  // You can read search params if bank appends them
  // const searchParams = useSearchParams();
  // const orderId = searchParams.get("orderId") ?? (typeof window !== "undefined" ? sessionStorage.getItem("lastOrderId") : null);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Payment Successful ✅</h1>
      <p className="text-muted-foreground">
        Thank you! Your payment was completed. We’ve sent a confirmation email.
      </p>
      <div className="mt-8">
        <a href="/" className="underline">
          Back to Home
        </a>
      </div>
    </div>
  );
}
