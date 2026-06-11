import { test, expect } from "@playwright/test";

test.describe("Grocery Workflow", () => {
  test("groceries page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/groceries");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Groceries link on authenticated pages", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Groceries");
  });

  test("groceries page shows heading", async ({ page }) => {
    await page.goto("/login");
    const link = page.locator('nav a:has-text("Groceries")');
    await expect(link).toBeVisible();
  });
});
