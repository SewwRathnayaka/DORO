# Doro App - Comprehensive Test Guide

## Overview

This document provides step-by-step testing instructions for all phases of the Doro app development. Follow these guides to verify functionality at each stage.

---

## Prerequisites

Before testing, ensure:
- ✅ App is running: `npm start` or `npm run web`
- ✅ Browser console is open (F12) to check for errors
- ✅ React DevTools installed (optional but recommended)

---

## Phase 1: Setup & Configuration Testing

### 1.1 Project Setup ✅
**Status**: Complete

**Tests**:
- [x] App starts without errors
- [x] No TypeScript compilation errors
- [x] All dependencies installed
- [x] Tailwind CSS configured

**How to Verify**:
```bash
npm start
# Check terminal for errors
# Check browser console (F12) for errors
```

---

## Phase 2: Navigation & Routing Testing

### 2.1 Screen Navigation ✅
**Status**: Complete

**Test Steps**:

1. **Logo Screen (/)**
   - [ ] Navigate to `http://localhost:8081/`
   - [ ] Should see "🌺 Doro Logo Screen"
   - [ ] Should auto-navigate to Welcome after 2 seconds
   - [ ] Check browser console for route changes

---

## Phase 5: Launch Logic & Route Updates Testing

### 5.1 Launch Logic ✅
**Status**: Complete

**Purpose**: Verify that the app correctly routes users based on whether they have a username set.

**Test Steps**:

#### Test 5.1.1: First-Time User (No Username)
1. **Clear User Data**:
   - Open browser DevTools (F12)
   - Go to Application tab → IndexedDB → `doro-db`
   - Delete the `users` store or clear all data
   - Refresh the page

2. **Verify Redirect to Welcome**:
   - [ ] Navigate to `http://localhost:8081/`
   - [ ] Should see loading screen briefly (🌺 Doro logo with spinner)
   - [ ] Should automatically redirect to `/welcome`
   - [ ] Check browser console for: `"No user found, redirecting to /welcome"`
   - [ ] URL should change to `http://localhost:8081/welcome`

3. **Verify Welcome Screen**:
   - [ ] Should see "Welcome to Doro" title
   - [ ] Should see three sections explaining:
     - What is Pomodoro?
     - Earn Flowers
     - Your Bouquet
   - [ ] Should see input field: "Enter your name:"
   - [ ] Should see "Start" button (disabled until name entered)

#### Test 5.1.2: Returning User (Has Username)
1. **Set Up User**:
   - Complete Test 5.1.1 first (enter name and click Start)
   - This should create a user in IndexedDB

2. **Verify Redirect to Home**:
   - Refresh the page or navigate to `http://localhost:8081/`
   - [ ] Should see loading screen briefly
   - [ ] Should automatically redirect to `/home`
   - [ ] Check browser console for: `"User found, redirecting to /home"`
   - [ ] URL should change to `http://localhost:8081/home`
   - [ ] Should NOT see Welcome screen

3. **Verify Home Screen**:
   - [ ] Should see Home screen content
   - [ ] Should NOT redirect back to Welcome

#### Test 5.1.3: Direct Navigation (Bypass Launch Logic)
1. **Navigate Directly to Welcome**:
   - [ ] Navigate to `http://localhost:8081/welcome` directly
   - [ ] Should load Welcome screen without redirect
   - [ ] LaunchGuard should allow direct access to `/welcome`

2. **Navigate Directly to Home (Without User)**:
   - Clear user data (as in Test 5.1.1)
   - [ ] Navigate to `http://localhost:8081/home` directly
   - [ ] LaunchGuard should redirect to `/welcome` (no user found)
   - [ ] Check console for redirect message

#### Test 5.1.4: Username Input & Submission
1. **Empty Username Validation**:
   - [ ] On Welcome screen, click "Start" without entering name
   - [ ] Should show alert: "Name Required"
   - [ ] Should NOT navigate away

2. **Valid Username Submission**:
   - [ ] Enter a name (e.g., "Test User")
   - [ ] Click "Start" button
   - [ ] Button should show "Starting..." while processing
   - [ ] Should navigate to `/home` after successful save
   - [ ] Check console for: `"User created/updated: Test User"`

3. **Check IndexedDB**:
   - **Method 1: Browser DevTools**:
     - Open DevTools (F12) → Application tab → Storage → IndexedDB
     - Expand `doro-db` → `users` object store
     - [ ] Should see an entry with **Key**: `"current_user"` (string)
     - [ ] Click on the entry to view the **Value** object
     - [ ] Should see user object with:
       - `userId`: string (auto-generated, e.g., "user_1234567890_abc123")
       - `username`: "Test User" (or whatever name you entered)
       - `createdAt`: Date object (may show as timestamp string in DevTools)
       - `settings`: object with `soundOn: true`
   - **Method 2: Console Verification**:
     - Check browser console for: `"User saved to IndexedDB:"` followed by the user object
     - Check for: `"IndexedDB key: current_user"`
   - **Method 3: Programmatic Check**:
     ```javascript
     // In browser console:
     import { getUser } from './src/data/user';
     const user = await getUser();
     console.log('Retrieved user:', user);
     ```
   - **Note**: Since the users store uses out-of-line keys, the key ("current_user") is stored separately from the value (the user object). If you don't see the entry:
     - Refresh the IndexedDB view (right-click → Refresh)
     - Check browser console for any errors
     - Verify the database name is `doro-db` and version is `1`

### 5.2 Route Updates ✅
**Status**: Complete

**Purpose**: Verify that routes match Phase 5 requirements.

**Test Steps**:

#### Test 5.2.1: Verify New Routes
1. **Welcome Route**:
   - [ ] Navigate to `http://localhost:8081/welcome`
   - [ ] Should load Welcome screen
   - [ ] Should display onboarding content and username input

2. **Pomo Route** (Updated from `/timer/pomo`):
   - [ ] Navigate to `http://localhost:8081/pomo`
   - [ ] Should load Pomodoro timer screen
   - [ ] Should show 25-minute timer
   - [ ] Old route `/timer/pomo` should redirect (if configured)

3. **Break Route** (Updated from `/timer/break`):
   - [ ] Navigate to `http://localhost:8081/break`
   - [ ] Should load Break timer screen
   - [ ] Should show break timer options
   - [ ] Old route `/timer/break` should redirect (if configured)

4. **Other Routes** (Unchanged):
   - [ ] `/home` → Home screen
   - [ ] `/bouquet` → Bouquet screen
   - [ ] `/progress` → Progress screen

#### Test 5.2.2: Route Consistency
1. **Check screenMap.ts**:
   - [ ] Verify `screenMap.ts` has correct routes:
     - `welcome`: `/welcome`
     - `pomoTimer`: `/pomo`
     - `breakTimer`: `/break`
   - [ ] Verify `AppRouter.tsx` maps these routes correctly

2. **Navigation from Components**:
   - [ ] Navigate to Home screen
   - [ ] Click any button that should navigate to Pomodoro
   - [ ] Should navigate to `/pomo` (not `/timer/pomo`)
   - [ ] Check URL bar to confirm correct route

### 5.3 LaunchGuard Component ✅
**Status**: Complete

**Test Steps**:

1. **Loading State**:
   - [ ] On initial load (no user), should show loading screen
   - [ ] Loading screen should display:
     - 🌺 emoji (large)
     - "Doro" text
     - Activity indicator (spinner)

