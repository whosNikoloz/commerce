import type { PaymentStatusUpdate } from '@/types/payment';

import { useEffect, useRef, useState } from 'react';

import { PaymentHubClient } from '@/lib/signalr-client';

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

        // Set connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (!isConnected) {
            setError('Connection timeout. Using polling fallback.');
            setIsConnected(false);
          }
        }, 10000);

        await hub.connect();
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);

        hub.onPaymentStatus((update) => {
          // eslint-disable-next-line no-console
          console.log('Payment status update:', update);
          setStatus(update);
        });

        // Handle connection errors
        const connection = (hub as any).connection;
        if (connection) {
          connection.onclose((error: any) => {
            if (error) {
              console.error('SignalR connection closed with error:', error);
              setError('Connection lost. Using polling fallback.');
              setIsConnected(false);
            }
          });

          connection.onreconnecting(() => {
            setError('Reconnecting to payment updates...');
          });

          connection.onreconnected(() => {
            setError(null);
            setIsConnected(true);
          });
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to connect to payment hub:', err);
        
        // Provide more specific error messages
        if (err?.message?.includes('timeout') || err?.message?.includes('ECONNREFUSED')) {
          setError('Cannot connect to payment server. Using polling fallback.');
        } else if (err?.message?.includes('404') || err?.message?.includes('Not Found')) {
          setError('Payment hub not found. Using polling fallback.');
        } else {
          setError('Failed to connect to real-time updates. Using polling fallback.');
        }
        
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
