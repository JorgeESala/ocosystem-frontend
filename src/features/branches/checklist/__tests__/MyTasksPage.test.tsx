import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyTasksPage from "../pages/MyTasksPage";
import type {
  BranchChecklist,
  ChecklistTaskEntry,
} from "../types/checklist.types";

const { mockGetDaily } = vi.hoisted(() => ({ mockGetDaily: vi.fn() }));

vi.mock("../api/checklist.api", () => ({
  checklistApi: { getDaily: (...args: unknown[]) => mockGetDaily(...args) },
}));

const pendingTask = (taskId: ChecklistTaskEntry["taskId"]) => ({
  taskId,
  label: taskId,
  status: "EMPTY",
  detail: "",
  dueAt: null,
  evaluatedAt: "",
});

const branch = (branchId: number): BranchChecklist => ({
  branchId,
  branchName: `Sucursal ${branchId}`,
  tasks: [pendingTask("UPLOAD_SALES_REPORT")] as ChecklistTaskEntry[],
});

const renderPage = (entry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/business/:slug/mis-tareas" element={<MyTasksPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("MyTasksPage scope params", () => {
  it("filters to the requested branch and day", async () => {
    mockGetDaily.mockResolvedValue({ branches: [branch(1), branch(2)] });

    renderPage("/business/sucursales/mis-tareas?branch=2&date=2026-09-15");

    expect(await screen.findAllByText("Sucursal 2")).not.toHaveLength(0);
    expect(screen.queryByText("Sucursal 1")).toBeNull();
    expect(screen.getByText(/15 de septiembre de 2026/)).toBeTruthy();
    expect(mockGetDaily).toHaveBeenCalledWith({ date: "2026-09-15" });
  });

  it("clears the branch filter back to every branch", async () => {
    mockGetDaily.mockResolvedValue({ branches: [branch(1), branch(2)] });

    renderPage("/business/sucursales/mis-tareas?branch=2");

    expect(await screen.findAllByText("Sucursal 2")).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Mostrar todas/ }));

    expect(screen.getByText("Sucursal 1")).toBeTruthy();
  });

  it("filters to multiple branches with the plural param", async () => {
    mockGetDaily.mockResolvedValue({
      branches: [branch(1), branch(2), branch(3)],
    });

    renderPage("/business/sucursales/mis-tareas?branches=1,3");

    expect(await screen.findByText("Sucursal 1")).toBeTruthy();
    expect(screen.getAllByText("Sucursal 3")).not.toHaveLength(0);
    expect(screen.queryByText("Sucursal 2")).toBeNull();
    expect(screen.getByText(/Mostrando solo:/).textContent).toContain(
      "2 sucursales",
    );
  });

  it("shows the empty state for unknown branch ids", async () => {
    mockGetDaily.mockResolvedValue({ branches: [branch(1), branch(2)] });

    renderPage("/business/sucursales/mis-tareas?branches=99");

    expect(
      await screen.findByText(/No hay tareas registradas/),
    ).toBeTruthy();
    expect(screen.getByText(/Mostrando solo:/).textContent).toContain(
      "Sucursal 99",
    );
  });

  it("shows every branch without params", async () => {
    mockGetDaily.mockResolvedValue({ branches: [branch(1), branch(2)] });

    renderPage("/business/sucursales/mis-tareas");

    expect(await screen.findByText("Sucursal 1")).toBeTruthy();
    expect(screen.getAllByText("Sucursal 2")).not.toHaveLength(0);
    expect(screen.queryByRole("button", { name: /Mostrar todas/ })).toBeNull();
  });
});