2. **Error Handling**:
   - Simulate IndexedDB error (if possible)
   - [ ] Should redirect to `/intro` on error
   - [ ] Should log error to console
   - [ ] Should not crash the app

3. **Performance**:
   - [ ] LaunchGuard check should complete quickly (< 500ms)
   - [ ] Should not cause unnecessary re-renders
   - [ ] Should only run once on mount

### 5.4 Integration Testing

#### Test 5.4.1: Complete First-Time Flow
1. **Fresh Install Simulation**:
   - Clear all IndexedDB data
   - Navigate to `http://localhost:8081/`
   - [ ] Should redirect to `/welcome`
   - [ ] Enter name and click Start
   - [ ] Should redirect to `/home`
   - [ ] Refresh page
   - [ ] Should redirect to `/home` (not `/welcome`)

#### Test 5.4.2: Navigation After Launch
1. **Normal Navigation**:
   - With user set up, navigate to `/home`
   - [ ] Click to navigate to `/pomo`
   - [ ] Should navigate correctly
   - [ ] LaunchGuard should NOT interfere with normal navigation
   - [ ] Should NOT redirect back to `/welcome`

### Browser Console Testing:
```javascript
// Test user check
import { getUser } from './src/data/user';
const user = await getUser();
console.log('Current user:', user);

// Test launch logic
// Clear user to test redirect
import { getDB } from './src/data/db';
const db = await getDB();
await db.delete('users', 'current_user');
// Refresh page to trigger launch logic

// Test route navigation
window.location.href = '/welcome';
window.location.href = '/pomo';
window.location.href = '/break';
```

### Expected Console Output:
```
No user found, redirecting to /welcome
```
OR
```
User found, redirecting to /home
```

---

## Phase 2: Navigation & Routing Testing (Continued)

2. **Welcome Screen (/welcome)**
   - [ ] Should see "Welcome to Doro" text
   - [ ] Should display onboarding content
   - [ ] URL should be `/welcome`

3. **Home Screen (/home)**
   - [ ] Navigate manually: `http://localhost:8081/home`
   - [ ] Should see "Home Screen" text
   - [ ] Should display "Start your Pomodoro session"

4. **All Other Screens**
   - [ ] Test each route manually:
     - `/timer/pomo` - Pomodoro Timer
     - `/timer/break` - Break Timer
     - `/bouquet` - Bouquet Page
     - `/progress` - Progress Page
     - `/settings` - Settings Page
     - `/share` - Share Page
   - [ ] Each should render without errors
   - [ ] URL should match expected route

**Expected Results**:
- ✅ All routes accessible
- ✅ No 404 errors
- ✅ Each screen displays placeholder content
- ✅ URL updates correctly

**How to Test**:
```javascript
// In browser console, test navigation:
// Navigate programmatically
window.location.href = '/home';
window.location.href = '/timer/pomo';
// etc.
```

---

### 2.2 Navigation Guard Testing

**Test Steps**:

1. **Direct URL Access**
   - [ ] Try accessing `/home` directly (should work)
   - [ ] Try accessing `/timer/pomo` directly (should work)
   - [ ] Check console for navigation guard logs

2. **Invalid Routes**
   - [ ] Navigate to `/invalid-route`
   - [ ] Should redirect to `/` (logo screen)
   - [ ] Check console for redirect message

**Expected Results**:
- ✅ Valid routes accessible
- ✅ Invalid routes redirect to home
- ✅ Navigation guard logs route changes

**How to Test**:
```javascript
// In browser console:
console.log('Current route:', window.location.pathname);
// Navigate and check console logs
```

---

### 2.3 useNavigation Hook Testing

**Test Steps**:

1. **Create Test Component** (temporary):
   ```tsx
   // Add to any screen temporarily
   import { useNavigation } from '../app/useNavigation';
   
   const { navigateTo, goBack, getCurrentScreen } = useNavigation();
   
   // Test buttons
   <Button onPress={() => navigateTo('home')}>Go Home</Button>
   <Button onPress={() => navigateTo('bouquet')}>Go Bouquet</Button>
   <Button onPress={goBack}>Go Back</Button>
   ```

2. **Test Navigation Functions**:
   - [ ] `navigateTo('home')` - Should navigate to home
   - [ ] `navigateTo('bouquet')` - Should navigate to bouquet
   - [ ] `navigateTo('invalid')` - Should log error, not navigate
   - [ ] `goBack()` - Should go back in history
   - [ ] `getCurrentScreen(pathname)` - Should return correct screen

**Expected Results**:
- ✅ Navigation works with screen IDs
- ✅ Invalid IDs are handled gracefully
- ✅ Browser history works correctly

---

## Phase 3: Component Testing

### 3.1 Timer Component ✅
**Status**: Working with State

**Test Steps**:

1. **Basic Timer Functionality**:
   - [ ] Navigate to `/timer/pomo`
   - [ ] Should see timer showing "25:00"
   - [ ] Click "Start" button
   - [ ] Timer should count down (25:00 → 24:59 → ...)
   - [ ] Timer should update every second

2. **Pause/Resume**:
   - [ ] Start timer
   - [ ] Click "Pause" button
   - [ ] Timer should stop counting
   - [ ] Click "Resume" button
   - [ ] Timer should continue from where it paused

3. **Reset**:
   - [ ] Start timer, let it run for a few seconds
   - [ ] Click "Pause"
   - [ ] Click "Reset" button
   - [ ] Timer should return to "25:00"
   - [ ] Timer should stop running

4. **Completion Callback Testing**:
   - [ ] Navigate to `/timer/pomo`
   - [ ] Timer is set to 5 seconds for quick testing
   - [ ] Click "Start" button
   - [ ] Wait for timer to reach "00:00"
   - [ ] **Check browser console (F12)** - You should see:
     ```
     ✅ Timer completed! onComplete callback fired
     🎉 Pomodoro session finished!
     📊 Store updated - consecutive count incremented
     ```
   - [ ] Timer should stop at "00:00"
   - [ ] **Check Zustand store** (see instructions below)

5. **Break Timer**:
   - [ ] Navigate to `/timer/break`
   - [ ] Should see break timer (default 5:00)
   - [ ] Test all timer controls work the same

**Expected Results**:
- ✅ Timer counts down correctly
- ✅ Pause/resume works
- ✅ Reset works
- ✅ Completion callback fires (check console)
- ✅ No memory leaks (check console for errors)

**How to Test Completion Callback**:

1. **Watch Console Logs**:
   - Open browser console (F12)
   - Start the timer
   - When timer completes, you should see:
     - `✅ Timer completed! onComplete callback fired`
     - `🎉 Pomodoro session finished!`
     - `📊 Store updated - consecutive count incremented`

2. **Check Zustand Store** (Browser Console):
   ```javascript
   // Method 1: Import and check store directly
   // Note: This works in browser console if you expose the store
   
   // Method 2: Use React DevTools (Recommended)
   // 1. Install React DevTools extension
   // 2. Open DevTools → Components tab
   // 3. Find Pomodoro component
   // 4. Check the useStore hook value
   
   // Method 3: Add temporary debug button (see below)
   ```

3. **Add Debug Button** (Temporary - for testing):
   Add this to Pomodoro.tsx temporarily:
   ```tsx
   import { useStore } from '../state/store';
   
   const store = useStore();
   
   // Add button to check store
   <TouchableOpacity onPress={() => {
     console.log('Current store state:', store);
     console.log('Timer running:', store.timerRunning);
     console.log('Time remaining:', store.timeRemaining);
     console.log('Consecutive count:', store.consecutiveCount);
   }}>
     <Text>Check Store</Text>
   </TouchableOpacity>
   ```

