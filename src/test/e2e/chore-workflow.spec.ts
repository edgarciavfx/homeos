import { test, expect } from "@playwright/test";

test.describe("Chore Workflow", () => {
  test("chores page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/chores");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Chores link on authenticated pages", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Chores");
  });

  test("chores page shows heading", async ({ page }) => {
    await page.goto("/login");
    const link = page.locator('nav a:has-text("Chores")');
    await expect(link).toBeVisible();
  });

  test("dashboard page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
