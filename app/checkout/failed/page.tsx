'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw } from 'lucide-react';

export default function PaymentFailedPage() {
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
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Failed</h1>
          <p className="mb-6 text-gray-600">
            Unfortunately, we couldn't process your payment. Please try again.
          </p>

          {/* Failure Reason */}
          {paymentInfo?.reason && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Reason:</p>
              <p className="text-sm text-red-700">{paymentInfo.reason}</p>
            </div>
          )}

          {/* Common Reasons */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Common Issues:</h2>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Insufficient funds</li>
              <li>• Incorrect card details</li>
              <li>• Payment cancelled by user</li>
              <li>• Bank declined the transaction</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
            <Link
              href="/cart"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back to Cart
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 underline hover:text-gray-900"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
