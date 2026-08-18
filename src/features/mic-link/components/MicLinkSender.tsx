"use client";

import {
  Button,
  Card,
  Chip,
  Divider,
  Select,
  SelectItem,
  Slider,
  Switch,
  Tab,
  Tabs,
} from "@nextui-org/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  MIC_LINK_AUDIO_CONSTRAINTS,
  MIC_LINK_LOCAL_MONITOR_DEFAULT_VOLUME,
} from "@/constants/mic-link";
import {
  AudioLevelMonitor,
  createAudioLevelMonitor,
} from "@/functions/audio-level";
import {
  describePlatform,
  DeviceAudioProfile,
  readCaptureLatencyMs,
} from "@/functions/device-audio-profile";
import {
  createLocalAudioMonitor,
  LocalAudioMonitor,
} from "@/functions/local-audio-monitor";
import {
  isWakeLockSupported,
  requestScreenWakeLock,
  ScreenWakeLock,
} from "@/functions/screen-wake-lock";
import { MicLinkQuality, MicLinkStatus } from "@/interfaces/mic-link";
import { trackEvent } from "@/libs/analytics";
import {
  MicLinkSenderSession,
  openSenderSession,
} from "@/libs/mic-link-signaling";
import MicLinkLevelMeter from "./MicLinkLevelMeter";
import MicLinkStatusChip from "./MicLinkStatusChip";

// Sentinel for "let the browser pick". Chrome really does expose a device whose
// deviceId is the literal string "default", so it cannot be used as the marker.
const SYSTEM_DEFAULT_DEVICE = "__system_default__";

// ICE reaching "failed" is terminal — the connection never recovers by itself,
// so the phone has to publish a fresh offer. Backoff keeps a genuinely dead
// network (receiver closed, wifi gone) from hammering Firestore.
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 8000;

export interface MicLinkSenderProps {
  roomId: string;
}

