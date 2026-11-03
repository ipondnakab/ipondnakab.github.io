import React from "react";

export interface PixelChatBubbleProps {
  id: string;
  children: React.ReactNode;
}

const PixelChatBubble: React.FC<PixelChatBubbleProps> = ({ id, children }) => (
  <div
    id={id}
    data-testid="chat-invitation"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-10 w-max max-w-[min(14rem,calc(100vw-3rem))] text-foreground"
  >
    <div className="relative px-1">
      <div className="border-y-4 border-foreground bg-background px-3 py-2">
        <span className="block break-words font-mono text-xs font-bold leading-5 tracking-wide">
          {children}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-0 w-1 bg-foreground"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-1 right-0 w-1 bg-foreground"
      />
    </div>
    <span aria-hidden="true" className="absolute -bottom-3 right-10 h-4 w-4">
      <span className="absolute left-0 top-0 h-1 w-4 bg-foreground" />
      <span className="absolute left-0 top-1 h-1 w-3 bg-foreground" />
      <span className="absolute left-1 top-2 h-1 w-1 bg-foreground" />
      <span className="absolute left-1 top-0 h-1 w-2 bg-background" />
      <span className="absolute left-1 top-1 h-1 w-1 bg-background" />
    </span>
  </div>
);

export default PixelChatBubble;
