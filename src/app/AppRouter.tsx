// src/app/AppRouter.tsx
// Defines all routes and maps them to screen components.
// Wrapped with NavigationGuard (auth + route validation) and LaunchGuard (logo redirect).

import { Routes, Route } from 'react-router-dom';
import { View } from 'react-native';
import { LaunchGuard } from './LaunchGuard';
import { NavigationGuard } from './NavigationGuard';
import Logo from '../screens/Logo';
import Welcome from '../screens/Welcome';
import Home from '../screens/Home';
import Pomodoro from '../screens/Pomodoro';
import Break from '../screens/Break';
import Bouquet from '../screens/Bouquet';
import Progress from '../screens/Progress';
import Settings from '../screens/Settings';
import Share from '../screens/Share';

const fullHeight = { flex: 1, minHeight: 0 };

export function AppRouter() {
  return (
    <View style={fullHeight}>
      <NavigationGuard>
        <LaunchGuard>
          <Routes>
            <Route path="/" element={<Logo />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/timer/pomo" element={<Pomodoro />} />
            <Route path="/timer/break" element={<Break />} />
            <Route path="/bouquet" element={<Bouquet />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/share" element={<Share />} />
          </Routes>
        </LaunchGuard>
      </NavigationGuard>
    </View>
  );
}
