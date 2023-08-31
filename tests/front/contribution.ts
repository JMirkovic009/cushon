import { test, expect } from "@playwright/test";
import { ClientLogin } from "../../POM/login";
import { HomePage } from "../../POM/homepage";
import { beforeEach } from "node:test";
import { clickButtonByName } from "../../utils/navigationHelper";
import { getRandomInt } from "../../utils/dataHelper";
import { queryDb } from "../../utils/sqlHelper";

const userData = require("../../data/accountData.json");

let clientLogin;
let homepage;
let adjustment;

test.describe("When logging into the platform", () => {
  //cycling through each user in our json data
  let accounts = userData.get;
  accounts.forEach((user) => {
    test.beforeEach(async ({ page }) => {
      //before each to get us to a state for the folowing tests of checking the contributions
      clientLogin = new ClientLogin(page); //initiate the POMS
      homepage = new homepage(page);
      await clientLogin.loginUser(user.email, user.password); //log in with the userData provided
      await expect(homepage.myAccountButton).toBeVisible(); //when this is visible, log in has been successful
    });

    test("I can view my monthly contributions and they display the correct values", async () => {
      let type;
      if (user.fixed === false) {
        //checks which type to expect based on userData
        type = "Percentage";
      } else {
        type = "Monthly Fixed";
      }

      //validating the contributions to check they are as expected
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

    //assert that the modal appears showing we have updated our contributions
    await expect(page.locator(".modal").locator(".modalBody")).toContainText(
      "Your contributions have been updated"
    );
    await clickButtonByName(page, "Close");

    //checking the contribution has updated on the homepage
    const contributionType = homepage.returnContributionType;
    const contributionValue = homepage.returnContributionValue;

    await expect(contributionType).toBe("Fixed");
    await expect(contributionValue).toBe(newAmount.toString());

    //writing a query that will get me the clients details
    let query = `SELECT rateType, amount FROM client.userData where userData = ${userData.post.userId}`;
    let res = await queryDb(query);

    //checking that the details match the ones we have set out at the start of the test
    await expect(res[0].rateType).toBe(type);
    await expect(res[0].amount).toBe(newAmount);
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

      //turnary to  decide if the amount needs to be a percentage or an fixed amount
      type == "fixed" ? (amount = 20.1) : (amount = 250.7);

      await clickButtonByName(page, "Update Contribution");
      await expect(page.locator("#input.contribution")).toBeVisible();

      //entering the contribution type
      await adjustment.changeContType.selectOption(type);
      //entering the contribution amount
      await adjustment.changeContAmount.fill(amount);
      await expect(await page.locator("div.warning").textContent()).toBe(
        "You must enter an exact number for a contribution"
      );

      await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
    });
  });
});
