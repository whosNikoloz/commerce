'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTBCPayment } from '@/hooks/payment/useTBCPayment';
import { useBOGPayment } from '@/hooks/payment/useBOGPayment';
import { usePaymentHub } from '@/hooks/payment/usePaymentHub';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get('provider');
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');

  const { getPaymentStatus: getTBCStatus, loading: tbcLoading } = useTBCPayment();
  const { getPaymentStatus: getBOGStatus, loading: bogLoading } = useBOGPayment();
  const { status: hubStatus } = usePaymentHub(paymentId, provider === 'tbc');

  const loading = tbcLoading || bogLoading;

  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    if (!paymentId && !orderId) {
      setStatus('failed');
      setMessage('Payment ID or Order ID not found');
      return;
    }

    const checkPayment = async () => {
      try {
        let details: any = null;
        let statusUpper = '';

        if (provider === 'tbc' && paymentId) {
          details = await getTBCStatus(paymentId);
          statusUpper = details?.status?.toUpperCase() || '';

          if (statusUpper === 'SUCCEEDED') {
            setStatus('success');
            setMessage('Payment completed successfully!');
            setTimeout(() => {
              router.push('/checkout/success?paymentId=' + paymentId);
            }, 2000);
          } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELED' || statusUpper === 'CANCELLED') {
            setStatus('failed');
            setMessage('Payment failed or was cancelled');
            setTimeout(() => {
              router.push('/checkout/failed?reason=' + encodeURIComponent(statusUpper));
            }, 2000);
          } else {
            setStatus('pending');
            setMessage('Payment is being processed...');
            if (!hubStatus) {
              setTimeout(() => checkPayment(), 3000);
            }
          }
        } else if (provider === 'bog' && orderId) {
          details = await getBOGStatus(orderId);
          statusUpper = details?.status?.toUpperCase() || '';

          if (statusUpper === 'COMPLETED' || statusUpper === 'APPROVED') {
            setStatus('success');
            setMessage('Payment completed successfully!');
            setTimeout(() => {
              router.push('/checkout/success?orderId=' + orderId);
            }, 2000);
          } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED' || statusUpper === 'DECLINED') {
            setStatus('failed');
            setMessage('Payment failed or was cancelled');
            setTimeout(() => {
              router.push('/checkout/failed?reason=' + encodeURIComponent(statusUpper));
            }, 2000);
          } else {
            setStatus('pending');
            setMessage('Payment is being processed...');
            setTimeout(() => checkPayment(), 3000);
          }
        } else {
          setStatus('failed');
          setMessage('Invalid payment provider or missing payment information');
          setTimeout(() => {
            router.push('/checkout/failed?reason=Invalid+payment+information');
          }, 2000);
        }
      } catch (error) {
        setStatus('failed');
        setMessage('Error checking payment status');
        setTimeout(() => {
          router.push('/checkout/failed?reason=Error+checking+payment');
        }, 2000);
      }
    };

    checkPayment();
  }, [searchParams, getTBCStatus, getBOGStatus, router, paymentId, orderId, provider, hubStatus]);

  // Handle real-time updates from SignalR
  useEffect(() => {
    if (hubStatus) {
      const statusUpper = hubStatus.status.toUpperCase();

      if (statusUpper === 'SUCCEEDED') {
        setStatus('success');
        setMessage(hubStatus.message || 'Payment completed successfully!');

        setTimeout(() => {
          router.push('/checkout/success?paymentId=' + paymentId);
        }, 2000);
      } else if (statusUpper === 'FAILED' || statusUpper === 'CANCELED' || statusUpper === 'CANCELLED') {
        setStatus('failed');
        setMessage(hubStatus.message || 'Payment failed or was cancelled');
      } else {
        setStatus('pending');
        setMessage(hubStatus.message || 'Payment is being processed...');
      }
    }
  }, [hubStatus, router, paymentId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {loading || status === 'checking' || status === 'pending' ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">Processing Payment</h2>
              <p className="text-gray-600">{message}</p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-green-800">Payment Successful!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="mt-2 text-sm text-gray-500">Redirecting to confirmation page...</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-red-800">Payment Failed</h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/checkout')}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Try Again
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
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
