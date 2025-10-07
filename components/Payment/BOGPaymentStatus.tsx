'use client';

import { useEffect, useState } from 'react';
import { useBOGPayment } from '@/hooks/payment/useBOGPayment';
import type { BOGPaymentDetails } from '@/types/payment';

interface BOGPaymentStatusProps {
  orderId: string;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function BOGPaymentStatus({
  orderId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 3000,
}: BOGPaymentStatusProps) {
  const { getPaymentStatus, loading } = useBOGPayment();
  const [paymentDetails, setPaymentDetails] = useState<BOGPaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchStatus = async () => {
      try {
        const details = await getPaymentStatus(orderId);
        if (details) {
          setPaymentDetails(details);
          setError(null);

          if (onStatusChange) {
            onStatusChange(details.status);
          }

          // Stop polling if payment is in final state
          const finalStatuses = ['COMPLETED', 'APPROVED', 'FAILED', 'CANCELLED', 'VOIDED'];
          if (finalStatuses.includes(details.status.toUpperCase()) && intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
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
  }, [orderId, getPaymentStatus, onStatusChange, autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
      case 'VOIDED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'CREATED':
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
      case 'APPROVED':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'FAILED':
      case 'VOIDED':
      case 'CANCELLED':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'CREATED':
      case 'PENDING':
        return (
          <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
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
        <h3 className="text-lg font-semibold text-gray-900">BOG Payment Status</h3>
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(paymentDetails.status)}`}>
          {getStatusIcon(paymentDetails.status)}
          {paymentDetails.status}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="mt-1 font-mono text-sm text-gray-900">{paymentDetails.order_id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Intent</p>
          <p className="mt-1 text-sm text-gray-900">{paymentDetails.intent}</p>
        </div>

        {paymentDetails.purchase_units && paymentDetails.purchase_units.length > 0 && (
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="mt-1 text-sm text-gray-900">
              {paymentDetails.purchase_units[0].amount.value} {paymentDetails.purchase_units[0].amount.currency_code}
            </p>
          </div>
        )}
      </div>

      {(paymentDetails.links || paymentDetails._links) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Available Actions</p>
          <div className="flex flex-wrap gap-2">
            {(paymentDetails.links || paymentDetails._links || []).map((link, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {link.rel}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
