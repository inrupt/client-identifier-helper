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
import noMixedRedirectUrls from "./noMixedRedirectUrls";

describe("remote and localhost redirect URIs should not be mixed", () => {
  test("errors on mixed URIs", async () => {
    const resultsForMixedLocalRemote = await noMixedRedirectUrls.check({
      document: {
        redirect_uris: [
          "http://localhost:1234/callback",
          "https://remote.example/callback",
        ],
      },
    });
    expect(resultsForMixedLocalRemote).toHaveLength(1);
    expect(resultsForMixedLocalRemote[0].title).toMatch(
      /Mixed localhost and remote redirect URIs/
    );
  });
  test("ignores on invalid redirect URIs object", async () => {
    const resultsForInvalid1 = await noMixedRedirectUrls.check({
      document: {
        redirect_uris: "https://invalid-redirect_uris.example",
      },
    });
    // invalid types are handled elsewhere
    expect(resultsForInvalid1).toHaveLength(0);
  });
  test("ignores on invalid redirect URIs", async () => {
    const resultsForInvalid2 = await noMixedRedirectUrls.check({
      document: {
        redirect_uris: ["invalid uri"],
      },
    });
    // invalid types are handled elsewhere
    expect(resultsForInvalid2).toHaveLength(0);
  });

  test("succeeds for localhost only redirect URIs", async () => {
    const resultsForSuccessLocalHost = await noMixedRedirectUrls.check({
      document: {
        redirect_uris: [
          "http://localhost:1234/callback1",
          "http://localhost:1234/callback2",
          "http://127.0.0.1:1234/callback3",
          "http://127.0.0.23:1234/callback4",
          "http://[::1]:1234/callback5",
        ],
      },
    });
    expect(resultsForSuccessLocalHost).toHaveLength(0);
  });

  test("succeeds for remote only redirect URIs", async () => {
    const resultsForSuccessRemote = await noMixedRedirectUrls.check({
      document: {
        redirect_uris: [
          "https://remote.example/callback1",
          "https://remote.example/callback2",
        ],
      },
    });
    expect(resultsForSuccessRemote).toHaveLength(0);
  });
});
