import { Locator, Page } from "@playwright/test";
import { waitForResponse } from "../utils/navigationHelper";

export class HomePage {
  readonly page: Page;
  readonly changeContType: Locator;
  readonly changeContAmount: Locator;
  readonly submitbutton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.changeContType = this.page.locator("input").nth(0);
    this.changeContAmount = this.page.locator("input").nth(1);
    this.submitbutton = this.page.getByRole("button", { name: "Submit" });
  }

  async enterChange(type: string, amount: number) {
    await this.changeContType.selectOption(type);
    await this.changeContAmount.fill(amount.toString());
    const response = waitForResponse(this.page, "update/contribution/", 200);
    await this.submitbutton.click();
    await response;
  }
}
