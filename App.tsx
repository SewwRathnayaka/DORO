import './src/index.css';
import { Platform } from 'react-native';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AppRouter } from './src/app/AppRouter';
import { isElectron } from './src/utils/electronEnv';

const routerProps = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  } as const,
};

export default function App() {
  if (Platform.OS === 'web') {
    // In Electron (file://), pathname is the file path; use HashRouter so routes use #/home etc.
    if (isElectron) {
      return (
        <HashRouter {...routerProps}>
          <AppRouter />
        </HashRouter>
      );
    }
    return (
      <BrowserRouter {...routerProps}>
        <AppRouter />
      </BrowserRouter>
    );
  }
  return <AppRouter />;
}
