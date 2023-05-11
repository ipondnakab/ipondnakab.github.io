import React from "react";
import { DefaultTheme } from "styled-components";
import { LocalStorageKey } from "../interfaces/database";

export const ThemeContext = React.createContext<
  ReturnType<typeof useThemeFeature>
>({} as ReturnType<typeof useThemeFeature>);

export const ThemeProvider = ThemeContext.Provider;

const baseTheme: Omit<DefaultTheme, "background" | "palette" | "boxShadow"> = {
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  transitionLong: "all 0.4s ease-in-out",
  brakePoints: {
    xs: "320px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
  },
};

export const lightTheme: DefaultTheme = {
  ...baseTheme,
  background: "linear-gradient( 89.7deg,  #e0e4f3 -10.7%, #b4cae0 88.8% )",
  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
  palette: {
    common: {
      black: "#2f2f2f",
      white: "#f2f2f2",
    },
    primary: "#f44336",
    secondary: "#f44336",
    text: {
      active: "#000000",
      primary: "#333333",
      secondary: "#111111",
      hidden: "#777777",
      inverse: "#ffffff",
    },
  },
};

export const darkTheme: DefaultTheme = {
  ...baseTheme,
  background: "linear-gradient( 89.7deg,  #0c161f -10.7%, #1f374b 88.8% )",
  boxShadow: "rgba(24, 24, 24, 0.2) 0px 8px 24px",
  palette: {
    common: {
      black: "#f2f2f2",
      white: "#2f2f2f",
    },
    primary: "#f44336",
    secondary: "#f44336",
    text: {
      active: "#ffffff",
      primary: "#e9e9e9",
      secondary: "#eeeeee",
      hidden: "#777777",
      inverse: "#222222",
    },
  },
};

export const useThemeFeature = () => {
  const [theme, setTheme] = React.useState<"light" | "dark">(
    (window.localStorage.getItem(LocalStorageKey.THEME) as "light" | "dark") ||
      "dark"
  );
  const [animation, setAnimation] = React.useState(
    window.localStorage.getItem(LocalStorageKey.ANIMATION) === "true" ||
      window.localStorage.getItem(LocalStorageKey.ANIMATION) === null
  );
  const [styleTheme, setStyleTheme] = React.useState<DefaultTheme>(darkTheme);
  const styles = getComputedStyle(document.body);
  const black = styles.getPropertyValue("--black");
  const white = styles.getPropertyValue("--white");
  const docEl = document.documentElement;

  const setBackground = React.useCallback(
    (theme: "light" | "dark") => {
      if (theme === "light") {
        docEl.style.setProperty("--background", white);
        docEl.style.setProperty("--foreground", black);
        document?.querySelector("html")?.classList.remove("dark-mode");
        document?.querySelector("html")?.classList.add("light-mode");
      } else {
        docEl.style.setProperty("--background", black);
        docEl.style.setProperty("--foreground", white);
        document?.querySelector("html")?.classList.add("dark-mode");
        document?.querySelector("html")?.classList.remove("light-mode");
      }
    },
    [black, docEl.style, white]
  );

  const toggleTheme = React.useCallback(
    (customTheme?: "light" | "dark") => {
      if (customTheme)
        window.localStorage.setItem(LocalStorageKey.THEME, customTheme);
      else
        window.localStorage.setItem(
          LocalStorageKey.THEME,
          theme === "light" ? "dark" : "light"
        );
      const t = customTheme || theme === "light" ? "dark" : "light";
      setTheme(t);
      setBackground(t);
      setStyleTheme(t === "light" ? lightTheme : darkTheme);
    },
    [setBackground, theme]
  );
  const toggleAnimation = React.useCallback(
    (enabled?: boolean) => {
      if (enabled !== undefined)
        window.localStorage.setItem(
          LocalStorageKey.ANIMATION,
          enabled ? "true" : "false"
        );
      else
        window.localStorage.setItem(
          LocalStorageKey.ANIMATION,
          animation ? "false" : "true"
        );
      setAnimation((a) => (enabled !== undefined ? enabled : !a));
    },
    [setAnimation, animation]
  );

  React.useEffect(() => {
    const localTheme =
      (window.localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(localTheme);
    setBackground(localTheme);
    setStyleTheme(localTheme === "light" ? lightTheme : darkTheme);
    if (!localTheme) window.localStorage.setItem("theme", "dark");
  }, [setBackground]);

  return {
    toggleTheme,
    theme,
    styleTheme,
    setAnimation,
    animation,
    toggleAnimation,
  };
};

const useContext = () => React.useContext(ThemeContext);

export default useContext;
