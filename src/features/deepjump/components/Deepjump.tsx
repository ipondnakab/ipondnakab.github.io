"use client";

import { DEFAULT_VALUES, HISTORY_KEY } from "@/features/deepjump/constants";
import {
  addToHistory,
  parseHistory,
  validateDeeplink,
} from "@/features/deepjump/lib/deepjump";
import {
  DeepjumpForm,
  HistoryAction,
  JumpHistoryEntry,
} from "@/features/deepjump/model/deepjump";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import FormHookWrapper from "@/shared/ui/form/FormHookWrapper";
import InputString from "@/shared/ui/inputs/InputString";
import { Button, Card } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  IoArrowForward,
  IoLinkOutline,
  IoTimeOutline,
  IoTrashOutline,
} from "react-icons/io5";

export interface DeepjumpProps {
  navigate?: (url: string) => void;
}

const Deepjump: React.FC<DeepjumpProps> = ({ navigate }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<JumpHistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<HistoryAction | null>(
    null,
  );
  useEffect(() => {
    try {
      setHistory(parseHistory(window.localStorage.getItem(HISTORY_KEY)));
    } catch {
      setMessage(t("deepjump.storageError"));
    }
    setReady(true);
  }, [t]);

  const save = (entries: JumpHistoryEntry[]) => {
    setHistory(entries);
    setMessage("");
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      setMessage(t("deepjump.storageError"));
    }
  };
  const jump = (input: string) => {
    const url = validateDeeplink(input);
    if (!url || !ready) return;
    save(addToHistory(history, url, Date.now()));
    try {
      if (navigate) navigate(url);
      else window.location.assign(url);
    } catch {
      setMessage(t("deepjump.launchError"));
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-5 px-3 py-5 pb-20 text-foreground sm:gap-6 sm:px-6 sm:py-8">
      <Card
        isBlurred
        className="min-w-0 gap-6 rounded-3xl p-4 shadow-sm sm:p-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary sm:h-16 sm:w-16 sm:text-4xl">
            <IoLinkOutline aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t("deepjump.title")}
            </h1>
            <p className="text-sm leading-relaxed text-default-600 sm:text-base">
              {t("deepjump.description")}
            </p>
          </div>
        </div>
        <FormHookWrapper<DeepjumpForm>
          defaultValues={DEFAULT_VALUES}
          onSubmit={() => {}}
          preventEnterSubmit={false}
        >
          {({ getValues, trigger }) => {
            const submit = () => {
              const input = getValues("url");
              if (validateDeeplink(input)) jump(input);
              else void trigger("url");
            };
            return (
              <div
                className="flex min-w-0 flex-col gap-5"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    event.target instanceof HTMLInputElement &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    submit();
                  }
                }}
              >
                <InputString
                  name="url"
                  inputMode="url"
                  enterKeyHint="go"
                  size="lg"
                  variant="bordered"
                  radius="lg"
                  labelPlacement="outside"
                  classNames={{
                    base: "min-w-0",
                    input: "text-base",
                    inputWrapper: "min-h-14 bg-content2/50",
                    label: "font-semibold text-foreground",
                  }}
                  label={t("deepjump.label")}
                  placeholder={t("deepjump.placeholder")}
                  disableAutoPlaceholder
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  rules={{
                    validate: (value: string) =>
                      Boolean(validateDeeplink(value)) || t("deepjump.invalid"),
                  }}
                />
                <Button
                  type="button"
                  isDisabled={!ready}
                  onClick={submit}
                  color="primary"
                  size="lg"
                  radius="lg"
                  fullWidth
                  disableAnimation
                  endContent={
                    <IoArrowForward aria-hidden className="shrink-0 text-xl" />
                  }
                  className="min-h-14 text-base font-semibold shadow-sm"
                >
                  {t("deepjump.jump")}
                </Button>
              </div>
            );
          }}
        </FormHookWrapper>
      </Card>
      <p
        role="status"
        className={
          message
            ? "rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning-600"
            : "sr-only"
        }
      >
        {message}
      </p>
      <section aria-labelledby="deepjump-history" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="deepjump-history"
            className="flex items-center gap-2 text-lg font-semibold sm:text-xl"
          >
            <IoTimeOutline
              aria-hidden
              className="shrink-0 text-xl text-primary"
            />
            {t("deepjump.history")}
          </h2>
          <Button
            type="button"
            size="sm"
            isDisabled={!history.length}
            onClick={() => setPendingAction({ kind: "clear" })}
            color="danger"
            variant="flat"
            radius="lg"
            disableAnimation
            className="min-h-12 min-w-0 whitespace-normal px-4 font-semibold"
          >
            {t("deepjump.clear")}
          </Button>
        </div>
        <p className="text-sm text-default-600">{t("deepjump.historyHint")}</p>
        {!ready ? (
          <p>{t("common.loading")}</p>
        ) : !history.length ? (
          <Card
            disableAnimation
            shadow="none"
            className="flex flex-col items-center gap-3 rounded-3xl px-4 py-10 text-center"
          >
            <IoLinkOutline aria-hidden className="text-3xl text-default-400" />
            <p className="text-sm text-default-600">{t("deepjump.empty")}</p>
          </Card>
        ) : (
          <ul className="space-y-3 px-4">
            {history.map((entry) => (
              <li key={entry.url} className="min-w-0">
                <Card
                  isBlurred
                  disableAnimation
                  className="min-w-0 flex-row items-center justify-center border bg-default-100/70 border-default rounded-large shadow-sm sm:flex-row sm:items-center sm:gap-4"
                >
                  <p
                    className="min-w-0 cursor-pointer flex-1 break-all p-3 py-4 font-mono text-sm leading-relaxed"
                    onClick={() => jump(entry.url)}
                  >
                    {entry.url}
                  </p>
                  <div
                    className="text-danger px-2"
                    onClick={() =>
                      setPendingAction({ kind: "delete", url: entry.url })
                    }
                  >
                    <IoTrashOutline aria-hidden />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ConfirmModal
        isOpen={pendingAction !== null}
        title={t(
          pendingAction?.kind === "delete"
            ? "deepjump.deleteTitle"
            : "deepjump.clearTitle",
        )}
        description={t(
          pendingAction?.kind === "delete"
            ? "deepjump.deleteDescription"
            : "deepjump.clearDescription",
        )}
        confirmLabel={t(
          pendingAction?.kind === "delete"
            ? "deepjump.delete"
            : "deepjump.clear",
        )}
        cancelLabel={t("deepjump.cancel")}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          save(
            pendingAction.kind === "clear"
              ? []
              : history.filter((entry) => entry.url !== pendingAction.url),
          );
          setPendingAction(null);
        }}
      >
        {pendingAction?.kind === "delete" && (
          <p className="min-w-0 break-all rounded-xl bg-default-100 p-3 font-mono text-sm leading-relaxed">
            {pendingAction.url}
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};
export default Deepjump;
