import { test, expect } from "@playwright/test";
import { getRandomInt } from "../../utils/dataHelper";

const userData = require("../../data/accountData.json");

test.describe("When reaching the post account endpoint", () => {
  test(`I can POST updates to my contributions`, async ({
    request,
    baseURL,
  }) => {
    let fixed: boolean = true; //in reality I would get the current fixed and make it use the other
    let amount: number = getRandomInt(1000); //and if fixed, the number wouldnt be higher than 100 due to how percentages work

    let url = `${baseURL}/account/`;
    const response = await request.post(url, {
      params: {
        user: userData.post.userId,
        fixed: fixed,
        amount: amount,
      },
    });

    await expect(response.status()).toBe(201);

    const respBody = await response.json();
    await expect(respBody.accountId).toBe(userData.post.userId);
    await expect(respBody.contribution.fixed).toBe(fixed);
    await expect(respBody.contribution.amount).toBe(amount);

    //if I had access to a SQL server I would then run a query and assert against the response, checking that the database had indeed updated
  });

  test("I can not POST an amount that is not a whole number", async ({
    request,
    baseURL,
  }) => {
    let value = 50.1;
    let url = `${baseURL}/account/`;
    const response = await request.post(url, {
      params: {
        user: userData.post.userId,
        fixed: true,
        amount: value,
      },
    });

    await expect(response.status()).toBe(422);

    const respBody = await response.json();
    await expect(respBody.error).toBe(`${value} is not a valid amount`);
    await expect(respBody.message).toBe("please enter an integer as an amount");
  });
});
