import { expect, test } from "@playwright/test";
import { open } from "./helpers";

test("the pup actor boots on the homepage and hides the static buddies", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("html")).toHaveAttribute("data-pup", "live");
  await expect(page.locator(".pup-layer")).toBeVisible();
  await expect(page.locator(".tp-hero .pup-stop .pup-buddy")).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps the static scenes: no curtain, actor, pinning or replay", async ({ page }) => {
    await open(page, "/");
    await expect(page.locator(".tp-curtain")).toBeHidden();
    await expect(page.locator("html")).not.toHaveAttribute("data-pup", /.+/);
    await expect(page.locator(".tp-meet")).not.toHaveAttribute("data-pinned", /.+/);
    await expect(page.locator(".tp-msg-group[data-show=true]")).toHaveCount(3);
    await expect(page.locator(".pup-buddy[data-live]")).toHaveCount(0);
    // Links still navigate, without the curtain.
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/\/faq$/);
  });
});

test("keyboard: the skip link comes first and lands on the main content", async ({ page }) => {
  await open(page, "/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("keyboard: every tab stop on the homepage shows a focus ring", async ({ page }) => {
  await open(page, "/");
  const unringed: string[] = [];
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const ringed = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
      return { ringed: ringed || cs.boxShadow !== "none", name: `${el.tagName} ${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 30)}` };
    });
    if (info && !info.ringed) unringed.push(info.name);
  }
  expect(unringed).toEqual([]);
});
