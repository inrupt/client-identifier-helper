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
      redirectUris: [DEFAULT_REDIRECT_URI],
      useRefreshTokens: false,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contact: DEFAULT_CONTACT,
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 60 * 60,
      compact: false,
    });
    const expected = `{
  "@context": [
    "https://www.w3.org/ns/solid/oidc-context.jsonld"
  ],
  "client_id": "https://app.example/id",
  "client_name": "My App",
  "client_uri": "https://app.example/about",
  "redirect_uris": [
    "https://app.example/callback"
  ],
  "grant_types": [
    "authorization_code"
  ],
  "scope": "openid webid",
  "token_endpoint_auth_method": "none",
  "logo_uri": "https://app.example/logo",
  "tos_uri": "https://app.example/tos",
  "policy_uri": "https://app.example/policy",
  "contacts": [
    "maintainer@app.example"
  ],
  "application_type": "web",
  "require_auth_time": true,
  "default_max_age": 3600
}`;
    expect(clientIdDocument).toBe(expected);
  });

  it("creates minimal document", async () => {
    const clientIdentifierDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [DEFAULT_REDIRECT_URI],
      useRefreshTokens: false,
      logoUri: "",
      tosUri: "",
      policyUri: "",
      contact: "",
      applicationType: "web",
    });
    const expected = `{
  "@context": [
    "https://www.w3.org/ns/solid/oidc-context.jsonld"
  ],
  "client_id": "https://app.example/id",
  "client_name": "My App",
  "client_uri": "https://app.example/about",
  "redirect_uris": [
    "https://app.example/callback"
  ],
  "grant_types": [
    "authorization_code"
  ],
  "scope": "openid webid",
  "token_endpoint_auth_method": "none",
  "logo_uri": "",
  "tos_uri": "",
  "policy_uri": "",
  "contacts": [
    ""
  ],
  "application_type": "web"
}`;
    expect(clientIdentifierDocument).toBe(expected);
  });

  it("creates document with refresh token", async () => {
    const clientIdentifierDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: [DEFAULT_REDIRECT_URI],
      useRefreshTokens: true,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contact: DEFAULT_CONTACT,
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 60 * 60,
      compact: false,
    });
    const expected = `{
  "@context": [
    "https://www.w3.org/ns/solid/oidc-context.jsonld"
  ],
  "client_id": "https://app.example/id",
  "client_name": "My App",
  "client_uri": "https://app.example/about",
  "redirect_uris": [
    "https://app.example/callback"
  ],
  "grant_types": [
    "authorization_code",
    "refresh_token"
  ],
  "scope": "openid webid offline_access",
  "token_endpoint_auth_method": "none",
  "logo_uri": "https://app.example/logo",
  "tos_uri": "https://app.example/tos",
  "policy_uri": "https://app.example/policy",
  "contacts": [
    "maintainer@app.example"
  ],
  "application_type": "web",
  "require_auth_time": true,
  "default_max_age": 3600
}`;
    expect(clientIdentifierDocument).toBe(expected);
  });

  it("creates document with redirectUris parameter as string", async () => {
    const clientIdentifierDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: DEFAULT_REDIRECT_URI,
      useRefreshTokens: true,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contact: DEFAULT_CONTACT,
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 60 * 60,
      compact: false,
    });
    const expected = `{
  "@context": [
    "https://www.w3.org/ns/solid/oidc-context.jsonld"
  ],
  "client_id": "https://app.example/id",
  "client_name": "My App",
  "client_uri": "https://app.example/about",
  "redirect_uris": [
    "https://app.example/callback"
  ],
  "grant_types": [
    "authorization_code",
    "refresh_token"
  ],
  "scope": "openid webid offline_access",
  "token_endpoint_auth_method": "none",
  "logo_uri": "https://app.example/logo",
  "tos_uri": "https://app.example/tos",
  "policy_uri": "https://app.example/policy",
  "contacts": [
    "maintainer@app.example"
  ],
  "application_type": "web",
  "require_auth_time": true,
  "default_max_age": 3600
}`;
    expect(clientIdentifierDocument).toBe(expected);
  });

  it("creates compacted document", async () => {
    const clientIdentifierDocument = generateDocument({
      clientId: DEFAULT_CLIENT_IDENTIFIER,
      clientName: DEFAULT_NAME,
      clientUri: DEFAULT_CLIENT_URI,
      redirectUris: DEFAULT_REDIRECT_URI,
      useRefreshTokens: true,
      logoUri: DEFAULT_LOGO_URI,
      tosUri: DEFAULT_TOS_URI,
      policyUri: DEFAULT_POLICY_URI,
      contact: DEFAULT_CONTACT,
      applicationType: "web",
      requireAuthTime: true,
      defaultMaxAge: 60 * 60,
      compact: true,
    });
    const expected = `{"@context":["https://www.w3.org/ns/solid/oidc-context.jsonld"],"client_id":"https://app.example/id","client_name":"My App","client_uri":"https://app.example/about","redirect_uris":["https://app.example/callback"],"grant_types":["authorization_code","refresh_token"],"scope":"openid webid offline_access","token_endpoint_auth_method":"none","logo_uri":"https://app.example/logo","tos_uri":"https://app.example/tos","policy_uri":"https://app.example/policy","contacts":["maintainer@app.example"],"application_type":"web","require_auth_time":true,"default_max_age":3600}`;
    expect(clientIdentifierDocument).toBe(expected);
  });
});
