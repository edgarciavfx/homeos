import { test, expect } from "@playwright/test";

test("app renders login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h1")).toContainText("HomeOS");
});
