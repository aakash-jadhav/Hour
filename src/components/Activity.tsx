import { ReactNode } from "react";

/**
 * Same idea as React’s Activity API (https://react.dev/reference/react/Activity): keep children mounted when
 * `mode="hidden"` so component state and DOM (e.g. inputs, timers) are preserved. Uses the HTML `hidden` attribute
 * (display: none) instead of conditional unmounting.
 */
type Props = {
  mode: "visible" | "hidden";
  children: ReactNode;
};

export function Activity({ mode, children }: Props) {
  return (
    <div className="activity-root" hidden={mode === "hidden"}>
      {children}
    </div>
  );
}
