import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { TranslationKey } from "../i18n";

const TOUR_SEEN_KEY = "dbviz-tour-seen";
const TOUR_THEME_KEY = "dbviz-tour-theme";

export type TourTheme = "dark" | "soft";

export const TOUR_THEMES: TourTheme[] = ["dark", "soft"];

const THEME_CLASS: Record<TourTheme, string> = {
  dark: "dbviz-tour-popover",
  soft: "dbviz-tour-soft",
};

type TFunc = (key: TranslationKey) => string;
type SetSettingsOpen = (open: boolean) => void;
type SetActiveTab = (tab: string) => void;

function buildSteps(
  t: TFunc,
  setSettingsOpen: SetSettingsOpen,
  setActiveTab: SetActiveTab
): DriveStep[] {
  return [
    {
      popover: {
        title: t("tour.welcome.title"),
        description: t("tour.welcome.description"),
      },
    },
    {
      element: "#tour-examples",
      popover: {
        title: t("tour.examples.title"),
        description: t("tour.examples.description"),
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-apply",
      popover: {
        title: t("tour.apply.title"),
        description: t("tour.apply.description"),
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#tour-engine",
      popover: {
        title: t("tour.engine.title"),
        description: t("tour.engine.description"),
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#tour-ai-panel",
      popover: {
        title: t("tour.aiPanel.title"),
        description: t("tour.aiPanel.description"),
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-ai-modes",
      popover: {
        title: t("tour.aiModes.title"),
        description: t("tour.aiModes.description"),
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-tabs",
      popover: {
        title: t("tour.tabs.title"),
        description: t("tour.tabs.description"),
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-erd-canvas",
      popover: {
        title: t("tour.erdContext.title"),
        description: t("tour.erdContext.description"),
        side: "left",
        align: "start",
      },
      onHighlightStarted: () => {
        setActiveTab("erd");
      },
    },
    {
      element: "#tour-sql-bar",
      popover: {
        title: t("tour.sqlBar.title"),
        description: t("tour.sqlBar.description"),
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-settings-drawer",
      popover: {
        title: t("tour.settings.title"),
        description: t("tour.settings.description"),
        side: "left",
        align: "start",
      },
      onHighlightStarted: () => {
        setSettingsOpen(true);
      },
      onDeselected: () => {
        setSettingsOpen(false);
      },
    },
    {
      element: "#tour-lang-toggle",
      popover: {
        title: t("tour.langToggle.title"),
        description: t("tour.langToggle.description"),
        side: "bottom",
        align: "end",
      },
    },
  ];
}

function loadTheme(): TourTheme {
  try {
    const v = localStorage.getItem(TOUR_THEME_KEY);
    if (v && TOUR_THEMES.includes(v as TourTheme)) return v as TourTheme;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function useTour(t: TFunc, setSettingsOpen: SetSettingsOpen, setActiveTab: SetActiveTab) {
  const driverRef = useRef<Driver | null>(null);
  const [tourTheme, setTourThemeState] = useState<TourTheme>(loadTheme);

  const setTourTheme = useCallback((theme: TourTheme) => {
    setTourThemeState(theme);
    try {
      localStorage.setItem(TOUR_THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_SEEN_KEY)) {
        const timer = setTimeout(() => {
          startTour();
          localStorage.setItem(TOUR_SEEN_KEY, "1");
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startTour = useCallback(() => {
    driverRef.current?.destroy();

    const d = driver({
      showProgress: true,
      progressText: t("tour.progress"),
      nextBtnText: t("tour.next"),
      prevBtnText: t("tour.prev"),
      doneBtnText: t("tour.done"),
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: tourTheme === "soft" ? 0.3 : 0.6,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: THEME_CLASS[tourTheme],
      steps: buildSteps(t, setSettingsOpen, setActiveTab),
      onDestroyed: () => {
        setSettingsOpen(false);
      },
    });

    driverRef.current = d;
    d.drive();
  }, [t, setSettingsOpen, tourTheme]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { startTour, tourTheme, setTourTheme };
}
