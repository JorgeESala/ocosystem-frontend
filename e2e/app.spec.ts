import { test, expect } from "@playwright/test";

test("app loads and shows login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ocosistema/i);
});

test("login page has email and password fields", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator(
      'input[type="email"], input[name="email"], input[placeholder*="email" i]',
    ),
  ).toBeVisible();
  await expect(
    page.locator('input[type="password"], input[name="password"]'),
  ).toBeVisible();
});
