import PromptPay from "@/components/prompt-pay/PromptPay";
import { Suspense } from "react";

export const metadata = {
  title: "PromptPay - by ipondnakab",
  description: "PromptPay QR Code Generator",
};

export default function PromptPayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PromptPay />
    </Suspense>
  );
}
