'use client';

import { useEffect } from 'react';

export default function FontAwesomeLoader() {
  useEffect(() => {
    // Load Font Awesome after initial render to avoid blocking
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  return null;
}
