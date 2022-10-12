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
import { OIDC_CONTEXT } from "../types";
import generateDocument from "./generateDocument";

const DEFAULT_NAME = "My App";
const DEFAULT_CLIENT_IDENTIFIER = "https://app.example/id";
const DEFAULT_CLIENT_URI = "https://app.example/about";
const DEFAULT_REDIRECT_URI = "https://app.example/callback";
const DEFAULT_LOGO_URI = "https://app.example/logo";
const DEFAULT_TOS_URI = "https://app.example/tos";
const DEFAULT_POLICY_URI = "https://app.example/policy";
const DEFAULT_CONTACT = "maintainer@app.example";

describe("generateDocument creates correct Client Identifier Documents", () => {
  it("creates full document", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [`${DEFAULT_REDIRECT_URI}1`, `${DEFAULT_REDIRECT_URI}2`],
      useRefreshTokens: false,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contacts: [DEFAULT_CONTACT],
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 3600,
      compact: false,
    });

    const clientIdDocumentJson = JSON.parse(clientIdDocument);

    // essential user fields
    expect(clientIdDocumentJson.client_id).toBe(DEFAULT_CLIENT_IDENTIFIER);
    expect(clientIdDocumentJson.client_name).toBe(DEFAULT_NAME);
    expect(clientIdDocumentJson.client_uri).toBe(DEFAULT_CLIENT_URI);
    expect(clientIdDocumentJson.redirect_uris).toHaveLength(2);
    expect(clientIdDocumentJson.redirect_uris[0]).toBe(
      `${DEFAULT_REDIRECT_URI}1`
    );
    expect(clientIdDocumentJson.redirect_uris[1]).toBe(
      `${DEFAULT_REDIRECT_URI}2`
    );
    // optional user fields
    expect(clientIdDocumentJson.logo_uri).toBe(DEFAULT_LOGO_URI);
    expect(clientIdDocumentJson.tos_uri).toBe(DEFAULT_TOS_URI);
    expect(clientIdDocumentJson.policy_uri).toBe(DEFAULT_POLICY_URI);
    expect(clientIdDocumentJson.contacts).toHaveLength(1);
    expect(clientIdDocumentJson.contacts[0]).toBe(DEFAULT_CONTACT);
    // technical fields
    expect(clientIdDocumentJson["@context"]).toHaveLength(1);
    expect(clientIdDocumentJson["@context"][0]).toBe(OIDC_CONTEXT);
    expect(clientIdDocumentJson.grant_types).toHaveLength(1);
    expect(clientIdDocumentJson.grant_types[0]).toBe("authorization_code");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("openid");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("webid");
    expect(clientIdDocumentJson.token_endpoint_auth_method).toBe("none");
    expect(clientIdDocumentJson.application_type).toBe("web");
    expect(clientIdDocumentJson.require_auth_time).toBe(true);
    expect(clientIdDocumentJson.default_max_age).toBe(3600);
  });

  it("creates minimal document", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [DEFAULT_REDIRECT_URI],
      useRefreshTokens: false,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contacts: [],
      applicationType: "web",
    });
    const clientIdDocumentJson = JSON.parse(clientIdDocument);

    // essential user fields
    expect(clientIdDocumentJson.client_id).toBe(DEFAULT_CLIENT_IDENTIFIER);
    expect(clientIdDocumentJson.client_name).toBe(DEFAULT_NAME);
    expect(clientIdDocumentJson.client_uri).toBe(DEFAULT_CLIENT_URI);
    expect(clientIdDocumentJson.redirect_uris).toHaveLength(1);
    expect(clientIdDocumentJson.redirect_uris[0]).toBe(DEFAULT_REDIRECT_URI);
    expect(clientIdDocumentJson.contacts).toHaveLength(0);
    // technical fields
    expect(clientIdDocumentJson["@context"]).toHaveLength(1);
    expect(clientIdDocumentJson["@context"][0]).toBe(OIDC_CONTEXT);
    expect(clientIdDocumentJson.grant_types).toHaveLength(1);
    expect(clientIdDocumentJson.grant_types[0]).toBe("authorization_code");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("openid");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("webid");
    expect(clientIdDocumentJson.token_endpoint_auth_method).toBe("none");
    expect(clientIdDocumentJson.application_type).toBe("web");
  });

  it("creates document with refresh token", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [DEFAULT_REDIRECT_URI],
      useRefreshTokens: true,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contacts: [],
      applicationType: "web",
    });
    const clientIdDocumentJson = JSON.parse(clientIdDocument);
    expect(clientIdDocumentJson.grant_types).toContain("refresh_token");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("offline_access");
  });

  it("creates document with redirectUris and defaultMaxAge parameter as string", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: DEFAULT_REDIRECT_URI,
      useRefreshTokens: false,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contacts: [],
      applicationType: "web",
      defaultMaxAge: "3600",
    });

    const clientIdDocumentJson = JSON.parse(clientIdDocument);
    expect(clientIdDocumentJson.redirect_uris).toHaveLength(1);
    expect(clientIdDocumentJson.redirect_uris[0]).toBe(DEFAULT_REDIRECT_URI);
    expect(clientIdDocumentJson.default_max_age).toBe(3600);
  });

  it("passes invalid defaultMaxAge string parameter", async () => {
    // Invalid defaultMaxAge string parameters are passed,
    // to be able to be caught by validation.
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: DEFAULT_REDIRECT_URI,
      useRefreshTokens: false,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contacts: [],
      applicationType: "web",
      defaultMaxAge: "invalid string is passed",
    });

    const clientIdDocumentJson = JSON.parse(clientIdDocument);
    expect(clientIdDocumentJson.default_max_age).toBe(
      "invalid string is passed"
    );
  });

  it("creates compacted document", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: DEFAULT_REDIRECT_URI,
      useRefreshTokens: false,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contacts: [],
      applicationType: "web",
      compact: true,
    });
    const clientIdDocumentJson = JSON.parse(clientIdDocument);

    // essential user fields
    expect(clientIdDocumentJson.client_id).toBe(DEFAULT_CLIENT_IDENTIFIER);
    expect(clientIdDocumentJson.client_name).toBe(DEFAULT_NAME);
    expect(clientIdDocumentJson.client_uri).toBe(DEFAULT_CLIENT_URI);
    expect(clientIdDocumentJson.redirect_uris).toHaveLength(1);
    expect(clientIdDocumentJson.redirect_uris[0]).toBe(DEFAULT_REDIRECT_URI);
    // technical fields
    expect(clientIdDocumentJson["@context"]).toHaveLength(1);
    expect(clientIdDocumentJson["@context"][0]).toBe(OIDC_CONTEXT);
    expect(clientIdDocumentJson.grant_types).toHaveLength(1);
    expect(clientIdDocumentJson.grant_types[0]).toBe("authorization_code");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("openid");
    expect(clientIdDocumentJson.scope.split(" ")).toContain("webid");
    expect(clientIdDocumentJson.token_endpoint_auth_method).toBe("none");
    expect(clientIdDocumentJson.application_type).toBe("web");
  });

  it("has no unknown fields", async () => {
    const clientIdDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [`${DEFAULT_REDIRECT_URI}1`, `${DEFAULT_REDIRECT_URI}2`],
      useRefreshTokens: false,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contacts: [DEFAULT_CONTACT],
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 3600,
      compact: false,
    });

    const knownFields = new Set([
      "@context",
      "client_id",
      "client_name",
      "client_uri",
      "logo_uri",
      "policy_uri",
      "tos_uri",
      "redirect_uris",
      "require_auth_time",
      "default_max_age",
      "application_type",
      "contacts",
      "grant_types",
      "response_types",
      "scope",
      "token_endpoint_auth_method",
    ]);

    const clientIdDocumentJson = JSON.parse(clientIdDocument);
    const presentFields = Object.keys(clientIdDocumentJson);
    const unknownFields = presentFields.filter(
      (fieldName) => !knownFields.has(fieldName)
    );

    expect(unknownFields).toHaveLength(0);
  });
});
