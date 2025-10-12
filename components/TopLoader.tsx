'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleRouteStart = () => NProgress.start();
    const handleRouteDone = () => NProgress.done();

    // Intercept all link clicks and button clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      const button = target.closest('button');

      // Handle link clicks
      if (link && link.href && link.target !== '_blank') {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Check if either pathname or search params are different
        if (url.origin === window.location.origin &&
            (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)) {
          handleRouteStart();
        }
      }

      // Handle button clicks (for router.push scenarios)
      if (button && !link) {
        handleRouteStart();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      handleRouteDone();
    };
  }, [pathname, searchParams]);

  return null;
}
