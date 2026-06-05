'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SW] registered', reg.scope);
        }
      })
      .catch((err) => {
        console.error('[SW] registration failed', err);
      });
  }, []);

  return null;
}
