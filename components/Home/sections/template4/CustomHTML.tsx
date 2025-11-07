'use client'
import type { CustomHTMLData, Locale } from "@/types/tenant";

import { useEffect, useRef, useMemo, useId } from "react";
import DOMPurify from 'isomorphic-dompurify';

interface CustomHTMLProps {
  data: CustomHTMLData;
  locale: Locale;
}

export default function CustomHTML({ data, locale }: CustomHTMLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '-'); // React's useId for SSR-safe unique IDs

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHTML = useMemo(() => {
    let sanitized = DOMPurify.sanitize(data.html, {
      ADD_TAGS: ['iframe'], // Allow iframe if needed (be careful!)
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'], // Allow iframe attributes
      ALLOW_DATA_ATTR: true, // Allow data-* attributes
    });

    // Add XR permissions to iframes to prevent console errors from 3D viewers
    sanitized = sanitized.replace(
      /<iframe([^>]*)>/gi,
      (match, attrs) => {
        // Check if 'allow' attribute already exists
        if (attrs.includes('allow=')) {
          // Add xr-spatial-tracking to existing allow attribute
          return match.replace(
            /allow="([^"]*)"/i,
            (m, allowValue) => {
              const permissions = allowValue.split(';').map((p: string) => p.trim());
              if (!permissions.includes('xr-spatial-tracking')) {
                permissions.push('xr-spatial-tracking');
              }
              return `allow="${permissions.join('; ')}"`;
            }
          );
        } else {
          // Add new allow attribute with xr-spatial-tracking
          return `<iframe${attrs} allow="xr-spatial-tracking">`;
        }
      }
    );

    return sanitized;
  }, [data.html]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject scoped CSS
    if (data.css) {
      const styleElement = document.createElement('style');
      // Scope all CSS selectors to this specific container
      const scopedCSS = scopeCSSToContainer(data.css, `[data-custom-html="${uniqueId}"]`);
      styleElement.textContent = scopedCSS;
      containerRef.current.appendChild(styleElement);
    }
  }, [data.css, uniqueId]);

  // Simple CSS scoping function
  const scopeCSSToContainer = (css: string, scopeSelector: string): string => {
    try {
      // Add scope to each CSS rule
      return css.replace(
        /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
        (match, selector, separator) => {
          // Don't scope @rules, :root, html, body
          if (
            selector.trim().startsWith('@') ||
            selector.trim().startsWith(':root') ||
            selector.trim() === 'html' ||
            selector.trim() === 'body'
          ) {
            return match;
          }
          // Add scope selector
          return `${scopeSelector} ${selector.trim()}${separator}`;
        }
      );
    } catch (error) {
      console.error('Error scoping CSS:', error);
      return css;
    }
  };

  const containerClasses = [
    // Base container
    'custom-html-section',
    // Padding options
    data.padding === 'none' ? '' : data.padding === 'small' ? 'py-4 md:py-6' : data.padding === 'large' ? 'py-16 md:py-24' : 'py-8 md:py-12',
    // Full width or contained
    data.fullWidth ? 'w-full' : 'container mx-auto px-4 sm:px-6 lg:px-8',
    // Custom classes
    data.containerClass || '',
  ].filter(Boolean).join(' ');

  return (
    <section
      ref={containerRef}
      className={containerClasses}
      data-custom-html={uniqueId}
    >
      {/* Render sanitized custom HTML */}
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </section>
  );
}
