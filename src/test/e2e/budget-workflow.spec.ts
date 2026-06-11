import { test, expect } from "@playwright/test";

test.describe("Budget Workflow", () => {
  test("budget page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/budget");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Budget link", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Budget");
  });

  test("login page shows Budget in navigation", async ({ page }) => {
    await page.goto("/login");
    const link = page.locator('nav a:has-text("Budget")');
    await expect(link).toBeVisible();
  });
});
