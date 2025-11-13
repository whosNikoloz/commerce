'use client';

import type { TBCPaymentDetails } from '@/types/payment';

import { useEffect, useState } from 'react';

import { useTBCPayment } from '@/hooks/payment/useTBCPayment';

interface PaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function PaymentStatus({
  paymentId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 3000,
}: PaymentStatusProps) {
  const { getPaymentStatus, loading } = useTBCPayment();
  const [paymentDetails, setPaymentDetails] = useState<TBCPaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchStatus = async () => {
      try {
        const details = await getPaymentStatus(paymentId);

        if (details) {
          setPaymentDetails(details);
          setError(null);

          if (onStatusChange) {
            onStatusChange(details.status);
          }

          // Stop polling if payment is in final state
          const finalStatuses = ['SUCCEEDED', 'FAILED', 'CANCELED', 'CANCELLED'];

          if (finalStatuses.includes(details.status.toUpperCase()) && intervalId) {
            clearInterval(intervalId);
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError('Failed to fetch payment status');
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling if autoRefresh is enabled
    if (autoRefresh) {
      intervalId = setInterval(fetchStatus, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId, getPaymentStatus, onStatusChange, autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'SUCCEEDED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
      case 'CANCELED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING':
      case 'CREATED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'SUCCEEDED':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'FAILED':
      case 'CANCELED':
      case 'CANCELLED':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'PENDING':
      case 'CREATED':
        return (
          <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (loading && !paymentDetails) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <span className="ml-2 text-sm text-gray-600">Loading payment status...</span>
      </div>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(paymentDetails.status)}`}>
          {getStatusIcon(paymentDetails.status)}
          {paymentDetails.status}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Payment ID</p>
          <p className="mt-1 font-mono text-sm text-gray-900">{paymentDetails.paymentId}</p>
        </div>

        {paymentDetails.transactionId && (
          <div>
            <p className="text-sm text-gray-500">Transaction ID</p>
            <p className="mt-1 font-mono text-sm text-gray-900">{paymentDetails.transactionId}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="mt-1 text-sm text-gray-900">
            {paymentDetails.amount} {paymentDetails.currency}
          </p>
        </div>

        {paymentDetails.paymentMethod && (
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="mt-1 text-sm text-gray-900">{paymentDetails.paymentMethod}</p>
          </div>
        )}
      </div>

      {paymentDetails.recurringCard && (
        <div className="border-t border-gray-200 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Card Information</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Card Number</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{paymentDetails.recurringCard.cardMask}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{paymentDetails.recurringCard.expiryDate}</p>
            </div>
          </div>
        </div>
      )}

      {(paymentDetails.userMessage || paymentDetails.developerMessage) && (
        <div className="border-t border-gray-200 pt-4">
          {paymentDetails.userMessage && (
            <p className="text-sm text-gray-700">{paymentDetails.userMessage}</p>
          )}
          {paymentDetails.developerMessage && (
            <p className="mt-1 text-xs text-gray-500">{paymentDetails.developerMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
