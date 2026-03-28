import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createArticleFixture } from "./support/articles";
import {
  editorStorageStatePath,
  writerStorageStatePath,
} from "./support/env";

async function openContextPage(
  context: BrowserContext,
  url: string,
) {
  const page = await context.newPage();
  await page.goto(url);
  return page;
}

async function primeWriterSession(page: Page) {
  await page.goto("/dashboard");
  await expect(page.getByText("Your article pipeline")).toBeVisible({
    timeout: 30_000,
  });
}

async function primeEditorSession(page: Page) {
  await page.goto("/editor/queue");
  await expect(page.getByText("Articles waiting for review")).toBeVisible({
    timeout: 30_000,
  });
}

async function waitForStatus(page: Page, status: string) {
  await expect(page.getByText(status, { exact: true })).toBeVisible({
    timeout: 30_000,
  });
}

test("covers the writer, editor, and public publishing workflow", async ({
  browser,
}) => {
  const article = createArticleFixture();

  const writerContext = await browser.newContext({
    storageState: writerStorageStatePath,
  });
  const writerPage = await openContextPage(writerContext, "/");
  await primeWriterSession(writerPage);
  await writerPage.goto("/articles/new");

  await expect(writerPage.getByText("Start a new English draft")).toBeVisible();

  await writerPage.getByLabel("Headline").fill(article.headline);
  await expect(writerPage.getByLabel("Slug")).toHaveValue(article.slug);
  await writerPage.getByLabel("Deck").fill(article.deck);
  await writerPage.getByLabel("Byline").fill(article.byline);
  await writerPage.getByLabel("Hero image URL").fill(article.heroImageUrl);
  await writerPage.getByLabel("Hero caption").fill(article.heroImageCaption);
  await writerPage.getByLabel("Hero alt text").fill(article.heroImageAlt);
  await writerPage.getByLabel("Body").fill(article.body);

  await writerPage.getByRole("button", { name: "Save Draft" }).click();
  await expect(writerPage).toHaveURL(/\/articles\/j[a-z0-9]+$/);
  await waitForStatus(writerPage, "DRAFT");

  const articlePath = new URL(writerPage.url()).pathname;
  const englishPath = `/en/articles/${article.slug}`;
  const filipinoPath = `/fil/articles/${article.slug}`;

  await writerPage.getByRole("button", { name: "Submit for Translation" }).click();
  await waitForStatus(writerPage, "NEEDS REVIEW");
  await expect(writerPage.getByLabel("Headline")).toBeDisabled();
  await expect(
    writerPage.getByText("Editing is locked", { exact: true }),
  ).toBeVisible();
  await expect(
    writerPage.getByRole("button", { name: "Save Draft" }),
  ).toBeDisabled();

  const editorContext = await browser.newContext({
    storageState: editorStorageStatePath,
  });
  const queuePage = await openContextPage(editorContext, "/");
  await primeEditorSession(queuePage);

  await expect(queuePage.getByText(article.headline)).toBeVisible({
    timeout: 30_000,
  });
  await queuePage
    .getByRole("row", { name: new RegExp(article.headline) })
    .getByRole("link", { name: "Open review" })
    .click();

  await expect(queuePage.getByText("English source", { exact: true })).toBeVisible();
  await expect(queuePage.getByText(article.headline)).toBeVisible();
  await expect(queuePage.getByText("Filipino draft", { exact: true })).toBeVisible();

  await queuePage.getByRole("button", { name: "Reject & Return to Writer" }).click();
  await queuePage.getByLabel("Required editor note").fill(article.rejectionNote);
  await queuePage
    .getByRole("button", { name: "Reject & Return to Writer" })
    .click();
  await expect(queuePage).toHaveURL(/\/editor\/queue$/);

  await writerPage.goto(articlePath);
  await waitForStatus(writerPage, "DRAFT");
  await expect(writerPage.getByText("Latest editor note")).toBeVisible();
  await expect(
    writerPage.getByText(article.rejectionNote, { exact: true }),
  ).toBeVisible();

  await writerPage.getByRole("button", { name: "Submit for Translation" }).click();
  await waitForStatus(writerPage, "NEEDS REVIEW");

  await queuePage.goto("/editor/queue");
  await expect(queuePage.getByText(article.headline)).toBeVisible({
    timeout: 30_000,
  });
  await queuePage
    .getByRole("row", { name: new RegExp(article.headline) })
    .getByRole("link", { name: "Open review" })
    .click();

  await queuePage.getByRole("button", { name: "Re-translate" }).click();
  await expect(
    queuePage.getByText(
      "Re-translation requested. Refreshing the Filipino draft.",
    ),
  ).toBeVisible();
  await waitForStatus(queuePage, "NEEDS REVIEW");

  await queuePage.getByLabel("Headline").fill(article.editedTranslation.headline);
  await queuePage.getByLabel("Deck").fill(article.editedTranslation.deck);
  await queuePage.getByLabel("Body").fill(article.editedTranslation.body);
  await queuePage.getByRole("button", { name: "Save Filipino edits" }).click();
  await expect(queuePage.getByText("Filipino edits saved.")).toBeVisible();

  await queuePage.getByRole("button", { name: "Approve & Publish" }).click();
  await expect(queuePage).toHaveURL(new RegExp(`${filipinoPath}$`));
  await expect(
    queuePage.getByText("AI-assisted translation disclosure"),
  ).toBeVisible();
  await expect(queuePage.getByText(article.editedTranslation.headline)).toBeVisible();
  await queuePage.goto(`/editor/review/${articlePath.split("/").at(-1)}`);
  await expect(queuePage.getByText("Review unavailable")).toBeVisible();

  const guestContext = await browser.newContext();
  const guestPage = await openContextPage(guestContext, filipinoPath);
  await expect(guestPage.getByText(article.editedTranslation.headline)).toBeVisible();
  await guestPage.getByRole("link", { name: "English", exact: true }).click();
  await expect(guestPage).toHaveURL(new RegExp(`${englishPath}$`));
  await expect(
    guestPage.getByRole("heading", { name: article.headline }),
  ).toBeVisible();

  await guestContext.close();
  await writerContext.close();
  await editorContext.close();
});

test("returns the app 404 state for /editor/review/new", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: editorStorageStatePath,
  });
  const page = await context.newPage();

  await primeEditorSession(page);
  await page.goto("/editor/review/new");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

  await context.close();
});
