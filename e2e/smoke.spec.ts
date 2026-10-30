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
    totalSales: 0,
    previousTotalSales: null,
    chickenSales: 0,
    otherProductsSales: 0,
    chickenPosSales: 0,
    posDays: 0,
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

async function mockAuthenticatedApi(page: Page, allowedBusinesses: string[]) {
  await page.addInitScript((allowed) => {
    localStorage.setItem("token", "e2e-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "E2E",
        role: "admin",
        allowedBusinesses: allowed,
      }),
    );
  }, allowedBusinesses);

  const apiOrigin = new URL(process.env.VITE_API_URL ?? "http://localhost:8080")
    .origin;

  await page.route(`${apiOrigin}/api/**`, async (route) => {
    const url = route.request().url();
    if (/\/api\/branches(\?.*)?$/.test(url)) {
      await route.fulfill({ json: branches });
      return;
    }
    if (url.includes("/excluded-branches")) {
      await route.fulfill({ json: [] });
      return;
    }
    if (url.includes("/notifications/summary")) {
      await route.fulfill({ json: { unreadCount: 0, recent: [] } });
      return;
    }
    if (url.includes("/reports/branches/dashboard")) {
      await route.fulfill({ json: dashboardDto });
      return;
    }
    if (url.includes("/branches/checklist")) {
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

test.describe("@smoke", () => {
  test.describe.configure({ mode: "serial" });

  test("login page renders the credentials form", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/ocosistema/i);
    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
    await expect(page.getByLabel("Correo Electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeVisible();
  });

  test("private route redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/business/sucursales");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("authenticated home lists the allowed businesses", async ({ page }) => {
    await mockAuthenticatedApi(page, ["BRANCHES", "EGG"]);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Unidades de negocio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sucursales/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Huevo/ }).first(),
    ).toBeVisible();
  });

  test("branches dashboard renders its shell and navigation", async ({
    page,
  }) => {
    await mockAuthenticatedApi(page, ["BRANCHES"]);
    await page.goto("/business/sucursales");

    await expect(page).toHaveURL(/\/business\/sucursales$/);
    await expect(
      page.getByRole("heading", { name: "Sucursales", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Planeación y desempeño" }),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/business/sucursales/mis-tareas"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/business/sucursales/reports"]').first(),
    ).toBeVisible();
  });
});
