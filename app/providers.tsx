"use client";
import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import dayjs from "dayjs";

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  React.useEffect(() => {
    if (window.location.hostname === "localhost") return;
    const nextTimeNotify = localStorage.getItem("nextTimeNotify");
    if (nextTimeNotify === null || dayjs().isAfter(dayjs(nextTimeNotify))) {
      localStorage.setItem(
        "nextTimeNotify",
        dayjs().add(3, "minute").toString(),
      );
    }
  }, []);

  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
};

export default Providers;
