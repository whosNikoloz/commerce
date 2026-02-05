import type { OrderEvent } from '@/types/orderTypes';

/**
 * SSEOrderClient - Connects to the backend /orders/stream endpoint for real-time order updates
 *
 * Usage:
 * 1. Create instance with auth token and domain
 * 2. Call connect() to establish SSE connection
 * 3. Call onOrderEvent() to listen for updates
 * 4. Call disconnect() when done
 */
export class SSEOrderClient {
    private eventSource: EventSource | null = null;
    private baseUrl: string;
    private token: string;
    private domain: string;
    private eventHandlers: Set<(event: OrderEvent) => void> = new Set();
    private errorHandlers: Set<(error: Event) => void> = new Set();
    private openHandlers: Set<() => void> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(token: string, domain: string, baseUrl?: string) {
        this.token = token;
        this.domain = domain;
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://localhost:7043';
    }

    /**
     * Establish SSE connection to the order stream endpoint
     */
    connect(): void {
        if (this.eventSource) {
            console.warn('SSE connection already exists');

            return;
        }

        // EventSource doesn't support custom headers, so we use query parameters
        const url = `${this.baseUrl}/orders/stream?access_token=${encodeURIComponent(this.token)}&domain=${encodeURIComponent(this.domain)}`;

        try {
            this.eventSource = new EventSource(url);

            // Listen for order-event messages
            this.eventSource.addEventListener('order-event', (event: MessageEvent) => {
                try {
                    const data: OrderEvent = JSON.parse(event.data);

                    this.eventHandlers.forEach(handler => handler(data));
                } catch (err) {
                    console.error('Failed to parse order event:', err);
                }
            });

            // Handle connection open
            this.eventSource.onopen = () => {
                console.log('SSE order stream connected');
                this.reconnectAttempts = 0;
                this.openHandlers.forEach(handler => handler());
            };

            // Handle errors
            this.eventSource.onerror = (error: Event) => {
                console.error('SSE connection error:', error);
                this.errorHandlers.forEach(handler => handler(error));

                // EventSource automatically reconnects, but we track attempts
                if (this.eventSource?.readyState === EventSource.CONNECTING) {
                    this.reconnectAttempts++;
                    console.log(`SSE reconnecting... (attempt ${this.reconnectAttempts})`);

                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        console.error('Max reconnection attempts reached, closing connection');
                        this.disconnect();
                    }
                } else if (this.eventSource?.readyState === EventSource.CLOSED) {
                    console.error('SSE connection closed permanently');
                }
            };
        } catch (err) {
            console.error('Failed to create EventSource:', err);
            throw err;
        }
    }

    /**
     * Register a callback for order events
     */
    onOrderEvent(callback: (event: OrderEvent) => void): void {
        this.eventHandlers.add(callback);
    }

    /**
     * Remove a callback for order events
     */
    offOrderEvent(callback: (event: OrderEvent) => void): void {
        this.eventHandlers.delete(callback);
    }

    /**
     * Register a callback for connection open
     */
    onOpen(callback: () => void): void {
        this.openHandlers.add(callback);
    }

    /**
     * Remove a callback for connection open
     */
    offOpen(callback: () => void): void {
        this.openHandlers.delete(callback);
    }

    /**
     * Register a callback for errors
     */
    onError(callback: (error: Event) => void): void {
        this.errorHandlers.add(callback);
    }

    /**
     * Remove a callback for errors
     */
    offError(callback: (error: Event) => void): void {
        this.errorHandlers.delete(callback);
    }

    /**
     * Close the SSE connection
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            console.log('SSE order stream disconnected');
        }
    }

    /**
     * Get the current connection state
     */
    getConnectionState(): number | null {
        return this.eventSource?.readyState ?? null;
    }

    /**
     * Check if currently connected
     */
    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN;
    }

    /**
     * Check if currently connecting
     */
    isConnecting(): boolean {
        return this.eventSource?.readyState === EventSource.CONNECTING;
    }
}
