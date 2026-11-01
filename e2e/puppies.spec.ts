import { expect, test } from "@playwright/test";
import { open } from "./helpers";

// 3. Filter chips update the URL and the count; Clear filters resets both.
test("puppy filters sync to the URL", async ({ page }) => {
  await open(page, "/puppies");
  const count = page.getByText(/puppies? (looking for a home|match)/);
  await expect(count).toHaveText("15 puppies looking for a home");

  await page.getByRole("button", { name: "Pomeranian" }).click();
  await expect(page).toHaveURL(/\?breed=pomeranian$/);
  await expect(count).toHaveText("4 puppies match");

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/puppies$/);
  await expect(count).toHaveText("15 puppies looking for a home");
});

// 5. Profile gallery: next/prev and the counter, the full-screen viewer, Esc.
test("puppy gallery steps and opens the viewer", async ({ page }) => {
  await open(page, "/puppies/maltipoo-max-male");
  const counter = page.getByText(/^1 \/ \d+$/);
  const total = (await counter.textContent())!.split("/")[1].trim();
  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(page.getByText(`2 / ${total}`)).toBeVisible();
  await page.getByRole("button", { name: "Previous photo" }).click();
  await expect(page.getByText(`1 / ${total}`)).toBeVisible();

  await page.getByRole("button", { name: /^Open Max, photo 1 of \d+ full screen$/ }).click();
  const viewer = page.getByRole("dialog", { name: "Max photos" });
  await expect(viewer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("profile links to the previous and next pups", async ({ page }) => {
  await open(page, "/puppies/maltipoo-max-male");
  const nav = page.getByRole("navigation", { name: "More puppies" });
  await expect(nav.getByRole("link")).toHaveCount(2);
  await nav.getByRole("link").last().click();
  await expect(page).not.toHaveURL(/maltipoo-max-male/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
