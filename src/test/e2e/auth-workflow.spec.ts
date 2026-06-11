import { test, expect } from "@playwright/test";

test.describe("Auth Workflow", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page has required elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page has required elements", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.locator('a:has-text("Register")');
    await expect(registerLink).toBeVisible();
  });

  test("all protected routes redirect to login", async ({ page }) => {
    const protectedRoutes = [
      "/dashboard",
      "/planning",
      "/meals",
      "/groceries",
      "/chores",
      "/budget",
      "/settings",
    ];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
