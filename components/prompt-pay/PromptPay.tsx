"use client";

import { Button, Card, Image } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PromptPay: React.FC = () => {
  const { t } = useTranslation();
  const search = useSearchParams();

  const target = search.get("target") || "";
  const amount = search.get("amount") || "0";

  const [qr, setQr] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!target) return;

      const payload = generatePayload(target, {
        amount: amount ? parseFloat(amount) : undefined,
      });

      const image = await QRCode.toDataURL(payload, {
        scale: 10,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#FFFFFF",
        },
      });
      setQr(image);
    };

    run();
  }, [target, amount]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const target = formData.get("target")?.toString() || "";
    const amount = formData.get("amount")?.toString() || "0";
    if (target) {
      const params = new URLSearchParams();
      params.set("target", target);
      if (amount) {
        params.set("amount", amount);
      }
      window.location.href = `/prompt-pay?${params.toString()}`;
    }
  };

  if (!target) {
    return (
      <main className="flex-1 sm:min-h-[calc(100vh-4rem)] flex items-center sm:justify-center p-6">
        <Card
          isBlurred
          className="flex items-center justify-center p-6 w-full sm:max-w-md"
        >
          <div className="text-center flex flex-col items-center justify-center gap-4 w-full">
            <h2 className="text-2xl font-bold mb-4">{t("promptPay.title")}</h2>
            <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
              <div>
                <label className="text-left block text-sm font-medium mb-2">
                  {t("promptPay.phoneLabel")}
                </label>
                <input
                  type="text"
                  placeholder="0812345678"
                  className="w-full px-3 py-2 border rounded-lg"
                  name="target"
                />
              </div>
              <div>
                <label className="text-left block text-sm font-medium mb-2">
                  {t("promptPay.amountLabel")}
                </label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full px-3 py-2 border rounded-lg"
                  name="amount"
                />
              </div>
              <Button color="primary" type="submit">
                {t("promptPay.generate")}
              </Button>
            </form>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 sm:min-h-[calc(100vh-4rem)] gap-4 flex flex-col items-center sm:justify-center p-6">
      <Image
        src="/images/promptpay.png"
        alt="PromptPay Logo"
        className="w-full max-w-[370px] object-contain rounded-none border-[12px] border-white bg-[#163C67] p-1 "
      />
      {qr && (
        <Image
          src={qr}
          className="w-full max-w-[370px] h-full object-contain rounded-none"
          alt="qr"
        />
      )}
      <Card className="w-full sm:max-w-96">
        <div className="text-center p-4">
          <p>
            {t("promptPay.target")}: {target}
          </p>
          {amount && (
            <p className="text-sm text-foreground/70">
              {t("promptPay.amount")}: ${amount}
            </p>
          )}
        </div>
      </Card>
      <Button
        onPress={() => (window.location.href = "/prompt-pay")}
        color="primary"
      >
        {t("promptPay.generateAnother")}
      </Button>
    </main>
  );
};

export default PromptPay;
