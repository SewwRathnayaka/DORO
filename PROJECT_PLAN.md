# Doro Project Plan

## Executive Summary

**Project Name:** Doro - Gamified Pomodoro Productivity App  
**Platform:** Offline Windows Desktop Application (Web + Electron)  
**Tech Stack:** React + Expo (Web & Desktop), Tailwind CSS, Electron Builder  
**MVP Goal:** Offline-first Pomodoro timer with flower rewards, bouquet system, and progress tracking

---

## 1. Project Overview

Doro is a gamified Pomodoro productivity application where users grow a digital bouquet of flowers by completing focused work sessions. Each completed 25-minute Pomodoro earns a flower, with progression rewards and visual animations encouraging consistent focus and habit-building.

### Core Value Proposition
- **Time Management:** Structured Pomodoro technique (25 min focus + breaks)
- **Visual Rewards:** Digital flowers earned through completed sessions
- **Progress Tracking:** Calendar heatmap, streaks, and daily statistics
- **Offline-First:** Fully functional without internet connection
- **Desktop Native:** Windows application with native feel

---

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend Framework:** React + Expo (Web & Desktop compatibility)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Desktop Packaging:** Electron Builder (Windows)
- **Storage:** 
  - IndexedDB (primary - sessions, flowers, bouquets, progress)
  - LocalStorage (settings, user name, flags)

### 2.2 Project Structure
```
doro/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components (Intro, Home, Timer, etc.)
│   ├── data/             # IndexedDB setup and CRUD operations
│   │   ├── db.ts         # IndexedDB configuration
│   │   ├── sessions.ts   # Session CRUD
│   │   ├── flowers.ts    # Flower CRUD
│   │   ├── bouquets.ts   # Bouquet CRUD
│   │   └── progress.ts   # Progress & streak logic
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── App.tsx           # Main app component
├── public/               # Static assets
├── electron/             # Electron configuration
└── package.json
```

---

## 3. Core Features & Requirements

### 3.1 Timer System
- **Pomodoro:** 25-minute focus session
- **Short Break:** 5 minutes (after each Pomodoro)
- **Long Break:** 15 minutes (after 3 consecutive Pomodoros)
- **Controls:** Start, Pause, Quit, Reset
- **State Persistence:** Timer state survives page refresh

### 3.2 Reward System
- **1 Pomodoro Completed:** 1 flower earned
- **3 Consecutive Pomodoros (Big Pomodoro):** 1 wrapper gift
- **6, 9, 12+ Consecutive Pomodoros:** Bonus flower (user chooses type)

### 3.3 Flower & Bouquet System
- Single active bouquet (grows continuously)
- Flower selection before starting Pomodoro
- Visual flower blooming animation during focus
- Bouquet display page with share functionality

### 3.4 Progress Tracking
- **Today's Summary:**
  - Total focus time
  - Total break time
  - Pomodoros completed
  - Current streak
- **Calendar Heatmap:** GitHub-style visualization
- **Daily Breakdown:** Click day to see details
- **All-Time Stats:** Total pomos, focus hours, wrappers earned

### 3.5 User Experience
- **Intro/Welcome Page:** First-time onboarding + settings
- **Home Page:** Central hub with navigation buttons
- **Sandwich Menu:** Global navigation (Bouquet, Progress, Settings)
- **Personalization:** User name throughout app

---

## 4. Data Model

### 4.1 User
```typescript
{
  userId: string
  name: string
  createdAt: Date
  settings: {
    soundOn: boolean
  }
}
```

### 4.2 Session
```typescript
{
  sessionId: string
  type: 'pomo' | 'shortBreak' | 'longBreak'
  startTime: Date
  endTime: Date | null
  status: 'completed' | 'quit' | 'reset' | 'paused'
  flowerType?: string  // Selected flower for pomo sessions
}
```

### 4.3 Flower
```typescript
{
  flowerId: string
  type: string
  earnedAt: Date
  isBonus: boolean
  earnedFromSessionId?: string
  earnedFromConsecutivePomoId?: string
}
```

