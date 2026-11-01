import { expect, test } from "@playwright/test";
import { open, PHONE } from "./helpers";

// 2. Desktop nav (through the page curtain) and the mobile menu dialog.
test("desktop nav links route through the curtain", async ({ page }) => {
  await open(page, "/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Puppies", exact: true }).click();
  await expect(page).toHaveURL(/\/puppies$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Available puppies");
  await expect(page.locator(".tp-curtain")).toHaveAttribute("data-state", "idle");
  await nav.getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/\/faq$/);
});

test.describe("phone", () => {
  test.use({ viewport: PHONE });

  test("menu dialog opens, closes on Esc, and a link closes it", async ({ page }) => {
    await open(page, "/");
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Menu" }).click();
    await dialog.getByRole("link", { name: "Visit & contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(dialog).toBeHidden();
  });

  // 9. Phones get the WhatsApp/Call bar and the Menu button instead of the nav.
  test("bottom bar and Menu button at 375px", async ({ page }) => {
    await open(page, "/");
    await expect(page.locator("[data-whatsapp-bar]")).toBeVisible();
    await expect(page.getByRole("link", { name: "WhatsApp us" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  });
});