---

### 3.2 Timer with Zustand State Integration ✅
**Status**: Working

**Test Steps**:

1. **State Integration** (if implemented):
   - [ ] Start timer from Pomodoro screen
   - [ ] Check Zustand store: `useStore.getState().timerRunning` should be `true`
   - [ ] Check `timeRemaining` updates in store
   - [ ] Pause timer, check `timerPaused` is `true`
   - [ ] Resume timer, check `timerRunning` is `true` again

2. **State Persistence**:
   - [ ] Start timer
   - [ ] Navigate away and back
   - [ ] Timer state should persist (if implemented)

**Expected Results**:
- ✅ Timer state syncs with Zustand store
- ✅ State persists across navigation (if implemented)

**How to Test**:
```javascript
// In browser console:
import { useStore } from './src/state/store';
const store = useStore.getState();
console.log('Timer running:', store.timerRunning);
console.log('Time remaining:', store.timeRemaining);
```

---

### 3.3 Menu Component Testing

**Test Steps**:

1. **Menu Display**:
   - [ ] Add Menu component to Home screen
   - [ ] Toggle menu visibility
   - [ ] Menu should slide in from side
   - [ ] Overlay should appear

2. **Menu Navigation**:
   - [ ] Click "Home" in menu - should navigate to home
   - [ ] Click "Bouquet" in menu - should navigate to bouquet
   - [ ] Click "Progress" in menu - should navigate to progress
   - [ ] Click "Settings" in menu - should navigate to settings
   - [ ] Menu should close after navigation

3. **Menu Close**:
   - [ ] Click "Close" button - menu should close
   - [ ] Click overlay - menu should close

**Expected Results**:
- ✅ Menu displays correctly
- ✅ Navigation works from menu
- ✅ Menu closes after actions

**How to Test**:
```tsx
// Add to Home.tsx temporarily:
import Menu from '../components/Menu';
import { useStore } from '../state/store';

const { menuVisible, toggleMenu } = useStore();

<Menu visible={menuVisible} onClose={() => toggleMenu()} />
<Button onPress={toggleMenu}>Toggle Menu</Button>
```

---

### 3.4 Modal Component Testing

**Test Steps**:

1. **FlowerSelect Modal**:
   - [ ] Add modal to Home screen
   - [ ] Open modal using state: `useStore.getState().showModal('flowerSelect')`
   - [ ] Modal should appear with overlay
   - [ ] Should see flower options

2. **Modal Interactions**:
   - [ ] Click a flower option
   - [ ] Modal should close
   - [ ] `onSelect` callback should fire
   - [ ] Click "Close" button
   - [ ] Modal should close

3. **Modal State Management**:
   - [ ] Check Zustand store: `modalVisible` should be `'flowerSelect'`
   - [ ] Close modal, check `modalVisible` should be `null`

**Expected Results**:
- ✅ Modal displays correctly
- ✅ Modal closes on selection
- ✅ Modal state syncs with Zustand

**How to Test**:
```tsx
// Add to Home.tsx:
import FlowerSelect from '../modals/FlowerSelect';
import { useStore } from '../state/store';

const { modalVisible, showModal, hideModal } = useStore();

<FlowerSelect
  visible={modalVisible === 'flowerSelect'}
  onClose={hideModal}
  onSelect={(flowerId) => {
    console.log('Selected:', flowerId);
    hideModal();
  }}
/>
<Button onPress={() => showModal('flowerSelect')}>Select Flower</Button>
```

---

### 3.5 StatCard Component Testing

**Test Steps**:

1. **Display**:
   - [ ] Navigate to `/progress`
   - [ ] Should see StatCard component
   - [ ] Check label and value display correctly

2. **Props Testing**:
   - [ ] Test with different values
   - [ ] Test with icons
   - [ ] Test with different labels

**Expected Results**:
- ✅ Cards display correctly
- ✅ Values format properly
- ✅ Icons display (if provided)

---

### 3.6 FlowerCard Component Testing

**Test Steps**:

1. **Display**:
   - [ ] Navigate to `/bouquet`
   - [ ] Add FlowerCard components
   - [ ] Check flower display

2. **Props Testing**:
   - [ ] Test with different flower types
   - [ ] Test with earned dates
   - [ ] Test without dates

**Expected Results**:
- ✅ Flowers display correctly
- ✅ Dates format properly
- ✅ Layout is correct

---

## Phase 4: Data Layer Testing

### 4.1 IndexedDB Setup Testing

**Test Steps**:

1. **Database Initialization**:
   ```javascript
   // In browser console:
   import { getDB } from './src/data/db';
   
   const db = await getDB();
   console.log('Database initialized:', db);
   ```

2. **Check Database**:
   - [ ] Open browser DevTools → Application → IndexedDB
   - [ ] Should see `doro-db` database
   - [ ] Should see all object stores:
     - users
     - sessions
     - consecutivePomos
     - flowers
     - earnedFlowers
     - bouquets
     - progress

**Expected Results**:
- ✅ Database creates successfully
- ✅ All stores exist
- ✅ Indexes are created

---

### 4.2 User Data Testing

**Test Steps**:

```javascript
// In browser console:
import { createOrUpdateUser, getUser, updateUserSettings } from './src/data/user';

// Test create user
const user = await createOrUpdateUser('TestUser', { soundOn: true });
console.log('Created user:', user);

// Test get user
const retrieved = await getUser();
console.log('Retrieved user:', retrieved);

// Test update settings
await updateUserSettings({ soundOn: false });
const updated = await getUser();
console.log('Updated user:', updated);
```

**Expected Results**:
- ✅ User creates successfully
- ✅ User retrieves correctly
- ✅ Settings update correctly
- ✅ Data persists in IndexedDB

---

### 4.3 Session Data Testing

**Test Steps**:

```javascript
// In browser console:
import { 
  createSession, 
  getSession, 
  completeSession, 
  getAllSessions,
  getSessionsByType 
} from './src/data/sessions';

// Test create session
const session = await createSession('pomo', new Date());
console.log('Created session:', session);

// Test get session
const retrieved = await getSession(session.sessionId);
console.log('Retrieved session:', retrieved);

// Test complete session
await completeSession(session.sessionId);
const completed = await getSession(session.sessionId);
console.log('Completed session:', completed);

// Test get all sessions
const allSessions = await getAllSessions();
console.log('All sessions:', allSessions);

// Test get by type
const pomoSessions = await getSessionsByType('pomo');
console.log('Pomo sessions:', pomoSessions);
```

**Expected Results**:
- ✅ Sessions create correctly
- ✅ Sessions retrieve correctly
- ✅ Sessions update correctly
- ✅ Queries work correctly

---

### 4.4 Consecutive Pomodoro Testing

**Test Steps**:

