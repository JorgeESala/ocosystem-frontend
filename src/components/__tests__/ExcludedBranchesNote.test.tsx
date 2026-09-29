import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ExcludedBranchesNote from "../ExcludedBranchesNote";

describe("ExcludedBranchesNote", () => {
  it("renders nothing without exclusions", () => {
    const { container } = render(<ExcludedBranchesNote excluded={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the excluded branches", () => {
    render(
      <ExcludedBranchesNote
        excluded={[
          { branchId: 1, branchName: "Centro", reason: "cerrada" },
          { branchId: 2, branchName: "Norte", reason: null },
        ]}
      />,
    );

    expect(
      screen.getByText(/2 sucursales excluidas del análisis/),
    ).toBeTruthy();
    expect(screen.getByText(/Centro, Norte/)).toBeTruthy();
  });

  it("uses the singular label for one branch", () => {
    render(
      <ExcludedBranchesNote
        excluded={[{ branchId: 1, branchName: "Centro" }]}
      />,
    );

    expect(screen.getByText(/1 sucursal excluida del análisis/)).toBeTruthy();
  });
});
