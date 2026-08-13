import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

test.describe("Notification mark-all-as-read persistence", () => {
  test("marking all as read should persist after page reload", async ({
    page,
  }) => {
    test.setTimeout(120000);
    test.skip(
      !EMAIL || !PASSWORD,
      "TEST_EMAIL and TEST_PASSWORD must be set in .env.development",
    );

    await page.goto("/login");

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator(
      'input[name="password"], input[type="password"]',
    );
    await emailInput.fill(EMAIL!);
    await passwordInput.fill(PASSWORD!);

    await page.locator('button[type="submit"]').click();
    await page.waitForURL("/", { timeout: 10000 });

    await page.goto("/business/sucursales");

    const bellButton = page
      .locator("aside button")
      .filter({ has: page.locator("svg.h-5") });
    await expect(bellButton).toBeVisible({ timeout: 10000 });

    const unreadBadge = bellButton.locator(".bg-red-500");
    const hasBadge = await unreadBadge.isVisible().catch(() => false);

    if (!hasBadge) {
      const token = await page.evaluate(() => localStorage.getItem("token"));
      const apiBase = "http://localhost:8080";
      const xBiz = "branches";

      const allRes = await page.request.get(
        `${apiBase}/api/v1/notifications?branchIds=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Business-Code": xBiz,
          },
        },
      );
      const all = await allRes.json();

      if (Array.isArray(all) && all.length > 0) {
        for (const n of all) {
          await page.request.delete(`${apiBase}/api/v1/notifications/${n.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Business-Code": xBiz,
            },
          });
        }
      }

      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(bellButton).toBeVisible({ timeout: 10000 });
    }

    await expect(unreadBadge).toBeVisible({ timeout: 20000 });

    await page
      .waitForResponse((res) => res.url().includes("/notifications/check"), {
        timeout: 15000,
      })
      .catch(() => {});

    await page.waitForTimeout(3000);

    await bellButton.click();

    const dropdown = page.locator("div.fixed.z-\\[9999\\]");
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const markAllBtn = dropdown.getByText(/Marcar todo/);
    await expect(markAllBtn).toBeVisible({ timeout: 5000 });

    const readAllResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/notifications/read-all") && res.status() === 200,
      { timeout: 10000 },
    );
    await markAllBtn.click();
    await readAllResponse;

    await page.waitForTimeout(2000);

    await page
      .waitForResponse((res) => res.url().includes("/notifications/summary"), {
        timeout: 10000,
      })
      .catch(() => {});

    await expect(unreadBadge).toBeHidden({ timeout: 15000 });

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(bellButton).toBeVisible({ timeout: 10000 });

    await page
      .waitForResponse((res) => res.url().includes("/notifications/check"), {
        timeout: 15000,
      })
      .catch(() => {});

    await page
      .waitForResponse((res) => res.url().includes("/notifications/summary"), {
        timeout: 10000,
      })
      .catch(() => {});

    await page.waitForTimeout(3000);

    const badgeAfterReload = bellButton.locator(".bg-red-500");
    const badgeVisible = await badgeAfterReload.isVisible().catch(() => false);
    expect(badgeVisible).toBe(false);
  });
});
