// src/app/useNavigation.ts
// Helper for safe navigation by screen ID

import { useNavigate } from 'react-router-dom';
import { getScreenById, Screen } from '../types/screenMap';
import { SCREEN_MAP } from '../types/screenMap';

/**
 * Custom hook for type-safe navigation using screen IDs
 * 
 * Usage:
 *   const { navigateTo } = useNavigation();
 *   navigateTo('home');
 */
export function useNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate to a screen by its ID
   * @param screenId - The ID of the screen from SCREEN_MAP
   * @param replace - Whether to replace current history entry (default: false)
   */
  const navigateTo = (screenId: string, replace: boolean = false) => {
    const screen = getScreenById(screenId);
    
    if (!screen) {
      if (__DEV__) {
        console.error(`Screen with ID "${screenId}" not found in SCREEN_MAP`);
      }
      return;
    }

    if (screen.type === 'modal') {
      if (__DEV__) {
        console.warn(`Cannot navigate to modal "${screenId}" - modals are controlled by state`);
      }
      return;
    }

    if (!screen.route) {
      if (__DEV__) {
        console.error(`Screen "${screenId}" has no route defined`);
      }
      return;
    }

    navigate(screen.route, { replace });
  };

  /**
   * Navigate back in history
   */
  const goBack = () => {
    navigate(-1);
  };

  /**
   * Navigate forward in history
   */
  const goForward = () => {
    navigate(1);
  };

  /**
   * Get the current screen based on route
   */
  const getCurrentScreen = (pathname: string): Screen | undefined => {
    return getScreenById(
      SCREEN_MAP.find(s => s.route === pathname)?.id || ''
    );
  };

  return {
    navigateTo,
    goBack,
    goForward,
    getCurrentScreen,
  };
}
