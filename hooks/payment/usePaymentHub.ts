import type { PaymentStatusUpdate } from '@/types/payment';

import { useEffect, useRef, useState, useCallback } from 'react';

import { PaymentHubClient } from '@/lib/signalr-client';
import { useUser } from '@/app/context/userContext';

interface UsePaymentHubReturn {
  /** Latest payment status update from SignalR */
  status: PaymentStatusUpdate | null;
  /** Whether the SignalR connection is active */
  isConnected: boolean;
  /** Error message if connection failed */
  error: string | null;
  /** Manually disconnect from the hub */
  disconnect: () => void;
}

/**
 * Hook for real-time payment status updates via SignalR
 *
 * @param paymentId - The payment ID to listen for updates
 * @param enabled - Whether to enable the connection (default: true)
 * @returns Connection state and payment status updates
 *
 * @example
 * ```tsx
 * const { status, isConnected, error } = usePaymentHub(paymentId);
 *
 * useEffect(() => {
 *   if (status?.success) {
 *     // Payment completed successfully
 *     router.push('/checkout/success');
 *   }
 * }, [status]);
 * ```
 */
export function usePaymentHub(
  paymentId: string | null,
  enabled: boolean = true
): UsePaymentHubReturn {
  const { accessToken } = useUser();
  const [status, setStatus] = useState<PaymentStatusUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hubRef = useRef<PaymentHubClient | null>(null);
  const connectionAttemptedRef = useRef(false);

  const disconnect = useCallback(() => {
    if (hubRef.current) {
      hubRef.current.disconnect();
      hubRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Skip if no paymentId, disabled, or already attempted
    if (!paymentId || !enabled) {
      return;
    }

    // Prevent multiple connection attempts
    if (connectionAttemptedRef.current) {
      return;
    }

    connectionAttemptedRef.current = true;

    const setupHub = async () => {
      try {
        const hub = new PaymentHubClient(paymentId, accessToken);

        hubRef.current = hub;

        // Listen for payment status updates
        hub.onPaymentStatus((update) => {
          setStatus(update);
        });

        // Listen for internal hub events
        hub.onJoined((data) => {
          console.log('Joined payment group successfully:', data.paymentId);
        });

        hub.onError((data) => {
          console.error('Payment Hub error:', data.message);
          setError(`Hub Error: ${data.message}`);
        });

        // Handle connection state changes
        hub.onConnectionChange({
          onClose: (err) => {
            if (err) {
              setError('Connection lost. Using polling fallback.');
            }
            setIsConnected(false);
          },
          onReconnecting: () => {
            setError('Reconnecting to payment updates...');
          },
          onReconnected: () => {
            setError(null);
            setIsConnected(true);
          },
        });

        // Set connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (!hub.isConnected()) {
            setError('Connection timeout. Using polling fallback.');
            setIsConnected(false);
          }
        }, 10000);

        await hub.connect();
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);
      } catch (err: any) {
        // Provide user-friendly error messages
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
      disconnect();
      connectionAttemptedRef.current = false;
    };
  }, [paymentId, enabled, disconnect, accessToken]);

  return {
    status,
    isConnected,
    error,
    disconnect,
  };
}
