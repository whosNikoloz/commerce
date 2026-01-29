'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import { useGA4 } from '@/hooks/useGA4';
import { useCartStore } from '@/app/context/cartContext';
import { useDictionary } from '@/app/context/dictionary-provider';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trackPurchaseComplete } = useGA4();
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; paymentId?: string } | null>(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  /* Hook */
  const { dictionary } = useDictionary();

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');
    const storedOrderId = typeof window !== 'undefined' ? sessionStorage.getItem('lastOrderId') : null;

    const finalOrderId = orderId || storedOrderId || paymentId;

    if (finalOrderId) {
      setOrderInfo({
        orderId: finalOrderId,
        paymentId: paymentId || undefined,
      });

      // Track purchase event (only once)
      if (!purchaseTracked && cart && cart.length > 0) {
        const shipping = subtotal > 50 ? 0 : 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        trackPurchaseComplete(
          finalOrderId,
          cart,
          total,
          {
            tax,
            shipping,
            affiliation: 'Online Store',
          }
        );

        setPurchaseTracked(true);

        // Clear cart after successful purchase
        setTimeout(() => {
          clearCart();
        }, 1000);
      }

      // Clear stored order ID
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lastOrderId');
      }
    }
  }, [searchParams, router, cart, subtotal, trackPurchaseComplete, clearCart, purchaseTracked]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="font-heading mb-2 text-3xl font-bold text-gray-900">{dictionary.checkout.success.title}</h1>
          <p className="font-primary mb-6 text-gray-600">
            {dictionary.checkout.success.message}
          </p>

          {/* Order Information */}
          {orderInfo && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
              <h2 className="font-heading mb-2 text-sm font-semibold text-gray-700">{dictionary.checkout.success.orderDetails}</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{dictionary.checkout.success.orderId}</span>
                  <span className="font-primary font-mono font-medium">{orderInfo.orderId}</span>
                </div>
                {orderInfo.paymentId && (
                  <div className="flex justify-between">
                    <span>{dictionary.checkout.success.paymentId}</span>
                    <span className="font-primary font-mono font-medium">{orderInfo.paymentId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Email Notice */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-primary text-sm text-blue-800">
              {dictionary.checkout.success.emailConfirmation}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              href="/"
            >
              {dictionary.checkout.success.continueShopping}
            </Link>
            <Link
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              href="/orders"
            >
              {dictionary.checkout.success.viewOrders}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