### 4.4 Bouquet (Single Instance)
```typescript
{
  bouquetId: 'main'  // Always 'main'
  flowers: string[]  // Array of flowerIds
  createdAt: Date
}
```

### 4.5 Progress
```typescript
{
  consecutivePomos: number
  totalPomos: number
  wrapperEarned: boolean
  dailyStats: [{
    date: string  // YYYY-MM-DD
    pomosCompleted: number
    focusMinutes: number
    breakMinutes: number
  }]
  streakActive: number
}
```

---

## 5. Development Phases

### Phase 1: Foundation & Core Timer ⏱️
**Duration:** 2-3 weeks  
**Priority:** Critical

**Tasks:**
- [ ] Set up React + Expo project structure
- [ ] Configure Tailwind CSS
- [ ] Create basic routing/navigation
- [ ] Implement Pomodoro timer logic (25 min countdown)
- [ ] Add Start/Pause/Reset/Quit controls
- [ ] Set up IndexedDB database schema
- [ ] Implement session persistence (survive refresh)
- [ ] Create timer UI component
- [ ] Handle edge cases (browser close, time manipulation)

**Deliverables:**
- Working Pomodoro timer
- Session data saved to IndexedDB
- Timer state persists across refreshes

---

### Phase 2: Intro & Home Pages 🏠
**Duration:** 1-2 weeks  
**Priority:** Critical

**Tasks:**
- [ ] Design and implement Intro/Welcome page
- [ ] Add name input and storage (LocalStorage)
- [ ] Create Home page hub
- [ ] Implement navigation system
- [ ] Add sandwich menu component
- [ ] Create page routing logic
- [ ] Add first-launch detection
- [ ] Implement settings page (reuse Intro page)

**Deliverables:**
- Intro page with onboarding
- Home page with navigation buttons
- Global menu navigation
- User name persistence

---

### Phase 3: Flower System & Rewards 🌸
**Duration:** 2-3 weeks  
**Priority:** High

**Tasks:**
- [ ] Design flower selection modal
- [ ] Create flower gallery component
- [ ] Implement flower selection before timer start
- [ ] Add flower blooming animation (Framer Motion)
- [ ] Implement reward logic:
  - Flower earned on Pomodoro completion
  - Wrapper gift after 3 consecutive Pomodoros
  - Bonus flower selection after 6+ consecutive Pomodoros
- [ ] Create consecutive Pomodoro tracking logic
- [ ] Implement flower CRUD operations (IndexedDB)
- [ ] Add reward animations (bloom burst, gift unwrap, golden glow)

**Deliverables:**
- Flower selection system
- Reward system with animations
- Consecutive Pomodoro tracking
- Flowers saved to IndexedDB

---

### Phase 4: Break Timer System ⏸️
**Duration:** 1 week  
**Priority:** High

**Tasks:**
- [ ] Implement break timer logic (5 min / 15 min)
- [ ] Determine break type based on consecutive count
- [ ] Create break timer UI
- [ ] Add break background animation (floating clouds)
- [ ] Implement Skip and Pause controls
- [ ] Add "Take Break" button on Home page (conditional visibility)
- [ ] Handle break completion flow

**Deliverables:**
- Short break (5 min) after regular Pomodoro
- Long break (15 min) after big Pomodoro
- Break timer with animations
- Proper navigation flow

---

### Phase 5: Bouquet Page 💐
**Duration:** 1-2 weeks  
**Priority:** Medium

**Tasks:**
- [ ] Design bouquet display layout
- [ ] Implement bouquet page component
- [ ] Create bouquet CRUD operations (IndexedDB)
- [ ] Add flower rendering in bouquet
- [ ] Implement share functionality
- [ ] Create share page/preview
- [ ] Add social platform shortcuts (optional)

**Deliverables:**
- Bouquet page displaying all earned flowers
- Share functionality
- Single bouquet system (always "main")

