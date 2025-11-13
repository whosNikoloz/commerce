'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<{ reason?: string } | null>(null);

  useEffect(() => {
    const reason = searchParams.get('reason');

    if (reason) {
      setPaymentInfo({ reason });
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/cart/checkout');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Payment Failed
          </h1>

          {paymentInfo?.reason && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {paymentInfo.reason}
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="mb-4 text-center text-gray-600">
              We couldn&apos;t process your payment. This could be due to:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Insufficient funds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Card declined by bank</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Incorrect card details</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Payment cancelled</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              onClick={handleRetry}
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>

            <Link className="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-center text-gray-700 transition hover:bg-gray-50"
              href="/cart"
            >
              Back to Cart
            </Link>

            <Link className="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-center text-gray-700 transition hover:bg-gray-50"
              href="/"
            >
              Continue Shopping
            </Link>

            <Link className="block w-full text-center text-sm text-blue-600 hover:underline" href="mailto:support@example.com">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
