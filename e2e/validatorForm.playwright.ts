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

/* eslint-disable jest/no-standalone-expect */
// eslint-disable-next-line no-shadow
import { test, expect, type Page } from "@playwright/test";
import {
  VALID_CLIENT_IDENTIFIER_DOCUMENT_URI,
  VALID_CLIENT_IDENTIFIER_DOCUMENT,
} from "./constants";

async function openValidatorPage(page: Page) {
  await page.goto("/");
  // Open validator page
  await page.locator(".openValidatorPage").click();
}

async function goToValidatorFormAndValidateFromString(
  page: Page,
  clientIdentifierDocument: string
) {
  await openValidatorPage(page);

  // Fill jsonDocument paste area with a basic valid document
  await page.locator("[name=jsonDocument]").fill(clientIdentifierDocument);

  // Click validate button
  await page.locator("[name=validateDocument]").click();

  await page.waitForTimeout(400);
}

async function goToValidatorPageAndValidateFromDocumentIri(
  page: Page,
  documentIri: string
) {
  await openValidatorPage(page);

  // enter Client Identifier URI
  await page.locator('input[name="clientIdentifierUri"]').fill(documentIri);

  // Click button Fetch & Validate
  await page.locator("text=Fetch & Validate").click();

  // wait until validation is done, i.e. button is re-enabled
  await page.waitForFunction(
    () =>
      !document
        .querySelector("[name=fetchDocument]")
        ?.classList.contains("Mui-disabled")
  );
}

test.describe("Validator page", () => {
  test("validates valid pasted JSON document", async ({ page }) => {
    // go and validate valid document
    await goToValidatorFormAndValidateFromString(
      page,
      VALID_CLIENT_IDENTIFIER_DOCUMENT
    );

    // expect no validation errors
    await expect(
      await page.locator(`.validationResults [data-testid="ErrorIcon"]`).count()
    ).toBe(0);
    // expect no successes
    await expect(
      await page
        .locator(`.validationResults [data-testid="CheckCircleIcon"]`)
        .count()
    ).toBeGreaterThan(0);
  });

  test("validates invalid pasted document", async ({ page }) => {
    // go and validate invalid string
    await goToValidatorFormAndValidateFromString(page, "invalid document");

    // expect validation errors
    expect(
      await page.locator(`.validationResults [data-testid=ErrorIcon]`).count()
    ).toBeGreaterThan(0);
  });

  test("validates valid remote document", async ({ page }) => {
    await goToValidatorPageAndValidateFromDocumentIri(
      page,
      VALID_CLIENT_IDENTIFIER_DOCUMENT_URI
    );

    // Expect remote document validity to be successful.
    expect(
      await page
        .locator(
          "text=Dereferenced Client Identifier and declared `client_id` match"
        )
        .count()
    ).toBe(1);
  });

  test("validates invalid remote document URI", async ({ page }) => {
    await goToValidatorPageAndValidateFromDocumentIri(
      page,
      "this is not a uri"
    );
    // expect the first result to be unsuccessful
    await expect(
      await page
        .locator(`.MuiPaper-root`)
        .first()
        .locator(`[data-testid="ErrorIcon"]`)
        .count()
    ).toBe(1);
  });

  test("validation buttons are disabled during remote validation", async ({
    page,
  }) => {
    await openValidatorPage(page);

    // enter Client Identifier URI
    await page
      .locator('input[name="clientIdentifierUri"]')
      .fill(VALID_CLIENT_IDENTIFIER_DOCUMENT_URI);

    // Click button Fetch & Validate
    await page.locator("text=Fetch & Validate").click();

    // expect the validation buttons to be disabled
    // as the document validation is being requested remotely
    await expect(page.locator("[name=fetchDocument]")).toBeDisabled();
    await expect(page.locator("[name=validateDocument]")).toBeDisabled();
  });

  test("pastes fetched documents into the document text field", async ({
    page,
  }) => {
    await openValidatorPage(page);

    // Fill document text field with text to be overwritten.
    await page.locator("[name=jsonDocument]").fill("Placeholder");

    // Fill Client Identifier URI.
    await page
      .locator('input[name="clientIdentifierUri"]')
      .fill(VALID_CLIENT_IDENTIFIER_DOCUMENT_URI);

    // Fetch document
    await page.locator("text=Fetch & Validate").click();

    // Wait until remote validation is finished.
    await page.locator(".MuiLoadingButton-root:enabled").waitFor();

    // Expect document text area to be overwritten (with Client Identifier Document).
    await expect(page.locator("[name=jsonDocument]")).not.toHaveText(
      "Placeholder"
    );
  });

  test("does not replace document text field on failed remote fetch", async ({
    page,
  }) => {
    await openValidatorPage(page);

    // Fill document text field with data to be overwritten.
    await page.locator("[name=jsonDocument]").fill("Placeholder");

    // Fill Client Identifier URI.
    await page
      .locator('input[name="clientIdentifierUri"]')
      .fill("https://not-a-client-id.example/");

    // Fetch document
    await page.locator("text=Fetch & Validate").click();

    // Wait until remote validation is finished.
    await page.locator(".MuiLoadingButton-root:enabled");

    // Expect document text field to not have been overwritten.
    await expect(page.locator("[name=jsonDocument]")).toHaveText("Placeholder");
  });

  test("starts remote validation on enter", async ({ page }) => {
    await openValidatorPage(page);

    // Fill Client Identifier URI.
    await page
      .locator('input[name="clientIdentifierUri"]')
      .fill(VALID_CLIENT_IDENTIFIER_DOCUMENT_URI);

    // Hit Enter.
    await page.keyboard.press("Enter");

    // Expect validation to have been initiated.
    await expect(page.locator("[name=fetchDocument]")).toBeDisabled();
  });

  test("starts local validation on shift+enter key", async ({ page }) => {
    await openValidatorPage(page);

    // Fill Client Identifier text area.
    await page.locator("[name=jsonDocument]").fill("{}");

    // Hit Control+Enter.
    await page.keyboard.press("Control+Enter");

    // Expect validation results to be shown.
    await expect(page.locator("text=Validation Results")).toBeVisible();
  });
});
