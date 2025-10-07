# Complete BOG & TBC Payment Integration

Full integration of both Bank of Georgia (BOG) and TBC Bank payment systems with your Next.js e-commerce application using domain-based tenant detection.

## 🌟 Features

- ✅ **TBC Bank Payment** - Full integration with TBC Bank payment gateway
- ✅ **BOG Payment (iPay)** - Complete Bank of Georgia iPay integration
- ✅ **Real-time Updates** - SignalR WebSocket for live payment status (TBC)
- ✅ **Domain-based Tenancy** - Automatic tenant detection via `X-Client-Domain` header
- ✅ **apiFetch Integration** - All API calls use centralized fetcher with auth & domain detection
- ✅ **Automatic Fallback** - Polling fallback when WebSocket unavailable
- ✅ **TypeScript Support** - Full type safety across all components
- ✅ **Payment Callbacks** - Both POST & GET webhook support
- ✅ **Unified Checkout** - Single checkout form for both payment providers

## 📁 Project Structure

```
app/
├── api/
│   ├── client/
│   │   └── fetcher.ts                    # Centralized API fetcher with domain detection
│   └── payment/
│       ├── bog/
│       │   ├── create/route.ts           # Create BOG payment
│       │   ├── status/[orderId]/route.ts # Get BOG payment status
│       │   ├── cancel/route.ts           # Cancel BOG payment
│       │   └── callback/route.ts         # BOG webhook handler (POST & GET)
│       └── tbc/
│           ├── create/route.ts           # Create TBC payment
│           ├── status/[paymentId]/route.ts # Get TBC payment status
│           ├── cancel/route.ts           # Cancel TBC payment
│           └── callback/route.ts         # TBC webhook handler (POST & GET)
├── payment/
│   └── callback/page.tsx                 # Universal payment callback page (BOG & TBC)
└── [lang]/
    └── cart/
        └── checkout/page.tsx             # Checkout page with payment selection

components/
├── Cart/
│   └── CheckoutPage/
│       ├── checkout-page.tsx             # Main checkout component
│       └── CheckoutForm.tsx              # Form with BOG/TBC selection
└── Payment/
    ├── PaymentStatus.tsx                 # TBC payment status with polling
    ├── PaymentStatusWithHub.tsx          # TBC status with SignalR
    └── BOGPaymentStatus.tsx              # BOG payment status

lib/
├── tbc-payment.ts                        # TBC types & client
├── bog-payment.ts                        # BOG types & client
└── signalr-payment.ts                    # SignalR hub client

hooks/
├── useTBCPayment.ts                      # TBC payment hook
├── useBOGPayment.ts                      # BOG payment hook
└── usePaymentHub.ts                      # SignalR hook for real-time updates
```

## 🔧 Setup

### 1. Environment Variables

Create/update `.env.local`:

```env
# Backend API URL - same backend for all tenants
BACKEND_API_URL=https://localhost:7043

# Public URLs for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=https://localhost:7043
```

### 2. Backend Configuration

Your C# backend should have these controllers:

#### TBC Controller
```
POST   /TBCPayment/create
GET    /TBCPayment/{paymentId}
POST   /TBCPayment/{paymentId}/cancel
GET    /TBCPayment/callback
```

#### BOG Controller
```
POST   /BOGPayment/create
GET    /BOGPayment/{orderId}
POST   /BOGPayment/{orderId}/cancel
POST   /BOGPayment/callback
GET    /BOGPayment/callback
```

#### SignalR Hub (Optional for TBC real-time updates)
```
Hub: /paymentHub
Methods: JoinPaymentGroup, LeavePaymentGroup
Events: PaymentStatus
```

### 3. Domain-based Tenant Detection

The `apiFetch` function automatically adds the `X-Client-Domain` header to all requests:

```typescript
// Server-side: Uses actual domain
X-Client-Domain: commerce-topaz-sigma-62.vercel.app

// Client-side: Uses configured domain
X-Client-Domain: commerce-topaz-sigma-62.vercel.app
```

Your backend uses this header to identify the tenant and return appropriate configuration.

## 📖 Usage

### TBC Payment

```tsx
import { useTBCPayment } from '@/hooks/useTBCPayment';

function PayButton() {
  const { createPayment, loading, error } = useTBCPayment();

  const handlePay = async () => {
    const result = await createPayment(
      100,        // amount
      'GEL',      // currency
      undefined,  // returnUrl (optional)
      undefined,  // extraInfo (optional)
      'KA'        // language
    );

    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  return <button onClick={handlePay} disabled={loading}>Pay ₾100</button>;
}
```

