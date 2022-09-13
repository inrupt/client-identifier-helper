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

/* eslint-disable-next-line no-shadow */
import { describe, expect, it } from "@jest/globals";
import { OIDC_CONTEXT } from "../../types";
import validContext from "./validContext";

describe("json ld @context field must be set correctly", () => {
  it("errors on missing context", async () => {
    const resultsForMissingContext = await validContext.check({
      document: {},
    });
    expect(resultsForMissingContext).toHaveLength(1);
    expect(resultsForMissingContext[0].title).toMatch(
      /`@context` field missing/
    );
  });

  it("errors on invalid context", async () => {
    const resultsForInvalidContext = await validContext.check({
      document: {
        "@context": "https://wrong context",
      },
    });
    expect(resultsForInvalidContext).toHaveLength(1);
    expect(resultsForInvalidContext[0].title).toMatch(
      /@context must be set correctly/
    );
  });

  it("errors on empty context", async () => {
    const resultsForEmptyContext = await validContext.check({
      document: {
        "@context": [],
      },
    });
    expect(resultsForEmptyContext).toHaveLength(1);
    expect(resultsForEmptyContext[0].title).toMatch(
      /@context must be set correctly/
    );
  });

  it("errors on additional context values", async () => {
    const resultsForAdditionalContext = await validContext.check({
      document: {
        "@context": [OIDC_CONTEXT, "https://custom-schema.example/schema1"],
      },
    });
    expect(resultsForAdditionalContext).toHaveLength(1);
    expect(resultsForAdditionalContext[0].title).toMatch(
      /@context must be set correctly/
    );
  });

  it("succeeds on valid context", async () => {
    const resultsForSuccess1 = await validContext.check({
      document: {
        "@context": OIDC_CONTEXT,
      },
    });
    expect(resultsForSuccess1).toHaveLength(1);
    expect(resultsForSuccess1[0].title).toMatch(
      /Document has valid json\+ld context/
    );
  });

  it("succeeds on valid context set as array", async () => {
    const resultsForSuccess2 = await validContext.check({
      document: {
        "@context": [OIDC_CONTEXT],
      },
    });
    expect(resultsForSuccess2).toHaveLength(1);
    expect(resultsForSuccess2[0].title).toMatch(
      /Document has valid json\+ld context/
    );
  });
});
