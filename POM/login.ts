import { Locator, Page } from "@playwright/test";
import { config } from "dotenv";

config();

export class ClientLogin {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly device: Locator;
  readonly rememberMe: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.locator("#email");
    this.password = page.locator("#password");
    this.rememberMe = page.locator("#remember");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async visit() {
    await this.page.goto(process.env.BASE_URL!);
  }

  async loginUser(name, password) {
    await this.email.fill(name);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
