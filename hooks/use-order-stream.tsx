'use client';

import type { OrderEvent } from '@/types/orderTypes';

import { useEffect, useState, useCallback, useRef } from 'react';

import { SSEOrderClient } from '@/lib/sse-order-client';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseOrderStreamOptions {
    token: string;
    domain: string;
    maxEvents?: number;
    autoConnect?: boolean;
}

interface UseOrderStreamReturn {
    events: OrderEvent[];
    connected: ConnectionStatus;
    error: Event | null;
    connect: () => void;
    disconnect: () => void;
    clearEvents: () => void;
}

/**
 * Custom hook for managing SSE order stream connection
 * 
 * @param options - Configuration options
 * @returns Stream state and control functions
 * 
 * @example
 * ```tsx
 * const { events, connected, connect, disconnect } = useOrderStream({
 *   token: adminToken,
 *   domain: 'new.janishop.ge',
 *   maxEvents: 100,
 *   autoConnect: true
 * });
 * ```
 */
export function useOrderStream({
    token,
    domain,
    maxEvents = 100,
    autoConnect = true,
}: UseOrderStreamOptions): UseOrderStreamReturn {
    const [events, setEvents] = useState<OrderEvent[]>([]);
    const [connected, setConnected] = useState<ConnectionStatus>('disconnected');
    const [error, setError] = useState<Event | null>(null);
    const clientRef = useRef<SSEOrderClient | null>(null);

    const connect = useCallback(() => {
        if (!token || !domain) {
            console.error('Token and domain are required to connect');

            return;
        }

        if (clientRef.current?.isConnected()) {
            console.warn('Already connected to order stream');

            return;
        }

        try {
            setConnected('connected');
            setError(null);

            const client = new SSEOrderClient(token, domain);

            clientRef.current = client;

            // Handle order events
            const handleOrderEvent = (event: OrderEvent) => {
                setEvents(prev => {
                    const newEvents = [event, ...prev];

                    return newEvents.slice(0, maxEvents);
                });
            };

            // Handle connection open
            const handleOpen = () => {
                setConnected('connected');
                setError(null);
            };

            // Handle errors — only show 'error' when permanently closed
            const handleError = (err: Event) => {
                setError(err);
                if (client.getConnectionState() === EventSource.CLOSED) {
                    setConnected('error');
                }
                // If CONNECTING (auto-reconnect), keep current state — no orange flash
            };

            client.onOrderEvent(handleOrderEvent);
            client.onOpen(handleOpen);
            client.onError(handleError);

            client.connect();
        } catch (err) {
            console.error('Failed to connect to order stream:', err);
            setConnected('error');
            setError(err as Event);
        }
    }, [token, domain, maxEvents]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
            setConnected('disconnected');
        }
    }, []);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect && token && domain) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, token, domain, connect, disconnect]);

    return {
        events,
        connected,
        error,
        connect,
        disconnect,
        clearEvents,
    };
}
