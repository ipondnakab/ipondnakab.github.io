"use client";

import {
  Button,
  Card,
  Chip,
  Divider,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { MIC_LINK_AUDIO_CONSTRAINTS } from "@/constants/mic-link";
import {
  AudioLevelMonitor,
  createAudioLevelMonitor,
} from "@/functions/audio-level";
import {
  isWakeLockSupported,
  requestScreenWakeLock,
  ScreenWakeLock,
} from "@/functions/screen-wake-lock";
import { MicLinkQuality, MicLinkStatus } from "@/interfaces/mic-link";
import { trackEvent } from "@/libs/analytics";
import { MicLinkSession, openSenderSession } from "@/libs/mic-link-signaling";
import MicLinkLevelMeter from "./MicLinkLevelMeter";
import MicLinkStatusChip from "./MicLinkStatusChip";

// Sentinel for "let the browser pick". Chrome really does expose a device whose
// deviceId is the literal string "default", so it cannot be used as the marker.
const SYSTEM_DEFAULT_DEVICE = "__system_default__";

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

  const sessionRef = useRef<MicLinkSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const monitorRef = useRef<AudioLevelMonitor | null>(null);
  const wakeLockRef = useRef<ScreenWakeLock | null>(null);

  const isBusy = status === "connecting";
  const isConnected = status === "live" || status === "connecting";

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

  const teardown = useCallback(async () => {
    monitorRef.current?.stop();
    monitorRef.current = null;
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
    await sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLevel(0);
    setIsMuted(false);
  }, []);

  const connect = useCallback(
    async (nextQuality: MicLinkQuality, nextDeviceId: string) => {
      await teardown();
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
        streamRef.current = stream;

        // Device labels stay blank until the user has granted permission, so
        // the list is only worth reading once capture has actually started.
        await refreshDevices();

        const label =
          stream.getAudioTracks()[0]?.label || t("micLink.sender.defaultLabel");

        sessionRef.current = await openSenderSession(
          roomId,
          stream,
          nextQuality,
          label,
          { onStatus: setStatus, onError: () => setErrorKey("negotiation") },
        );
        monitorRef.current = createAudioLevelMonitor(stream, setLevel);
        wakeLockRef.current = requestScreenWakeLock();
        trackEvent("mic_link_sender_connected", { quality: nextQuality });
      } catch (error) {
        await teardown();
        setStatus("error");
        const name = error instanceof Error ? error.message : "";
        const domName = error instanceof DOMException ? error.name : "";
        if (name === "INSECURE_CONTEXT") setErrorKey("insecureContext");
        else if (name === "ROOM_NOT_FOUND") setErrorKey("roomNotFound");
        else if (domName === "NotAllowedError") setErrorKey("permissionDenied");
        else if (domName === "NotFoundError") setErrorKey("noMicrophone");
        else if (domName === "NotReadableError") setErrorKey("micBusy");
        else setErrorKey("generic");
      }
    },
    [refreshDevices, roomId, t, teardown],
  );

  const disconnect = useCallback(async () => {
    await teardown();
    setStatus("idle");
  }, [teardown]);

  // Changing the mic or the quality profile means a new MediaStream, so the
  // session is renegotiated from scratch. The receiver handles a fresh offer.
  const applySettings = useCallback(
    (nextQuality: MicLinkQuality, nextDeviceId: string) => {
      setQuality(nextQuality);
      setDeviceId(nextDeviceId);
      if (sessionRef.current) void connect(nextQuality, nextDeviceId);
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

  useEffect(() => {
    return () => void teardown();
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
