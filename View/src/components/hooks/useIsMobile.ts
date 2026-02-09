/**
 * useIsMobile - Hook to detect mobile viewport
 */

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= breakpoint);
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    
    media.addEventListener('change', checkMobile);
    return () => media.removeEventListener('change', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
