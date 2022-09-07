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
import validScope from "./validScope";

describe("valid `scope` field check", () => {
  it("errors on non-string `scope` field", async () => {
    const resultsForInvalid = await validScope.check({
      document: {
        scope: ["openid", "webid"],
      },
    });
    expect(resultsForInvalid).toHaveLength(1);
    expect(resultsForInvalid[0].description).toMatch(/must be a string/);
  });

  it("errors on unset `scope` field", async () => {
    const resultsForUnset = await validScope.check({
      document: {
        scope: undefined,
      },
    });
    expect(resultsForUnset).toHaveLength(1);
    expect(resultsForUnset[0].title).toMatch(/Scope field not set/);
  });

  it("errors on missing `webid` and `openid` scope", async () => {
    const resultsForEmpty = await validScope.check({
      document: {
        scope: "profile",
      },
    });
    expect(resultsForEmpty).toHaveLength(2);
    expect(resultsForEmpty[0].title).toMatch(/Missing.*openid/);
    expect(resultsForEmpty[1].title).toMatch(/Missing.*webid/);
  });

  it("errors on duplicates", async () => {
    const resultsForDuplicates = await validScope.check({
      document: {
        scope: "openid webid profile profile",
      },
    });
    expect(resultsForDuplicates).toHaveLength(1);
    expect(resultsForDuplicates[0].title).toMatch(/Duplicate Scope values/);
  });

  it("infos for unknown scope field", async () => {
    const resultsForUnknowns = await validScope.check({
      document: {
        scope: "openid webid custom_scope",
      },
    });
    expect(resultsForUnknowns).toHaveLength(1);
    expect(resultsForUnknowns[0].title).toMatch(/Unknown Scope value/);
  });

  it("succeeds on correctly set `openid webid` scope", async () => {
    const resultsForSuccess = await validScope.check({
      document: {
        scope: "openid\t webid",
      },
    });
    expect(resultsForSuccess).toHaveLength(1);
    expect(resultsForSuccess[0].title).toMatch(/looks fine/);
  });
});
