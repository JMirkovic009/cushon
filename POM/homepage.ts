import { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly contributionType: Locator;
  readonly contributionValue: Locator;
  readonly myAccountButton: Locator;
  readonly updateContribution: Locator;
  readonly contactUs: Locator;
  readonly logOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contributionType = page
      .locator("#clientInfo")
      .locator("div.info-panel")
      .nth(0);
    this.contributionValue = page
      .locator("#clientInfo")
      .locator("div.info-panel")
      .nth(1);
    this.myAccountButton = page.getByRole("button", {
      name: "Account Settings",
    });
    this.contactUs = page.getByRole("link", { name: "Contat Us" });
    this.logOutButton = page.getByRole("button", { name: "Logout" });
  }

  async returnContributionType() {
    return await this.contributionType.textContent();
  }

  async returnContributionValue() {
    return await this.contributionValue.textContent();
  }
}
