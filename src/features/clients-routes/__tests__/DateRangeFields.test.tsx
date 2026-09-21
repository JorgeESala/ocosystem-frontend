import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangeFields } from "../components/DateRangeFields";

vi.mock("flowbite-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("flowbite-react")>();
  return {
    ...actual,
    Datepicker: ({
      language,
      value,
      onChange,
      minDate,
      id,
    }: {
      language?: string;
      value?: Date | null;
      onChange?: (date: Date | null) => void;
      minDate?: Date;
      id?: string;
    }) => (
      <input
        id={id}
        data-testid="mock-datepicker"
        data-language={language}
        data-min-date={minDate ? minDate.toISOString().slice(0, 10) : ""}
        value={value ? value.toISOString().slice(0, 10) : ""}
        onChange={() => onChange?.(new Date("2032-02-01T00:00:00"))}
      />
    ),
  };
});

describe("DateRangeFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos Desde y Hasta con Flowbite Datepicker en español", () => {
    render(<DateRangeFields from={null} to={null} onChange={vi.fn()} />);

    expect(screen.getByText("Desde")).toBeInTheDocument();
    expect(screen.getByText("Hasta")).toBeInTheDocument();

    const datepickers = screen.getAllByTestId("mock-datepicker");
    expect(datepickers).toHaveLength(2);
    expect(datepickers[0]).toHaveAttribute("data-language", "es-MX");
    expect(datepickers[1]).toHaveAttribute("data-language", "es-MX");
  });

  it("propaga el cambio de la fecha inicial", () => {
    const onChange = vi.fn();
    render(<DateRangeFields from={null} to={null} onChange={onChange} />);

    fireEvent.change(screen.getAllByTestId("mock-datepicker")[0], {
      target: { value: "2032-02-01" },
    });

    expect(onChange).toHaveBeenCalledWith(
      new Date("2032-02-01T00:00:00"),
      null,
    );
  });
});
