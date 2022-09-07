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
import redirectUrisApplicationTypeRule from "./redirectUrisApplicationTypeRule";

describe("redirect URIs must be valid", () => {
  it("errors on invalid `redirect_uris` field", async () => {
    const resultsForInvalid1 = await redirectUrisApplicationTypeRule.check({
      document: {
        redirect_uris: "https://invalid-redirect_uris.example",
      },
    });
    // invalid types are handled elsewhere
    expect(resultsForInvalid1).toHaveLength(0);
  });

  it("errors on invalid redirect URI", async () => {
    const resultsForInvalid2 = await redirectUrisApplicationTypeRule.check({
      document: {
        redirect_uris: ["invalid uri"],
      },
    });
    // invalid types are handled elsewhere
    expect(resultsForInvalid2).toHaveLength(0);
  });

  it("errors on non-tls redirect URI", async () => {
    const resultsForWebHttp = await redirectUrisApplicationTypeRule.check({
      document: {
        application_type: "web",
        redirect_uris: ["http://my-app.example/callback"],
      },
    });
    expect(resultsForWebHttp).toHaveLength(1);
    expect(resultsForWebHttp[0].title).toMatch(
      /Insecure http for Redirect URI/
    );
  });

  it("errors on wrong URI-scheme for application type `web`", async () => {
    const resultsForWebCustomScheme =
      await redirectUrisApplicationTypeRule.check({
        document: {
          application_type: "web",
          redirect_uris: ["customScheme://my-app.example/callback"],
        },
      });
    expect(resultsForWebCustomScheme).toHaveLength(1);
    expect(resultsForWebCustomScheme[0].title).toMatch(
      /Wrong protocol for Redirect URI/
    );
  });

  it("errors on remote redirect URI for application type `native`", async () => {
    const resultsForNativeRemote = await redirectUrisApplicationTypeRule.check({
      document: {
        application_type: "native",
        redirect_uris: [
          "https://my-app.example/callback",
          "http://my-app.example/callback",
        ],
      },
    });
    expect(resultsForNativeRemote).toHaveLength(2);
    expect(resultsForNativeRemote[0].title).toMatch(/No remote http/);
    expect(resultsForNativeRemote[1].title).toMatch(/No remote http/);
  });

  it("passes for valid redirect URIs for application type `web`", async () => {
    const resultsForSuccessWebLocal =
      await redirectUrisApplicationTypeRule.check({
        document: {
          application_type: "web",
          redirect_uris: [
            "http://localhost/callback",
            "https://localhost/callback",
          ],
        },
      });
    expect(resultsForSuccessWebLocal).toHaveLength(0);
  });

  it("passes for valid localhost redirect URIs for application type `native`", async () => {
    const resultsForSuccessWebRemote =
      await redirectUrisApplicationTypeRule.check({
        document: {
          application_type: "web",
          redirect_uris: [
            "https://my-app.example/callback",
            "https://my-app.example/callback",
          ],
        },
      });
    expect(resultsForSuccessWebRemote).toHaveLength(0);

    const resultsForSuccessNativeLocal =
      await redirectUrisApplicationTypeRule.check({
        document: {
          application_type: "native",
          redirect_uris: [
            "http://localhost:123/callback",
            "http://[::1]/callback]",
            "http://127.0.0.123/callback]",
            "https://localhost:123/callback",
            "https://[::1]/callback]",
            "https://127.0.0.123/callback]",
          ],
        },
      });
    expect(resultsForSuccessNativeLocal).toHaveLength(0);
  });

  it("passes for valid custom scheme redirect URIs for application type `native`", async () => {
    const resultsForSuccessNativeCustom =
      await redirectUrisApplicationTypeRule.check({
        document: {
          application_type: "native",
          redirect_uris: ["customScheme://localhost/callback"],
        },
      });
    expect(resultsForSuccessNativeCustom).toHaveLength(0);
  });
});
