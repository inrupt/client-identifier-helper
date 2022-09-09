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
import sameDomainForRedirectUris from "./sameDomainForRedirectUris";

describe("redirect URIs should be located on the same domain", () => {
  it("warns if redirect URIs are on different domains", async () => {
    const resultsForDifferentDomains = await sameDomainForRedirectUris.check({
      document: {
        redirect_uris: [
          "https://remote.example/callback1",
          "https://remote2.example/callback1",
        ],
      },
    });
    expect(resultsForDifferentDomains).toHaveLength(1);
    expect(resultsForDifferentDomains[0].title).toMatch(
      /Multiple redirect URI domains/
    );
  });

  it("ignores on invalid `redirect_uris` object", async () => {
    const resultsForInvalid = await sameDomainForRedirectUris.check({
      document: {
        redirect_uris: "https://invalid-redirect_uris.example",
      },
    });
    // Invalid types are handled elsewhere.
    expect(resultsForInvalid).toHaveLength(0);
  });

  it("ignores on invalid redirect URIs", async () => {
    const resultsForInvalid2 = await sameDomainForRedirectUris.check({
      document: {
        redirect_uris: ["invalid uri"],
      },
    });
    // Invalid types are handled elsewhere.
    expect(resultsForInvalid2).toHaveLength(0);
  });

  it("succeeds for redirect URIs on same domain", async () => {
    const resultsForSuccess = await sameDomainForRedirectUris.check({
      document: {
        redirect_uris: [
          "https://remote.example/callback1",
          "https://remote.example/callback2",
        ],
      },
    });
    expect(resultsForSuccess).toHaveLength(0);
  });
});
