import { test, expect } from "@playwright/test";

test.describe("Meal Workflow", () => {
  test("meals page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/meals");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigation includes Meals link", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toContainText("Meals");
  });

  test("create meal page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/meals/create");
    await expect(page).toHaveURL(/\/login/);
  });

  test("meal detail page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/meals/some-meal-id");
    await expect(page).toHaveURL(/\/login/);
  });
});
