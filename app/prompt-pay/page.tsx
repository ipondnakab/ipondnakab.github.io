"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export default function Page() {
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
    return null;
  }

  return (
    <main className="flex-1">
      {qr && <img src={qr} className="w-full" alt="qr" />}
    </main>
  );
}
