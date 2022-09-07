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
import refreshTokenRule from "./refreshTokenRule";

describe("refresh token request must be set correctly", () => {
  it("errors on missing scope", async () => {
    const resultsForMissingScope = await refreshTokenRule.check({
      document: {
        grant_types: ["authorization_code", "refresh_token"],
      },
    });
    expect(resultsForMissingScope).toHaveLength(1);
    expect(resultsForMissingScope[0].title).toMatch(
      /Invalid Refresh Token request/
    );
  });

  it("errors on explicitly missing scope", async () => {
    const resultsForMissingScopeExplicit = await refreshTokenRule.check({
      document: {
        grant_types: ["authorization_code", "refresh_token"],
        scope: "openid webid",
      },
    });
    expect(resultsForMissingScopeExplicit).toHaveLength(1);
    expect(resultsForMissingScopeExplicit[0].title).toMatch(
      /Invalid Refresh Token request/
    );
  });

  it("errors on missing grant type", async () => {
    const resultsForMissingGrantType = await refreshTokenRule.check({
      document: {
        scope: "openid webid offline_access",
      },
    });
    expect(resultsForMissingGrantType).toHaveLength(1);
    expect(resultsForMissingGrantType[0].title).toMatch(
      /Invalid Refresh Token request/
    );
  });

  it("errors on explicitly missing grant type", async () => {
    const resultsForMissingGrantTypeExplicit = await refreshTokenRule.check({
      document: {
        grant_types: ["authorization_code"],
        scope: "openid webid offline_access",
      },
    });
    expect(resultsForMissingGrantTypeExplicit).toHaveLength(1);
    expect(resultsForMissingGrantTypeExplicit[0].title).toMatch(
      /Invalid Refresh Token request/
    );
  });

  it("succeeds for valid request", async () => {
    const resultsForSuccess = await refreshTokenRule.check({
      document: {
        grant_types: ["authorization_code", "refresh_token"],
        scope: "openid webid offline_access",
      },
    });
    expect(resultsForSuccess).toHaveLength(1);
    expect(resultsForSuccess[0].title).toMatch(/Refresh Token rules are met/);
  });
});
