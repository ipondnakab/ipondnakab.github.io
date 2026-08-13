"use client";

import {
  Button,
  Card,
  Chip,
  Divider,
  Image,
  Slider,
  Switch,
} from "@nextui-org/react";
import QRCode from "qrcode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  MIC_LINK_MIC_PARAM,
  MIC_LINK_ROOM_PARAM,
  MIC_LINK_STATS_INTERVAL_MS,
} from "@/constants/mic-link";
import {
  AudioLevelMonitor,
  createAudioLevelMonitor,
} from "@/functions/audio-level";
import { MicLinkConnectionInfo, MicLinkStatus } from "@/interfaces/mic-link";
import { trackEvent } from "@/libs/analytics";
import { MicLinkSession, openReceiverSession } from "@/libs/mic-link-signaling";
import MicLinkLevelMeter from "./MicLinkLevelMeter";
import MicLinkStatusChip from "./MicLinkStatusChip";

const RECORDING_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

const pickRecordingMimeType = (): string | undefined =>
  RECORDING_MIME_TYPES.find(
    (type) =>
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type),
  );

export interface MicLinkReceiverProps {
  roomId: string;
  onEnd: () => void;
}

const MicLinkReceiver: React.FC<MicLinkReceiverProps> = ({ roomId, onEnd }) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<MicLinkStatus>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [info, setInfo] = useState<MicLinkConnectionInfo | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [qr, setQr] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  // Monitoring is off by default on purpose: the phone's mic will happily pick
  // up these speakers and howl. Headphones or a muted monitor, never both loud.
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<MicLinkSession | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Build the join link on the client only — during the static prerender there
  // is no window, and rendering a placeholder would cause a hydration mismatch.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(MIC_LINK_ROOM_PARAM, roomId);
    url.searchParams.set(MIC_LINK_MIC_PARAM, "1");
    setJoinUrl(url.toString());
  }, [roomId]);

  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, {
      scale: 8,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [joinUrl]);

  useEffect(() => {
    let isCancelled = false;
    let session: MicLinkSession | null = null;

    openReceiverSession(roomId, "voice", {
      onStatus: setStatus,
      onError: () => setErrorKey("negotiation"),
      onRemoteStream: setRemoteStream,
    })
      .then((opened) => {
        if (isCancelled) {
          void opened.close();
          return;
        }
        session = opened;
        sessionRef.current = opened;
        trackEvent("mic_link_room_opened", {});
      })
      .catch(() => {
        setStatus("error");
        setErrorKey("roomCreate");
      });

    return () => {
      isCancelled = true;
      void session?.close();
      sessionRef.current = null;
    };
  }, [roomId]);

  // Attach the incoming stream to a real <audio> element. This is not only for
  // playback: Chrome will not feed a remote WebRTC stream into Web Audio unless
  // it is also attached to a playing media element, even a muted one, so the
  // level meter depends on this too.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !remoteStream) return;

    audio.srcObject = remoteStream;
    // Start muted no matter what the monitor toggle says: muted playback is the
    // one thing autoplay policy always permits, so this can never be blocked on
    // a page that has not seen a user gesture yet (a bookmarked room link). The
    // effect below immediately corrects `muted` in the same commit, and
    // unmuting an already-playing element needs no further permission.
    audio.muted = true;
    void audio.play().catch(() => undefined);
    const monitor: AudioLevelMonitor = createAudioLevelMonitor(
      remoteStream,
      setLevel,
    );

    return () => {
      monitor.stop();
      audio.srcObject = null;
    };
  }, [remoteStream]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = !isMonitoring;
  }, [isMonitoring, remoteStream]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, remoteStream]);

  useEffect(() => {
    if (status !== "live") {
      setInfo(null);
      return;
    }
    const timer = setInterval(() => {
      void sessionRef.current?.getConnectionInfo().then((next) => {
        if (next) setInfo(next);
      });
    }, MIC_LINK_STATS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [status]);

  const handleCopy = useCallback(async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setErrorKey("clipboard");
    }
  }, [joinUrl]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!remoteStream) return;
    try {
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(
        remoteStream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        const extension = recorder.mimeType.includes("mp4") ? "m4a" : "webm";
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `mic-link-${roomId}-${Date.now()}.${extension}`;
        anchor.click();
        // Revoking immediately can cancel the download in some browsers.
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      trackEvent("mic_link_recording_started", {});
    } catch {
      setErrorKey("recordingUnsupported");
    }
  }, [remoteStream, roomId]);

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
    };
  }, []);

  const isLive = status === "live";

  return (
    <div className="flex items-start justify-center p-4 py-10 min-h-[calc(100vh-4rem)]">
      <Card isBlurred className="max-w-xl w-full p-6 gap-5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{t("micLink.receiver.title")}</h1>
            <span className="text-tiny text-default-500">
              {t("micLink.room")}: <code className="font-mono">{roomId}</code>
            </span>
          </div>
          <MicLinkStatusChip status={status} />
        </div>

        <Divider />

        {!isLive && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-small text-default-600 text-center">
              {t("micLink.receiver.scanPrompt")}
            </p>
            {qr ? (
              <Image
                src={qr}
                alt={t("micLink.receiver.qrAlt")}
                width={224}
                height={224}
                className="rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 rounded-lg bg-default-100 animate-pulse" />
            )}
            <Button
              variant="bordered"
              size="sm"
              onPress={() => void handleCopy()}
              isDisabled={!joinUrl}
            >
              {t(
                isCopied ? "micLink.receiver.copied" : "micLink.receiver.copy",
              )}
            </Button>
            <p className="text-tiny text-default-500 text-center max-w-sm">
              {t("micLink.receiver.sameNetworkHint")}
            </p>
          </div>
        )}

        <MicLinkLevelMeter
          level={level}
          isActive={isLive}
          label={t("micLink.receiver.incomingLevel")}
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

        <div className="flex flex-col gap-3">
          <Switch
            isSelected={isMonitoring}
            onValueChange={setIsMonitoring}
            isDisabled={!isLive}
          >
            <div className="flex flex-col">
              <span className="text-small">
                {t("micLink.receiver.monitor")}
              </span>
              <span className="text-tiny text-default-500">
                {t("micLink.receiver.monitorHint")}
              </span>
            </div>
          </Switch>

          <Slider
            size="sm"
            label={t("micLink.receiver.volume")}
            value={volume}
            onChange={(next) =>
              setVolume(Array.isArray(next) ? next[0] : (next as number))
            }
            minValue={0}
            maxValue={1}
            step={0.01}
            isDisabled={!isLive || !isMonitoring}
          />
        </div>

        {isLive && info && (
          <div className="flex flex-wrap gap-2">
            <Chip
              size="sm"
              variant="flat"
              color={info.isDirect ? "success" : "default"}
            >
              {t(
                info.isDirect
                  ? "micLink.receiver.direct"
                  : "micLink.receiver.relayed",
              )}
            </Chip>
            {info.roundTripTimeMs !== undefined && (
              <Chip size="sm" variant="flat">
                {t("micLink.receiver.latency", { ms: info.roundTripTimeMs })}
              </Chip>
            )}
            {info.bitrateKbps !== undefined && (
              <Chip size="sm" variant="flat">
                {t("micLink.receiver.bitrate", { kbps: info.bitrateKbps })}
              </Chip>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1"
            color={isRecording ? "danger" : "primary"}
            variant={isRecording ? "solid" : "bordered"}
            onPress={isRecording ? stopRecording : startRecording}
            isDisabled={!isLive}
          >
            {t(
              isRecording
                ? "micLink.receiver.stopRecording"
                : "micLink.receiver.startRecording",
            )}
          </Button>
          <Button
            className="flex-1"
            color="danger"
            variant="flat"
            onPress={onEnd}
          >
            {t("micLink.receiver.end")}
          </Button>
        </div>

        {/* Kept mounted for the whole session — see the attach effect above. */}
        <audio ref={audioRef} playsInline className="hidden" />
      </Card>
    </div>
  );
};

export default MicLinkReceiver;
