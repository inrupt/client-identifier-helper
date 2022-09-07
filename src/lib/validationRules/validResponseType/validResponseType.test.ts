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
import validResponseType from "./validResponseType";

describe("response type must be valid or unset", () => {
  it("errors if `response_type` is not an array", async () => {
    const resultsForInvalid = await validResponseType.check({
      document: {
        response_types: "invalid type",
      },
    });
    expect(resultsForInvalid).toHaveLength(1);
    expect(resultsForInvalid[0].title).toMatch(/Invalid `response_types`/);
  });

  it("warns if response type has more than `code` set", async () => {
    const resultsForTooMany = await validResponseType.check({
      document: {
        response_types: ["code", "any other invalid type"],
      },
    });
    expect(resultsForTooMany).toHaveLength(1);
    expect(resultsForTooMany[0].title).toMatch(/has more values than expected/);
  });

  it("errors if response type is missing `code`", async () => {
    const resultsForMissing = await validResponseType.check({
      document: {
        response_types: ["some value"],
      },
    });
    expect(resultsForMissing).toHaveLength(1);
    expect(resultsForMissing[0].title).toMatch(
      /Missing value in `response_types`/
    );
  });

  it("passes on correct response type", async () => {
    const resultsForSuccessExplicit = await validResponseType.check({
      document: {
        response_types: ["code"],
      },
    });
    expect(resultsForSuccessExplicit).toHaveLength(0);
  });

  it("passes on empty/implicit correct response type", async () => {
    const resultsForSuccessImplicit = await validResponseType.check({
      document: {
        response_types: undefined,
      },
    });
    expect(resultsForSuccessImplicit).toHaveLength(0);
  });
});