---

### Phase 6: Progress & Tracking 📊
**Duration:** 2-3 weeks  
**Priority:** High

**Tasks:**
- [ ] Create Progress page layout
- [ ] Implement today's summary panel:
  - Total focus time calculation
  - Total break time calculation
  - Pomodoros completed today
  - Current streak calculation
- [ ] Build calendar heatmap component (GitHub-style)
- [ ] Implement daily stats aggregation
- [ ] Add streak logic:
  - Check yesterday's record
  - Increment or reset streak
- [ ] Create daily breakdown modal (click day)
- [ ] Add all-time stats section
- [ ] Implement progress CRUD operations (IndexedDB)

**Deliverables:**
- Progress page with all metrics
- Calendar heatmap visualization
- Streak tracking system
- Daily and all-time statistics

---

### Phase 7: Animations & Polish ✨
**Duration:** 2 weeks  
**Priority:** Medium

**Tasks:**
- [ ] Implement flower blooming animation (time-based)
- [ ] Add break mode animations (floating clouds)
- [ ] Create reward animations:
  - Bloom burst (flower earned)
  - Gift unwrap (wrapper earned)
  - Golden glow (bonus flower selection)
- [ ] Add page transitions
- [ ] Implement loading states
- [ ] Add micro-interactions
- [ ] Polish UI/UX based on Figma prototype

**Deliverables:**
- Smooth animations throughout app
- Polished user experience
- Visual feedback for all actions

---

### Phase 8: Desktop Build (Electron) 🖥️
**Duration:** 2-3 weeks  
**Priority:** High

**Tasks:**
- [ ] Set up Electron configuration
- [ ] Configure Electron Builder for Windows
- [ ] Test app in Electron environment
- [ ] Fix any Electron-specific issues
- [ ] Create installer build process
- [ ] Add desktop shortcut functionality
- [ ] Test offline functionality
- [ ] Package and test .exe installer
- [ ] Create distribution package

**Deliverables:**
- Windows .exe installer
- Desktop application
- Offline-ready desktop app

---

### Phase 9: Testing & Bug Fixes 🐛
**Duration:** Ongoing  
**Priority:** Critical

**Tasks:**
- [ ] Unit tests for timer logic
- [ ] Unit tests for streak calculation
- [ ] Integration tests for IndexedDB operations
- [ ] Test edge cases:
  - Browser/app closed during timer
  - Page refresh during timer
  - Time manipulation
  - IndexedDB corruption scenarios
- [ ] Cross-browser testing (if web version)
- [ ] Performance testing
- [ ] User acceptance testing

**Deliverables:**
- Test suite
- Bug fixes
- Stable application

---

### Phase 10: Documentation & Deployment 📚
**Duration:** 1 week  
**Priority:** Medium

**Tasks:**
- [ ] Write user documentation
- [ ] Create README with setup instructions
- [ ] Document API/data layer
- [ ] Create developer documentation
- [ ] Prepare release notes
- [ ] Set up distribution channels (if applicable)

**Deliverables:**
- Complete documentation
- Release-ready application

---

## 6. Key Technical Decisions

### 6.1 Storage Strategy
- **IndexedDB:** Primary storage for all app data (sessions, flowers, bouquets, progress)
- **LocalStorage:** User preferences, name, first-launch flag
- **Rationale:** Offline-first, large data capacity, structured data support

### 6.2 State Management
- **Global State:** Timer status, flower selection, consecutive count, progress, bouquet
- **Local State:** Animations, UI modals, button states
- **Recommendation:** React Context API or Zustand for global state

### 6.3 Timer Implementation
- Use system time delta instead of countdown-only logic
- Persist start time and calculate remaining time on resume
- Prevents time manipulation issues

### 6.4 Consecutive Pomodoro Logic
- Track completed Pomodoros (not breaks)
- Reset on Quit or Reset
- Short breaks don't break consecutive chain
- Long break comes after 3 consecutive Pomodoros

