import { expect, test } from "@playwright/test";
import { writerStorageStatePath } from "./support/env";

test("redirects unauthenticated dashboard visits to the login screen", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("renders the branded login shell", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByText("Human-in-the-loop bilingual publishing."),
  ).toBeVisible();
});

test("redirects sign-up attempts back to the login screen", async ({ page }) => {
  await page.goto("/login/create");
  await expect(page).toHaveURL(/\/login\?mode=signup-disabled/);
  await expect(page.getByText("Public sign-up is disabled")).toBeVisible();
});

test("writer accounts are blocked from the editor queue", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: writerStorageStatePath,
  });
  const page = await context.newPage();

  await page.goto("/dashboard");
  await expect(page.getByText("Your article pipeline")).toBeVisible({
    timeout: 30_000,
  });
  await page.goto("/editor/queue");
  await expect(page.getByText("Editor access required")).toBeVisible();

  await context.close();
});
