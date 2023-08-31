const { test, expect } = require("@playwright/test");
import { apiBodySchema } from "../../utils/bodyChecker";

const userData = require("../../data/accountData.json");

test.describe.only("When reaching the get account endpoint", () => {
  let accounts = userData.get;
  accounts.forEach((user) => {
    //test repeats for all the users we have in the json file accountData.json
    test(`I can GET my current account details for ${user.userId}`, async ({
      request,
      baseURL,
    }) => {
      let url = `${baseURL}/account/${user.userId}`;
      const response = await request.get(url);
      await expect(response.status()).toBe(200); //status code check
      const respBody = await response.json(); //capture the response body
      await expect(respBody.accountId).toBe(user.userId); //assert the response body has the values we expect
      await expect(respBody.contribution.fixed).toBe(user.fixed);
      await expect(respBody.contribution.amount).toBe(user.amount);
      await expect(respBody).toMatchZodSchema(apiBodySchema);
    });
  });

  test("I recieve an error if i do not use an integer as a user id", async ({
    request,
    baseURL,
  }) => {
    {
      let url = `${baseURL}/account/NaN`;
      const response = await request.get(url);
      await expect(response.status()).toBe(400);
      const respBody = await response.json();
      await expect(respBody.error).toBe("not a valid account");
      await expect(respBody.message).toBe(
        "please enter an integer as an account id"
      );
    }
  });

  test("I recieve an error if my account does not exist", async ({
    request,
    baseURL,
  }) => {
    {
      let url = `${baseURL}/account/3548734085723`;
      const response = await request.get(url);
      await expect(response.status()).toBe(404);
      const respBody = await response.json();
      await expect(respBody.error).toBe("not found");
    }
  });
});
