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
import validGrantTypes from "./validGrantTypes";

describe("grant types must be known and valid for Solid OIDC", () => {
  it("errors on unset `grant_types`", async () => {
    const resultsForUndefined = await validGrantTypes.check({
      document: {
        grant_types: undefined,
      },
    });
    expect(resultsForUndefined).toHaveLength(1);
    expect(resultsForUndefined[0].title).toMatch(/No Grant Type set/);
  });

  it("errors on invalid `grant_types` object", async () => {
    const resultsForWrongType = await validGrantTypes.check({
      document: {
        grant_types: "this is not an array",
      },
    });
    expect(resultsForWrongType).toHaveLength(1);
    expect(resultsForWrongType[0].description).toMatch(/must be an array/);
  });

  it("errors on missing grant type `authorization_code`", async () => {
    const resultsForNoAuthCode = await validGrantTypes.check({
      document: {
        grant_types: [],
      },
    });
    expect(resultsForNoAuthCode).toHaveLength(1);
    expect(resultsForNoAuthCode[0].title).toMatch(/Missing Grant Type/);
  });

  it("errors on present grant type `implicit`", async () => {
    const resultsForImplicit = await validGrantTypes.check({
      document: {
        grant_types: ["implicit", "authorization_code"],
      },
    });
    expect(resultsForImplicit).toHaveLength(1);
    expect(resultsForImplicit[0].description).toMatch(
      /implicit .* not allowed/
    );
  });

  it("errors on duplicate grant types", async () => {
    const resultsForDuplicates = await validGrantTypes.check({
      document: {
        grant_types: ["authorization_code", "authorization_code"],
      },
    });
    expect(resultsForDuplicates).toHaveLength(1);
    expect(resultsForDuplicates[0].description).toMatch(/duplicate values/);
  });

  it("infos for unknown grant types", async () => {
    const resultsForUnknown = await validGrantTypes.check({
      document: {
        grant_types: ["misspelled grant type", "authorization_code"],
      },
    });
    expect(resultsForUnknown).toHaveLength(1);
    expect(resultsForUnknown[0].title).toMatch(/Unknown Grant Types/);
  });

  it("succeeds on valid grant types", async () => {
    const resultsForSuccess = await validGrantTypes.check({
      document: {
        grant_types: ["authorization_code"],
      },
    });
    expect(resultsForSuccess).toHaveLength(1);
    expect(resultsForSuccess[0].title).toMatch(/look fine/);
  });
});
