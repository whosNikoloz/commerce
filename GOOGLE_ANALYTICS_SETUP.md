# Google Analytics 4 Integration - Setup Guide

This Next.js e-commerce application includes comprehensive Google Analytics 4 (GA4) tracking for all major e-commerce events and user interactions.

## Table of Contents
1. [Features](#features)
2. [Setup Instructions](#setup-instructions)
3. [Tracked Events](#tracked-events)
4. [Testing Your Integration](#testing-your-integration)
5. [Advanced Configuration](#advanced-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Features

The GA4 integration automatically tracks:

### E-commerce Events
- **Product Views** - When users view product detail pages
- **Product List Views** - When category/search results are displayed
- **Add to Cart** - When products are added to cart
- **Remove from Cart** - When products are removed from cart
- **View Cart** - When users view their cart
- **Begin Checkout** - When users start the checkout process
- **Add Payment Info** - When payment method is selected
- **Purchase** - When orders are successfully completed

### User Engagement
- **Page Views** - Automatic tracking on all route changes
- **Search** - When users search for products
- **Site Navigation** - User journey through the site

### Additional Features
- Enhanced e-commerce data layer
- Debug mode in development
- Google Signals support for cross-device tracking
- Ad personalization support

---

## Setup Instructions

### Step 1: Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in the bottom left)
3. Under **Property** column, click **Create Property**
4. Fill in your property details:
   - Property name (e.g., "My E-commerce Store")
   - Time zone and currency
5. Click **Next** and complete the setup
6. Under **Data Streams**, click **Add stream** > **Web**
7. Enter your website URL and stream name
8. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Configure Your Tenant Settings

The Google Analytics tracking ID is configured in your tenant configuration file (usually in your backend or tenant config).

Update your tenant's `siteConfig.seo` section:

```json
{
  "siteConfig": {
    "name": "Your Store Name",
    "seo": {
      "googleAnalyticsId": "G-XXXXXXXXXX",

      // Optional: Add these for additional tracking
      "googleTagManagerId": "GTM-XXXXXXX",
      "facebookPixelId": "1234567890",
      "hotjarId": "1234567",
      "clarityId": "abcdefghij"
    }
  }
}
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID from Step 1.

### Step 3: Verify Installation

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser's Developer Tools** (F12)

3. **Navigate to the Console tab**

4. **Visit your site** - You should see GA4 debug messages if in development mode

5. **Check Network tab** for requests to `www.google-analytics.com/g/collect`

### Step 4: Enable E-commerce Tracking in GA4

1. In Google Analytics, go to **Admin** > **Data Settings** > **Data Collection**
2. Make sure **Enhanced measurement** is enabled
3. Go to **Admin** > **Events**
4. Verify that e-commerce events are being received (may take 24-48 hours for initial data)

---

## Tracked Events

### Automatic Events

These events are tracked automatically without any additional code:

| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `page_view` | Every route change | Page path, page title |
| `view_item` | Product detail page load | Product ID, name, price, category, brand |
| `add_to_cart` | Adding product to cart | Product details, quantity, value |
| `remove_from_cart` | Removing from cart | Product details, quantity, value |
| `view_cart` | Viewing cart page | All cart items, total value |
| `begin_checkout` | Starting checkout | Cart items, total value |
| `add_payment_info` | Selecting payment method | Cart items, payment type |
| `purchase` | Successful order | Transaction ID, items, revenue, tax, shipping |
| `search` | Product search | Search term |

### Event Parameters

All e-commerce events include:
- `currency` - Default: GEL (Georgian Lari)
- `value` - Total monetary value
- `items` - Array of product details with:
  - `item_id` - Product ID
  - `item_name` - Product name
  - `price` - Product price
  - `quantity` - Quantity
  - `item_brand` - Brand name
  - `item_category` - Category name
  - `discount` - Discount amount (if applicable)

---

## Testing Your Integration

### Method 1: Google Analytics Debug View

1. In Google Analytics, go to **Configure** > **DebugView**
2. Open your site in a browser
3. Interact with your site (view products, add to cart, etc.)
4. Watch events appear in real-time in DebugView

### Method 2: Browser Console (Development Mode)

When running in development mode (`npm run dev`), GA4 tracking includes debug mode which provides console warnings if GA is not loaded.

### Method 3: Google Tag Assistant

1. Install [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome extension
2. Visit your site
3. Click the Tag Assistant icon
4. Verify that GA4 tag is firing correctly

### Method 4: Network Tab

1. Open DevTools Network tab
2. Filter by `collect` or `google-analytics.com`
3. Perform actions (view product, add to cart, etc.)
4. Verify requests are being sent with correct parameters

---

## Advanced Configuration

### Custom Events

You can track custom events using the `useGA4` hook:

```tsx
import { useGA4 } from '@/hooks/useGA4';

function MyComponent() {
  const { trackCustomEvent } = useGA4();

  const handleSpecialAction = () => {
    trackCustomEvent('special_action', {
      category: 'user_engagement',
      label: 'newsletter_signup',
      value: 1
    });
  };

  return <button onClick={handleSpecialAction}>Sign Up</button>;
}
```

### Available Tracking Functions

The `useGA4` hook provides these functions:

```typescript
// E-commerce
trackProductView(product)
trackProductListView(products, listName)
trackProductClick(product, listName)
trackCartAdd(cartItem)
trackCartRemove(cartItem)
trackCartView(cartItems)
trackCheckoutBegin(cartItems, coupon?)
trackPaymentInfo(cartItems, paymentType, coupon?)
trackShippingInfo(cartItems, shippingTier, coupon?)
trackPurchaseComplete(transactionId, cartItems, total, options?)

// User Engagement
trackSearchQuery(searchTerm)
trackUserLogin(method?)
trackUserSignUp(method?)
trackContentShare(method, contentType, itemId)
trackWishlistAdd(product)

// Custom
trackCustomEvent(eventName, params?)
```

### Disable Tracking in Development

To disable GA tracking in development, update the configuration:

```typescript
// In components/Analytics/AnalyticsScripts.tsx
gtag('config', '${seo.googleAnalyticsId}', {
  page_path: window.location.pathname,
  send_page_view: false,
  debug_mode: false, // Change to false
});
```

### Multiple GA Properties

To track to multiple GA4 properties, update the AnalyticsScripts component:

```tsx
{seo.googleAnalyticsId && (
  <>
    {/* Primary GA4 */}
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
      strategy="afterInteractive"
    />
    {/* Secondary GA4 */}
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=G-YYYYYYYYYY`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seo.googleAnalyticsId}');
        gtag('config', 'G-YYYYYYYYYY');
      `}
    </Script>
  </>
)}
```

---

## Troubleshooting

### Events Not Showing in GA4

**Problem:** Events are not appearing in Google Analytics

**Solutions:**
1. **Check Measurement ID** - Verify your GA4 Measurement ID is correct (starts with `G-`)
2. **Wait 24-48 hours** - Initial data may take time to appear
3. **Use DebugView** - Check real-time events in GA4 DebugView
4. **Check Network Tab** - Verify requests are being sent
5. **Ad Blockers** - Disable ad blockers during testing
6. **Browser Console** - Check for JavaScript errors

### Debug Mode Not Working

**Problem:** Debug messages not appearing in console

**Solutions:**
1. Verify you're running in development mode (`npm run dev`)
2. Check that `debug_mode: true` is set in the config
3. Open browser DevTools Console before loading the page

### Events Fire Multiple Times

**Problem:** Duplicate events being tracked

**Solutions:**
1. **React Strict Mode** - This is expected in development with React Strict Mode
2. **Check useEffect dependencies** - Ensure tracking is not called in infinite loops
3. Use the `purchaseTracked` pattern (see checkout success page) to prevent duplicates

### Cart Not Clearing After Purchase

**Problem:** Cart items remain after successful purchase

**Solution:**
The cart is automatically cleared 1 second after tracking the purchase event. This delay ensures GA4 has time to capture the purchase data before items are removed.

### TypeScript Errors

**Problem:** TypeScript errors with GA4 functions

**Solutions:**
1. Ensure your product/cart item objects include all required fields:
   - `id` (string)
   - `name` (string)
   - `price` (number)
   - `quantity` (number)
2. Check that optional fields match the expected types in `lib/analytics/ga4.ts`

---

## Data Privacy & GDPR Compliance

### Cookie Consent

The current implementation loads GA4 immediately. For GDPR compliance, you should:

1. **Install a cookie consent library** (e.g., `react-cookie-consent`)
2. **Conditionally load GA4** based on user consent
3. **Update AnalyticsScripts component:**

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function AnalyticsScripts({ seo }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check for stored consent
    const consent = localStorage.getItem('ga-consent');
    if (consent === 'granted') {
      setHasConsent(true);
    }
  }, []);

  if (!seo || !hasConsent) return null;

  // ... rest of component
}
```

### User Opt-Out

Allow users to opt-out of tracking:

```typescript
// Add to your privacy settings page
const handleOptOut = () => {
  window['ga-disable-G-XXXXXXXXXX'] = true;
  localStorage.setItem('ga-consent', 'denied');
};
```

---

## Support & Resources

- **Google Analytics Help:** https://support.google.com/analytics
- **GA4 E-commerce Guide:** https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- **GA4 Event Reference:** https://developers.google.com/analytics/devguides/collection/ga4/reference/events

---

## Summary

Your Next.js e-commerce application now has **comprehensive GA4 tracking** integrated!

✅ All major e-commerce events are tracked automatically
✅ Enhanced e-commerce data layer configured
✅ User engagement events monitored
✅ Debug mode for development
✅ Production-ready and optimized

**Next Steps:**
1. Add your GA4 Measurement ID to your tenant configuration
2. Verify tracking using DebugView
3. Set up conversion goals and funnels in GA4
4. Monitor your analytics dashboard regularly
5. Consider implementing cookie consent for GDPR compliance

Happy tracking! 📊
