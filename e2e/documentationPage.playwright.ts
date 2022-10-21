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

import { test as it, test, expect, type Page } from "@playwright/test";
import { ValidationRule } from "../src/lib/types";
import { localRules, remoteRules } from "../src/lib/validationRules";

const compareRuleByName = (rule1: ValidationRule, rule2: ValidationRule) =>
  rule1.rule.name.localeCompare(rule2.rule.name);

const rulesOrderedByRemoteAndName = [
  ...remoteRules.sort(compareRuleByName),
  ...localRules.sort(compareRuleByName),
];

test.describe("Generator page functionality", () => {
  it("shows all rule titles in the right order", async ({ page }) => {
    await page.goto("/documentation");

    const ruleNames = await page
      .locator(".RulesContainer h3")
      .allTextContents();

    expect(rulesOrderedByRemoteAndName.map((r) => r.rule.name)).toEqual(
      ruleNames
    );
  });

  it("rules have the right result outputs", async ({ page }) => {
    await page.goto("/documentation");

    const accordions = await page.locator(".RulesContainer .MuiAccordion-root");

    // Validate each rule's result titles. Expects the rules to be in the right order.
    rulesOrderedByRemoteAndName.forEach(async (_, i) => {
      // Open accordion;
      await accordions.nth(i).click();
      const headings = await accordions
        .nth(i)
        .locator(".MuiCardHeader-root")
        .allTextContents();

      // Check each result title.
      for (let j = 0; j < headings.length; j += 1) {
        expect(headings[j]).toEqual(
          Object.values(rulesOrderedByRemoteAndName[i].resultDescriptions)[j]
            .title
        );
      }
    });
  });
});
