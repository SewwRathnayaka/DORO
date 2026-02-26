// LocalStorage utilities for user preferences and settings

const STORAGE_KEYS = {
  USER_NAME: 'doro_user_name',
  FIRST_LAUNCH: 'doro_first_launch',
  SETTINGS: 'doro_settings',
} as const;

export interface UserSettings {
  soundOn: boolean;
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.USER_NAME);
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}

export function isFirstLaunch(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH) !== 'false';
}

export function setFirstLaunchComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return { soundOn: true };
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { soundOn: true };
    }
  }
  
  return { soundOn: true };
}

export function setSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
