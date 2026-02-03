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
  private connection: signalR.HubConnection;
  private paymentId: string;
  private hubUrl: string;
  private handlers = new Map<string, Set<any>>();

  constructor(paymentId: string, hubUrl?: string) {
    this.paymentId = paymentId;
    this.hubUrl = hubUrl || process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://localhost:7043';

    // Get auth token if available (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const domain = 'new.janishop.ge';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/transactionHub?domain=${encodeURIComponent(domain)}`, {
        accessTokenFactory: token ? () => token : undefined,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  async connect(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.start();
      console.log('SignalR connected, joining group:', this.paymentId);
      // Join the payment-specific group to receive updates
      await this.connection.invoke('JoinGroup', this.paymentId);
    } catch (err) {
      console.error('Failed to connect to SignalR:', err);
      throw err;
    }
  }

  /**
   * Listen for successful join event
   */
  onJoined(callback: (data: { paymentId: string; message: string }) => void): void {
    this.connection.on('Joined', callback);
  }

  /**
   * Listen for hub errors
   */
  onError(callback: (data: { message: string }) => void): void {
    this.connection.on('Error', callback);
  }

  /**
   * Listen for payment status updates
   */
  onPaymentStatus(callback: (update: PaymentStatusUpdate) => void): void {
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
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