```javascript
// In browser console:
import {
  createConsecutivePomo,
  getConsecutivePomo,
  updateConsecutivePomoStatus,
  addBonusItem,
  getActiveConsecutivePomo
} from './src/data/consecutive';

// Create sessions first
const session1 = await createSession('pomo');
const session2 = await createSession('pomo');
const session3 = await createSession('pomo');

// Test create consecutive
const consecutive = await createConsecutivePomo([
  session1.sessionId,
  session2.sessionId,
  session3.sessionId
]);
console.log('Created consecutive:', consecutive);

// Test get consecutive
const retrieved = await getConsecutivePomo(consecutive.consecutivePomoId);
console.log('Retrieved consecutive:', retrieved);

// Test update status
await updateConsecutivePomoStatus(consecutive.consecutivePomoId, 'completed');
const updated = await getConsecutivePomo(consecutive.consecutivePomoId);
console.log('Updated consecutive:', updated);

// Test add bonus
await addBonusItem(consecutive.consecutivePomoId, 'wrapper');
const withBonus = await getConsecutivePomo(consecutive.consecutivePomoId);
console.log('With bonus:', withBonus);
```

**Expected Results**:
- ✅ Consecutive pomos create correctly
- ✅ Status updates work
- ✅ Bonus items add correctly

---

### 4.5 Flower Data Testing

**Test Steps**:

```javascript
// In browser console:
import {
  createFlower,
  getFlower,
  getAllFlowers,
  earnFlowerFromSession,
  getAllEarnedFlowers
} from './src/data/flowers';

// Test create flower
const flower = await createFlower('rose_1', 'Rose');
console.log('Created flower:', flower);

// Test get flower
const retrieved = await getFlower('rose_1');
console.log('Retrieved flower:', retrieved);

// Test earn flower
const session = await createSession('pomo');
const earned = await earnFlowerFromSession(session.sessionId, 'rose_1');
console.log('Earned flower:', earned);

// Test get all earned
const allEarned = await getAllEarnedFlowers();
console.log('All earned flowers:', allEarned);
```

**Expected Results**:
- ✅ Flowers create correctly
- ✅ Earned flowers track correctly
- ✅ Queries work correctly

---

### 4.6 Progress Data Testing

**Test Steps**:

```javascript
// In browser console:
import {
  getProgress,
  initializeProgress,
  updateProgress,
  addDailyStats,
  incrementConsecutivePomoCount,
  resetConsecutivePomoCount
} from './src/data/progress';

// Test initialize
const progress = await initializeProgress();
console.log('Initialized progress:', progress);

// Test update
await updateProgress({ totalPomos: 5 });
const updated = await getProgress();
console.log('Updated progress:', updated);

// Test daily stats
await addDailyStats({
  date: new Date().toISOString().split('T')[0],
  pomosCompleted: 3,
  focusMinutes: 75,
  breakMinutes: 10,
  streakActive: true
});
const withStats = await getProgress();
console.log('With daily stats:', withStats);

// Test consecutive count
await incrementConsecutivePomoCount();
const incremented = await getProgress();
console.log('Incremented count:', incremented);
```

**Expected Results**:
- ✅ Progress initializes correctly
- ✅ Updates work correctly
- ✅ Daily stats add correctly
- ✅ Consecutive count increments correctly

---

## Phase 5: State Management Testing

### 5.1 Zustand Store Testing ✅
**Status**: Working

**Test Steps**:

```javascript
// In browser console:
import { useStore } from './src/state/store';

const store = useStore.getState();

// Test app state
console.log('Current screen:', store.currentScreen);
console.log('Modal visible:', store.modalVisible);
console.log('Menu visible:', store.menuVisible);

// Test timer state
console.log('Timer running:', store.timerRunning);
console.log('Time remaining:', store.timeRemaining);
console.log('Consecutive count:', store.consecutiveCount);

// Test actions
store.setCurrentScreen('home');
console.log('Screen after set:', useStore.getState().currentScreen);

store.showModal('flowerSelect');
console.log('Modal after show:', useStore.getState().modalVisible);

store.startTimer(1500, 'pomo');
console.log('Timer after start:', {
  running: useStore.getState().timerRunning,
  remaining: useStore.getState().timeRemaining
});
```

**Expected Results**:
- ✅ State reads correctly
- ✅ Actions update state correctly
- ✅ State persists (if implemented)

---

## Phase 6: Integration Testing

### 6.1 Complete Pomodoro Flow Testing

**Test Steps**:

1. **Start Pomodoro**:
   - [ ] Navigate to Home
   - [ ] Click "Start Pomodoro" (when implemented)
   - [ ] Select flower from modal
   - [ ] Navigate to Pomodoro screen
   - [ ] Timer should start

2. **Complete Pomodoro**:
   - [ ] Let timer complete (or fast-forward for testing)
   - [ ] Check session created in IndexedDB
   - [ ] Check flower earned
   - [ ] Check progress updated
   - [ ] Check consecutive count updated

3. **Break Flow**:
   - [ ] After Pomodoro completion
   - [ ] Navigate to Break screen
   - [ ] Timer should show break duration
   - [ ] Complete break
   - [ ] Check break session created

**Expected Results**:
- ✅ Complete flow works end-to-end
- ✅ Data persists correctly
- ✅ State updates correctly

---

### 6.2 Consecutive Pomodoro Flow Testing

**Test Steps**:

1. **First 3 Pomodoros**:
   - [ ] Complete 3 Pomodoros
   - [ ] Check consecutive pomo created
   - [ ] Check wrapper bonus earned
   - [ ] Check long break available

2. **Second Set (6 Total)**:
   - [ ] Complete 3 more Pomodoros
   - [ ] Check second consecutive pomo created
   - [ ] Check bonus flower option appears
   - [ ] Select bonus flower
   - [ ] Check bonus flower earned

**Expected Results**:
- ✅ Consecutive tracking works
- ✅ Bonuses awarded correctly
- ✅ Break types switch correctly

---

## Phase 7: UI/UX Testing

### 7.1 Responsive Design Testing

**Test Steps**:
- [ ] Test on different screen sizes
- [ ] Test on mobile (if applicable)
- [ ] Test on desktop
- [ ] Check layout doesn't break

---

### 7.2 Animation Testing

**Test Steps**:
- [ ] Test screen transitions
- [ ] Test modal animations
- [ ] Test flower animations (when implemented)
- [ ] Check performance (no lag)

---

## Testing Checklist Summary

### ✅ Completed Tests:
- [x] Project setup
- [x] Navigation & routing
- [x] Timer component functionality
- [x] Timer with Zustand state integration
- [x] Zustand store functionality

### 🔄 To Test:
- [ ] Menu component
- [ ] Modal component
- [ ] StatCard component
- [ ] FlowerCard component
- [ ] IndexedDB operations
- [ ] Complete Pomodoro flow
- [ ] Consecutive Pomodoro flow
- [ ] Data persistence
- [ ] UI/UX elements

---

## Quick Test Commands

### Browser Console Testing:
```javascript
// Test navigation
window.location.href = '/home';

// Test Zustand store
import { useStore } from './src/state/store';
const store = useStore.getState();
console.log(store);

// Test IndexedDB
import { getDB } from './src/data/db';
const db = await getDB();
console.log(db);

// Test user data
import { getUser } from './src/data/user';
const user = await getUser();
console.log(user);
```

### React DevTools:
1. Install React DevTools extension
2. Open DevTools → Components tab
3. Inspect component state
4. Check props and hooks

### IndexedDB Inspection:
1. Open DevTools → Application tab
2. Navigate to IndexedDB → doro-db
3. Inspect object stores
4. Check data values

---

## Reporting Issues

When reporting test failures:
1. Note the test phase and step
2. Include browser console errors
3. Include React DevTools screenshots
4. Include IndexedDB data (if relevant)
5. Note steps to reproduce

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Mark completed tests in this document
2. ✅ Update PROGRESS.md with test results
3. ✅ Fix any issues found
4. ✅ Proceed to next phase

