import { test, expect } from "@playwright/test";

test.describe("Planning Workflow", () => {
  test("planning page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/planning");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Planning link", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Planning");
  });

  test("login page shows Planning in navigation", async ({ page }) => {
    await page.goto("/login");
    const link = page.locator('nav a:has-text("Planning")');
    await expect(link).toBeVisible();
  });
});
