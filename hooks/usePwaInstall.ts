'use client';

import { useEffect, useState, useCallback } from 'react';

const LS_INSTALLED  = 'mad_pwa_installed';
const LS_DISMISSED  = 'mad_pwa_dismissed';
const DISMISS_TTL   = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePwaInstallResult {
  isInstallable: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  // Android / desktop Chrome
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // iOS Safari
  if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) return true;
  return false;
}

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(LS_DISMISSED);
    if (!ts) return false;
    return Date.now() - Number(ts) < DISMISS_TTL;
  } catch {
    return false;
  }
}

function wasInstalled(): boolean {
  try {
    return localStorage.getItem(LS_INSTALLED) === '1';
  } catch {
    return false;
  }
}

export function usePwaInstall(): UsePwaInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isStandalone]                       = useState(isStandaloneMode);

  useEffect(() => {
    // Already installed or running as PWA — nothing to show
    if (isStandalone || wasInstalled()) return;
    // User dismissed recently — respect the TTL
    if (wasDismissedRecently()) return;

    const handler = (e: Event) => {
      e.preventDefault(); // suppress native mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      try { localStorage.setItem(LS_INSTALLED, '1'); } catch { /* ignore */ }
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      try { localStorage.setItem(LS_INSTALLED, '1'); } catch { /* ignore */ }
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsInstallable(false);
    setDeferredPrompt(null);
    try { localStorage.setItem(LS_DISMISSED, String(Date.now())); } catch { /* ignore */ }
  }, []);

  return { isInstallable, isStandalone, promptInstall, dismiss };
}
