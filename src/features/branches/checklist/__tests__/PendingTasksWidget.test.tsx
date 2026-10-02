import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PendingTasksWidget from "../components/PendingTasksWidget";
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

const branchWithPending = (
  branchId: number,
  taskCount: number,
): BranchChecklist => ({
  branchId,
  branchName: `Sucursal ${branchId}`,
  tasks: [
    pendingTask("UPLOAD_SALES_REPORT"),
    pendingTask("REGISTER_EXPENSES"),
    pendingTask("REGISTER_SALES"),
  ].slice(0, taskCount) as ChecklistTaskEntry[],
});

const renderWidget = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/business/sucursales"]}>
        <Routes>
          <Route path="/business/:slug" element={<PendingTasksWidget />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("PendingTasksWidget", () => {
  it("shows only the top five branches with a count of the rest", async () => {
    mockGetDaily.mockResolvedValue({
      branches: [1, 2, 3, 4, 5, 6, 7].map((id) => branchWithPending(id, 1)),
    });

    renderWidget();

    expect(await screen.findByText("Sucursal 5")).toBeTruthy();
    expect(screen.queryByText("Sucursal 6")).toBeNull();
    expect(screen.queryByText("Sucursal 7")).toBeNull();
    expect(screen.getByText("Mostrando 5 de 7 sucursales")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Ver todas/ }).getAttribute("href"),
    ).toBe("/business/sucursales/mis-tareas");
  });

  it("shows every branch when there are five or fewer", async () => {
    mockGetDaily.mockResolvedValue({
      branches: [1, 2, 3].map((id) => branchWithPending(id, 1)),
    });

    renderWidget();

    expect(await screen.findByText("Sucursal 3")).toBeTruthy();
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });
});
