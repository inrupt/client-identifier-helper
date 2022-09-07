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
import noUnknownFields from "./noUnknownFields";

describe("all set Client Identifier Document fields should be known", () => {
  it("errors for unknown fields", async () => {
    const resultsForUnknownField = await noUnknownFields.check({
      document: {
        unknown_field1: "some value 1",
        unknown_field2: "some value 2",
      },
    });
    expect(resultsForUnknownField).toHaveLength(2);
    expect(resultsForUnknownField[0].title).toMatch(/Unknown field/);
    expect(resultsForUnknownField[1].title).toMatch(/Unknown field/);
  });
  it("succeeds for known fields only", async () => {
    const resultsForSuccess = await noUnknownFields.check({
      document: {
        client_id: "https://my-app.example/webid#this",
        client_name: "My app",
        redirect_uris: ["https://my-app.example/callback"],
        scope: "openid webid",
        grant_types: ["authorization_code"],
        // ... this test only checks for unknown fields, so we leave it here
      },
    });
    expect(resultsForSuccess).toHaveLength(0);
  });
});
