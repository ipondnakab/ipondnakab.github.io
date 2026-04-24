"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { Card } from "@nextui-org/react";

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

  if (!target) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Card isBlurred className="flex items-center justify-center p-6">
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold mb-4">No target provided</h2>
            <p>
              Please provide a target phone number or PromptPay ID in the query
              parameters
            </p>
            <code className="text-gray-500 bg-gray-100 p-1 rounded">
              ?target=0812345678&amount=100
            </code>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {qr && <img src={qr} className="w-full" alt="qr" />}
    </main>
  );
}
