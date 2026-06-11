import { test, expect } from "@playwright/test";

test.describe("Dashboard Workflow", () => {
  test("dashboard page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Dashboard link", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Dashboard");
  });

  test("root path redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
