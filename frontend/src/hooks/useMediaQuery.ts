import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query - CSS media query string
 * @returns Boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === 'undefined') {
      return;
    }
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    // Define a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the callback as a listener for changes to the media query
    mediaQuery.addEventListener('change', handleChange);
    
    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
}

// Predefined breakpoints based on common screen sizes
export const breakpoints = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1400px)',
};

// Hooks for common breakpoints
export const useIsMobile = () => useMediaQuery(breakpoints.xs);
export const useIsTablet = () => useMediaQuery(breakpoints.md);
export const useIsDesktop = () => useMediaQuery(breakpoints.lg);
export const useIsLargeDesktop = () => useMediaQuery(breakpoints.xl); 