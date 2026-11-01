import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// 6. Puppy enquiry: inline errors first, then the success card (no Resend key, so it only logs).
test("enquiry form validates, then succeeds", async ({ page }) => {
  await open(page, "/puppies/maltipoo-max-male");
  const form = page.locator("form", { has: page.getByRole("button", { name: "Send enquiry" }) });
  await form.getByRole("button", { name: "Send enquiry" }).click();
  await expect(form.getByRole("alert")).toContainText("Please check the highlighted details");
  await expect(form.getByText("Please tell us your name.")).toBeVisible();
  await expect(form.getByLabel(/Your name/)).toHaveAttribute("aria-invalid", "true");

  await form.getByLabel(/Your name/).fill("Test Visitor");
  await form.getByLabel(/Phone or WhatsApp/).fill("+971 50 000 0000");
  await form.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("status")).toContainText("Message received!");
  await expect(page).toHaveURL(/\/puppies\/maltipoo-max-male$/);
});

// 7. Contact letter: errors list, then the post box and the "sent" card.
test("contact letter posts and shows the sent card", async ({ page }) => {
  await open(page, "/contact");
  await page.getByRole("button", { name: "Post my letter" }).click();
  await expect(page.locator(".tp-letterform__alert")).toContainText("Please tell us your name.");

  await page.getByLabel("Your name (required)").fill("Test Visitor");
  await page.getByLabel(/Phone or WhatsApp number/).fill("+971 50 000 0000");
  await page.getByLabel("Puppy you're interested in (optional)").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Post my letter" }).click();
  await expect(page.getByRole("status")).toContainText("Message received!", { timeout: 10_000 });
  await expect(page.getByRole("link", { name: "WhatsApp us" }).first()).toBeVisible();
});
