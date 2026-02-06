'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { usePaymentHub } from '@/hooks/payment/usePaymentHub';
import { useDictionary } from '@/app/context/dictionary-provider';
import { useCartStore } from '@/app/context/cartContext';
import { Button } from '@/components/ui/button';

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
  const { status: hubStatus, isConnected } = usePaymentHub(paymentId, true);

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

  // Render content based on status
  const renderContent = () => {
    switch (status) {
      case 'checking':
      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-white dark:bg-neutral-800 rounded-full p-4 shadow-sm border border-gray-100 dark:border-neutral-700">
                <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              {dictionary.checkout?.processing?.title || 'Processing Payment'}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6 font-primary text-sm leading-relaxed">
              {message}
            </p>

            {isConnected && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Connected to payment gateway
                </span>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-xl" />
              <div className="relative bg-white dark:bg-neutral-800 rounded-full p-4 shadow-sm border border-gray-100 dark:border-neutral-700">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              {dictionary.checkout?.processing?.success || 'Payment Successful'}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6 font-primary text-sm">
              {message}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {dictionary.checkout?.processing?.redirecting || 'Redirecting...'}
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-xl" />
              <div className="relative bg-white dark:bg-neutral-800 rounded-full p-4 shadow-sm border border-gray-100 dark:border-neutral-700">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </motion.div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              {dictionary.checkout?.processing?.failed || 'Payment Failed'}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8 font-primary text-sm">
              {message}
            </p>

            <div className="grid grid-cols-1 w-full gap-3">
              <Button
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                onClick={() => router.push('/checkout')}
              >
                {dictionary.checkout?.processing?.tryAgain || 'Try Again'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                onClick={() => router.push('/cart')}
              >
                {dictionary.checkout?.processing?.backToCart || 'Back to Cart'}
              </Button>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-xl" />
              <div className="relative bg-white dark:bg-neutral-800 rounded-full p-4 shadow-sm border border-gray-100 dark:border-neutral-700">
                <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              {dictionary.checkout?.processing?.timeout || 'Verification Timeout'}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8 font-primary text-sm">
              {message}
            </p>

            <div className="grid grid-cols-1 w-full gap-3">
              <Button
                className="w-full"
                onClick={() => router.push('/profile/orders')}
              >
                {dictionary.checkout?.processing?.checkOrders || 'Check My Orders'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 dark:border-neutral-700"
                onClick={() => router.push('/')}
              >
                {dictionary.checkout?.processing?.goHome || 'Go to Home'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand/Logo Area */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-xl">
            <ShoppingBag className="h-6 w-6" />
            <span>Store</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-neutral-800 overflow-hidden relative">
          {/* Progress Bar for Checking state */}
          {(status === 'checking' || status === 'pending') && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-neutral-800">
              <div className="h-full bg-blue-500 dark:bg-blue-400 animate-progress-indeterminate" />
            </div>
          )}

          {renderContent()}
        </div>

        {/* Footer Help Text */}
        <p className="text-center mt-8 text-xs text-gray-400 dark:text-neutral-500">
          Need help? <a href="/contact" className="underline hover:text-gray-600 dark:hover:text-neutral-400">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
