# Payment System - Clean Architecture

This document describes the clean architecture implementation of the payment system.

## 📁 Project Structure

```
types/
└── payment.ts                              # All payment-related TypeScript types

lib/
└── services/
    └── payment/
        ├── index.ts                        # Service exports
        ├── tbc.service.ts                  # TBC payment service
        ├── bog.service.ts                  # BOG payment service
        ├── signalr.service.ts              # SignalR hub service
        └── order.service.ts                # Order management service

hooks/
└── payment/
    ├── index.ts                            # Hook exports
    ├── useTBCPayment.ts                    # TBC payment hook
    ├── useBOGPayment.ts                    # BOG payment hook
    └── usePaymentHub.ts                    # SignalR real-time updates hook

app/
├── api/
│   ├── client/
│   │   └── fetcher.ts                      # Centralized API fetcher (domain detection)
│   └── payment/
│       ├── webapi.ts                       # Order service re-exports
│       ├── route.ts                        # Legacy payment endpoint
│       ├── status/route.ts                 # Legacy status endpoint
│       ├── bog/
│       │   ├── create/route.ts             # BOG create payment
│       │   ├── status/[orderId]/route.ts   # BOG payment status
│       │   ├── cancel/route.ts             # BOG cancel payment
│       │   └── callback/route.ts           # BOG webhook handler
│       └── tbc/
│           ├── create/route.ts             # TBC create payment
│           ├── status/[paymentId]/route.ts # TBC payment status
│           ├── cancel/route.ts             # TBC cancel payment
│           └── callback/route.ts           # TBC webhook handler
└── payment/
    └── callback/page.tsx                   # Universal payment callback page

components/
└── Payment/
    ├── PaymentStatus.tsx                   # TBC payment status (polling)
    ├── PaymentStatusWithHub.tsx            # TBC status (SignalR + polling)
    └── BOGPaymentStatus.tsx                # BOG payment status

lib/payment/                                # Legacy (still used by route.ts)
├── types.ts                                # Legacy types (backward compat)
├── tbc.ts                                  # TBC bank API wrapper
└── bog.ts                                  # BOG bank API wrapper
```

## 🏗️ Architecture Layers

### 1. **Types Layer** (`types/payment.ts`)

All payment-related TypeScript interfaces and types in one centralized location:

- **Provider Types**: `PaymentProvider`
- **TBC Types**: All TBC-specific interfaces
- **BOG Types**: All BOG-specific interfaces
- **SignalR Types**: Real-time update types
- **Order Session Types**: Backend integration types
- **Legacy Types**: Backward compatibility types

### 2. **Service Layer** (`lib/services/payment/`)

Business logic and external API communication:

#### `TBCPaymentService`
- `createPayment()` - Create TBC payment
- `getPaymentStatus()` - Get payment status
- `cancelPayment()` - Cancel payment

#### `BOGPaymentService`
- `createPayment()` - Create BOG payment
- `getPaymentStatus()` - Get payment status
- `cancelPayment()` - Cancel payment

#### `PaymentHubService`
- `connect()` - Connect to SignalR hub
- `onPaymentStatus()` - Listen for status updates
- `disconnect()` - Disconnect from hub

#### `OrderService`
- `createOrderSession()` - Create order in backend
- `markOrderComplete()` - Mark order as completed
- `markOrderFailed()` - Mark order as failed
- `getOrderStatus()` - Get order status

### 3. **Hook Layer** (`hooks/payment/`)

React hooks for component integration:

- **`useTBCPayment()`** - TBC payment operations
- **`useBOGPayment()`** - BOG payment operations
- **`usePaymentHub()`** - SignalR real-time updates

### 4. **API Layer** (`app/api/payment/`)

Next.js API routes that use services:

All routes use `apiFetch` from `app/api/client/fetcher.ts` which:
- Automatically adds `X-Client-Domain` header
- Handles authentication tokens
- Provides centralized error handling

### 5. **Component Layer** (`components/Payment/`)

React components for UI:

- **PaymentStatus** - Status display with polling
- **PaymentStatusWithHub** - Status with real-time updates
- **BOGPaymentStatus** - BOG-specific status display

## 🔄 Data Flow

### TBC Payment Flow

```
User Action
    ↓
useTBCPayment hook
    ↓
/api/payment/tbc/create
    ↓
apiFetch (adds X-Client-Domain)
    ↓
Backend API /TBCPayment/create
    ↓
TBC Bank
    ↓
User redirected to TBC
    ↓
Payment completed
    ↓
TBC webhook → /api/payment/tbc/callback
    ↓
OrderService.markOrderComplete()
    ↓
SignalR notification
    ↓
usePaymentHub receives update
    ↓
UI updated in real-time
```

### BOG Payment Flow

```
User Action
    ↓
useBOGPayment hook
    ↓
/api/payment/bog/create
    ↓
apiFetch (adds X-Client-Domain)
    ↓
Backend API /BOGPayment/create
    ↓
BOG Bank (iPay)
    ↓
User redirected to BOG
    ↓
Payment completed
    ↓
BOG webhook → /api/payment/bog/callback
    ↓
OrderService.markOrderComplete()
    ↓
UI polls for status update
    ↓
UI updated
```

## 🎯 Key Design Principles

