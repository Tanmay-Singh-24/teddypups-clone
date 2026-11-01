import type { Page } from "@playwright/test";

/** Opens a page and waits until React has hydrated it (the network has gone quiet). */
export async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

export const PHONE = { width: 375, height: 812 };