### BOG Payment

```tsx
import { useBOGPayment } from '@/hooks/useBOGPayment';

function PayButton() {
  const { createPayment, loading, error } = useBOGPayment();

  const handlePay = async () => {
    const items = [
      { productId: '1', qty: 2, unitPrice: 50, name: 'Product 1' }
    ];

    const result = await createPayment(
      100,                    // total amount
      items,                  // cart items
      crypto.randomUUID(),    // orderId
      undefined,              // returnUrl (optional)
      'en-US'                 // locale
    );

    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  return <button onClick={handlePay} disabled={loading}>Pay ₾100</button>;
}
```

### Payment Status Tracking

#### TBC with Real-time Updates

```tsx
import PaymentStatusWithHub from '@/components/Payment/PaymentStatusWithHub';

function PaymentPage({ paymentId }: { paymentId: string }) {
  return (
    <PaymentStatusWithHub
      paymentId={paymentId}
      onStatusChange={(status) => {
        if (status === 'SUCCEEDED') {
          // Handle success
        }
      }}
      useRealtime={true}
    />
  );
}
```

#### BOG Status Tracking

```tsx
import BOGPaymentStatus from '@/components/Payment/BOGPaymentStatus';

function PaymentPage({ orderId }: { orderId: string }) {
  return (
    <BOGPaymentStatus
      orderId={orderId}
      onStatusChange={(status) => {
        if (status === 'COMPLETED') {
          // Handle success
        }
      }}
      autoRefresh={true}
    />
  );
}
```

## 🔄 Payment Flow

### TBC Payment Flow

1. User fills checkout form and selects TBC
2. Frontend calls `/api/payment/tbc/create` with payment details
3. API route uses `apiFetch` to call backend `/TBCPayment/create`
   - `X-Client-Domain` header identifies tenant
   - Backend returns tenant-specific TBC credentials
4. User redirected to TBC payment page
5. User completes payment
6. TBC sends webhook to `/api/payment/tbc/callback`
7. Callback updates order status in database
8. User redirected to `/payment/callback?provider=tbc&paymentId=xxx`
9. Frontend connects to SignalR hub for real-time updates
10. Success/failure message shown, redirect to confirmation page

### BOG Payment Flow

1. User fills checkout form and selects BOG
2. Frontend calls `/api/payment/bog/create` with order details
3. API route uses `apiFetch` to call backend `/BOGPayment/create`
   - `X-Client-Domain` header identifies tenant
   - Backend returns tenant-specific BOG credentials
4. User redirected to BOG iPay page
5. User completes payment
6. BOG sends webhook to `/api/payment/bog/callback`
7. Callback updates order status in database
8. User redirected to `/payment/callback?provider=bog&orderId=xxx`
9. Frontend polls for payment status
10. Success/failure message shown, redirect to confirmation page

## 🎯 Key Features Explained

### 1. apiFetch with Domain Detection

All payment API routes use the centralized `apiFetch` function:

```typescript
import { apiFetch } from "@/app/api/client/fetcher";

const response = await apiFetch<ResponseType>(
  `${backendUrl}/TBCPayment/create`,
  {
    method: "POST",
    body: JSON.stringify(requestData),
  }
);
```

**Benefits:**
- Automatic `X-Client-Domain` header injection
- Automatic authentication token handling
- Centralized error handling
- Type-safe responses

### 2. Multi-Tenant Support

The backend uses the `X-Client-Domain` header to:
- Identify which tenant is making the request
- Return appropriate payment credentials (TBC/BOG)
- Store transactions with tenant association
- Maintain separate configurations per tenant

### 3. Unified Checkout Experience

The checkout form (`CheckoutForm.tsx`) allows users to:
- Choose between BOG and TBC payment providers
- Fill shipping/billing information once
- Seamless payment experience regardless of provider

### 4. Real-time Updates (TBC Only)

SignalR WebSocket connection provides:
- Instant payment status updates
- No polling overhead
- Better user experience
- Automatic fallback to polling if WebSocket fails

## 📊 Payment Statuses

### TBC Statuses
- `CREATED` - Payment initiated
- `PENDING` - Payment in progress
- `SUCCEEDED` - Payment completed ✅
- `FAILED` - Payment failed ❌
- `CANCELED` / `CANCELLED` - Payment cancelled ❌

