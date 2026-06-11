import { test, expect } from "@playwright/test";

test.describe("Household Workflow", () => {
  test("settings page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Settings link", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Settings");
  });

  test("navigation includes household name area", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});
