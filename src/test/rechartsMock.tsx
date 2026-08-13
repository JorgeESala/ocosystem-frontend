import { cloneElement } from "react";
import type { ReactNode } from "react";

export function MockResponsiveContainer({ children }: { children: ReactNode }) {
  return (
    <div data-testid="responsive-container">
      {cloneElement(
        children as React.ReactElement<{ width?: number; height?: number }>,
        { width: 600, height: 300 },
      )}
    </div>
  );
}