---

---

## Phase 6: Pomodoro Timer Screen Testing

### 6.1 Pomodoro Screen UI Testing ✅
**Status**: Complete

**Purpose**: Verify that the Pomodoro Timer screen matches the Figma design and displays all elements correctly.

**Test Steps**:

#### Test 6.1.1: Screen Layout
1. **Navigate to Pomodoro Screen**:
   - [ ] Navigate to `/pomo` or click START button from Home
   - [ ] Should see Pomodoro Timer screen

2. **Verify UI Elements**:
   - [ ] **Logo**: Should appear in top-left corner (248x100)
   - [ ] **Background**: Should show background pattern from Home.tsx
   - [ ] **Consecutive Count**: Should appear in top-right corner
     - Should show "No. of consecutive pomodoros" label
     - Should show count value (0, 1, or 2) in white rounded box
   - [ ] **Central Flower**: Should appear in white circle (300x300)
     - Should display the selected flower from FlowerSelect modal
     - Default to rose if no flower selected
   - [ ] **TIME Label**: Should appear below flower, centered
   - [ ] **Timer Display**: Should show MM:SS format (e.g., "25:00")
     - Should have gradient background (yellow to peach)
     - Should be in rounded capsule shape
   - [ ] **PAUSE Button**: Should appear on left side of TIME label (when timer running)
   - [ ] **RESET Button**: Should appear on right side of TIME label (when paused)
   - [ ] **QUIT Button**: Should appear below timer display
   - [ ] **Warning Text**: Should show "Do not close this window" below QUIT button
   - [ ] **StoreDebugger**: Should appear in bottom-right (for development)

**Expected Results**:
- ✅ All UI elements match Figma design
- ✅ Layout is centered and properly spaced
- ✅ Colors match design (gradients, borders, etc.)
- ✅ Fonts match design (Poppins-Regular, Goldman-Regular)

#### Test 6.1.2: Flower Display
1. **With Selected Flower**:
   - [ ] Select a flower from FlowerSelect modal
   - [ ] Navigate to Pomodoro screen
   - [ ] Should display the selected flower in the center circle

2. **Without Selected Flower**:
   - [ ] Navigate to Pomodoro screen without selecting a flower
   - [ ] Should default to rose flower

**Expected Results**:
- ✅ Selected flower displays correctly
- ✅ Default flower displays when none selected

### 6.2 Timer Functionality Testing ✅
**Status**: Complete

**Purpose**: Verify that the timer counts down correctly and all controls work.

**Test Steps**:

#### Test 6.2.1: Auto-Start
1. **Timer Auto-Starts**:
   - [ ] Navigate to Pomodoro screen
   - [ ] Timer should automatically start counting down from 25:00
   - [ ] Should NOT require clicking a Start button
   - [ ] Check Zustand store: `timerRunning` should be `true`

**Expected Results**:
- ✅ Timer starts automatically on screen load
- ✅ Timer counts down every second (25:00 → 24:59 → ...)

#### Test 6.2.2: Pause/Resume
1. **Pause Timer**:
   - [ ] Start timer (auto-starts)
   - [ ] Click PAUSE button
   - [ ] Timer should stop counting
   - [ ] PAUSE button should disappear
   - [ ] RESUME button should appear on left
   - [ ] RESET button should appear on right
   - [ ] Check Zustand store: `timerPaused` should be `true`, `timerRunning` should be `false`
   - [ ] **Consecutive count should remain unchanged**

2. **Resume Timer**:
   - [ ] Click RESUME button
   - [ ] Timer should continue from where it paused
   - [ ] RESUME button should disappear
   - [ ] PAUSE button should reappear on left
   - [ ] RESET button should disappear
   - [ ] Check Zustand store: `timerRunning` should be `true`, `timerPaused` should be `false`
   - [ ] **Consecutive count should remain unchanged**

**Expected Results**:
- ✅ Pause stops timer correctly
- ✅ Resume continues from paused time
- ✅ Consecutive count does NOT reset on pause/resume

#### Test 6.2.3: Reset Timer
1. **Reset While Paused**:
   - [ ] Start timer, let it run for a few seconds
   - [ ] Click PAUSE
   - [ ] Click RESET button
   - [ ] Should show confirmation alert: "Reset Timer"
   - [ ] Click "Reset" in alert
   - [ ] Timer should return to 25:00
   - [ ] Timer should stop running
   - [ ] Check Zustand store: `timerRunning` should be `false`, `timerPaused` should be `false`, `timeRemaining` should be 1500 (25 minutes)
   - [ ] **Consecutive count should remain unchanged**

2. **Cancel Reset**:
   - [ ] Click RESET button
   - [ ] Click "Cancel" in alert
   - [ ] Timer should remain paused at current time
   - [ ] **Consecutive count should remain unchanged**

**Expected Results**:
- ✅ Reset returns timer to 25:00
- ✅ Reset only works when paused
- ✅ Consecutive count does NOT reset on timer reset

#### Test 6.2.4: Timer Completion
1. **Complete Pomodoro**:
   - [ ] Navigate to Pomodoro screen
   - [ ] Wait for timer to reach 00:00 (or modify duration for testing)
   - [ ] Timer should stop at 00:00
   - [ ] Check browser console for:
     ```
     ✅ Pomodoro completed! Consecutive count incremented
     ```
   - [ ] Should automatically navigate to Home screen after 1 second
   - [ ] Check Zustand store: `consecutiveCount` should be incremented
   - [ ] **Consecutive count should increment only on full completion**

**Expected Results**:
- ✅ Timer completes correctly
- ✅ Completion callback fires
- ✅ Consecutive count increments
- ✅ Navigation to home occurs

### 6.3 Consecutive Count Logic Testing ✅
**Status**: Complete

**Purpose**: Verify that consecutive Pomodoro counting works according to the rules.

**Test Steps**:

#### Test 6.3.1: First Pomodoro (Count = 0)
1. **Start First Pomodoro**:
   - [ ] Navigate to Pomodoro screen
   - [ ] Check consecutive count indicator: Should show "0"
   - [ ] Complete the Pomodoro (wait for timer or modify duration)
   - [ ] Check consecutive count: Should increment to 1
   - [ ] Navigate back to Pomodoro screen
   - [ ] Check consecutive count indicator: Should show "1"

**Expected Results**:
- ✅ Count starts at 0
- ✅ Count increments to 1 after first completion

#### Test 6.3.2: Second Pomodoro (Count = 1)
1. **Start Second Pomodoro**:
   - [ ] With count at 1, start new Pomodoro
   - [ ] Check consecutive count indicator: Should show "1"
   - [ ] Complete the Pomodoro
   - [ ] Check consecutive count: Should increment to 2
   - [ ] Navigate back to Pomodoro screen
   - [ ] Check consecutive count indicator: Should show "2"

**Expected Results**:
- ✅ Count shows 1 for second Pomodoro
- ✅ Count increments to 2 after second completion

#### Test 6.3.3: Third Pomodoro - Big Pomodoro (Count = 2 → 0)
1. **Start Third Pomodoro**:
   - [ ] With count at 2, start new Pomodoro
   - [ ] Check consecutive count indicator: Should show "2"
   - [ ] Complete the Pomodoro
   - [ ] Check consecutive count: Should increment to 3, then automatically reset to 0
   - [ ] Navigate back to Pomodoro screen
   - [ ] Check consecutive count indicator: Should show "0"

