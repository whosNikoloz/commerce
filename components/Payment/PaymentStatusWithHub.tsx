'use client';

import { useEffect, useState } from 'react';

import PaymentStatus from './PaymentStatus';

import { usePaymentHub } from '@/hooks/payment/usePaymentHub';

interface PaymentStatusWithHubProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
  useRealtime?: boolean;
}

export default function PaymentStatusWithHub({
  paymentId,
  onStatusChange,
  useRealtime = true,
}: PaymentStatusWithHubProps) {
  const { status: hubStatus, isConnected, error: hubError } = usePaymentHub(paymentId, useRealtime);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (hubStatus) {
      setCurrentStatus(hubStatus.status);
      if (onStatusChange) {
        onStatusChange(hubStatus.status);
      }
    }
  }, [hubStatus, onStatusChange]);

  return (
    <div className="space-y-4">
      {useRealtime && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="font-primary text-gray-600">
            {isConnected ? 'Real-time updates active' : 'Connecting to real-time updates...'}
          </span>
        </div>
      )}

      {hubError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {hubError}. Falling back to polling.
        </div>
      )}

      <PaymentStatus
        autoRefresh={!isConnected || !!hubError}
        paymentId={paymentId}
        refreshInterval={5000}
        onStatusChange={onStatusChange}
      />

      {hubStatus && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="font-primary text-sm font-medium text-blue-900">Latest Update</p>
          <p className="font-primary mt-1 text-sm text-blue-700">{hubStatus.message}</p>
        </div>
      )}
    </div>
  );
}
