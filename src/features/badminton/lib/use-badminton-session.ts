"use client";

import { DEFAULT_BADMINTON_SESSION } from "@/features/badminton/constants";
import { loadSession, saveSession } from "@/features/badminton/lib/storage";
import { BadmintonSession } from "@/features/badminton/model/badminton";
import { SetStateAction, useEffect, useRef, useState } from "react";

export const useBadmintonSession = () => {
  const restoredSession = useRef(DEFAULT_BADMINTON_SESSION);
  const [session, setSession] = useState(DEFAULT_BADMINTON_SESSION);
  const [storageReady, setStorageReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  useEffect(() => {
    const result = loadSession();
    restoredSession.current = result.session ?? DEFAULT_BADMINTON_SESSION;
    setSession(restoredSession.current);
    setStorageUnavailable(result.unavailable);
    setStorageReady(true);
  }, []);
  useEffect(() => {
    // Save changes only; never write defaults over an unreadable saved session.
    if (storageReady && session !== restoredSession.current)
      setStorageUnavailable(!saveSession(session));
  }, [session, storageReady]);
  const setField = <K extends keyof BadmintonSession>(
    key: K,
    value: SetStateAction<BadmintonSession[K]>,
  ) => {
    setSession((current) => ({
      ...current,
      [key]: typeof value === "function" ? value(current[key]) : value,
    }));
  };
  return { session, setSession, setField, storageReady, storageUnavailable };
};
