// Web-only StatusBar (no-op, replaces expo-status-bar)
import React from 'react';

interface StatusBarProps {
  style?: 'light' | 'dark' | 'auto';
}

export function StatusBar(_props: StatusBarProps): React.ReactElement | null {
  return null;
}
