import { Page } from "@playwright/test";

export async function clickButtonByName(
  page: Page,
  name: string,
  instance: number = 0 //the nth iteration of the button
) {
  await page
    .getByRole("button", { name: `${name}`, exact: true })
    .nth(instance)
    .click();
}

export async function waitForResponse(
  page: Page,
  url: string,
  status: number = 200
) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(url) && response.status() === status
  );
}
