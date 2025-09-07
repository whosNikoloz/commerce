export default function PaymentFail() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Payment Failed ❌</h1>
      <p className="text-muted-foreground">
        We couldn’t complete your payment. Please try again or use another method.
      </p>
      <div className="mt-8">
        <a className="underline" href="/cart">
          Return to cart
        </a>
      </div>
    </div>
  );
}
