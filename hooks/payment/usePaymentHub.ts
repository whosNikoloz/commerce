import { useEffect, useRef, useState } from 'react';
import { PaymentHubClient } from '@/lib/signalr-client';
import type { PaymentStatusUpdate } from '@/types/payment';

export function usePaymentHub(paymentId: string | null, enabled: boolean = true) {
  const [status, setStatus] = useState<PaymentStatusUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hubRef = useRef<PaymentHubClient | null>(null);

  useEffect(() => {
    if (!paymentId || !enabled) {
      return;
    }

    const setupHub = async () => {
      try {
        const hub = new PaymentHubClient(paymentId);
        hubRef.current = hub;

        await hub.connect();
        setIsConnected(true);
        setError(null);

        hub.onPaymentStatus((update) => {
          console.log('Payment status update:', update);
          setStatus(update);
        });
      } catch (err) {
        console.error('Failed to connect to payment hub:', err);
        setError('Failed to connect to payment updates');
        setIsConnected(false);
      }
    };

    setupHub();

    return () => {
      if (hubRef.current) {
        hubRef.current.disconnect();
        hubRef.current = null;
        setIsConnected(false);
      }
    };
  }, [paymentId, enabled]);

  return {
    status,
    isConnected,
    error,
  };
}
