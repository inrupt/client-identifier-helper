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
import validRedirectUris from "./validRedirectUris";

describe("redirect URIs must be syntactically correct and should be static", () => {
  it("errors on invalid `redirect_uris` type", async () => {
    const resultsForWrongType = await validRedirectUris.check({
      document: {
        redirect_uris: "https://no-array-example/",
      },
    });
    expect(resultsForWrongType).toHaveLength(1);
    expect(resultsForWrongType[0].title).toMatch(/Redirect URIs field invalid/);
  });

  it("errors on empty `redirect uris`", async () => {
    const resultsForEmptyRedirectUris = await validRedirectUris.check({
      document: {
        redirect_uris: [],
      },
    });
    expect(resultsForEmptyRedirectUris).toHaveLength(1);
    expect(resultsForEmptyRedirectUris[0].title).toMatch(
      /No Redirect URIs set/
    );
  });

  it("errors on malformed redirect URI", async () => {
    const resultsForMalformedRedirectUri = await validRedirectUris.check({
      document: {
        redirect_uris: ["this-is-no-uri.example/"],
      },
    });
    expect(resultsForMalformedRedirectUri).toHaveLength(1);
    expect(resultsForMalformedRedirectUri[0].title).toMatch(
      /Redirect URI is malformed/
    );
  });

  it("warns for missing URI path", async () => {
    const resultsForMissingRedirectUriPath = await validRedirectUris.check({
      document: {
        redirect_uris: ["https://my-app.example"],
      },
    });
    expect(resultsForMissingRedirectUriPath).toHaveLength(1);
    expect(resultsForMissingRedirectUriPath[0].title).toMatch(
      /Redirect URI should have a path/
    );
  });

  it("warns for non-static redirect URIs", async () => {
    const resultsForRedirectUriWithSearchParameters =
      await validRedirectUris.check({
        document: {
          redirect_uris: ["https://my-app.example/callback?someState=myState"],
        },
      });
    expect(resultsForRedirectUriWithSearchParameters).toHaveLength(1);
    expect(resultsForRedirectUriWithSearchParameters[0].title).toMatch(
      /Redirect URI has search parameters/
    );
  });

  it("succeeds for valid redirect URIs", async () => {
    const resultsForSuccess = await validRedirectUris.check({
      document: {
        redirect_uris: ["https://my-app.example/callback"],
      },
    });
    expect(resultsForSuccess).toHaveLength(0);
  });
});
