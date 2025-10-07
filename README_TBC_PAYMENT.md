# TBC Payment Integration

Complete integration of TBC Bank payment system with your Next.js e-commerce application.

## Features

- ✅ Full TBC Payment API integration
- ✅ Real-time payment status updates via SignalR
- ✅ Automatic fallback to polling if WebSocket fails
- ✅ Payment callback handling
- ✅ Payment status tracking component
- ✅ TypeScript types for all API requests/responses
- ✅ Custom React hooks for easy integration

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Backend API URL for TBC Payment
BACKEND_API_URL=https://localhost:7043

# Public URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=https://localhost:7043
```

### 2. Backend Configuration

Make sure your C# backend API is running with the following endpoints:

- `POST /TBCPayment/create` - Create payment
- `GET /TBCPayment/{paymentId}` - Get payment status
- `POST /TBCPayment/{paymentId}/cancel` - Cancel payment
- `GET /TBCPayment/callback` - Payment callback webhook

### 3. SignalR Hub

Your backend should have a SignalR hub configured at `/paymentHub` for real-time updates.

## Usage

### Basic Payment Flow

```tsx
import { useTBCPayment } from '@/hooks/useTBCPayment';

function CheckoutButton() {
  const { createPayment, loading } = useTBCPayment();

  const handlePayment = async () => {
    const result = await createPayment(
      100,           // amount
      'GEL',         // currency
      undefined,     // returnUrl (optional)
      undefined,     // extraInfo (optional)
      'KA'           // language
    );

    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      Pay ₾100
    </button>
  );
}
```

### Payment Status Tracking

```tsx
import PaymentStatus from '@/components/Payment/PaymentStatus';

function PaymentPage({ paymentId }: { paymentId: string }) {
  return (
    <PaymentStatus
      paymentId={paymentId}
      onStatusChange={(status) => console.log('Status:', status)}
      autoRefresh={true}
      refreshInterval={3000}
    />
  );
}
```

### Real-time Payment Updates with SignalR

```tsx
import PaymentStatusWithHub from '@/components/Payment/PaymentStatusWithHub';

function PaymentTrackingPage({ paymentId }: { paymentId: string }) {
  return (
    <PaymentStatusWithHub
      paymentId={paymentId}
      onStatusChange={(status) => {
        if (status === 'SUCCEEDED') {
          // Handle successful payment
        }
      }}
      useRealtime={true}
    />
  );
}
```

## API Routes

### Create Payment

**Endpoint:** `POST /api/payment/tbc/create`

**Request:**
```json
{
  "amount": 100,
  "currency": "GEL",
  "returnUrl": "https://yoursite.com/callback",
  "extraInfo": "Order #12345",
  "language": "KA"
}
```

**Response:**
```json
{
  "paymentId": "pay_abc123",
  "redirectUrl": "https://tbcbank.ge/payment/...",
  "success": true
}
```

### Get Payment Status

**Endpoint:** `GET /api/payment/tbc/status/{paymentId}`

**Response:**
```json
{
  "paymentId": "pay_abc123",
  "status": "SUCCEEDED",
  "amount": 100,
  "currency": "GEL",
  "transactionId": "txn_xyz789",
  "paymentMethod": "CARD"
}
```

### Cancel Payment

**Endpoint:** `POST /api/payment/tbc/cancel`

**Request:**
```json
{
  "paymentId": "pay_abc123",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment cancelled successfully"
}
```

## Files Created

### Core Library Files
- `lib/tbc-payment.ts` - TypeScript types and TBC Payment client
- `lib/signalr-payment.ts` - SignalR hub client for real-time updates

### API Routes
- `app/api/payment/tbc/create/route.ts` - Create payment endpoint
- `app/api/payment/tbc/status/[paymentId]/route.ts` - Get payment status
- `app/api/payment/tbc/cancel/route.ts` - Cancel payment
- `app/api/payment/tbc/callback/route.ts` - Payment webhook (updated)

### React Hooks
- `hooks/useTBCPayment.ts` - Main payment hook
- `hooks/usePaymentHub.ts` - SignalR real-time updates hook

### Components
- `components/Payment/PaymentStatus.tsx` - Payment status display with polling
- `components/Payment/PaymentStatusWithHub.tsx` - Payment status with real-time updates
- `app/payment/callback/page.tsx` - Payment callback handler page

### Configuration
- `.env.local` - Environment variables
- `.env.local.example` - Example environment variables

## Payment Status Flow

1. **User clicks "Pay"** → Frontend calls `/api/payment/tbc/create`
2. **Payment created** → User redirected to TBC payment page
3. **User completes payment** → TBC redirects back to your callback URL
4. **Callback page loads** → Connects to SignalR hub for real-time updates
5. **Backend receives webhook** → Updates database and sends SignalR notification
6. **Frontend receives update** → Shows success/failure message
7. **Auto-redirect** → User redirected to success/failure page

## Payment Statuses

- `CREATED` - Payment initiated
- `PENDING` - Payment in progress
- `SUCCEEDED` - Payment completed successfully
- `FAILED` - Payment failed
- `CANCELED` / `CANCELLED` - Payment cancelled

## Testing

### Development Testing

1. Start your backend API: `dotnet run`
2. Start Next.js dev server: `npm run dev`
3. Navigate to checkout page
4. Select TBC Bank as payment provider
5. Complete the payment flow

### Production Deployment

1. Update `.env.local` with production URLs
2. Ensure your backend API is accessible
3. Configure TBC Bank production credentials
4. Test the complete payment flow in production

## Troubleshooting

### SignalR Connection Issues

If SignalR fails to connect, the system automatically falls back to polling. Check:

- Backend API is running and accessible
- CORS is configured correctly on the backend
- WebSocket connections are allowed by your hosting provider

### Payment Callback Not Working

Ensure:

- Your callback URL is publicly accessible
- TBC Bank has the correct callback URL configured
- Your backend `/TBCPayment/callback` endpoint is working

### Environment Variables Not Loading

Make sure:

- `.env.local` file exists in the root directory
- Next.js dev server was restarted after adding variables
- Variables are prefixed with `NEXT_PUBLIC_` for client-side access

## Security Considerations

- Never expose backend API keys in client-side code
- Always validate payment status on the backend before fulfilling orders
- Use HTTPS in production
- Implement rate limiting on payment endpoints
- Log all payment transactions for auditing

## Next Steps

1. Add payment cancellation UI
2. Implement refund functionality
3. Add payment history page
4. Set up payment notifications via email/SMS
5. Add analytics tracking for payment conversions

## Support

For issues related to:
- **TBC Bank API**: Contact TBC Bank support
- **Frontend Integration**: Check this documentation or open an issue
- **Backend API**: Refer to your C# backend documentation
