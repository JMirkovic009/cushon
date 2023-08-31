import { test, expect } from "@playwright/test";
import { getRandomInt } from "../../utils/dataHelper";
import { queryDb } from "../../utils/sqlHelper";

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

    if (response.status() !== 200) {
      throw new Error(
        `Failed to update contribution. Status code: ${response.status()}`
      );
    }

    const respBody = await response.json();
    await expect(respBody.accountId).toBe(userData.post.userId);
    await expect(respBody.contribution.fixed).toBe(fixed);
    await expect(respBody.contribution.amount).toBe(amount);

    let query = `SELECT rateType, amount FROM client.userData where userData = ${userData.post.userId}`;
    let res = await queryDb(query);

    await expect(res[0].rateType).toBe("fixed");
    await expect(res[0].amount).toBe(amount);
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
