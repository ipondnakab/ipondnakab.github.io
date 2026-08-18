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
import clsx from "clsx";
import QRCode from "qrcode";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  MIC_LINK_DEFAULT_GAIN,
  MIC_LINK_MAX_SENDERS,
  MIC_LINK_MIC_PARAM,
  MIC_LINK_ROOM_PARAM,
  MIC_LINK_STATS_INTERVAL_MS,
} from "@/features/mic-link/constants";
import {
  createMicLinkMixer,
  MicLinkMixer,
} from "@/features/mic-link/lib/mixer";
import {
  MicLinkReceiverSession,
  openReceiverSession,
} from "@/features/mic-link/lib/signaling";
import {
  MicLinkChannelState,
  MicLinkConnectionInfo,
  MicLinkInput,
  MicLinkLatencyEstimate,
  MicLinkStatus,
} from "@/features/mic-link/model/mic-link";
import { trackEvent } from "@/shared/lib/analytics";
import MicLinkMixerStrip from "./MicLinkMixerStrip";
import MicLinkStatusChip from "./MicLinkStatusChip";
import MicLinkStreamSink from "./MicLinkStreamSink";

const RECORDING_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

// Meters do not need to run at display refresh rate, and this one drives a
// state update for every connected phone at once.
const METER_INTERVAL_MS = 33;

