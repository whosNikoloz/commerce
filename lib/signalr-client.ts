import type { PaymentStatusUpdate } from '@/types/payment';

import * as signalR from '@microsoft/signalr';

/**
 * PaymentHubClient - Connects to the backend transactionHub for real-time payment updates
 *
 * Usage:
 * 1. Create instance with paymentId
 * 2. Call connect() to establish connection
 * 3. Call onPaymentStatus() to listen for updates
 * 4. Call disconnect() when done
 */
export class PaymentHubClient {
  private connection: signalR.HubConnection | null = null;
  private paymentId: string;
  private hubUrl: string;

  constructor(paymentId: string, hubUrl?: string) {
    this.paymentId = paymentId;
    this.hubUrl = hubUrl || process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://localhost:7043';
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    // Get auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    //const domain = typeof window !== 'undefined' ? window.location.hostname : '';
    const domain = 'new.janishop.ge';
    const connectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/transactionHub?domain=${encodeURIComponent(domain)}`, {
        accessTokenFactory: token ? () => token : undefined,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection = connectionBuilder;

    // Register internal handlers for lifecycle events
    this.connection.on('Joined', (data: { paymentId: string; message: string }) => {
      console.log('Joined payment group:', data.paymentId, data.message);
    });

    this.connection.on('Error', (data: { message: string }) => {
      console.error('Hub error:', data.message);
    });

    try {
      await this.connection.start();
      // Join the payment-specific group to receive updates
      await this.connection.invoke('JoinGroup', this.paymentId);
    } catch (err) {
      this.connection = null;
      throw err;
    }
  }

  /**
   * Listen for successful join event
   */
  onJoined(callback: (data: { paymentId: string; message: string }) => void): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }
    this.connection.on('Joined', callback);
  }

  /**
   * Listen for hub errors
   */
  onError(callback: (data: { message: string }) => void): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }
    this.connection.on('Error', callback);
  }

  /**
   * Listen for payment status updates
   * The callback receives PaymentStatusUpdate with:
   * - status: string (e.g., "approved", "declined")
   * - message: string (human-readable message)
   * - paymentId: string
   * - success: boolean
   */
  onPaymentStatus(callback: (update: PaymentStatusUpdate) => void): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }

    this.connection.on('PaymentStatus', callback);
  }

  /**
   * Handle connection state changes
   */
  onConnectionChange(callbacks: {
    onClose?: (error?: Error) => void;
    onReconnecting?: (error?: Error) => void;
    onReconnected?: (connectionId?: string) => void;
  }): void {
    if (!this.connection) return;

    if (callbacks.onClose) {
      this.connection.onclose(callbacks.onClose);
    }
    if (callbacks.onReconnecting) {
      this.connection.onreconnecting(callbacks.onReconnecting);
    }
    if (callbacks.onReconnected) {
      this.connection.onreconnected(callbacks.onReconnected);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        // Leave the payment group before disconnecting
        await this.connection.invoke('LeaveGroup', this.paymentId).catch(() => { });
      } catch {
        // Ignore errors when leaving group
      }

      await this.connection.stop();
      this.connection = null;
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