**Expected Results**:
- ✅ Count shows 2 for third Pomodoro
- ✅ After third completion, count resets to 0 (big Pomodoro complete)

#### Test 6.3.4: Pause Does NOT Reset Count
1. **Pause During Pomodoro**:
   - [ ] Start Pomodoro with count at 1
   - [ ] Click PAUSE
   - [ ] Check consecutive count: Should still be 1
   - [ ] Click RESUME
   - [ ] Complete Pomodoro
   - [ ] Check consecutive count: Should increment to 2

**Expected Results**:
- ✅ Pausing does NOT reset consecutive count
- ✅ Resuming does NOT reset consecutive count

#### Test 6.3.5: Reset Timer Does NOT Reset Count
1. **Reset During Pomodoro**:
   - [ ] Start Pomodoro with count at 1
   - [ ] Click PAUSE
   - [ ] Click RESET
   - [ ] Check consecutive count: Should still be 1
   - [ ] Complete Pomodoro
   - [ ] Check consecutive count: Should increment to 2

**Expected Results**:
- ✅ Resetting timer does NOT reset consecutive count
- ✅ Count only increments on full completion

#### Test 6.3.6: Quit Resets Count
1. **Quit During Pomodoro**:
   - [ ] Start Pomodoro with count at 1
   - [ ] Click QUIT button
   - [ ] Should show confirmation alert: "Quit Session"
   - [ ] Click "Quit" in alert
   - [ ] Should navigate to Home
   - [ ] Check consecutive count: Should be reset to 0

2. **Cancel Quit**:
   - [ ] Click QUIT button
   - [ ] Click "Cancel" in alert
   - [ ] Should remain on Pomodoro screen
   - [ ] Check consecutive count: Should remain unchanged

**Expected Results**:
- ✅ Quitting resets consecutive count to 0
- ✅ Canceling quit does NOT reset count

### 6.4 Complete Flow Testing ✅

#### Test 6.4.1: Complete Big Pomodoro Flow
1. **Three Consecutive Pomodoros**:
   - [ ] Start first Pomodoro → Complete → Count = 1
   - [ ] Start second Pomodoro → Complete → Count = 2
   - [ ] Start third Pomodoro → Complete → Count = 0 (reset after big Pomodoro)
   - [ ] Verify count resets correctly

**Expected Results**:
- ✅ Count progresses: 0 → 1 → 2 → 0
- ✅ Big Pomodoro completes after 3rd Pomodoro

#### Test 6.4.2: Skip Break Flow
1. **Skip Break Between Pomodoros**:
   - [ ] Complete first Pomodoro
   - [ ] Navigate to Home (skip break)
   - [ ] Start new Pomodoro immediately
   - [ ] Count should increment correctly
   - [ ] Flow should continue uninterrupted

**Expected Results**:
- ✅ Skipping breaks does NOT break consecutive flow
- ✅ Count increments correctly

### Browser Console Testing:
```javascript
// Test consecutive count
import { useStore } from './src/state/store';
const store = useStore.getState();
console.log('Consecutive count:', store.consecutiveCount);

// Test timer state
console.log('Timer running:', store.timerRunning);
console.log('Timer paused:', store.timerPaused);
console.log('Time remaining:', store.timeRemaining);

// Test increment
store.incrementConsecutive();
console.log('After increment:', useStore.getState().consecutiveCount);

// Test reset
store.resetConsecutive();
console.log('After reset:', useStore.getState().consecutiveCount);
```

### Expected Console Output:
```
✅ Pomodoro completed! Consecutive count incremented
```

---

## Phase 7: Flower Persistence & Page Refresh Testing

### 7.1 Selected Flower Persistence ✅
**Status**: Complete

**Purpose**: Verify that the selected flower persists across page refreshes and the timer restarts correctly with the same flower.

**Test Steps**:

#### Test 7.1.1: Flower Persistence on Page Refresh
1. **Select a Flower and Start Timer**:
   - [ ] Navigate to Home screen (`/home`)
   - [ ] Click "START" button
   - [ ] Select a flower from FlowerSelect modal (e.g., "Carnation" or "Lily")
   - [ ] Should navigate to Pomodoro screen (`/pomo`)
   - [ ] Verify the selected flower displays in the center circle
   - [ ] Timer should start automatically

2. **Refresh Page While Timer is Running**:
   - [ ] While timer is running (e.g., at 24:30), refresh the page (F5 or Ctrl+R)
   - [ ] Page should reload
   - [ ] **Expected**: The same flower should still be displayed (NOT default rose)
   - [ ] Timer should restart from 25:00 (as per design - refresh resets timer)
   - [ ] Timer should auto-start counting down

3. **Verify localStorage Persistence**:
   - [ ] Open browser DevTools (F12) → Application tab → Local Storage
   - [ ] Navigate to `http://localhost:8081`
   - [ ] Look for key: `doro_selectedFlower`
   - [ ] Value should be the flower ID you selected (e.g., "carnation", "lily")
   - [ ] Refresh page again
   - [ ] Flower should still persist

**Expected Results**:
- ✅ Selected flower persists across page refreshes
- ✅ Flower does NOT revert to default rose after refresh
- ✅ Timer restarts correctly (25:00) after refresh
- ✅ Timer auto-starts after refresh
- ✅ Flower is stored in localStorage

#### Test 7.1.2: Flower Persistence After Timer Completion
1. **Complete Pomodoro with Selected Flower**:
   - [ ] Select a flower (e.g., "Daisy")
   - [ ] Start Pomodoro timer
   - [ ] Complete the timer (wait or modify duration for testing)
   - [ ] Should navigate to Home after completion

2. **Start New Pomodoro**:
   - [ ] Click "START" button again
   - [ ] **Expected**: Should NOT show FlowerSelect modal (flower already selected)
   - [ ] Should navigate directly to Pomodoro screen
   - [ ] **Expected**: Same flower (Daisy) should still be displayed
   - [ ] Timer should start with the persisted flower

3. **Refresh After Completion**:
   - [ ] Complete another Pomodoro
   - [ ] Refresh the page
   - [ ] Navigate to Pomodoro screen
   - [ ] **Expected**: Same flower should still be displayed

**Expected Results**:
- ✅ Flower persists after timer completion
- ✅ FlowerSelect modal does NOT appear if flower already selected
- ✅ New Pomodoro sessions use the persisted flower

#### Test 7.1.3: Change Flower Selection
1. **Select Different Flower**:
   - [ ] With a flower already selected (e.g., "Rose")
   - [ ] Navigate to Home
   - [ ] Click "START" button
   - [ ] **Expected**: Should show FlowerSelect modal (allows changing selection)
   - [ ] Select a different flower (e.g., "Orchid")
   - [ ] Navigate to Pomodoro screen
   - [ ] **Expected**: New flower (Orchid) should display

2. **Verify localStorage Update**:
   - [ ] Check localStorage: `doro_selectedFlower` should be "orchid"
   - [ ] Refresh page
   - [ ] **Expected**: Orchid should still be displayed (not Rose)

**Expected Results**:
- ✅ Flower selection can be changed
- ✅ localStorage updates when new flower is selected
- ✅ New selection persists across refreshes

