import { test, expect } from "@playwright/test";
import { ClientLogin } from "../../POM/login";
import { HomePage } from "../../POM/homepage";
import { beforeEach } from "node:test";
import { clickButtonByName } from "../../utils/navigationHelper";
import { getRandomInt } from "../../utils/dataHelper";

const userData = require("../../data/accountData.json");

let clientLogin;
let homepage;
let adjustment;

test.describe("When logging into the platform", () => {
  let accounts = userData.get;
  accounts.forEach((user) => {
    test.beforeEach(async ({ page }) => {
      clientLogin = new ClientLogin(page);
      homepage = new homepage(page);
      await clientLogin.loginUser(user.email, user.password);
      await expect(homepage.myAccountButton).toBeVisible();
    });

    test("I can view my monthly contributions and they display the correct values", async () => {
      let type;
      if (user.fixed === false) {
        type = "Percentage";
      } else {
        type = "Monthly Fixed";
      }
      await expect(homepage.contributionType).toBe(type);
      await expect(homepage.contributionValue).toBe(user.amount);
    });
  });
});

test.describe("When trying to update my monthly contribution", () => {
  test.beforeEach(async ({ page }) => {
    clientLogin = new ClientLogin(page);
    homepage = new homepage(page);
    adjustment = new adjustment(page);
    await clientLogin.loginUser(userData.post.email, userData.post.password);
    await expect(homepage.myAccountButton).toBeVisible();
  });

  test("I can update my contribution to a fixed rate", async ({ page }) => {
    let newAmount = getRandomInt(1000);

    await clickButtonByName(page, "Update Contribution");
    await expect(page.locator("#input.contribution")).toBeVisible();

    await adjustment.changeContType.selectOption("Fixed");
    await adjustment.changeContAmount.selectOption(newAmount);
    await clickButtonByName(page, "Submit");

    await expect(page.locator(".modal").locator(".modalBody")).toContainText(
      "Your contributions have been updated"
    );
    await clickButtonByName(page, "Close");

    //checking the contribution has updated on the homepage
    const contributionType = homepage.returnContributionType;
    const contributionValue = homepage.returnContributionValue;

    await expect(contributionType).toBe("Fixed");
    await expect(contributionValue).toBe(newAmount.toString());
  });

  test("I can update my contribution to a percentage rate", async ({
    page,
  }) => {
    let newAmount = getRandomInt(20);

    await clickButtonByName(page, "Update Contribution");
    await expect(page.locator("#input.contribution")).toBeVisible();

    await adjustment.changeContType.selectOption("Percentage");
    await adjustment.changeContAmount.selectOption(newAmount);
    await clickButtonByName(page, "Submit");

    await expect(page.locator(".modal").locator(".modalBody")).toContainText(
      "Your contributions have been updated"
    );
    await clickButtonByName(page, "Close");

    //checking the contribution has updated on the homepage
    const contributionType = homepage.returnContributionType;
    const contributionValue = homepage.returnContributionValue;

    await expect(contributionType).toBe("Percentage");
    await expect(contributionValue).toBe(newAmount.toString());
  });

  test("I cannot enter more than 100 for a percentage rate", async ({
    page,
  }) => {
    await clickButtonByName(page, "Update Contribution");
    await expect(page.locator("#input.contribution")).toBeVisible();

    await adjustment.changeContType.selectOption("Percentage");
    await adjustment.changeContAmount.selectOption(101);

    await expect(await page.locator("div.warning").textContent()).toBe(
      "You cannot enter over 100% for your percentage contribution"
    );
    await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  let type = ["fixed", "percentage"];
  type.forEach((type: string) => {
    test(`I can only enter exact amounts for a ${type} contriburtion`, async ({
      page,
    }) => {
      let amount;

      type == "fixed" ? (amount = 20.1) : (amount = 250.7);

      await clickButtonByName(page, "Update Contribution");
      await expect(page.locator("#input.contribution")).toBeVisible();

      await adjustment.changeContType.selectOption(type);
      await adjustment.changeContAmount.selectOption(amount);
      await expect(await page.locator("div.warning").textContent()).toBe(
        "You must enter an exact number for a contribution"
      );

      await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
    });
  });
});
