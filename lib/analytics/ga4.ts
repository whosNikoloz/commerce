/**
 * Google Analytics 4 Tracking Utilities
 * Comprehensive GA4 e-commerce and event tracking
 */

// GA4 E-commerce Item interface
export interface GA4Item {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

// GA4 E-commerce Event Parameters
export interface GA4EcommerceParams {
  currency?: string;
  value?: number;
  items: GA4Item[];
  transaction_id?: string;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
  item_list_id?: string;
  item_list_name?: string;
}

// Custom Event Parameters
export interface GA4EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Declare gtag function
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: GA4EventParams | GA4EcommerceParams
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if GA is loaded
 */
export const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Send a custom event to GA4
 */
export const trackEvent = (
  eventName: string,
  params?: GA4EventParams
): void => {
  if (!isGALoaded()) {
    console.warn('GA4 not loaded. Event not tracked:', eventName);
    return;
  }

  window.gtag?.('event', eventName, params);
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'page_view', {
    page_path: url,
    page_title: title,
  });
};

/**
 * E-COMMERCE EVENTS
 */

/**
 * Track product view
 */
export const trackViewItem = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'view_item', {
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items,
  });
};

/**
 * Track view item list (category page, search results)
 */
export const trackViewItemList = (params: {
  items: GA4Item[];
  item_list_id?: string;
  item_list_name?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'view_item_list', {
    item_list_id: params.item_list_id,
    item_list_name: params.item_list_name,
    items: params.items,
  });
};

/**
 * Track product click in list
 */
export const trackSelectItem = (params: {
  items: GA4Item[];
  item_list_id?: string;
  item_list_name?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'select_item', {
    item_list_id: params.item_list_id,
    item_list_name: params.item_list_name,
    items: params.items,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'add_to_cart', {
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items,
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'remove_from_cart', {
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items,
  });
};

/**
 * Track view cart
 */
export const trackViewCart = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'view_cart', {
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items,
  });
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
  coupon?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'begin_checkout', {
    currency: params.currency || 'GEL',
    value: params.value,
    coupon: params.coupon,
    items: params.items,
  });
};

/**
 * Track add payment info
 */
export const trackAddPaymentInfo = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
  payment_type?: string;
  coupon?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'add_payment_info', {
    currency: params.currency || 'GEL',
    value: params.value,
    payment_type: params.payment_type,
    coupon: params.coupon,
    items: params.items,
  });
};

/**
 * Track add shipping info
 */
export const trackAddShippingInfo = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
  shipping_tier?: string;
  coupon?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'add_shipping_info', {
    currency: params.currency || 'GEL',
    value: params.value,
    shipping_tier: params.shipping_tier,
    coupon: params.coupon,
    items: params.items,
  });
};

/**
 * Track purchase (conversion)
 */
export const trackPurchase = (params: {
  transaction_id: string;
  items: GA4Item[];
  currency?: string;
  value: number;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'purchase', {
    transaction_id: params.transaction_id,
    affiliation: params.affiliation,
    currency: params.currency || 'GEL',
    value: params.value,
    tax: params.tax || 0,
    shipping: params.shipping || 0,
    coupon: params.coupon,
    items: params.items,
  });
};

/**
 * Track refund
 */
export const trackRefund = (params: {
  transaction_id: string;
  items?: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'refund', {
    transaction_id: params.transaction_id,
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items || [],
  });
};

/**
 * USER ENGAGEMENT EVENTS
 */

/**
 * Track search
 */
export const trackSearch = (searchTerm: string): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'search', {
    search_term: searchTerm,
  });
};

/**
 * Track login
 */
export const trackLogin = (method?: string): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'login', {
    method: method || 'email',
  });
};

/**
 * Track signup
 */
export const trackSignUp = (method?: string): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'sign_up', {
    method: method || 'email',
  });
};

/**
 * Track share
 */
export const trackShare = (params: {
  method?: string;
  content_type?: string;
  item_id?: string;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'share', params);
};

/**
 * Track add to wishlist
 */
export const trackAddToWishlist = (params: {
  items: GA4Item[];
  currency?: string;
  value?: number;
}): void => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'add_to_wishlist', {
    currency: params.currency || 'GEL',
    value: params.value,
    items: params.items,
  });
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Convert cart item to GA4 item format
 */
export const cartItemToGA4Item = (item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  category?: string;
  discount?: number;
}): GA4Item => ({
  item_id: item.id,
  item_name: item.name,
  price: item.price,
  quantity: item.quantity,
  item_brand: item.brand,
  item_category: item.category,
  discount: item.discount,
});

/**
 * Convert product to GA4 item format
 */
export const productToGA4Item = (product: {
  id: string;
  name: string;
  price?: number;
  discountPrice?: number;
  brand?: { name?: string };
  category?: { name?: string };
  quantity?: number;
  index?: number;
  listName?: string;
}): GA4Item => {
  const price = product.discountPrice ?? product.price ?? 0;
  const discount = product.price && product.discountPrice
    ? product.price - product.discountPrice
    : 0;

  return {
    item_id: product.id,
    item_name: product.name,
    price,
    quantity: product.quantity || 1,
    item_brand: product.brand?.name,
    item_category: product.category?.name,
    discount: discount > 0 ? discount : undefined,
    index: product.index,
    item_list_name: product.listName,
  };
};

/**
 * Calculate total value from items
 */
export const calculateItemsValue = (items: GA4Item[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 1;
    const itemDiscount = item.discount || 0;
    return total + (itemPrice - itemDiscount) * itemQuantity;
  }, 0);
};
