/// <reference types="vite/client" />

declare const __DEV__: boolean;

declare module 'react-native' {
  import type { ComponentType } from 'react';
  export const Platform: { OS: string };
  export const View: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const ImageBackground: ComponentType<any>;
  export const StyleSheet: { create: <T extends Record<string, any>>(styles: T) => T };
  export const TouchableOpacity: ComponentType<any>;
  export const ScrollView: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const TextInput: ComponentType<any>;
  export const Alert: { alert: (title?: string, message?: string, buttons?: any[]) => void };
  export namespace Animated {
    export class Value {
      constructor(initialValue: number);
      setValue(value: number): void;
      [key: string]: any;
    }
    export interface CompositeAnimation {
      start: (callback?: (r: { finished: boolean }) => void) => void;
      stop: () => void;
      reset: () => void;
    }
    export const View: ComponentType<any>;
    export function timing(value: any, config: any): CompositeAnimation;
    export function loop(animation: CompositeAnimation, config?: { iterations?: number }): CompositeAnimation;
    export function parallel(animations: CompositeAnimation[]): CompositeAnimation;
    export function sequence(animations: CompositeAnimation[]): CompositeAnimation;
  }
  export const Easing: any;
  export type ViewStyle = object;
  export type TextStyle = object;
  export type ImageStyle = object;
}

declare module 'expo-status-bar' {
  export const StatusBar: React.ComponentType<{ style?: 'light' | 'dark' | 'auto' }>;
}

declare module 'expo-linear-gradient' {
  export const LinearGradient: React.ComponentType<{
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: object;
    children?: React.ReactNode;
  }>;
}
