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
import applicationTypeWebOrNative from "./validApplicationType";

describe("application type must be set to `web` or `native`", () => {
  test("errors on invalid/unknown application type", async () => {
    const resultsForInvalidType = await applicationTypeWebOrNative.check({
      document: {
        application_type: "invalid",
      },
    });
    expect(resultsForInvalidType).toHaveLength(1);
    expect(resultsForInvalidType[0].title).toMatch(/Application Type invalid/);
  });

  test("passes on explicitly set application type", async () => {
    const resultsForSuccessExplicit = await applicationTypeWebOrNative.check({
      document: {
        application_type: "native",
      },
    });
    expect(resultsForSuccessExplicit).toHaveLength(0);
  });

  test("passes on implicitly set (i.e. unset) application type", async () => {
    const resultsForSuccessImplicit = await applicationTypeWebOrNative.check({
      document: {
        application_type: undefined,
      },
    });
    expect(resultsForSuccessImplicit).toHaveLength(0);
  });
});
