// src/types/screenMap.ts
//
// Screen Map: Navigation Contract
// ===============================
// This file defines the complete navigation structure of the Doro app.
// It serves as a single source of truth for all routes, screen IDs, and component mappings.
//
// Purpose:
// - Makes routing predictable and consistent
// - Prevents accidental creation of duplicate or conflicting routes
// - Keeps architecture aligned with Figma design
// - Provides type safety for navigation throughout the app

export type ScreenType = "page" | "modal";

/**
 * Screen configuration interface
 * Defines the structure for each screen in the app
 */
export interface Screen {
  /** Unique identifier for the screen (used internally) */
  id: string;

  /** Display name of the screen */
  name: string;

  /** Type of screen - page (full screen) or modal (overlay) */
  type: ScreenType;

  /** Route path (null for modals that don't have routes) */
  route: string | null;

  /** Brief description of the screen's purpose */
  description: string;

  /** Array of screen IDs that can navigate to this screen */
  entryFrom: string[];
}

/**
 * Screen Map: Complete navigation structure
 *
 * This is the authoritative list of all screens in the Doro app.
 * All routes should be defined here to maintain consistency.
 */
export const SCREEN_MAP: Screen[] = [
  {
    id: "logo",
    name: "Logo Screen",
    type: "page",
    route: "/",
    description: "Initial splash screen. Shows Doro logo while app loads.",
    entryFrom: [],
  },
  {
    id: "welcome",
    name: "Welcome Screen",
    type: "page",
    route: "/welcome",
    description: "Explains Pomodoro system, flower rewards, bouquet concept, and collects username.",
    entryFrom: ["logo"],
  },
  {
    id: "home",
    name: "Home Screen",
    type: "page",
    route: "/home",
    description: "Main hub. Buttons to start Pomodoro, start Break timer, open menu, and display username with background animation.",
    entryFrom: ["welcome"],
  },
  {
    id: "pomoTimer",
    name: "Pomodoro Timer Screen",
    type: "page",
    route: "/timer/pomo",
    description: "25-minute focus timer. Shows flower preview animation, consecutive counter, and controls: pause, reset, quit.",
    entryFrom: ["home", "breakTimer"],
  },
  {
    id: "breakTimer",
    name: "Break Screen",
    type: "page",
    route: "/timer/break",
    description: "Short or long break timer with skip and pause controls and center background animation.",
    entryFrom: ["home"],
  },
  {
    id: "flowerSelect",
    name: "Flower Selection Modal",
    type: "modal",
    route: null,
    description: "Modal overlay for choosing flower before starting a Pomodoro.",
    entryFrom: ["home", "pomoTimer"],
  },
  {
    id: "bouquet",
    name: "Bouquet Page",
    type: "page",
    route: "/bouquet",
    description: "Displays user's single active bouquet and share button.",
    entryFrom: ["home"],
  },
  {
    id: "progress",
    name: "Progress Page",
    type: "page",
    route: "/progress",
    description: "Shows streaks, daily stats, and calendar heatmap view.",
    entryFrom: ["home"],
  },
  {
    id: "settings",
    name: "Intro / Settings Page",
    type: "page",
    route: "/settings",
    description: "Allows user to edit username and re-read Pomodoro system and reward rules.",
    entryFrom: ["home"],
  },
  {
    id: "share",
    name: "Share Page",
    type: "page",
    route: "/share",
    description: "Preview bouquet and generate shareable link with social shortcuts.",
    entryFrom: ["bouquet"],
  },
];

/**
 * Helper function to get a screen by its ID
 */
export function getScreenById(id: string): Screen | undefined {
  return SCREEN_MAP.find((screen) => screen.id === id);
}

/**
 * Helper function to get a screen by its route
 */
export function getScreenByRoute(route: string): Screen | undefined {
  return SCREEN_MAP.find((screen) => screen.route === route);
}

/**
 * Helper function to get all routes as an array
 */
export function getAllRoutes(): string[] {
  return SCREEN_MAP.filter((screen) => screen.route !== null).map(
    (screen) => screen.route as string
  );
}