#### Test 7.1.4: Clear Flower Selection
1. **Clear Selection** (if implemented):
   - [ ] With a flower selected
   - [ ] Clear the selection (if there's a clear button, or manually clear localStorage)
   - [ ] Navigate to Pomodoro screen
   - [ ] **Expected**: Should default to rose flower

2. **Verify localStorage Clear**:
   - [ ] Check localStorage: `doro_selectedFlower` should be removed/null
   - [ ] Refresh page
   - [ ] **Expected**: Should still default to rose

**Expected Results**:
- ✅ Clearing selection works correctly
- ✅ localStorage is cleared when selection is cleared
- ✅ Default rose displays when no flower selected

### Browser Console Testing:
```javascript
// Test localStorage persistence
// Check current selected flower
console.log('Selected flower:', localStorage.getItem('doro_selectedFlower'));

// Set a flower manually (for testing)
localStorage.setItem('doro_selectedFlower', 'carnation');
// Refresh page to see if it loads

// Clear selection
localStorage.removeItem('doro_selectedFlower');
// Refresh page to see if it defaults to rose

// Test Zustand store
import { useStore } from './src/state/store';
const store = useStore.getState();
console.log('Store selectedFlower:', store.selectedFlower);

// Load flower from localStorage
store.loadSelectedFlower();
console.log('After load:', useStore.getState().selectedFlower);
```

### Expected Console Output:
```
// When loading flower on mount:
// (No errors, flower should load silently)
```

### Test Scenarios Summary:

| Scenario | Expected Behavior |
|----------|------------------|
| Refresh while timer running | Same flower displays, timer restarts at 25:00 |
| Complete Pomodoro, refresh | Same flower persists |
| Select new flower | New flower persists, localStorage updates |
| Clear selection | Defaults to rose, localStorage cleared |
| Direct navigation to `/pomo` | Uses persisted flower or defaults to rose |

---

**Last Updated**: After Phase 7 completion (Flower Persistence & Page Refresh)
**Next Review**: After Break Timer implementation

---

## Phase 8: Bouquet Screen & Flower Earning Testing

### 8.1 Bouquet Screen UI Testing ✅
**Status**: Complete

**Purpose**: Verify that the Bouquet screen displays correctly with background, logo, buttons, and bouquet layout.

**Test Steps**:

#### Test 8.1.1: Screen Layout
1. **Navigate to Bouquet Screen**:
   - [ ] Navigate to `/bouquet` or click "YOUR BOUQUET" from Home sidebar
   - [ ] Should see Bouquet screen

2. **Verify UI Elements**:
   - [ ] **Logo**: Should appear in top-left corner (248x100)
   - [ ] **Background**: Should show background pattern (same as Home.tsx)
   - [ ] **Back Button**: Should appear on left side, below logo
     - Should have gradient background (#F1B89A to #F3F3B7)
     - Should have rounded right corners, flat left edge
     - Text: "back" in lowercase, Poppins-Regular, 14px, black
   - [ ] **Share Button**: Should appear on right side, aligned with back button
     - Size: 155px width × 45px height
     - Gradient: #E8E4BF (left) to #F7A0B1 (right)
     - Text: "SHARE" in uppercase, Goldman-bold, 24px, black
   - [ ] **Bouquet Area**: Should be centered horizontally
     - Should display flowers in pyramid pattern (if any earned)
     - Should display wrapper image below flowers (if any flowers exist)

**Expected Results**:
- ✅ All UI elements match Figma design
- ✅ Layout is properly positioned
- ✅ Buttons are functional

#### Test 8.1.2: Empty Bouquet State
1. **No Flowers Earned**:
   - [ ] Navigate to Bouquet screen with no completed Pomodoros
   - [ ] Should show empty bouquet area (no flowers, no wrapper)
   - [ ] Screen should still display logo, buttons, and background

**Expected Results**:
- ✅ Empty state displays correctly
- ✅ No errors in console

### 8.2 Flower Earning & Storage Testing ✅
**Status**: Complete

**Purpose**: Verify that flowers are properly stored when Pomodoro completes.

**Test Steps**:

#### Test 8.2.1: Flower Storage on Pomodoro Completion
1. **Complete a Pomodoro**:
   - [ ] Navigate to Home screen
   - [ ] Click "START" button
   - [ ] Select a flower (e.g., "Carnation")
   - [ ] Navigate to Pomodoro screen
   - [ ] Complete the Pomodoro timer (wait for completion or modify duration for testing)
   - [ ] Should see PomodoroComplete modal

2. **Verify Flower Storage**:
   - [ ] Open browser DevTools (F12) → Application tab → IndexedDB → `doro-db`
   - [ ] Navigate to `earnedFlowers` object store
   - [ ] Should see a new entry with:
     - `earnedFromSessionId`: Session ID (string)
     - `flowerId`: The selected flower ID (e.g., "carnation")
     - `isBonus`: false
   - [ ] Navigate to `sessions` object store
   - [ ] Should see a completed session with:
     - `type`: "pomo"
     - `status`: "completed"
     - `endTime`: Date object

3. **Check Console Logs**:
   - [ ] Browser console should show: `"✅ Pomodoro completed! Flower earned: [flowerId]"`

**Expected Results**:
- ✅ Flower is stored in IndexedDB when Pomodoro completes
- ✅ Session is created and marked as completed
- ✅ Correct flower ID is stored (matches selected flower)

#### Test 8.2.2: Multiple Flowers Storage
1. **Complete Multiple Pomodoros**:
   - [ ] Complete first Pomodoro with flower "Rose"
   - [ ] Complete second Pomodoro with flower "Lily"
   - [ ] Complete third Pomodoro with flower "Carnation"

2. **Verify All Flowers Stored**:
   - [ ] Check IndexedDB `earnedFlowers` store
   - [ ] Should see 3 entries with different `flowerId` values
   - [ ] Each should have a unique `earnedFromSessionId`

**Expected Results**:
- ✅ Multiple flowers are stored correctly
- ✅ Each flower has unique session ID
- ✅ Flower IDs match selected flowers

### 8.3 Bouquet Layout Algorithm Testing ✅
**Status**: Complete

**Purpose**: Verify that flowers are arranged correctly in the pyramid pattern.

**Test Steps**:

#### Test 8.3.1: Single Flower (Row 1)
1. **Earn One Flower**:
   - [ ] Complete 1 Pomodoro
   - [ ] Navigate to Bouquet screen
   - [ ] Should see 1 flower displayed

2. **Verify Position**:
   - [ ] Flower should be centered horizontally
   - [ ] Flower should be at top of bouquet area
   - [ ] Flower rotation should be 0° (upright)
   - [ ] Wrapper should appear below flower

**Expected Results**:
- ✅ Single flower is centered
- ✅ Rotation is 0°
- ✅ Wrapper is positioned correctly

#### Test 8.3.2: Two Flowers (Row 1 + Row 2)
1. **Earn Two Flowers**:
   - [ ] Complete 2 Pomodoros
   - [ ] Navigate to Bouquet screen
   - [ ] Should see 2 flowers displayed

2. **Verify Layout**:
   - [ ] Row 1: 1 flower centered, 0° rotation
   - [ ] Row 2: 2 flowers below row 1
     - Left flower: rotated +30°
     - Right flower: rotated -30°
   - [ ] Flowers should be evenly spaced horizontally
   - [ ] Wrapper should appear below row 2

**Expected Results**:
- ✅ Flowers arranged in correct rows
- ✅ Rotations match specification (+30°, -30°)
- ✅ Spacing is even

#### Test 8.3.3: Three Flowers (Row 1 + Row 2)
1. **Earn Three Flowers**:
   - [ ] Complete 3 Pomodoros
   - [ ] Navigate to Bouquet screen
   - [ ] Should see 3 flowers displayed

2. **Verify Layout**:
   - [ ] Row 1: 1 flower centered, 0° rotation
   - [ ] Row 2: 2 flowers with +30° and -30° rotations
   - [ ] All flowers should be properly spaced

**Expected Results**:
- ✅ Layout matches pyramid pattern
- ✅ All rotations correct

#### Test 8.3.4: Four Flowers (Row 1 + Row 2 + Row 3)
1. **Earn Four Flowers**:
   - [ ] Complete 4 Pomodoros
   - [ ] Navigate to Bouquet screen
   - [ ] Should see 4 flowers displayed

2. **Verify Layout**:
   - [ ] Row 1: 1 flower, 0° rotation
   - [ ] Row 2: 2 flowers, +30° and -30° rotations
   - [ ] Row 3: 1 flower (first of row 3), +30° rotation
   - [ ] Flowers should be properly spaced

**Expected Results**:
- ✅ Third row starts correctly
- ✅ Rotations match specification

#### Test 8.3.5: Ten Flowers (Full Bouquet)
1. **Earn Ten Flowers**:
   - [ ] Complete 10 Pomodoros (or modify code to add test flowers)
   - [ ] Navigate to Bouquet screen
   - [ ] Should see exactly 10 flowers displayed

2. **Verify Complete Layout**:
   - [ ] Row 1: 1 flower, 0° rotation
   - [ ] Row 2: 2 flowers, +30° and -30° rotations
   - [ ] Row 3: 3 flowers, +30°, 0°, -30° rotations
   - [ ] Row 4: 4 flowers, +30°, +15°, -15°, -30° rotations
   - [ ] All rows should be horizontally centered
   - [ ] Vertical spacing between rows should be 1/3 flower height
   - [ ] Wrapper should be positioned 1/2 flower height below row 4

**Expected Results**:
- ✅ All 10 flowers displayed
- ✅ Pyramid pattern is complete
- ✅ All rotations match specification
- ✅ Wrapper positioned correctly

#### Test 8.3.6: More Than Ten Flowers
1. **Earn More Than Ten Flowers**:
   - [ ] Complete 11+ Pomodoros
   - [ ] Navigate to Bouquet screen
   - [ ] Should see exactly 10 flowers (max limit)

2. **Verify Limit**:
   - [ ] Only first 10 flowers should be displayed
   - [ ] No errors in console
   - [ ] Layout should still be correct

**Expected Results**:
- ✅ Maximum 10 flowers enforced
- ✅ No layout errors
- ✅ Bouquet still displays correctly

### 8.4 Flower Type Persistence Testing ✅
**Status**: Complete

**Purpose**: Verify that the correct flower type is stored and displayed.

**Test Steps**:

#### Test 8.4.1: Different Flower Types
1. **Complete Pomodoros with Different Flowers**:
   - [ ] Complete Pomodoro 1: Select "Rose" → Complete
   - [ ] Complete Pomodoro 2: Select "Lily" → Complete
   - [ ] Complete Pomodoro 3: Select "Carnation" → Complete
   - [ ] Complete Pomodoro 4: Select "Daisy" → Complete

2. **Verify Flower Types in Bouquet**:
   - [ ] Navigate to Bouquet screen
   - [ ] Should see flowers matching the selected types
   - [ ] Flower 1 (top): Rose
   - [ ] Flower 2 (row 2, left): Lily
   - [ ] Flower 3 (row 2, right): Carnation
   - [ ] Flower 4 (row 3, left): Daisy

**Expected Results**:
- ✅ Correct flower images displayed
- ✅ Flower types match selections
- ✅ Order matches completion order

#### Test 8.4.2: Default Flower (No Selection)
1. **Complete Pomodoro Without Selecting Flower**:
   - [ ] Navigate directly to Pomodoro screen (bypass flower selection)
   - [ ] Complete Pomodoro
   - [ ] Should default to "rose" flower

2. **Verify Default**:
   - [ ] Check IndexedDB: `flowerId` should be "rose"
   - [ ] Bouquet screen should show rose flower

**Expected Results**:
- ✅ Defaults to rose when no flower selected
- ✅ No errors when flower selection is skipped

### 8.5 Bouquet Refresh & Persistence Testing ✅
**Status**: Complete

**Purpose**: Verify that bouquet persists across page refreshes and updates correctly.

**Test Steps**:

#### Test 8.5.1: Bouquet Persistence
1. **Earn Flowers and Refresh**:
   - [ ] Complete 3 Pomodoros
   - [ ] Navigate to Bouquet screen
   - [ ] Verify 3 flowers are displayed
   - [ ] Refresh the page (F5)
   - [ ] Navigate back to Bouquet screen

2. **Verify Persistence**:
   - [ ] Should still see 3 flowers
   - [ ] Layout should be correct
   - [ ] Flower types should match

**Expected Results**:
- ✅ Bouquet persists across page refreshes
- ✅ Flowers loaded from IndexedDB correctly

#### Test 8.5.2: Real-time Updates
1. **Add Flower While on Bouquet Screen**:
   - [ ] Navigate to Bouquet screen (with some flowers already)
   - [ ] Open another tab/window
   - [ ] Complete a Pomodoro in the other tab
   - [ ] Return to Bouquet screen tab
   - [ ] Refresh the page

2. **Verify Update**:
   - [ ] New flower should appear after refresh
   - [ ] Layout should update correctly

**Expected Results**:
- ✅ Bouquet updates when new flowers are earned
- ✅ Layout adjusts correctly

### Browser Console Testing:
```javascript
// Test flower earning
import { getAllEarnedFlowers } from './src/data/flowers';
const flowers = await getAllEarnedFlowers();
console.log('Earned flowers:', flowers);
console.log('Total flowers:', flowers.length);

// Test bouquet layout
import { getFlowerPosition, getWrapperYPosition } from './src/utils/bouquetLayout';
for (let i = 0; i < 10; i++) {
  const pos = getFlowerPosition(i);
  console.log(`Flower ${i}:`, pos);
}
console.log('Wrapper Y position:', getWrapperYPosition(10));

// Test sessions
import { getAllSessions } from './src/data/sessions';
const sessions = await getAllSessions();
console.log('All sessions:', sessions);
const pomoSessions = sessions.filter(s => s.type === 'pomo' && s.status === 'completed');
console.log('Completed Pomodoros:', pomoSessions.length);
```

### Expected Console Output:
```
✅ Pomodoro completed! Flower earned: carnation
✅ Pomodoro completed! Consecutive count incremented
```

### Test Scenarios Summary:

| Scenario | Expected Behavior |
|----------|------------------|
| Complete 1 Pomodoro | 1 flower in row 1, centered, 0° rotation |
| Complete 2 Pomodoros | Row 1: 1 flower (0°), Row 2: 2 flowers (+30°, -30°) |
| Complete 3 Pomodoros | Row 1: 1, Row 2: 2, Row 3: 1 (first) |
| Complete 10 Pomodoros | Full pyramid: 1+2+3+4 flowers, all rotations correct |
| Complete 11+ Pomodoros | Only 10 flowers displayed (max limit) |
| Refresh page | Bouquet persists, flowers reload from IndexedDB |
| Different flower types | Correct flower images displayed |

---

**Last Updated**: After Phase 8 completion (Bouquet Screen & Flower Earning)
**Next Review**: After additional features implementation
