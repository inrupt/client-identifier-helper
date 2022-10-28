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
import validUriFields from "./validUriFields";

describe("URI fields must be valid URIs (and some set) check", () => {
  it("errors on empty client_id", async () => {
    const resultsForEmpty = await validUriFields.check({
      document: {
        client_id: "",
      },
    });
    expect(resultsForEmpty).toHaveLength(5);
    resultsForEmpty.forEach((result) => {
      expect(result.title).toMatch(/URI not set/);
    });
  });

  it("errors on non-string URI", async () => {
    const resultsForInvalidClientIdObject = await validUriFields.check({
      document: {
        client_id: "https://my-client.example/clientid",
        client_uri: 1234,
        logo_uri: "https://my-client.example/logo",
        tos_uri: "https://my-client.example/terms-of-service",
        policy_uri: "https://my-client.example/policy",
      },
    });
    expect(resultsForInvalidClientIdObject).toHaveLength(2);
    expect(resultsForInvalidClientIdObject[1].title).toMatch(
      /URI field not a string/
    );
  });

  it("errors on malformed Client Identifier URI", async () => {
    const resultsForInvalidClientIdUri = await validUriFields.check({
      document: {
        client_id: "Invalid uri",
        client_uri: "https://my-client.example/about",
        logo_uri: "https://my-client.example/logo",
        tos_uri: "https://my-client.example/terms-of-service",
        policy_uri: "https://my-client.example/policy",
      },
    });
    expect(resultsForInvalidClientIdUri).toHaveLength(1);
    expect(resultsForInvalidClientIdUri[0].title).toMatch(/URI malformed/);
  });

  it("warns on non-https URI", async () => {
    const resultsForNoTlsLogoUri = await validUriFields.check({
      document: {
        client_id: "https://my-client.example/clientid",
        client_uri: "https://my-client.example/about",
        logo_uri: "http://my-client.example/logo",
        tos_uri: "https://my-client.example/terms-of-service",
        policy_uri: "https://my-client.example/policy",
      },
    });
    expect(resultsForNoTlsLogoUri).toHaveLength(2);
    expect(resultsForNoTlsLogoUri[1].title).toMatch(/URI does not use https/);
  });

  it("succeeds on well-formed Client Identifier URI", async () => {
    const resultsForValidClientIdUri = await validUriFields.check({
      document: {
        client_id: "https://my-client.example/client-id",
        client_uri: "https://my-client.example/about",
        logo_uri: "https://my-client.example/logo",
        tos_uri: "https://my-client.example/terms-of-service",
        policy_uri: "https://my-client.example/policy",
      },
    });
    expect(resultsForValidClientIdUri).toHaveLength(1);
    expect(resultsForValidClientIdUri[0].title).toMatch(
      /URI syntax looks good/
    );
  });
});