const MicLinkSender: React.FC<MicLinkSenderProps> = ({ roomId }) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<MicLinkStatus>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState<MicLinkQuality>("voice");
  const [deviceId, setDeviceId] = useState(SYSTEM_DEFAULT_DEVICE);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [deviceProfile, setDeviceProfile] = useState<DeviceAudioProfile | null>(
    null,
  );
  const [isSelfMonitoring, setIsSelfMonitoring] = useState(false);
  const [selfMonitorVolume, setSelfMonitorVolume] = useState(
    MIC_LINK_LOCAL_MONITOR_DEFAULT_VOLUME,
  );

  const sessionRef = useRef<MicLinkSenderSession | null>(null);
  // Identifies this phone within the room for as long as the page is open, so a
  // reconnect (after a screen lock, or a microphone change) reuses the same
  // mixer strip on the receiver instead of appearing as a second phone.
  const senderIdRef = useRef<string>(
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  );
  const streamRef = useRef<MediaStream | null>(null);
  const monitorRef = useRef<AudioLevelMonitor | null>(null);
  const selfMonitorRef = useRef<LocalAudioMonitor | null>(null);
  const selfMonitorVolumeRef = useRef(MIC_LINK_LOCAL_MONITOR_DEFAULT_VOLUME);
  const wakeLockRef = useRef<ScreenWakeLock | null>(null);

  // True between tapping Connect and tapping Disconnect. Auto-reconnect only
  // runs while the user actually wants to be connected, so a deliberate
  // disconnect is never undone by a retry already in flight.
  const wantsConnectionRef = useRef(false);
  const attemptsRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped by every connect, disconnect and unmount. `connect` awaits several
  // slow things (getUserMedia, Firestore), and without this a connect still in
  // flight when the user hits Disconnect — or when a second connect starts —
  // would happily finish and install a session nobody asked for.
  const generationRef = useRef(0);
  const settingsRef = useRef({
    quality: "voice" as MicLinkQuality,
    deviceId: SYSTEM_DEFAULT_DEVICE,
  });
  // Lets the retry timer call the latest `connect` without the two of them
  // forming a circular useCallback dependency.
  const connectRef = useRef<
    | ((quality: MicLinkQuality, deviceId: string, isRetry: boolean) => void)
    | null
  >(null);

  const isBusy = status === "connecting";
  const isReconnecting = reconnectAttempt > 0 && wantsConnectionRef.current;
  const isConnected =
    status === "live" || status === "connecting" || isReconnecting;

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const list = await navigator.mediaDevices.enumerateDevices();
    setDevices(list.filter((device) => device.kind === "audioinput"));
  }, []);

  useEffect(() => {
    void refreshDevices();
    const media = navigator.mediaDevices;
    if (!media?.addEventListener) return;
    const handleChange = () => void refreshDevices();
    media.addEventListener("devicechange", handleChange);
    return () => media.removeEventListener("devicechange", handleChange);
  }, [refreshDevices]);

  const teardown = useCallback(
    async (options?: { keepRegistration?: boolean }) => {
      monitorRef.current?.stop();
      monitorRef.current = null;
      selfMonitorRef.current?.stop();
      selfMonitorRef.current = null;
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
      await sessionRef.current?.close(options);
      sessionRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setLevel(0);
      setIsMuted(false);
    },
    [],
  );

  const cancelReconnect = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    attemptsRef.current = 0;
    setReconnectAttempt(0);
  }, []);

  // Called only from the session's own status handler, i.e. when the peer
  // connection itself fails. Setup failures (permission denied, no microphone,
  // room gone) set the status directly and deliberately do not land here —
  // retrying those would just fail the same way.
  const scheduleReconnect = useCallback(() => {
    if (!wantsConnectionRef.current) return;
    if (retryTimerRef.current !== null) return;
    if (attemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      // Give up and hand the UI back to the Connect button, otherwise the card
      // would keep showing "Disconnect" for a session that is never coming back.
      wantsConnectionRef.current = false;
      setErrorKey("reconnectFailed");
      setStatus("error");
      return;
    }

    const attempt = attemptsRef.current + 1;
    attemptsRef.current = attempt;
    setReconnectAttempt(attempt);
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1),
      RECONNECT_MAX_DELAY_MS,
    );

    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      const { quality: retryQuality, deviceId: retryDeviceId } =
        settingsRef.current;
      void connectRef.current?.(retryQuality, retryDeviceId, true);
    }, delay);
  }, []);

  const connect = useCallback(
    async (
      nextQuality: MicLinkQuality,
      nextDeviceId: string,
      isRetry = false,
    ) => {
      if (!isRetry) cancelReconnect();
      wantsConnectionRef.current = true;
      settingsRef.current = { quality: nextQuality, deviceId: nextDeviceId };

      const generation = generationRef.current + 1;
      generationRef.current = generation;
      const isStale = () => generationRef.current !== generation;

      // A retry keeps our registration on the receiver, so the renegotiation
      // reuses the existing mixer strip instead of removing it and adding a new
      // one — which would reset its gain, mute and solo.
      await teardown({ keepRegistration: isRetry });
      if (isStale()) return;
      setErrorKey(null);
      setStatus("connecting");

      try {
        // `navigator.mediaDevices` is simply absent on an insecure origin, which
        // is the single most common way this feature "doesn't work".
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("INSECURE_CONTEXT");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            ...MIC_LINK_AUDIO_CONSTRAINTS[nextQuality],
            ...(nextDeviceId === SYSTEM_DEFAULT_DEVICE
              ? {}
              : { deviceId: { exact: nextDeviceId } }),
          },
          video: false,
        });
        // The permission prompt can sit open for a long time; by the time it is
        // answered the user may have navigated away or disconnected.
        if (isStale()) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        // Device labels stay blank until the user has granted permission, so
        // the list is only worth reading once capture has actually started.
        await refreshDevices();

        const label =
          stream.getAudioTracks()[0]?.label || t("micLink.sender.defaultLabel");

        const session = await openSenderSession(
          roomId,
          senderIdRef.current,
          stream,
          nextQuality,
          label,
          {
            onStatus: (next) => {
              setStatus(next);
              // Reaching "error" here means the peer connection failed, which
              // ICE never recovers from on its own.
              if (next === "error") scheduleReconnect();
              if (next === "live") {
                attemptsRef.current = 0;
                setReconnectAttempt(0);
              }
            },
            onError: (message) =>
              setErrorKey(
                message === "permission-denied"
                  ? "databaseDenied"
                  : "negotiation",
              ),
          },
        );
        if (isStale()) {
          await session.close();
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        sessionRef.current = session;
        monitorRef.current = createAudioLevelMonitor(stream, setLevel);
        wakeLockRef.current = requestScreenWakeLock();

        // Measured after a beat: `outputLatency` reads 0 until the AudioContext
        // has actually rendered. This is the number that decides whether a
        // latency complaint is worth chasing in our code or is just the phone.
        const platform = describePlatform();
        const captureLatencyMs = readCaptureLatencyMs(stream);
        window.setTimeout(() => {
          if (isStale()) return;
          const outputLatencyMs = monitorRef.current?.getOutputLatencyMs();
          setDeviceProfile({ platform, captureLatencyMs, outputLatencyMs });
          void sessionRef.current?.publishDeviceProfile({
            platform,
            captureLatencyMs,
            deviceOutputLatencyMs: outputLatencyMs,
          });
        }, 1500);

        trackEvent("mic_link_sender_connected", { quality: nextQuality });
      } catch (error) {
        // Everything reaching here is a setup failure that needs the user to do
        // something (grant permission, free the mic, get a fresh QR code), so
        // the retry loop stops and hands control back to the Connect button.
        wantsConnectionRef.current = false;
        cancelReconnect();
        await teardown();
        setStatus("error");
        const name = error instanceof Error ? error.message : "";
        const domName = error instanceof DOMException ? error.name : "";
        const code = (error as { code?: string })?.code;
        if (code === "permission-denied") setErrorKey("databaseDenied");
        else if (name === "INSECURE_CONTEXT") setErrorKey("insecureContext");
        else if (name === "ROOM_NOT_FOUND") setErrorKey("roomNotFound");
        else if (name === "ROOM_FULL") setErrorKey("roomFull");
        else if (domName === "NotAllowedError") setErrorKey("permissionDenied");
        else if (domName === "NotFoundError") setErrorKey("noMicrophone");
        else if (domName === "NotReadableError") setErrorKey("micBusy");
        else setErrorKey("generic");
      }
    },
    [cancelReconnect, refreshDevices, roomId, scheduleReconnect, t, teardown],
  );

  useEffect(() => {
    connectRef.current = (retryQuality, retryDeviceId, isRetry) => {
      void connect(retryQuality, retryDeviceId, isRetry);
    };
  }, [connect]);

  const disconnect = useCallback(async () => {
    wantsConnectionRef.current = false;
    generationRef.current += 1;
    cancelReconnect();
    await teardown();
    setStatus("idle");
  }, [cancelReconnect, teardown]);

  // Changing the mic or the quality profile means a new MediaStream, so the
  // session is renegotiated from scratch. The receiver handles a fresh offer.
  const applySettings = useCallback(
    (nextQuality: MicLinkQuality, nextDeviceId: string) => {
      setQuality(nextQuality);
      setDeviceId(nextDeviceId);
      // Also applies mid-reconnect, when there is no live session to check.
      if (sessionRef.current || wantsConnectionRef.current) {
        void connect(nextQuality, nextDeviceId);
      }
    },
    [connect],
  );

  const toggleMute = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (tracks.length === 0) return;
    const nextMuted = !isMuted;
    // Disabling the track keeps the peer connection up and sends silence, which
    // is far cheaper (and faster to undo) than renegotiating.
    tracks.forEach((track) => (track.enabled = !nextMuted));
    setIsMuted(nextMuted);
  }, [isMuted]);

  // Local monitoring is attached to whatever stream is live right now, so it is
  // rebuilt after a reconnect or a microphone change rather than left pointing
  // at a stopped track.
  useEffect(() => {
    const stream = streamRef.current;
    selfMonitorRef.current?.stop();
    selfMonitorRef.current = null;
    if (!isSelfMonitoring || !stream || status !== "live") return;
    // Read through a ref so a volume change adjusts the running gain node
    // instead of tearing down and rebuilding the whole AudioContext.
    selfMonitorRef.current = createLocalAudioMonitor(
      stream,
      selfMonitorVolumeRef.current,
    );
  }, [isSelfMonitoring, status]);

  useEffect(() => {
    selfMonitorVolumeRef.current = selfMonitorVolume;
    selfMonitorRef.current?.setVolume(selfMonitorVolume);
  }, [selfMonitorVolume]);

  useEffect(() => {
    return () => {
      // Stop any retry already scheduled before tearing down, or it would fire
      // against an unmounted component and reopen a session nobody is watching.
      wantsConnectionRef.current = false;
      generationRef.current += 1;
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
      void teardown();
    };
  }, [teardown]);

  return (
    <div className="flex items-center justify-center p-4 py-10 min-h-[calc(100vh-4rem)]">
      <Card isBlurred className="max-w-md w-full p-6 gap-5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{t("micLink.sender.title")}</h1>
            <span className="text-tiny text-default-500">
              {t("micLink.room")}: <code className="font-mono">{roomId}</code>
            </span>
          </div>
          <MicLinkStatusChip status={status} />
        </div>

        <Divider />

        <MicLinkLevelMeter
          level={isMuted ? 0 : level}
          isActive={status === "live" && !isMuted}
          label={t("micLink.sender.inputLevel")}
        />

        {errorKey && (
          <Chip
            variant="flat"
            color="danger"
            className="max-w-full h-auto py-2 text-center whitespace-normal"
          >
            {t(`micLink.errors.${errorKey}`)}
          </Chip>
        )}

        {isReconnecting && !errorKey && (
          <Chip
            variant="flat"
            color="warning"
            className="max-w-full h-auto py-2 text-center whitespace-normal"
          >
            {t("micLink.sender.reconnecting", {
              attempt: reconnectAttempt,
              max: MAX_RECONNECT_ATTEMPTS,
            })}
          </Chip>
        )}

        <Select
          label={t("micLink.sender.microphone")}
          variant="bordered"
          selectedKeys={[deviceId]}
          isDisabled={isBusy}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<React.Key>)[0]?.toString();
            if (next) applySettings(quality, next);
          }}
        >
          {[
            <SelectItem
              key={SYSTEM_DEFAULT_DEVICE}
              value={SYSTEM_DEFAULT_DEVICE}
            >
              {t("micLink.sender.systemDefault")}
            </SelectItem>,
            ...devices.map((device, index) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label ||
                  t("micLink.sender.unnamedMic", { index: index + 1 })}
              </SelectItem>
            )),
          ]}
        </Select>

        <div className="flex flex-col gap-2">
          <span className="text-small text-default-600">
            {t("micLink.sender.profile")}
          </span>
          <Tabs
            fullWidth
            selectedKey={quality}
            isDisabled={isBusy}
            onSelectionChange={(key) =>
              applySettings(key.toString() as MicLinkQuality, deviceId)
            }
          >
            <Tab key="voice" title={t("micLink.quality.voice")} />
            <Tab key="hifi" title={t("micLink.quality.hifi")} />
          </Tabs>
          <span className="text-tiny text-default-500">
            {t(`micLink.quality.${quality}Hint`)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Switch
            isSelected={isSelfMonitoring}
            onValueChange={setIsSelfMonitoring}
            isDisabled={status !== "live"}
          >
            <div className="flex flex-col">
              <span className="text-small">
                {t("micLink.sender.selfMonitor")}
              </span>
              <span className="text-tiny text-default-500">
                {t("micLink.sender.selfMonitorHint")}
              </span>
            </div>
          </Switch>
          {isSelfMonitoring && (
            <Slider
              size="sm"
              label={t("micLink.sender.selfMonitorVolume")}
              value={selfMonitorVolume}
              onChange={(next) =>
                setSelfMonitorVolume(
                  Array.isArray(next) ? next[0] : (next as number),
                )
              }
              minValue={0}
              maxValue={1}
              step={0.01}
            />
          )}
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              color={isMuted ? "warning" : "default"}
              variant={isMuted ? "solid" : "bordered"}
              onPress={toggleMute}
              isDisabled={status !== "live"}
            >
              {t(isMuted ? "micLink.sender.unmute" : "micLink.sender.mute")}
            </Button>
            <Button
              className="flex-1"
              color="danger"
              variant="flat"
              onPress={() => void disconnect()}
            >
              {t("micLink.sender.disconnect")}
            </Button>
          </div>
        ) : (
          <Button
            color="primary"
            size="lg"
            onPress={() => void connect(quality, deviceId)}
          >
            {t("micLink.sender.connect")}
          </Button>
        )}

        {deviceProfile && (
          <div className="flex flex-col gap-1 rounded-medium bg-default-100 p-3">
            <span className="text-tiny text-default-600">
              {t("micLink.sender.deviceAudio", {
                platform: t(`micLink.platform.${deviceProfile.platform}`),
              })}
            </span>
            <span className="text-tiny text-default-500 tabular-nums">
              {t("micLink.sender.deviceLatency", {
                capture: deviceProfile.captureLatencyMs ?? "?",
                output: deviceProfile.outputLatencyMs ?? "?",
              })}
            </span>
            {deviceProfile.platform === "android" && (
              <span className="text-tiny text-warning">
                {t("micLink.sender.androidWarning")}
              </span>
            )}
          </div>
        )}

        <p className="text-tiny text-default-500 text-center">
          {isWakeLockSupported()
            ? t("micLink.sender.wakeLockOn")
            : t("micLink.sender.wakeLockOff")}
        </p>
      </Card>
    </div>
  );
};

export default MicLinkSender;
