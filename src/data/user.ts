// src/data/user.ts
// Username + local user profile operations

import { getDB } from './db';
import type { User } from '../types/index';

const USER_KEY = 'current_user';

/**
 * Get current user
 */
export async function getUser(): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', USER_KEY);
}

/**
 * Create or update user
 */
export async function createOrUpdateUser(
  username: string,
  settings: Partial<User['settings']> = { 
    soundOn: true,
    audioSettings: {
      soundsEnabled: true,
      musicEnabled: true,
      volume: 0.7,
    },
  }
): Promise<User> {
  const db = await getDB();
  const existing = await db.get('users', USER_KEY);
  
  if (existing) {
    // Type assertion to handle optional audioSettings
    const existingSettings = existing.settings as User['settings'];
    const existingAudioSettings = existingSettings.audioSettings && 
      typeof existingSettings.audioSettings === 'object' &&
      'soundsEnabled' in existingSettings.audioSettings &&
      'musicEnabled' in existingSettings.audioSettings &&
      'volume' in existingSettings.audioSettings
      ? existingSettings.audioSettings
      : undefined;
    
    const updated: User = {
      ...existing,
      username,
      settings: { 
        soundOn: settings.soundOn ?? existingSettings.soundOn ?? true,
        audioSettings: settings.audioSettings ?? existingAudioSettings ?? {
          soundsEnabled: true,
          musicEnabled: true,
          volume: 0.7,
        },
      },
    };
    await db.put('users', updated, USER_KEY);
    return updated;
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user: User = {
    userId,
    username,
    createdAt: new Date(),
    settings: {
      soundOn: settings.soundOn ?? true,
      audioSettings: settings.audioSettings || {
        soundsEnabled: true,
        musicEnabled: true,
        volume: 0.7,
      },
    },
  };

  // Use put with key since users store uses out-of-line keys
  await db.put('users', user, USER_KEY);
  
  // Verify the user was saved
  await db.get('users', USER_KEY);
  
  return user;
}

/**
 * Update user settings
 */
export async function updateUserSettings(settings: Partial<User['settings']>): Promise<void> {
  const db = await getDB();
  const user = await db.get('users', USER_KEY);
  if (user) {
    await db.put('users', {
      ...user,
      settings: { ...user.settings, ...settings },
    }, USER_KEY);
  }
}
