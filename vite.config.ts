import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Map code asset paths to actual file names (code has lilly/peonies, files are lily/peony)
function assetPathMap(assetPath) {
  const p = assetPath.replace(/\\/g, '/');
  if (p.endsWith('lilly.webp')) return p.replace('lilly.webp', 'lily.webp');
  if (p.endsWith('peonies.webp')) return p.replace('peonies.webp', 'peony.webp');
  if (p.endsWith('peoniesw.webp')) return p.replace('peoniesw.webp', 'peonyw.webp');
  return p;
}

// Transform require('...asset') to Vite-friendly form so assets work on web
function requireAssetPlugin() {
  return {
    name: 'require-asset',
    transform(code, id) {
      if (!/\.(tsx?|jsx?)$/.test(id)) return null;
      const imageExt = /require\s*\(\s*['"]([^'"]+\.(webp|png|jpg|jpeg|gif|ico))['"]\s*\)/g;
      const otherExt = /require\s*\(\s*['"]([^'"]+\.(mp3|ttf))['"]\s*\)/g;
      let out = code.replace(imageExt, (_, p1) => {
        const mapped = assetPathMap(p1);
        return `({ uri: new URL("${mapped.replace(/"/g, '\\"')}", import.meta.url).href })`;
      });
      out = out.replace(otherExt, (_, p1) => {
        const mapped = assetPathMap(p1);
        return `new URL("${mapped.replace(/"/g, '\\"')}", import.meta.url).href`;
      });
      return out !== code ? { code: out, map: null } : null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [requireAssetPlugin(), react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-linear-gradient': path.resolve(__dirname, './src/components/LinearGradient.tsx'),
      'expo-status-bar': path.resolve(__dirname, './src/components/StatusBar.tsx'),
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
