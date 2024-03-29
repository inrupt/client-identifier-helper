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
import validClientName from "./validClientName";

describe("well-formed client name check", () => {
  it("fails on empty client name", async () => {
    const resultsForEmptyClientName = await validClientName.check({
      document: { client_name: "" },
    });
    expect(resultsForEmptyClientName).toHaveLength(1);
    expect(resultsForEmptyClientName[0].title).toMatch(/Missing Client Name/);
  });

  it("fails on invalid `client_name` object", async () => {
    const resultsForInvalidClientName = await validClientName.check({
      document: { client_name: ["arrays are invalid client names"] },
    });
    expect(resultsForInvalidClientName).toHaveLength(1);
    expect(resultsForInvalidClientName[0].title).toMatch(/Invalid Client Name/);
  });

  it("warns on whitespace client name", async () => {
    const resultsForLongClientName = await validClientName.check({
      document: {
        client_name: "   ",
      },
    });
    expect(resultsForLongClientName).toHaveLength(1);
    expect(resultsForLongClientName[0].description).toMatch(
      /The Client Name consists of whitespace only/
    );
  });

  it("warns on long client name", async () => {
    const resultsForLongClientName = await validClientName.check({
      document: {
        client_name:
          "this is a super long client name that will likely not be rendered nicely",
      },
    });
    expect(resultsForLongClientName).toHaveLength(1);
    expect(resultsForLongClientName[0].title).toMatch(/Long Client Name/);
  });

  it("passes on decent client name", async () => {
    const resultsForValidClientName = await validClientName.check({
      document: {
        client_name: "My regular app",
      },
    });
    expect(resultsForValidClientName).toHaveLength(0);
  });
});
