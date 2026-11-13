import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoTip } from "../InfoTip";

describe("InfoTip", () => {
  it("aligns to the right edge when requested", () => {
    render(
      <InfoTip title="Ayuda" align="right">
        Contenido de ayuda
      </InfoTip>,
    );

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveClass(
      "right-0",
    );
  });

  it("limits its width to the viewport", () => {
    render(<InfoTip title="Ayuda">Contenido de ayuda</InfoTip>);

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveClass(
      "max-w-[calc(100vw-2rem)]",
    );
  });
});
