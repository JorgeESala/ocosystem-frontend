import { test, expect, type Page } from "@playwright/test";

const branches = [
  { id: 1, name: "Norte" },
  { id: 2, name: "Sur" },
];

const pendingTask = (taskId: string) => ({
  taskId,
  label: taskId,
  status: "EMPTY",
  detail: "",
  dueAt: null,
  evaluatedAt: "",
});

const dashboardDto = {
  startDate: "2026-09-01",
  endDate: "2026-09-07",
  previousStartDate: "2026-08-25",
  previousEndDate: "2026-08-31",
  summary: {
    totalSales: 0,
    previousTotalSales: null,
    chickenSales: 0,
    previousChickenSales: null,
    otherProductsSales: 0,
    previousOtherProductsSales: null,
    chickenCosts: 0,
    chickenProfit: 0,
    mermaLossQuantity: 0,
    trimmedBranches: 0,
  },
  coverage: {
    totalBranches: 2,
    branchesWithPosReport: 2,
    branchesWithChickenSales: 0,
  },
  branches: branches.map((branch) => ({
    branchId: branch.id,
    branchName: branch.name,
    totalSales: 100,
    previousTotalSales: null,
    chickenSales: 0,
    otherProductsSales: 100,
    chickenPosSales: 0,
    posDays: 6,
    chickenDays: 0,
    mermaLossQuantity: 0,
    reconciliationStatus: "MATCH",
    chickenVariancePct: null,
    comparisonTrimmed: false,
    trimmedDays: 0,
  })),
  daily: [],
};

const dailyChecklist = {
  date: "2026-09-30",
  evaluatedAt: "2026-09-30T00:00:00",
  summary: {
    totalBranches: 2,
    branchesComplete: 0,
    branchesPartial: 2,
    branchesEmpty: 0,
  },
  branches: branches.map((branch) => ({
    branchId: branch.id,
    branchName: branch.name,
    tasks: [pendingTask("REGISTER_EXPENSES")],
  })),
};

async function mockBranchApis(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("token", "e2e-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "E2E",
        allowedBusinesses: ["BRANCHES"],
        role: "admin",
      }),
    );
  });
  const apiOrigin = new URL(process.env.VITE_API_URL ?? "http://localhost:8080")
    .origin;
  await page.route(`${apiOrigin}/api/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith("/api/branches")) {
      await route.fulfill({ json: branches });
      return;
    }
    if (url.includes("/excluded-branches")) {
      await route.fulfill({ json: [] });
      return;
    }
    if (url.includes("/reports/branches/dashboard")) {
      await route.fulfill({ json: dashboardDto });
      return;
    }
    if (url.includes("/branches/checklist?")) {
      await route.fulfill({ json: dailyChecklist });
      return;
    }
    if (
      url.includes("/order-predictions") ||
      url.includes("/delivery-schedule")
    ) {
      await route.fulfill({ json: [] });
      return;
    }
    await route.fulfill({ json: {} });
  });
}

test.describe("branches attention group links", () => {
  test("grouped pending tasks link to scoped mis-tareas", async ({ page }) => {
    await mockBranchApis(page);
    await page.goto("/business/sucursales");

    const tasksLink = page.locator(
      "a[href*='mis-tareas?branches=']:has-text('Atender')",
    );
    await expect(tasksLink.first()).toBeVisible({ timeout: 15000 });
    await expect(tasksLink.first()).toHaveAttribute(
      "href",
      /mis-tareas\?branches=1%2C2&date=\d{4}-\d{2}-\d{2}/,
    );

    await tasksLink.first().click();
    await expect(page).toHaveURL(/mis-tareas\?branches=1%2C2&date=/);
    await expect(page.getByText(/Mostrando solo:/)).toContainText(
      "2 sucursales",
    );
    await expect(page.getByText("Norte").first()).toBeVisible();
    await expect(page.getByText("Sur").first()).toBeVisible();
  });

  test("grouped missing reports link to scoped reports", async ({ page }) => {
    await mockBranchApis(page);
    await page.goto("/business/sucursales");

    const reportsLink = page.locator(
      "a[href*='/reports?branches=']:has-text('Atender')",
    );
    await expect(reportsLink.first()).toBeVisible({ timeout: 15000 });
    await expect(reportsLink.first()).toHaveAttribute(
      "href",
      "/business/sucursales/reports?branches=1%2C2&start=2026-09-01&end=2026-09-07",
    );

    await reportsLink.first().click();
    await expect(page).toHaveURL(
      /reports\?branches=1%2C2&start=2026-09-01&end=2026-09-07/,
    );
  });

  test("mis-tareas honors a direct plural branches param", async ({ page }) => {
    await mockBranchApis(page);
    await page.goto("/business/sucursales/mis-tareas?branches=2");

    await expect(page.getByText(/Mostrando solo:/)).toContainText("Sur");
    await expect(page.getByText("Sur").first()).toBeVisible();
    await expect(page.getByText("Norte")).toBeHidden();
  });
});
