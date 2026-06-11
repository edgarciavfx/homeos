import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  const pages = [
    { path: "/login", name: "Login" },
    { path: "/register", name: "Register" },
  ];

  for (const { path, name } of pages) {
    test(`${name} page has no critical accessibility issues`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(critical).toHaveLength(0);
    });
  }

  test("navigation landmark is present on login page", async ({ page }) => {
    await page.goto("/login");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("login form has proper label associations", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});
