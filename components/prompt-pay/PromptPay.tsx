"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { Button, Card } from "@nextui-org/react";

export default function PromptPay() {
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

      const image = await QRCode.toDataURL(payload);
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
      <main className="flex-1 min-h-[calc(100vh-4rem)] flex sm:items-center sm:justify-center p-6">
        <Card
          isBlurred
          className="flex items-center justify-center p-6 w-full sm:max-w-md"
        >
          <div className="text-center flex flex-col items-center justify-center gap-4 w-full">
            <h2 className="text-2xl font-bold mb-4">Generate PromptPay QR</h2>
            <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
              <div>
                <label className="text-left block text-sm font-medium mb-2">
                  PromptPay (Phone/ID)
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
                  Amount (optional)
                </label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full px-3 py-2 border rounded-lg"
                  name="amount"
                />
              </div>
              <Button color="primary" type="submit">
                Generate QR
              </Button>
            </form>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col sm:items-center sm:justify-center p-6">
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          className="w-full sm:max-w-96 h-full object-contain"
          alt="qr"
        />
      )}
      <Button
        onPress={() => (window.location.href = "/prompt-pay")}
        className="mt-4"
        color="primary"
      >
        Generate Another QR
      </Button>
    </main>
  );
}
