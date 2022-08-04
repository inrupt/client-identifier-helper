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
import staticClientIDUri from "./staticClientIDUri";

describe("Client Identifier URIs must be static", () => {
  test("ignores for invalid `client_id` object", async () => {
    const resultsForInvalid1 = await staticClientIDUri.check({
      document: {
        client_id: ["not a string"],
      },
    });
    expect(resultsForInvalid1).toHaveLength(0);
  });

  test("ignores for invalid `client_id` URI field", async () => {
    const resultsForInvalid2 = await staticClientIDUri.check({
      document: {
        client_id: "malformed URI",
      },
    });
    expect(resultsForInvalid2).toHaveLength(0);
  });

  test("warns for Client Identifier URI with search params", async () => {
    const resultsForSearchParameters = await staticClientIDUri.check({
      document: {
        client_id:
          "https://my-app.example/client-identifier?someState=currentState",
      },
    });
    expect(resultsForSearchParameters).toHaveLength(1);
    expect(resultsForSearchParameters[0].title).toMatch(
      /Search parameters in Client Identifier URI/
    );
  });

  test("passes for plain Client Identifier URI", async () => {
    const resultsForSuccess = await staticClientIDUri.check({
      document: {
        client_id: "https://my-app.example/client-identifier",
      },
    });
    expect(resultsForSuccess).toHaveLength(0);
  });
});
