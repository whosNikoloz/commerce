/**
 * React Hook for Google Analytics 4 Tracking
 * Provides easy-to-use GA4 tracking functions in React components
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import * as ga4 from '@/lib/analytics/ga4';

/**
 * Hook to track page views automatically on route changes
 */
export const useGA4PageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Track page view
    ga4.trackPageView(url);
  }, [pathname, searchParams]);
};

/**
 * Hook to get GA4 tracking functions
 */
export const useGA4 = () => {
  // E-commerce tracking
  const trackProductView = useCallback((product: any) => {
    const item = ga4.productToGA4Item(product);
    const value = item.price ? item.price * (item.quantity || 1) : undefined;

    ga4.trackViewItem({
      items: [item],
      value,
    });
  }, []);

  const trackProductListView = useCallback((products: any[], listName?: string) => {
    const items = products.map((product, index) =>
      ga4.productToGA4Item({ ...product, index, listName })
    );

    ga4.trackViewItemList({
      items,
      item_list_name: listName,
    });
  }, []);

  const trackProductClick = useCallback((product: any, listName?: string) => {
    const item = ga4.productToGA4Item({ ...product, listName });

    ga4.trackSelectItem({
      items: [item],
      item_list_name: listName,
    });
  }, []);

  const trackCartAdd = useCallback((cartItem: any) => {
    const item = ga4.cartItemToGA4Item(cartItem);
    const value = item.price ? item.price * (item.quantity || 1) : undefined;

    ga4.trackAddToCart({
      items: [item],
      value,
    });
  }, []);

  const trackCartRemove = useCallback((cartItem: any) => {
    const item = ga4.cartItemToGA4Item(cartItem);
    const value = item.price ? item.price * (item.quantity || 1) : undefined;

    ga4.trackRemoveFromCart({
      items: [item],
      value,
    });
  }, []);

  const trackCartView = useCallback((cartItems: any[]) => {
    const items = cartItems.map(ga4.cartItemToGA4Item);
    const value = ga4.calculateItemsValue(items);

    ga4.trackViewCart({
      items,
      value,
    });
  }, []);

  const trackCheckoutBegin = useCallback((cartItems: any[], coupon?: string) => {
    const items = cartItems.map(ga4.cartItemToGA4Item);
    const value = ga4.calculateItemsValue(items);

    ga4.trackBeginCheckout({
      items,
      value,
      coupon,
    });
  }, []);

  const trackPaymentInfo = useCallback((
    cartItems: any[],
    paymentType: string,
    coupon?: string
  ) => {
    const items = cartItems.map(ga4.cartItemToGA4Item);
    const value = ga4.calculateItemsValue(items);

    ga4.trackAddPaymentInfo({
      items,
      value,
      payment_type: paymentType,
      coupon,
    });
  }, []);

  const trackShippingInfo = useCallback((
    cartItems: any[],
    shippingTier: string,
    coupon?: string
  ) => {
    const items = cartItems.map(ga4.cartItemToGA4Item);
    const value = ga4.calculateItemsValue(items);

    ga4.trackAddShippingInfo({
      items,
      value,
      shipping_tier: shippingTier,
      coupon,
    });
  }, []);

  const trackPurchaseComplete = useCallback((
    transactionId: string,
    cartItems: any[],
    total: number,
    options?: {
      tax?: number;
      shipping?: number;
      coupon?: string;
      affiliation?: string;
    }
  ) => {
    const items = cartItems.map(ga4.cartItemToGA4Item);

    ga4.trackPurchase({
      transaction_id: transactionId,
      items,
      value: total,
      tax: options?.tax,
      shipping: options?.shipping,
      coupon: options?.coupon,
      affiliation: options?.affiliation,
    });
  }, []);

  // User engagement tracking
  const trackSearchQuery = useCallback((searchTerm: string) => {
    ga4.trackSearch(searchTerm);
  }, []);

  const trackUserLogin = useCallback((method?: string) => {
    ga4.trackLogin(method);
  }, []);

  const trackUserSignUp = useCallback((method?: string) => {
    ga4.trackSignUp(method);
  }, []);

  const trackContentShare = useCallback((
    method: string,
    contentType: string,
    itemId: string
  ) => {
    ga4.trackShare({
      method,
      content_type: contentType,
      item_id: itemId,
    });
  }, []);

  const trackWishlistAdd = useCallback((product: any) => {
    const item = ga4.productToGA4Item(product);
    const value = item.price ? item.price * (item.quantity || 1) : undefined;

    ga4.trackAddToWishlist({
      items: [item],
      value,
    });
  }, []);

  // Custom event tracking
  const trackCustomEvent = useCallback((
    eventName: string,
    params?: Record<string, string | number | boolean>
  ) => {
    ga4.trackEvent(eventName, params);
  }, []);

  return {
    // E-commerce
    trackProductView,
    trackProductListView,
    trackProductClick,
    trackCartAdd,
    trackCartRemove,
    trackCartView,
    trackCheckoutBegin,
    trackPaymentInfo,
    trackShippingInfo,
    trackPurchaseComplete,
    // User engagement
    trackSearchQuery,
    trackUserLogin,
    trackUserSignUp,
    trackContentShare,
    trackWishlistAdd,
    // Custom
    trackCustomEvent,
  };
};