const DEFAULT_CHANNEL: MicLinkChannelState = {
  gain: MIC_LINK_DEFAULT_GAIN,
  isMuted: false,
  isSoloed: false,
};

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

  const [roomStatus, setRoomStatus] = useState<MicLinkStatus>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [inputs, setInputs] = useState<MicLinkInput[]>([]);
  const [channels, setChannels] = useState<Record<string, MicLinkChannelState>>(
    {},
  );
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [info, setInfo] = useState<MicLinkConnectionInfo | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [qr, setQr] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isRecording, setIsRecording] = useState(false);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [outputLatencyMs, setOutputLatencyMs] = useState(0);

  const sessionRef = useRef<MicLinkReceiverSession | null>(null);
  const mixerRef = useRef<MicLinkMixer | null>(null);
  const mixedStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const liveCount = inputs.filter((input) => input.status === "live").length;
  const hasLiveInput = liveCount > 0;
  const displayStatus: MicLinkStatus = hasLiveInput ? "live" : roomStatus;
  const isFull = inputs.length >= MIC_LINK_MAX_SENDERS;
  const anySolo = useMemo(
    () => Object.values(channels).some((channel) => channel.isSoloed),
    [channels],
  );

  // The mixer owns an AudioContext, so it is created once for the lifetime of
  // the receiver and disposed on unmount. Declared before the session effect so
  // it is guaranteed to exist by the time the first stream arrives.
  useEffect(() => {
    const mixer = createMicLinkMixer();
    mixerRef.current = mixer;
    const mixed = mixedStreamsRef.current;
    return () => {
      mixer.dispose();
      mixerRef.current = null;
      mixed.clear();
    };
  }, []);

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
    let session: MicLinkReceiverSession | null = null;

    openReceiverSession(roomId, {
      onStatus: setRoomStatus,
      onError: (message) =>
        setErrorKey(
          message === "permission-denied" ? "databaseDenied" : "negotiation",
        ),
      onSenderJoined: (senderId, sender) => {
        setInputs((previous) => {
          const existing = previous.find(
            (input) => input.senderId === senderId,
          );
          const measurements = {
            platform: sender.platform,
            captureLatencyMs: sender.captureLatencyMs,
            deviceOutputLatencyMs: sender.deviceOutputLatencyMs,
          };
          if (existing) {
            return previous.map((input) =>
              input.senderId === senderId
                ? {
                    ...input,
                    label: sender.label,
                    quality: sender.quality,
                    ...measurements,
                  }
                : input,
            );
          }
          return [
            ...previous,
            {
              senderId,
              label: sender.label,
              quality: sender.quality,
              status: "connecting" as MicLinkStatus,
              stream: null,
              ...measurements,
            },
          ];
        });
        setChannels((previous) =>
          previous[senderId]
            ? previous
            : { ...previous, [senderId]: { ...DEFAULT_CHANNEL } },
        );
      },
      onSenderStatus: (senderId, status) => {
        setInputs((previous) =>
          previous.map((input) =>
            input.senderId === senderId ? { ...input, status } : input,
          ),
        );
      },
      onSenderStream: (senderId, stream) => {
        setInputs((previous) =>
          previous.map((input) =>
            input.senderId === senderId ? { ...input, stream } : input,
          ),
        );
      },
      onSenderLeft: (senderId) => {
        setInputs((previous) =>
          previous.filter((input) => input.senderId !== senderId),
        );
        // Channel settings are deliberately kept. A phone that drops and comes
        // back rejoins under the same sender id, and having its gain, mute and
        // solo silently reset to defaults every time would be worse than the
        // negligible cost of holding a few stale entries for the room's life.
      },
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
      .catch((error: { code?: string }) => {
        setRoomStatus("error");
        setErrorKey(
          error?.code === "permission-denied" ? "databaseDenied" : "roomCreate",
        );
      });

    return () => {
      isCancelled = true;
      void session?.close();
      sessionRef.current = null;
    };
  }, [roomId]);

  // Keep the mixer's channels in step with the connected phones. Handles the
  // replacement case too: a phone that reconnects arrives with a brand new
  // MediaStream, and the old source node has to be torn out first.
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    const mixed = mixedStreamsRef.current;

    inputs.forEach((input) => {
      if (!input.stream) return;
      if (mixed.get(input.senderId) === input.stream) return;
      if (mixed.has(input.senderId)) mixer.removeInput(input.senderId);
      mixer.addInput(input.senderId, input.stream);
      mixed.set(input.senderId, input.stream);
    });

    Array.from(mixed.keys()).forEach((senderId) => {
      if (inputs.some((input) => input.senderId === senderId)) return;
      mixer.removeInput(senderId);
      mixed.delete(senderId);
    });
  }, [inputs]);

  // Push fader positions down. Solo is resolved here rather than in the mixer:
  // a soloed channel silences the others without touching their mute state, so
  // clearing solo restores exactly what the user had set.
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    inputs.forEach((input) => {
      const channel = channels[input.senderId] ?? DEFAULT_CHANNEL;
      mixer.setChannel(input.senderId, {
        gain: channel.gain,
        isMuted: channel.isMuted || (anySolo && !channel.isSoloed),
      });
    });
  }, [channels, inputs, anySolo]);

  useEffect(() => {
    // In low-latency mode the <audio> elements do the playing and the mixer's
    // monitor output is silenced, so the audio never passes through Web Audio
    // on its way to the speakers. The mixer keeps running for meters and for
    // recording, which still want the summed bus.
    mixerRef.current?.setMonitoring(isMonitoring && !isLowLatency, volume);
    // An AudioContext starts suspended unless it was created during a gesture;
    // toggling monitoring is a gesture, so this is the right moment to resume.
    if (isMonitoring) {
      void mixerRef.current?.resume();
      // Only meaningful once the context is actually running.
      setOutputLatencyMs(mixerRef.current?.getOutputLatencyMs() ?? 0);
    }
  }, [isMonitoring, volume, isLowLatency]);

  useEffect(() => {
    sessionRef.current?.setLowLatency(isLowLatency);
  }, [isLowLatency]);

  useEffect(() => {
    if (inputs.length === 0) return;
    const timer = setInterval(() => {
      const mixer = mixerRef.current;
      if (mixer) setLevels(mixer.readLevels());
    }, METER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [inputs.length]);

  // Collapse the QR panel once the first phone is in, but leave it reachable so
  // more can be added mid-session.
  useEffect(() => {
    if (inputs.length === 1) setIsInviteOpen(false);
  }, [inputs.length]);

  useEffect(() => {
    if (!hasLiveInput) {
      setInfo(null);
      return;
    }
    const timer = setInterval(() => {
      void sessionRef.current?.getConnectionInfo().then((next) => {
        if (next) setInfo(next);
      });
      setOutputLatencyMs(mixerRef.current?.getOutputLatencyMs() ?? 0);
    }, MIC_LINK_STATS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasLiveInput]);

  // Only the measurable legs. The phone's own capture buffer is not exposed by
  // any browser API, so real mouth-to-ear is roughly this plus 10-20ms.
  const latency = useMemo<MicLinkLatencyEstimate | null>(() => {
    if (!info || info.jitterBufferMs === undefined) return null;
    const networkMs =
      info.roundTripTimeMs === undefined
        ? 0
        : Math.round(info.roundTripTimeMs / 2);
    return {
      jitterBufferMs: info.jitterBufferMs,
      networkMs,
      outputMs: outputLatencyMs,
      totalMs: info.jitterBufferMs + networkMs + outputLatencyMs,
    };
  }, [info, outputLatencyMs]);

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

  const updateChannel = useCallback(
    (senderId: string, patch: Partial<MicLinkChannelState>) => {
      setChannels((previous) => ({
        ...previous,
        [senderId]: { ...(previous[senderId] ?? DEFAULT_CHANNEL), ...patch },
      }));
    },
    [],
  );

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    try {
      // Recording the mixer bus, not any single phone: what lands in the file is
      // the same mix the faders describe.
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(
        mixer.recordingStream,
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

      void mixer.resume();
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      trackEvent("mic_link_recording_started", { inputs: inputs.length });
    } catch {
      setErrorKey("recordingUnsupported");
    }
  }, [inputs.length, roomId]);

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
    };
  }, []);

  return (
    <div className="flex items-start justify-center p-4 py-10 min-h-[calc(100vh-4rem)]">
      <Card isBlurred className="max-w-xl w-full p-6 gap-5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{t("micLink.receiver.title")}</h1>
            <span className="text-tiny text-default-500">
              {t("micLink.room")}: <code className="font-mono">{roomId}</code>
              {inputs.length > 0 &&
                ` · ${t("micLink.receiver.connectedCount", {
                  count: inputs?.length,
                  max: MIC_LINK_MAX_SENDERS,
                })}`}
            </span>
          </div>
          <MicLinkStatusChip status={displayStatus} />
        </div>

        <Divider />

        {isInviteOpen ? (
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
            <div className="flex gap-2">
              <Button
                variant="bordered"
                size="sm"
                onPress={() => void handleCopy()}
                isDisabled={!joinUrl}
              >
                {t(
                  isCopied
                    ? "micLink.receiver.copied"
                    : "micLink.receiver.copy",
                )}
              </Button>
              {inputs.length > 0 && (
                <Button
                  variant="light"
                  size="sm"
                  onPress={() => setIsInviteOpen(false)}
                >
                  {t("micLink.receiver.hideQr")}
                </Button>
              )}
            </div>
            <p className="text-tiny text-default-500 text-center max-w-sm">
              {t("micLink.receiver.sameNetworkHint")}
            </p>
          </div>
        ) : (
          <Button
            variant="bordered"
            size="sm"
            onPress={() => setIsInviteOpen(true)}
            isDisabled={isFull}
          >
            {t(
              isFull
                ? "micLink.receiver.roomFull"
                : "micLink.receiver.addAnother",
            )}
          </Button>
        )}

        {errorKey && (
          <Chip
            variant="flat"
            color="danger"
            className="max-w-full h-auto py-2 text-center whitespace-normal"
          >
            {t(`micLink.errors.${errorKey}`)}
          </Chip>
        )}

        {inputs.length === 0 ? (
          <p className="text-small text-default-500 text-center py-4">
            {t("micLink.receiver.noInputs")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {inputs.map((input) => {
              const channel = channels[input.senderId] ?? DEFAULT_CHANNEL;
              return (
                <MicLinkMixerStrip
                  key={input.senderId}
                  label={input.label}
                  platform={input.platform}
                  captureLatencyMs={input.captureLatencyMs}
                  deviceOutputLatencyMs={input.deviceOutputLatencyMs}
                  status={input.status}
                  level={levels[input.senderId] ?? 0}
                  gain={channel.gain}
                  isMuted={channel.isMuted}
                  isSoloed={channel.isSoloed}
                  isDimmed={anySolo && !channel.isSoloed}
                  onGainChange={(gain) =>
                    updateChannel(input.senderId, { gain })
                  }
                  onMuteToggle={() =>
                    updateChannel(input.senderId, { isMuted: !channel.isMuted })
                  }
                  onSoloToggle={() =>
                    updateChannel(input.senderId, {
                      isSoloed: !channel.isSoloed,
                    })
                  }
                />
              );
            })}
          </div>
        )}

        <Divider />

        <div className="flex flex-col gap-3">
          <Switch
            isSelected={isMonitoring}
            onValueChange={setIsMonitoring}
            isDisabled={!hasLiveInput}
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
            isDisabled={!hasLiveInput || !isMonitoring}
          />

          <Switch
            isSelected={isLowLatency}
            onValueChange={setIsLowLatency}
            isDisabled={!hasLiveInput}
          >
            <div className="flex flex-col">
              <span className="text-small">
                {t("micLink.receiver.lowLatency")}
              </span>
              <span className="text-tiny text-default-500">
                {t("micLink.receiver.lowLatencyHint")}
              </span>
            </div>
          </Switch>
        </div>

        {hasLiveInput && info && (
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

        {hasLiveInput && latency && (
          <div className="flex flex-col gap-1 rounded-medium bg-default-100 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-small">
                {t("micLink.receiver.latencyTotal")}
              </span>
              <span
                className={clsx(
                  "text-medium font-semibold tabular-nums",
                  latency.totalMs <= 40
                    ? "text-success"
                    : latency.totalMs <= 90
                      ? "text-warning"
                      : "text-danger",
                )}
              >
                ~{latency.totalMs} ms
              </span>
            </div>
            <span className="text-tiny text-default-500">
              {t("micLink.receiver.latencyBreakdown", {
                jitter: latency.jitterBufferMs,
                network: latency.networkMs,
                output: latency.outputMs,
              })}
            </span>
            {info?.jitterBufferTargetMs !== undefined && (
              <span className="text-tiny text-default-500">
                {t("micLink.receiver.latencyTarget", {
                  target: info.jitterBufferTargetMs,
                })}
                {isLowLatency && info.jitterBufferTargetMs > 30
                  ? ` — ${t("micLink.receiver.latencyTargetIgnored")}`
                  : ""}
              </span>
            )}
            <span className="text-tiny text-default-500">
              {t("micLink.receiver.latencyCaveat")}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1"
            color={isRecording ? "danger" : "primary"}
            variant={isRecording ? "solid" : "bordered"}
            onPress={isRecording ? stopRecording : startRecording}
            isDisabled={!hasLiveInput}
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

        {/* Always mounted so Chrome keeps pumping each remote stream into Web
            Audio for the meters. In low-latency mode these also become the
            playback path, which is why they carry the fader state. */}
        {inputs.map((input) => {
          if (!input.stream) return null;
          const channel = channels[input.senderId] ?? DEFAULT_CHANNEL;
          const isSilenced =
            channel.isMuted || (anySolo && !channel.isSoloed) || !isMonitoring;
          return (
            <MicLinkStreamSink
              key={input.senderId}
              stream={input.stream}
              muted={!isLowLatency || isSilenced}
              volume={channel.gain * volume}
            />
          );
        })}
      </Card>
    </div>
  );
};

export default MicLinkReceiver;