### BOG Statuses
- `CREATED` - Order created
- `PENDING` - Payment in progress
- `APPROVED` - Payment approved ✅
- `COMPLETED` - Payment completed ✅
- `DECLINED` - Payment declined ❌
- `CANCELLED` - Payment cancelled ❌
- `FAILED` - Payment failed ❌

## 🔐 Security

- ✅ Server-side payment creation (credentials never exposed)
- ✅ Webhook signature verification (implement in backend)
- ✅ Domain validation for tenant security
- ✅ HTTPS required in production
- ✅ Payment verification before order fulfillment
- ✅ Rate limiting on payment endpoints (recommended)

## 🧪 Testing

### Development

1. Start backend: `dotnet run`
2. Start frontend: `npm run dev`
3. Navigate to checkout: `http://localhost:3000/cart/checkout`
4. Select payment provider (BOG or TBC)
5. Complete payment flow

### Production Checklist

- [ ] Update `.env.local` with production URLs
- [ ] Configure production payment credentials in backend
- [ ] Test with real payment amounts
- [ ] Verify webhooks are reachable
- [ ] Test SignalR connection in production environment
- [ ] Verify domain detection works for all tenants
- [ ] Test both BOG and TBC payment flows
- [ ] Verify payment callbacks update order status correctly

## 🐛 Troubleshooting

### SignalR Not Connecting

**Symptoms:** No real-time updates, falls back to polling

**Solutions:**
- Check backend SignalR hub is running
- Verify WebSocket support on hosting provider
- Check CORS configuration allows WebSocket connections
- Ensure `NEXT_PUBLIC_BACKEND_API_URL` is correct

### Domain Detection Not Working

**Symptoms:** Wrong tenant configuration returned

**Solutions:**
- Verify `X-Client-Domain` header in network tab
- Check backend domain mapping configuration
- Ensure `commerce-topaz-sigma-62.vercel.app` is updated to actual domain
- Test with different tenant domains

### Payment Callbacks Not Working

**Symptoms:** Orders not updating after payment

**Solutions:**
- Verify webhook URL is publicly accessible
- Check backend logs for callback errors
- Test webhook endpoints manually with Postman
- Verify callback URL configuration in payment provider dashboard

### BOG vs TBC Confusion

**Remember:**
- TBC uses `paymentId` (from TBC Bank)
- BOG uses `orderId` (from BOG iPay)
- Check `provider` query parameter in callback URL
- Each has different status values

## 📚 API Reference

### TBC API

#### Create Payment
```
POST /api/payment/tbc/create

Body:
{
  "amount": 100,
  "currency": "GEL",
  "returnUrl": "https://yoursite.com/callback",
  "extraInfo": "Order #123",
  "language": "KA"
}

Response:
{
  "paymentId": "pay_xxx",
  "redirectUrl": "https://tbc.ge/...",
  "success": true
}
```

### BOG API

#### Create Payment
```
POST /api/payment/bog/create

Body:
{
  "amount": 100,
  "items": [
    {
      "productId": "1",
      "qty": 2,
      "unitPrice": 50,
      "name": "Product 1"
    }
  ],
  "orderId": "order_xxx",
  "returnUrl": "https://yoursite.com/callback",
  "locale": "en-US"
}

Response:
{
  "orderId": "order_xxx",
  "redirectUrl": "https://ipay.ge/...",
  "success": true
}
```

## 🚀 Next Steps

1. **Add Payment History** - Create admin panel to view all transactions
2. **Add Refunds** - Implement refund functionality for both providers
3. **Add Recurring Payments** - Support subscription/recurring billing
4. **Email Notifications** - Send payment confirmation emails
5. **Analytics** - Track conversion rates and payment failures
6. **Multi-currency** - Support currencies beyond GEL

## 📝 Notes

- Both integrations use the same backend API
- Domain detection happens automatically via `apiFetch`
- SignalR is optional - system falls back to polling
- Checkout form is already configured for both providers
- All API routes are typed with TypeScript
- Payment status components auto-refresh until final status

## 🙏 Support

For issues:
- **TBC Integration**: Check TBC Bank API docs
- **BOG Integration**: Check BOG iPay docs
- **Frontend Issues**: Review this README or check component code
- **Backend Issues**: Review C# controller implementation
