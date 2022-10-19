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
import decentClientName from "./noLocalhostClientId";

describe("well-formed client name check", () => {
  it("warns on localhost client_id", async () => {
    const resultsForLocalhostClientId = await decentClientName.check({
      document: { client_id: "http://localhost:1234" },
    });
    expect(resultsForLocalhostClientId).toHaveLength(1);
    expect(resultsForLocalhostClientId[0].title).toMatch(
      /Client Identifier uses localhost/
    );
  });

  it("passes on valid client_id", async () => {
    const resultsForLocalhostClientId = await decentClientName.check({
      document: { client_id: "http://app.example" },
    });
    expect(resultsForLocalhostClientId).toHaveLength(0);
  });

  it("passes on invalid client_id", async () => {
    const resultsForLocalhostClientId = await decentClientName.check({
      document: { client_id: "not a uri" },
    });
    expect(resultsForLocalhostClientId).toHaveLength(0);
  });
});
