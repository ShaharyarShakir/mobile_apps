import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemePalette } from "./colors";
import { settingsStore, ThemeMode } from "../lib/settingsStore";

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "dark",
  isDark: true,
  colors: darkColors,
  setThemeMode: async () => {},
  toggleDarkMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setLocalThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const savedMode = await settingsStore.getThemeMode();
      if (isMounted) {
        setLocalThemeMode(savedMode);
      }
    };
    init();

    const unsubscribe = settingsStore.subscribe(async () => {
      const mode = await settingsStore.getThemeMode();
      if (isMounted) {
        setLocalThemeMode(mode);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setLocalThemeMode(mode);
    await settingsStore.setThemeMode(mode);
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  const toggleDarkMode = useCallback(async () => {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    setLocalThemeMode(nextMode);
    await settingsStore.setThemeMode(nextMode);
  }, [isDark]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      setThemeMode,
      toggleDarkMode,
    }),
    [themeMode, isDark, colors, setThemeMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
