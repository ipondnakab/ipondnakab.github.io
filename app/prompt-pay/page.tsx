import React, { Suspense } from "react";

import PromptPay from "@/components/prompt-pay/PromptPay";

export const metadata = {
  title: "PromptPay",
  description: "A simple PromptPay QR code generator for quick Thai payments.",
};

const PromptPayPage: React.FC = () => {
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
};

export default PromptPayPage;
