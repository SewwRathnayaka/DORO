/**
 * Detect when the app is running in Electron or loaded via file://
 * (e.g. packaged app or opening dist/index.html locally).
 * Used to switch to HashRouter and hash-based pathname in guards.
 */
export const isElectron =
  typeof window !== 'undefined' && window.location.protocol === 'file:';

/**
 * Effective pathname for routing: when on file:// use the hash (e.g. #/home → /home),
 * otherwise use the normal pathname (e.g. /home).
 */
export function getEffectivePathname(location: { pathname: string; hash: string }): string {
  if (!isElectron || !location.hash) {
    return location.pathname;
  }
  const hash = location.hash.slice(1); // remove '#'
  return hash.startsWith('/') ? hash : `/${hash}`;
}
