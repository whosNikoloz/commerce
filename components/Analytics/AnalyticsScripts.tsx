/**
 * Analytics and Tracking Scripts Component
 * Renders tracking scripts based on tenant SEO configuration
 */

import type { SEOConfig } from "@/types/tenant";

import Script from "next/script";


interface AnalyticsScriptsProps {
  seo?: SEOConfig;
}

export default function AnalyticsScripts({ seo }: AnalyticsScriptsProps) {
  if (!seo) return null;

  // Helper to check if a value is a valid non-empty string
  const isValidString = (value: any): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
  };

  // Helper to check if a value is a valid number
  const isValidNumber = (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value) && value > 0;
  };

  return (
    <>
      {/* Google Analytics 4 */}
      {isValidString(seo.googleAnalyticsId) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seo.googleAnalyticsId}', {
                page_path: window.location.pathname,
                send_page_view: false,
                // Enhanced E-commerce Configuration
                allow_google_signals: true,
                allow_ad_personalization_signals: true,
                // Debug mode (set to false in production)
                debug_mode: ${process.env.NODE_ENV === 'development'},
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {isValidString(seo.googleTagManagerId) && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${seo.googleTagManagerId}');
            `}
          </Script>
          {/* GTM noscript fallback - should be added to body in layout */}
        </>
      )}

      {/* Facebook Pixel */}
      {isValidString(seo.facebookPixelId) && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${seo.facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Hotjar */}
      {isValidNumber(seo.hotjarId) && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${seo.hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* Microsoft Clarity */}
      {isValidString(seo.clarityId) && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${seo.clarityId}");
          `}
        </Script>
      )}

      {/* Facebook Pixel noscript fallback */}
      {isValidString(seo.facebookPixelId) && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height="1"
            src={`https://www.facebook.com/tr?id=${seo.facebookPixelId}&ev=PageView&noscript=1`}
            style={{ display: "none" }}
            width="1"
          />
        </noscript>
      )}
    </>
  );
}