### 1. **Separation of Concerns**
- Types in `types/`
- Business logic in `lib/services/`
- React logic in `hooks/`
- API routes in `app/api/`
- UI components in `components/`

### 2. **Single Responsibility**
Each service class has one responsibility:
- `TBCPaymentService` - TBC operations only
- `BOGPaymentService` - BOG operations only
- `OrderService` - Order management only
- `PaymentHubService` - SignalR communication only

### 3. **Dependency Injection**
Services accept `baseUrl` in constructor for testing:

```typescript
const service = new TBCPaymentService('https://test-api.com');
```

### 4. **Type Safety**
All functions use TypeScript interfaces from `types/payment.ts`:

```typescript
async createPayment(...): Promise<TBCPaymentCreationResult>
```

### 5. **Centralized API Calls**
All backend calls use `apiFetch` which:
- Adds domain header for multi-tenancy
- Handles authentication
- Provides consistent error handling

## 🔧 Usage Examples

### Creating a Payment

```typescript
import { useTBCPayment } from '@/hooks/payment';

function CheckoutButton() {
  const { createPayment, loading } = useTBCPayment();

  const handlePay = async () => {
    const result = await createPayment(100, 'GEL');
    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  return <button onClick={handlePay}>Pay</button>;
}
```

### Checking Payment Status

```typescript
import PaymentStatusWithHub from '@/components/Payment/PaymentStatusWithHub';

function PaymentPage({ paymentId }) {
  return (
    <PaymentStatusWithHub
      paymentId={paymentId}
      useRealtime={true}
    />
  );
}
```

### Using Services Directly

```typescript
import { tbcPaymentService } from '@/lib/services/payment';

const result = await tbcPaymentService.createPayment(100, 'GEL');
```

## 🧪 Testing

### Unit Testing Services

```typescript
import { TBCPaymentService } from '@/lib/services/payment';

describe('TBCPaymentService', () => {
  const service = new TBCPaymentService('https://mock-api.com');

  it('should create payment', async () => {
    const result = await service.createPayment(100, 'GEL');
    expect(result.success).toBe(true);
  });
});
```

### Mocking Hooks

```typescript
jest.mock('@/hooks/payment', () => ({
  useTBCPayment: () => ({
    createPayment: jest.fn(),
    loading: false,
    error: null,
  }),
}));
```

## 📝 Type Exports

All types are exported from a single location:

```typescript
import type {
  // Provider
  PaymentProvider,

  // TBC
  TBCPaymentDetails,
  TBCPaymentCreationResult,

  // BOG
  BOGPaymentDetails,
  BOGPaymentCreationResult,

  // SignalR
  PaymentStatusUpdate,

  // Order
  CreateOrderSessionInput,
  CompleteOrderInput,
} from '@/types/payment';
```

## 🚀 Migration from Old Structure

### Before (Old Structure)
```typescript
import { useTBCPayment } from '@/hooks/useTBCPayment';
import { PaymentDetails } from '@/lib/tbc-payment';
```

### After (New Structure)
```typescript
import { useTBCPayment } from '@/hooks/payment';
import type { TBCPaymentDetails } from '@/types/payment';
```

## 🔐 Security Features

1. **Domain-based Tenancy** - `X-Client-Domain` header identifies tenant
2. **Server-side Payment Creation** - Credentials never exposed to client
3. **Webhook Verification** - Backend verifies payment webhooks
4. **Type Safety** - TypeScript prevents runtime errors
5. **Error Handling** - Centralized error handling in `apiFetch`

## 📊 Benefits of This Architecture

1. ✅ **Maintainability** - Easy to find and update code
2. ✅ **Testability** - Each layer can be tested independently
3. ✅ **Scalability** - Easy to add new payment providers
4. ✅ **Type Safety** - Full TypeScript coverage
5. ✅ **Reusability** - Services can be used anywhere
6. ✅ **Clarity** - Clear separation of concerns
7. ✅ **DRY** - No code duplication

## 🔄 Adding a New Payment Provider

1. Add types to `types/payment.ts`
2. Create service in `lib/services/payment/newprovider.service.ts`
3. Create hook in `hooks/payment/useNewProvider.ts`
4. Create API routes in `app/api/payment/newprovider/`
5. Export from index files
6. Update components as needed

Example:

```typescript
// 1. Add types
export interface NewProviderPaymentDetails {
  id: string;
  status: string;
}

// 2. Create service
export class NewProviderService {
  async createPayment() { /* ... */ }
}

// 3. Create hook
export function useNewProvider() { /* ... */ }

// 4. Export
export * from './newprovider.service';
```

## 🎓 Best Practices

1. **Always use hooks in components** - Don't call services directly from components
2. **Import types from `@/types/payment`** - Single source of truth
3. **Use `apiFetch` for all backend calls** - Ensures domain header is sent
4. **Keep services stateless** - Services should not maintain state
5. **Use TypeScript strict mode** - Catch errors at compile time
6. **Follow naming conventions** - `use*` for hooks, `*Service` for services

## 📚 Related Documentation

- `README_BOG_TBC_PAYMENT.md` - Complete integration guide
- `README_TBC_PAYMENT.md` - TBC-specific documentation
- `/types/payment.ts` - Type definitions
- `/lib/services/payment/` - Service implementations

---

This architecture follows clean architecture principles and provides a solid foundation for payment system development and maintenance.
