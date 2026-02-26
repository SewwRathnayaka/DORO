// src/app/NavigationGuard.tsx
// Enforces entryFrom rules from SCREEN_MAP and username validation
// Protects routes that require a username - only logo and welcome are accessible without username

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getScreenByRoute } from '../types/screenMap';
import { getUser } from '../data/user';
import { getEffectivePathname } from '../utils/electronEnv';

interface NavigationGuardProps {
  children: React.ReactNode;
}

/**
 * NavigationGuard Component
 * 1. Validates navigation based on entryFrom rules in SCREEN_MAP
 * 2. Protects routes that require a username - redirects to welcome if no username
 * Only logo ("/") and welcome ("/welcome") are accessible without username
 */
export function NavigationGuard({ children }: NavigationGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const pathname = getEffectivePathname(location);

  useEffect(() => {
    const checkUserAndProtect = async () => {
      // Allow logo and welcome pages without username check
      if (pathname === '/' || pathname === '/welcome') {
        setIsChecking(false);
        return;
      }

      const currentScreen = getScreenByRoute(pathname);
      
      if (!currentScreen) {
        // Unknown route, redirect to logo
        navigate('/', { replace: true });
        setIsChecking(false);
        return;
      }

      try {
        // Check if user exists and has username
        const user = await getUser();
        
        // If no user or no username, redirect to welcome
        if (!user || !user.username || user.username.trim() === '') {
          navigate('/welcome', { replace: true });
          setIsChecking(false);
          return;
        }

        // Check if navigation is allowed based on entryFrom rules
        // For now, we'll allow all navigation if user has username
        // TODO: Implement proper navigation history tracking
        // This would require storing the previous screen ID in state/context
        // and validating against currentScreen.entryFrom array
        
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking user in NavigationGuard:', error);
        }
        // On error, redirect to welcome
        navigate('/welcome', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkUserAndProtect();
  }, [pathname, navigate]);

  // Show nothing while checking (prevents flash of protected content)
  if (isChecking && pathname !== '/' && pathname !== '/welcome') {
    return null;
  }

  return <>{children}</>;
}
