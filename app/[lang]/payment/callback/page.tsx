'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { useTBCPayment } from '@/hooks/payment/useTBCPayment';
import { useBOGPayment } from '@/hooks/payment/useBOGPayment';
import { usePaymentHub } from '@/hooks/payment/usePaymentHub';
import { useDictionary } from '@/app/context/dictionary-provider';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get('provider');
  
  // Per guide: Get paymentId/orderId from URL params or sessionStorage
  const paymentIdFromUrl = searchParams.get('paymentId');
  const orderIdFromUrl = searchParams.get('orderId');
  
  // Get from sessionStorage as fallback (per guide pattern)
  const paymentIdFromStorage = typeof window !== 'undefined' 
    ? sessionStorage.getItem('currentPaymentId') 
    : null;
  const orderIdFromStorage = typeof window !== 'undefined' 
    ? sessionStorage.getItem('lastOrderId') 
    : null;
  
  const paymentId = paymentIdFromUrl || paymentIdFromStorage;
  const orderId = orderIdFromUrl || orderIdFromStorage;

  const { getPaymentStatus: getTBCStatus, loading: tbcLoading } = useTBCPayment();
  const { getPaymentStatus: getBOGStatus, loading: bogLoading } = useBOGPayment();
  const { status: hubStatus } = usePaymentHub(paymentId, provider === 'tbc');

  // Get dictionary
  const { dictionary } = useDictionary();

  const loading = tbcLoading || bogLoading;

  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending' | 'timeout'>('checking');
  const [message, setMessage] = useState(dictionary.checkout.processing.description);
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 60; // Max 60 polls = 3 minutes (60 * 3 seconds)
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes timeout

  useEffect(() => {
    // Per guide: paymentId is required for TBC, orderId for BOG
    if (provider === 'tbc' && !paymentId) {
      setStatus('failed');
      setMessage(dictionary.checkout.errors.invalidProvider || 'Payment ID is required');

      return;
    }

    if (provider === 'bog' && !orderId) {
      setStatus('failed');
      setMessage(dictionary.checkout.errors.invalidProvider || 'Order ID is required');

      return;
    }

    // Set timeout for payment processing (30 minutes max)
    const timeoutId = setTimeout(() => {
      if (status === 'checking' || status === 'pending') {
        setStatus('timeout');
        setMessage('Payment session expired. Please check your order status or try again.');
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentPaymentId');
          sessionStorage.removeItem('lastOrderId');
        }
      }
    }, timeoutDuration);

    const checkPayment = async () => {
      // Prevent infinite polling
      if (pollCount >= maxPolls) {
        setStatus('timeout');
        setMessage('Payment check timeout. Please check your order status manually.');
        clearTimeout(timeoutId);

        return;
      }

      try {
        let details: any = null;
        let statusUpper = '';

        if (provider === 'tbc' && paymentId) {
          // Per guide: Check payment status via GET /TBCPayment/{paymentId}
          try {
            details = await getTBCStatus(paymentId);
            statusUpper = details?.status?.toUpperCase() || '';
          } catch (apiError: any) {
            // Handle API errors gracefully
            // eslint-disable-next-line no-console
            console.error('Error checking payment status:', apiError);

            // If it's a network error, retry
            if (pollCount < maxPolls && !hubStatus) {
              setPollCount(prev => prev + 1);
              setTimeout(() => checkPayment(), 3000);

              return;
            }

            // If max retries reached or other error, show error
            setStatus('failed');
            setMessage('Unable to verify payment status. Please check your order or contact support.');
            clearTimeout(timeoutId);

            return;
          }

          if (statusUpper === 'SUCCEEDED') {
            clearTimeout(timeoutId);
            setStatus('success');
            setMessage(dictionary.checkout.processing.successMessage);

            // Per guide: Clean up stored IDs after success
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('currentPaymentId');
              sessionStorage.removeItem('lastOrderId');
            }
            
            setTimeout(() => {
              router.push('/checkout/success?paymentId=' + paymentId);
            }, 2000);
          } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELED' || statusUpper === 'CANCELLED') {
            clearTimeout(timeoutId);
            setStatus('failed');
            setMessage(dictionary.checkout.processing.failed);
            setTimeout(() => {
              router.push('/checkout/failed?reason=' + encodeURIComponent(statusUpper));
            }, 2000);
          } else {
            // Per guide: Show pending status and poll if SignalR not connected
            setStatus('pending');
            setMessage(dictionary.checkout.processing.description);

            if (!hubStatus) {
              // Per guide: Poll every 2-3 seconds as fallback
              setPollCount(prev => prev + 1);
              setTimeout(() => checkPayment(), 3000);
            }
          }
        } else if (provider === 'bog' && orderId) {
          details = await getBOGStatus(orderId);
          statusUpper = details?.status?.toUpperCase() || '';

          if (statusUpper === 'COMPLETED' || statusUpper === 'APPROVED') {
            setStatus('success');
            setMessage(dictionary.checkout.processing.successMessage);
            setTimeout(() => {
              router.push('/checkout/success?orderId=' + orderId);
            }, 2000);
          } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED' || statusUpper === 'DECLINED') {
            setStatus('failed');
            setMessage(dictionary.checkout.processing.failed);
            setTimeout(() => {
              router.push('/checkout/failed?reason=' + encodeURIComponent(statusUpper));
            }, 2000);
          } else {
            setStatus('pending');
            setMessage(dictionary.checkout.processing.description);

            if (pollCount < maxPolls) {
            setPollCount(prev => prev + 1);
            setTimeout(() => checkPayment(), 3000);
          } else {
            setStatus('timeout');
            setMessage('Payment check timeout. Please check your order status.');
            clearTimeout(timeoutId);
          }
        }
        } else {
          clearTimeout(timeoutId);
          setStatus('failed');
          setMessage(dictionary.checkout.errors.invalidProvider);
          setTimeout(() => {
            router.push('/checkout/failed?reason=Invalid+payment+information');
          }, 2000);
        }
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Payment check error:', error);
        clearTimeout(timeoutId);
        
        // If we've tried too many times, give up
        if (pollCount >= maxPolls) {
          setStatus('timeout');
          setMessage('Unable to verify payment status after multiple attempts. Please check your order or contact support.');
        } else {
          setStatus('failed');
          setMessage(dictionary.checkout.processing.errorChecking || 'Error checking payment status');
          setTimeout(() => {
            router.push('/checkout/failed?reason=Error+checking+payment');
          }, 2000);
        }
      }
    };

    checkPayment();

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchParams, getTBCStatus, getBOGStatus, router, paymentId, orderId, provider, hubStatus, dictionary, pollCount, status]);

  // Handle real-time updates from SignalR
  useEffect(() => {
    if (hubStatus) {
      const statusUpper = hubStatus.status.toUpperCase();

      if (statusUpper === 'SUCCEEDED') {
        setStatus('success');
        setMessage(hubStatus.message || dictionary.checkout.processing.successMessage);

        // Per guide: Clean up stored IDs after success
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentPaymentId');
          sessionStorage.removeItem('lastOrderId');
        }

        setTimeout(() => {
          router.push('/checkout/success?paymentId=' + paymentId);
        }, 2000);
      } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELED' || statusUpper === 'CANCELLED') {
        setStatus('failed');
        setMessage(hubStatus.message || dictionary.checkout.processing.failed);
        setTimeout(() => {
          router.push('/checkout/failed?reason=' + encodeURIComponent(statusUpper));
        }, 2000);
      } else {
        setStatus('pending');
        setMessage(hubStatus.message || dictionary.checkout.processing.description);
      }
    }
  }, [hubStatus, router, paymentId, dictionary]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {loading || status === 'checking' || status === 'pending' ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <h2 className="font-heading mb-2 text-2xl font-semibold text-gray-800">{dictionary.checkout.processing.title}</h2>
              <p className="font-primary text-gray-600">{message}</p>
              {pollCount > 0 && (
                <p className="font-primary mt-2 text-xs text-gray-500">Checking... ({pollCount}/{maxPolls})</p>
              )}
            </>
          ) : status === 'timeout' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-yellow-800">Payment Check Timeout</h2>
              <p className="font-primary text-gray-600">{message}</p>
              <div className="mt-6 space-y-3">
                <button className="font-primary w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                  onClick={() => router.push('/cart/checkout')}
                >
                  Try Again
                </button>
                <button className="font-primary w-full rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                  onClick={() => router.push('/')}
                >
                  Go to Home
                </button>
              </div>
            </>
          ) : status === 'success' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-green-800">{dictionary.checkout.processing.success}</h2>
              <p className="font-primary text-gray-600">{message}</p>
              <p className="font-primary mt-2 text-sm text-gray-500">{dictionary.checkout.processing.redirecting}</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-red-800">{dictionary.checkout.processing.failed}</h2>
              <p className="font-primary text-gray-600">{message}</p>
              <button className="font-primary mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                onClick={() => router.push('/checkout')}
              >
                {dictionary.checkout.processing.tryAgain}
              </button>
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
