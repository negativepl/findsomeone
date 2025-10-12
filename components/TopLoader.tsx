'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    // Complete the loading bar when route changes
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is on or inside a link
      const link = target.closest('a');
      if (link && link.href && link.target !== '_blank') {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Check if URL will change
        if (url.origin === window.location.origin &&
            (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)) {
          NProgress.start();

          // Fallback timeout in case navigation doesn't happen
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          loadingTimeoutRef.current = setTimeout(() => {
            NProgress.done();
          }, 5000);
        }
        return;
      }

      // Check if click is on or inside a button with data-navigate attribute
      const navigateButton = target.closest('[data-navigate="true"]');
      if (navigateButton) {
        NProgress.start();

        // Shorter timeout for button navigation (will complete when URL changes)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = setTimeout(() => {
          NProgress.done();
        }, 2000);
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
