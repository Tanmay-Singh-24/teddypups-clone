import { expect, test } from "@playwright/test";

// 1. Every sitemap route returns 200, has exactly one h1 and logs no console errors.
test("every sitemap route renders cleanly", async ({ page, request }) => {
  test.setTimeout(180_000);
  const xml = await (await request.get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(paths).toHaveLength(49);

  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(`${page.url()}: ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`${page.url()}: ${err.message}`));

  for (const path of paths) {
    const res = await page.goto(path, { waitUntil: "load" });
    expect(res?.status(), path).toBe(200);
    await expect(page.locator("h1"), path).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

// 8. An unknown puppy is a real 404 with the LOST poster.
test("unknown puppy slug shows the LOST poster", async ({ page }) => {
  const res = await page.goto("/puppies/no-such-pup");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "LOST" })).toBeVisible();
  await expect(page.getByText("this page has wandered off")).toBeVisible();
});
