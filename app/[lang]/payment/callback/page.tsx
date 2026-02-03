'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { usePaymentHub } from '@/hooks/payment/usePaymentHub';
import { useDictionary } from '@/app/context/dictionary-provider';
import { useCartStore } from '@/app/context/cartContext';

type PaymentStatus = 'checking' | 'success' | 'failed' | 'pending' | 'timeout';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dictionary = useDictionary();
  const clearCart = useCartStore((s) => s.clearCart);

  // Get status from URL params (set by payment gateway/backend)
  const statusFromUrl = searchParams.get('status');
  const errorFromUrl = searchParams.get('error');
  const orderIdFromUrl = searchParams.get('orderId');
  const paymentIdFromUrl = searchParams.get('paymentId');

  // Get from sessionStorage as fallback
  const paymentIdFromStorage = typeof window !== 'undefined'
    ? sessionStorage.getItem('currentPaymentId')
    : null;
  const orderIdFromStorage = typeof window !== 'undefined'
    ? sessionStorage.getItem('lastOrderId')
    : null;

  const paymentId = paymentIdFromUrl || paymentIdFromStorage;
  const orderId = orderIdFromUrl || orderIdFromStorage;

  // Connect to SignalR for real-time updates
  const { status: hubStatus, isConnected, error: hubError } = usePaymentHub(paymentId, true);

  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [message, setMessage] = useState(dictionary.checkout?.processing?.description || 'Processing your payment...');

  // Handle URL status (payment gateway redirected with status)
  useEffect(() => {
    if (statusFromUrl === 'success') {
      setStatus('success');
      setMessage(dictionary.checkout?.processing?.successMessage || 'Payment successful!');

      // Clear cart on success
      clearCart();

      // Clean up session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentPaymentId');
        sessionStorage.removeItem('lastOrderId');
        sessionStorage.removeItem('lastOrderNumber');
      }

      // Redirect to success page
      setTimeout(() => {
        const params = new URLSearchParams();

        if (orderId) params.set('orderId', orderId);
        if (paymentId) params.set('paymentId', paymentId);
        router.push(`/checkout/success?${params.toString()}`);
      }, 2000);
    } else if (statusFromUrl === 'failed') {
      setStatus('failed');
      setMessage(errorFromUrl || dictionary.checkout?.processing?.failed || 'Payment failed');

      // Redirect to failed page
      setTimeout(() => {
        const params = new URLSearchParams();

        if (errorFromUrl) params.set('reason', errorFromUrl);
        if (orderId) params.set('orderId', orderId);
        router.push(`/checkout/failed?${params.toString()}`);
      }, 2000);
    }
  }, [statusFromUrl, errorFromUrl, orderId, paymentId, router, dictionary, clearCart]);

  // Handle SignalR real-time updates
  useEffect(() => {
    if (hubStatus) {
      const statusUpper = hubStatus.status?.toUpperCase() || '';

      // Check if success (based on boolean or status strings)
      // Including variations like "Succeeded", "Succeeded", "Approved", "Completed", "Success"
      const isSuccessful = hubStatus.success ||
        ['APPROVED', 'COMPLETED', 'SUCCEEDED', 'SUCCESS'].includes(statusUpper);

      // Check if failed
      const isFailed = ['DECLINED', 'REJECTED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(statusUpper);

      if (isSuccessful) {
        setStatus('success');
        setMessage(hubStatus.message || dictionary.checkout?.processing?.successMessage || 'Payment successful!');

        // Clear cart on success
        clearCart();

        // Clean up session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentPaymentId');
          sessionStorage.removeItem('lastOrderId');
          sessionStorage.removeItem('lastOrderNumber');
        }

        // Redirect to success page
        setTimeout(() => {
          const params = new URLSearchParams();

          if (orderId) params.set('orderId', orderId);
          if (hubStatus.paymentId || paymentId) params.set('paymentId', hubStatus.paymentId || paymentId || '');
          router.push(`/checkout/success?${params.toString()}`);
        }, 2000);
      } else if (isFailed) {
        setStatus('failed');
        setMessage(hubStatus.message || dictionary.checkout?.processing?.failed || 'Payment failed');

        // Redirect to failed page
        setTimeout(() => {
          const params = new URLSearchParams();

          params.set('reason', hubStatus.status || 'Payment failed');
          if (orderId) params.set('orderId', orderId);
          router.push(`/checkout/failed?${params.toString()}`);
        }, 2000);
      } else {
        // Still processing or unknown status
        setStatus('pending');
        setMessage(hubStatus.message || dictionary.checkout?.processing?.description || 'Processing your payment...');
      }
    }
  }, [hubStatus, router, orderId, paymentId, dictionary, clearCart]);

  // Set timeout for payment processing
  useEffect(() => {
    // Don't timeout if we already have a final status
    if (status === 'success' || status === 'failed') return;

    // If no URL status and no payment ID, show error
    if (!statusFromUrl && !paymentId) {
      setStatus('failed');
      setMessage('Invalid payment callback. Missing payment information.');
      setTimeout(() => {
        router.push('/checkout/failed?reason=missing_payment_info');
      }, 2000);

      return;
    }

    // Set 2 minute timeout for SignalR-based status checking
    const timeoutId = setTimeout(() => {
      if (status === 'checking' || status === 'pending') {
        setStatus('timeout');
        setMessage('Payment verification timeout. Please check your order status or contact support.');
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearTimeout(timeoutId);
  }, [status, statusFromUrl, paymentId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <div className="text-center">
          {status === 'checking' || status === 'pending' ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600" />
              <h2 className="font-heading mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {dictionary.checkout?.processing?.title || 'Processing Payment'}
              </h2>
              <p className="font-primary text-gray-600 dark:text-gray-400">{message}</p>
              {isConnected && (
                <p className="font-primary mt-2 text-xs text-green-600 dark:text-green-400">
                  Connected to payment updates
                </p>
              )}
              {hubError && (
                <p className="font-primary mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  {hubError}
                </p>
              )}
            </>
          ) : status === 'timeout' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-yellow-800 dark:text-yellow-300">
                {dictionary.checkout?.processing?.timeout || 'Verification Timeout'}
              </h2>
              <p className="font-primary text-gray-600 dark:text-gray-400">{message}</p>
              <div className="mt-6 space-y-3">
                <button
                  className="font-primary w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                  onClick={() => router.push('/orders')}
                >
                  {dictionary.checkout?.processing?.checkOrders || 'Check My Orders'}
                </button>
                <button
                  className="font-primary w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-2 text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => router.push('/')}
                >
                  {dictionary.checkout?.processing?.goHome || 'Go to Home'}
                </button>
              </div>
            </>
          ) : status === 'success' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-green-800 dark:text-green-300">
                {dictionary.checkout?.processing?.success || 'Payment Successful'}
              </h2>
              <p className="font-primary text-gray-600 dark:text-gray-400">{message}</p>
              <p className="font-primary mt-2 text-sm text-gray-500 dark:text-gray-500">
                {dictionary.checkout?.processing?.redirecting || 'Redirecting...'}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-red-800 dark:text-red-300">
                {dictionary.checkout?.processing?.failed || 'Payment Failed'}
              </h2>
              <p className="font-primary text-gray-600 dark:text-gray-400">{message}</p>
              <div className="mt-6 space-y-3">
                <button
                  className="font-primary w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                  onClick={() => router.push('/checkout')}
                >
                  {dictionary.checkout?.processing?.tryAgain || 'Try Again'}
                </button>
                <button
                  className="font-primary w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-2 text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => router.push('/cart')}
                >
                  {dictionary.checkout?.processing?.backToCart || 'Back to Cart'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
