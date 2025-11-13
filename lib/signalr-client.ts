import type { PaymentStatusUpdate } from '@/types/payment';

import * as signalR from '@microsoft/signalr';

export class PaymentHubClient {
  private connection: signalR.HubConnection | null = null;
  private paymentId: string;
  private hubUrl: string;

  constructor(paymentId: string, hubUrl?: string) {
    this.paymentId = paymentId;
    this.hubUrl = hubUrl || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7043';
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/paymentHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      // eslint-disable-next-line no-console
      console.log('SignalR Connected');

      await this.connection.invoke('JoinPaymentGroup', this.paymentId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SignalR Connection Error:', err);
      throw err;
    }
  }

  onPaymentStatus(callback: (update: PaymentStatusUpdate) => void): void {
    if (!this.connection) {
      throw new Error('Connection not established. Call connect() first.');
    }

    this.connection.on('PaymentStatus', callback);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.invoke('LeavePaymentGroup', this.paymentId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error leaving payment group:', err);
      }

      await this.connection.stop();
      this.connection = null;
      // eslint-disable-next-line no-console
      console.log('SignalR Disconnected');
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}
