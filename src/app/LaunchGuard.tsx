// src/app/LaunchGuard.tsx
// Launch logic: Check if user exists and redirect accordingly
// Ensures Logo screen displays for minimum 3 seconds before redirecting

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../data/user';
import { getEffectivePathname } from '../utils/electronEnv';

interface LaunchGuardProps {
  children: React.ReactNode;
}

const MIN_LOGO_DISPLAY_TIME = 3000; // 3 seconds minimum

/**
 * LaunchGuard Component
 * On app load:
 * - If no username → redirect to /welcome
 * - Else → redirect to /home
 * - Ensures Logo screen displays for minimum 3 seconds
 */
export function LaunchGuard({ children }: LaunchGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = getEffectivePathname(location);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Skip check if already on welcome/home or if already initialized
      if (pathname === '/welcome' || pathname === '/home') {
        setIsInitialized(true);
        return;
      }

      // Only check and redirect if on logo screen
      if (pathname === '/' || pathname === '/logo') {
        const startTime = Date.now();
        
        try {
          // Check if user exists
          const user = await getUser();
          
          // Calculate elapsed time and ensure minimum display time
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOGO_DISPLAY_TIME - elapsed);
          
          // Wait for remaining time to ensure minimum 3 seconds
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          
          if (!user || !user.username) {
            // No user or no username → redirect to welcome
            navigate('/welcome', { replace: true });
          } else {
            // User exists → redirect to home
            // Set flag to indicate we're coming from logo page (for welcome toast)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('doro_fromLogo', 'true');
            }
            navigate('/home', { replace: true });
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Error checking user:', error);
          }
          // On error, ensure minimum time then redirect to welcome
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOGO_DISPLAY_TIME - elapsed);
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          navigate('/welcome', { replace: true });
        } finally {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    };

    // Only run check once on mount
    if (!isInitialized) {
      checkUserAndRedirect();
    }
  }, [navigate, pathname, isInitialized]);

  // Always render children (Logo screen will be visible)
  return <>{children}</>;
}
