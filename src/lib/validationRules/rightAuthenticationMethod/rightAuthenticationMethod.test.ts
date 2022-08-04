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
import { describe, expect, test } from "@jest/globals";
import rightAuthenticationMethod from "./rightAuthenticationMethod";

describe("authentication method must be explicitly set to none", () => {
  test("errors on unset authentication method", async () => {
    const resultsForNoAuthMethod = await rightAuthenticationMethod.check({
      document: {
        token_endpoint_auth_method: undefined,
      },
    });
    expect(resultsForNoAuthMethod).toHaveLength(1);
    expect(resultsForNoAuthMethod[0].title).toMatch(
      /Field `token_endpoint_auth_method` unset/
    );
  });

  test("errors on wrong authentication method", async () => {
    const resultsForWrongAuthMethod = await rightAuthenticationMethod.check({
      document: {
        token_endpoint_auth_method: "client_basic_secret",
      },
    });
    expect(resultsForWrongAuthMethod).toHaveLength(1);
    expect(resultsForWrongAuthMethod[0].title).toMatch(/must be set to `none`/);
  });

  test("succeeds on right authentication method (`none`)", async () => {
    const resultsForSuccess = await rightAuthenticationMethod.check({
      document: {
        token_endpoint_auth_method: "none",
      },
    });
    expect(resultsForSuccess).toHaveLength(1);
    expect(resultsForSuccess[0].title).toMatch(/looks fine/);
  });
});
