"use client";
import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { lineNotify } from "./services/line";
import dayjs from "dayjs";

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  React.useEffect(() => {
    const nextTimeNotify = localStorage.getItem("nextTimeNotify");
    const viewCount = localStorage.getItem("viewCount") || 0;
    if (nextTimeNotify === null || dayjs().isAfter(dayjs(nextTimeNotify))) {
      lineNotify({
        message: "Someone is viewing your resume. - " + Number(viewCount) + 1,
      });
      localStorage.setItem(
        "nextTimeNotify",
        dayjs().add(3, "minute").toString(),
      );
      localStorage.setItem("viewCount", (Number(viewCount) + 1).toString());
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
