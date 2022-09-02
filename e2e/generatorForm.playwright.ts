//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

// how do I fix this? Apparently jest lint thinks,
// the test down here is a jest and not a playwright test
/* eslint-disable jest/no-standalone-expect */

// eslint-disable-next-line no-shadow
import { test as it, test, expect, type Page } from "@playwright/test";
import {
  DEFAULT_CLIENT_ID,
  DEFAULT_CLIENT_NAME,
  DEFAULT_CLIENT_HOMEPAGE,
  DEFAULT_CLIENT_REDIRECT_URI,
  DEFAULT_CLIENT_LOGO_URI,
  DEFAULT_CLIENT_POLICY_URI,
  DEFAULT_CLIENT_TOS_URI,
  DEFAULT_CLIENT_EMAIL,
} from "./constants";

async function fillEssentialFieldsWithDefaults(page: Page) {
  await page.locator("[name=clientId]").fill(DEFAULT_CLIENT_ID);
  await page.locator("[name=clientName]").fill(DEFAULT_CLIENT_NAME);
  await page.locator("[name=clientUri]").fill(DEFAULT_CLIENT_HOMEPAGE);

  await page
    .locator(`[name="redirectUris.0"]`)
    .fill(`${DEFAULT_CLIENT_REDIRECT_URI}1`);
}

async function clickAndGenerateDocument(page: Page) {
  await page.locator("[name=generateDocument]").click();

  return JSON.parse(await page.locator("[name=generatedJson]").inputValue());
}

async function fillUserFacingFieldsWithDefaults(page: Page) {
  // open user information fields accordion
  await page.locator(".userInformationFields").click();

  // Fill logo URI.
  await page.locator('input[name="logoUri"]').click();
  await page.locator('input[name="logoUri"]').fill(DEFAULT_CLIENT_LOGO_URI);

  // Fill policy URI.
  await page.locator('input[name="logoUri"]').press("Tab");
  await page.locator('input[name="policyUri"]').fill(DEFAULT_CLIENT_POLICY_URI);

  // Fill terms of service URI.
  await page.locator('input[name="policyUri"]').press("Tab");
  await page.locator('input[name="tosUri"]').fill(DEFAULT_CLIENT_TOS_URI);

  // Fill contact mail.
  await page.locator('input[name="tosUri"]').press("Tab");
  await page.locator('input[name="contact"]').fill(DEFAULT_CLIENT_EMAIL);
}

async function fillTechnicalFields(page: Page) {
  await page.locator(".advancedFields").click();

  // Select application type native.
  await page.locator('div[role="button"]:has-text("Web Application")').click();
  await page
    .locator('li[role="option"]:has-text("Native Application")')
    .click();

  // Set default max age.
  await page.locator('input[name="defaultMaxAge"]').click();
  await page.locator('input[name="defaultMaxAge"]').fill("3600");

  // Request a time of authentication claim.
  await page.locator("text=Request a time of authentication claim").click();
}

test.describe("Generator page functionality", () => {
  it("has title Client Identifier Helper", async ({ page }) => {
    await page.goto("/generator");

    await expect(page).toHaveTitle(/Client Identifier Helper/);
  });

  it("root redirects to generator page", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/.*generator/);
  });

  it("creates essential document with two redirect URIs", async ({ page }) => {
    await page.goto("/generator");
    await fillEssentialFieldsWithDefaults(page);

    // Add two redirect URIs, delete one.
    await page.locator("[name=addRedirectUri]").click();
    await page
      .locator(`[name="redirectUris.1"]`)
      .fill(`${DEFAULT_CLIENT_REDIRECT_URI}2`);
    await page.locator("[name=addRedirectUri]").click();
    await page
      .locator(`[name="redirectUris.2"]`)
      .fill(`${DEFAULT_CLIENT_REDIRECT_URI}3`);
    await page.locator(`[name="removeRedirectUri.1"]`).click();

    const clientIdentifierDocument = await clickAndGenerateDocument(page);

    expect(clientIdentifierDocument.client_id).toMatch(DEFAULT_CLIENT_ID);
    expect(clientIdentifierDocument.client_name).toMatch(DEFAULT_CLIENT_NAME);
    expect(clientIdentifierDocument.client_uri).toMatch(
      DEFAULT_CLIENT_HOMEPAGE
    );
  });

  it("creates document with all user-facing fields", async ({ page }) => {
    await page.goto("/generator");
    await fillEssentialFieldsWithDefaults(page);
    await fillUserFacingFieldsWithDefaults(page);

    const clientIdentifierDocument = await clickAndGenerateDocument(page);
    expect(clientIdentifierDocument.logo_uri).toBe(DEFAULT_CLIENT_LOGO_URI);
    expect(clientIdentifierDocument.policy_uri).toBe(DEFAULT_CLIENT_POLICY_URI);
    expect(clientIdentifierDocument.tos_uri).toBe(DEFAULT_CLIENT_TOS_URI);
    expect(clientIdentifierDocument?.contacts[0]).toBe(DEFAULT_CLIENT_EMAIL);
  });

  it("creates document with technical fields", async ({ page }) => {
    await page.goto("/generator");
    await fillEssentialFieldsWithDefaults(page);
    await fillTechnicalFields(page);

    const clientIdentifierDocument = await clickAndGenerateDocument(page);
    expect(clientIdentifierDocument.application_type).toBe("native");
    expect(clientIdentifierDocument.default_max_age).toBe(3600);
    expect(clientIdentifierDocument.require_auth_time).toBe(true);
  });

  it("creates fully configured document", async ({ page }) => {
    await page.goto("/generator");
    await fillEssentialFieldsWithDefaults(page);
    await fillUserFacingFieldsWithDefaults(page);
    await fillTechnicalFields(page);

    const clientIdentifierDocument = await clickAndGenerateDocument(page);
    expect(clientIdentifierDocument.logo_uri).toBe(DEFAULT_CLIENT_LOGO_URI);
    expect(clientIdentifierDocument.policy_uri).toBe(DEFAULT_CLIENT_POLICY_URI);
    expect(clientIdentifierDocument.tos_uri).toBe(DEFAULT_CLIENT_TOS_URI);
    expect(clientIdentifierDocument?.contacts[0]).toBe(DEFAULT_CLIENT_EMAIL);

    expect(clientIdentifierDocument.application_type).toBe("native");
    expect(clientIdentifierDocument.default_max_age).toBe(3600);
    expect(clientIdentifierDocument.require_auth_time).toBe(true);
  });
});
