"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

import I18nProvider from "@/components/providers/I18nProvider";

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <I18nProvider>{children}</I18nProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
};

export default Providers;
