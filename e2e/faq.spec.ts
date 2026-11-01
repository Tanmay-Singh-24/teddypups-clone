import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// 4. Searching narrows the board to matching notes, unfolds them and marks the words.
test("FAQ search highlights, expands and resets", async ({ page }) => {
  await open(page, "/faq");
  const search = page.getByLabel("sniff out a question");
  const notes = page.locator(".tp-notes__list > li");
  await expect(notes).toHaveCount(9);

  await search.fill("deliver");
  await expect(page.getByText("1 note found")).toBeVisible();
  await expect(notes).toHaveCount(1);
  await expect(notes.first().getByRole("button")).toHaveAttribute("aria-expanded", "true");
  await expect(notes.first().locator("mark").first()).toHaveText(/deliver/i);

  await search.fill("zzz");
  await expect(page.getByText("No note about “zzz” yet.")).toBeVisible();

  await search.fill("");
  await expect(page.getByText("9 notes on the board")).toBeVisible();
  await expect(notes).toHaveCount(9);
});

test("FAQ notes unfold one at a time", async ({ page }) => {
  await open(page, "/faq");
  const first = page.getByRole("button", { name: "Are your puppies vaccinated and health-checked?" });
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Do you deliver?" }).click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
});
