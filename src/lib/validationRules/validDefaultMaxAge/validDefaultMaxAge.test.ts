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
import validDefaultMaxAge from "./validDefaultMaxAge";

describe("`default_max_age` must be valid, unset, or should be set decently", () => {
  it("errors on negative max age", async () => {
    const resultsForInvalid = await validDefaultMaxAge.check({
      document: {
        default_max_age: -60,
      },
    });
    expect(resultsForInvalid).toHaveLength(1);
    expect(resultsForInvalid[0].title).toMatch(
      /Invalid `default_max_age` value/
    );
  });

  it("warns for small max age", async () => {
    const resultsForSmallValue = await validDefaultMaxAge.check({
      document: {
        default_max_age: 5,
      },
    });
    expect(resultsForSmallValue).toHaveLength(1);
    expect(resultsForSmallValue[0].title).toMatch(
      /Small `default_max_age` value/
    );
  });

  it("passes for decent max age", async () => {
    const resultsForUnset = await validDefaultMaxAge.check({
      document: {
        default_max_age: undefined,
      },
    });
    expect(resultsForUnset).toHaveLength(0);

    const resultsForWellSet = await validDefaultMaxAge.check({
      document: {
        default_max_age: 60 * 15,
      },
    });
    expect(resultsForWellSet).toHaveLength(0);
  });
});