---

## 7. Edge Cases & Solutions

| Edge Case | Solution |
|-----------|----------|
| Browser/App closed during timer | Treat as Quit → Lose flower, reset consecutive count |
| Page refresh during timer | Persist timer state in IndexedDB, resume on load |
| Time manipulation | Use system time delta, not just countdown |
| Flower selection skipped | Block start action, require selection |
| IndexedDB corruption | Add error handling, data validation, recovery logic |
| Offline mode | App fully functional offline, no sync needed for MVP |

---

## 8. Success Metrics

- **Engagement:** Pomodoros completed per user
- **Productivity:** Total focus hours
- **Consistency:** Streak length
- **Sharing:** Share link clicks
- **Quality:** Average session time
- **Retention:** Daily active users

---

## 9. Risk Assessment

### High Risk
- **Timer Reliability:** Complex state management, edge cases
- **IndexedDB Corruption:** Data loss scenarios
- **State Sync Bugs:** Timer state inconsistencies

### Medium Risk
- **Animation Performance:** May impact app responsiveness
- **Electron Packaging:** Windows-specific issues
- **Offline Storage Limits:** Large datasets over time

### Mitigation Strategies
- Comprehensive testing of timer logic
- Data validation and error handling
- Regular IndexedDB backups (future)
- Performance monitoring
- Early Electron testing

---

## 10. Future Enhancements (Post-MVP)

- **Accounts & Cloud Sync:** Multi-device support
- **Leaderboards:** Social competition
- **Flower Marketplace:** Unlockable flower types
- **Soundscapes:** Focus music/ambient sounds
- **Mobile App:** iOS/Android versions
- **AI Focus Insights:** Productivity analytics
- **Multiple Bouquets:** Create new bouquets after 25 flowers
- **Flower Rarity Levels:** Common, rare, epic flowers

---

## 11. Project Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Core Timer | 2-3 weeks | 3 weeks |
| Phase 2: Intro & Home | 1-2 weeks | 5 weeks |
| Phase 3: Flowers & Rewards | 2-3 weeks | 8 weeks |
| Phase 4: Break Timer | 1 week | 9 weeks |
| Phase 5: Bouquet Page | 1-2 weeks | 11 weeks |
| Phase 6: Progress & Tracking | 2-3 weeks | 14 weeks |
| Phase 7: Animations & Polish | 2 weeks | 16 weeks |
| Phase 8: Desktop Build | 2-3 weeks | 19 weeks |
| Phase 9: Testing | Ongoing | - |
| Phase 10: Documentation | 1 week | 20 weeks |

**Total Estimated Duration:** 4-5 months (assuming single developer, full-time)

---

## 12. Next Steps

1. **Review Figma Prototype:** Align implementation with design
2. **Set Up Development Environment:**
   - Initialize React + Expo project
   - Configure Tailwind CSS
   - Set up TypeScript
3. **Create Project Repository:** Set up Git, initial structure
4. **Begin Phase 1:** Start with core timer implementation
5. **Regular Reviews:** Weekly progress reviews and adjustments

---

## 13. Dependencies & Prerequisites

### Required Tools
- Node.js (v18+)
- npm or yarn
- Git
- Code editor (VS Code recommended)
- Windows development environment (for Electron testing)

### Key Libraries
- React
- Expo
- Tailwind CSS
- Framer Motion (animations)
- idb (IndexedDB wrapper)
- Electron
- Electron Builder

---

## 14. Notes

- **MVP Focus:** Keep scope limited to core features, defer future enhancements
- **Offline-First:** All core functionality must work without internet
- **Single Bouquet:** Only one active bouquet in MVP (no multiple bouquets)
- **Windows Only:** Desktop build targets Windows initially
- **Figma Alignment:** Regularly reference Figma prototype during development

---

**Document Version:** 1.0  
**Last Updated:** February 2, 2026  
**Status:** Ready for Development
