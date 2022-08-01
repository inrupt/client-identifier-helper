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

import { GrantType, ApplicationType, TokenEndpointAuthMethod } from "./types";
import generateClientIdDocument from "./index";

test("client id document defaults", () => {
  const clientIdDocUriOnly = generateClientIdDocument(
    ["https://decentphotos.example:443/callback"],
    "https://decentphotos.example/webid#this"
  );

  expect(clientIdDocUriOnly.redirect_uris[0]).toBe(
    "https://decentphotos.example:443/callback"
  );
  expect(clientIdDocUriOnly.scope).toBe("openid webid");
  // Document should only have properties redirect_uris, client_id, scope, and auth_method
  expect(Object.keys(clientIdDocUriOnly)).toHaveLength(4);

  // Fill document and explicitly set default values. This should result in a minimal document as well.
  const clientIdDocExplicitDefaults = generateClientIdDocument(
    ["https://decentphotos.example/callback"],
    "none-solid-oidc-client-id",
    "webid openid",
    ApplicationType.web,
    "",
    "",
    "",
    "",
    "",
    false,
    undefined,
    [],
    [GrantType.authorization_code],
    TokenEndpointAuthMethod.client_secret_basic
  );

  expect(clientIdDocExplicitDefaults.redirect_uris[0]).toBe(
    "https://decentphotos.example/callback"
  );
  expect(clientIdDocExplicitDefaults.scope).toBe("webid openid");
  // Document should only have properties redirect_uris, client_id and scope.
  expect(Object.keys(clientIdDocExplicitDefaults)).toHaveLength(3);

  const clientIdDocNonDefaults = generateClientIdDocument(
    ["http://localhost:80/code_callback", "customscheme:example"],
    "https://decentphotos.example/webid#this",
    "webid openid custom_token",
    ApplicationType.native,
    "https://decentphotos.example",
    "https://decentphotos.example/logo",
    "My client name",
    "https://decentphotos.example/tos",
    "https://decentphotos.example/policy",
    true,
    600n,
    ["contact@decentphotos.example"],
    [GrantType.authorization_code, GrantType.refresh_token],
    TokenEndpointAuthMethod.none
  );

  expect(Object.keys(clientIdDocNonDefaults)).toHaveLength(14);

  // No redirect uris set.
  expect(() =>
    generateClientIdDocument([], "https://decentphotos.example/webid#this")
  ).toThrow(/At least one redirect uri is required/);

  // No client id set.
  expect(() =>
    generateClientIdDocument(["https://decentphotos.example/code_callback"], "")
  ).toThrow(/Client id must be set/);

  // Wrong auth method.
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      TokenEndpointAuthMethod.client_secret_basic
    )
  ).toThrow(/client authentication method .* must be set to none/);
});

test("localized fields", () => {
  const clientIdDocWithLocales = generateClientIdDocument(
    ["https://decentphotos.example/callback"],
    "https://decentphotos.example/webid#this",
    "webid openid",
    ApplicationType.web,
    [
      { lang: "", val: "http://decentphotos.example" },
      { lang: "de-DE", val: "http://de.decentphotos.example" },
    ],
    "https://de.decentphotos.example/logo",
    [
      { lang: "de", val: "Mein Clientname" },
      { lang: "en-US", val: "The US client name" },
    ],
    [
      { lang: "", val: "https://decentphotos.example/tos" },
      { lang: "de-DE", val: "https://decentphotos.example/tos?lang=de" },
    ],
    [
      { lang: "", val: "https://decentphotos.example/policy" },
      { lang: "de-DE", val: "https://decentphotos.example/policy?lang=de" },
    ]
  );

  expect(clientIdDocWithLocales["client_uri#de-DE"]).toBe(
    "http://de.decentphotos.example"
  );
  expect(clientIdDocWithLocales.logo_uri).toBe(
    "https://de.decentphotos.example/logo"
  );
  expect(clientIdDocWithLocales["client_name#de"]).toBe("Mein Clientname");
  expect(clientIdDocWithLocales["client_name#en-US"]).toBe(
    "The US client name"
  );
  expect(clientIdDocWithLocales["tos_uri#de-DE"]).toBe(
    "https://decentphotos.example/tos?lang=de"
  );
  expect(clientIdDocWithLocales["policy_uri#de-DE"]).toBe(
    "https://decentphotos.example/policy?lang=de"
  );

  // Locales supplied twice
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/callback"],
      "https://decentphotos.example/webid#this",
      "webid openid",
      ApplicationType.web,
      [
        { lang: "", val: "http://decentphotos.example" },
        { lang: "de", val: "http://de.decentphotos.example" },
        { lang: "de", val: "http://de.decentphotos.example" },
      ]
    )
  ).toThrow(/Locales for parameter .* are not unique/);

  // invalid language tag
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/callback"],
      "https://decentphotos.example/webid#this",
      "webid openid",
      ApplicationType.web,
      [{ lang: "de-thisisnotvalid", val: "http://decentphotos.example" }]
    )
  ).toThrow(/Language tag .* no valid IETF BCP 47 language tag in the field/);
});

test("grant Type tests", () => {
  const clientIdDocWithRefreshToken = generateClientIdDocument(
    ["https://decentphotos.example"],
    "https://decentphotos.example/webid#this",
    "webid openid",
    ApplicationType.web,
    "",
    "",
    "",
    "",
    "",
    false,
    undefined,
    [],
    [GrantType.authorization_code, GrantType.refresh_token]
  );
  expect(clientIdDocWithRefreshToken.grant_types?.at(1)).toEqual(
    GrantType.refresh_token
  );

  // Test, if missing GrantType authorization_code fails.
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example"],
      "https://decentphotos.example/webid#this",
      "webid openid",
      ApplicationType.web,
      "",
      "",
      "",
      "",
      "",
      false,
      undefined,
      [],
      [GrantType.refresh_token]
    )
  ).toThrow(/Solid OIDC requires the grant_type 'authorization_code'/);
});

test("URI validity", () => {
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      "webid openid",
      ApplicationType.web,
      "https://invalid uri"
    )
  ).toThrow(/is not a valid URI/);
});

test("scope validity", () => {
  // Scope must contain `openid` and `webid`.
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      "webid"
    )
  ).toThrow(/Parameter scope must include webid and openid once/);

  // Scope must contain `openid` and `webid`.
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      "openid"
    )
  ).toThrow(/Parameter scope must include webid and openid once/);

  // Should pass..
  generateClientIdDocument(
    ["https://decentphotos.example/code_callback"],
    "https://decentphotos.example/webid#this",
    "webid openid offline_access"
  );

  // Custom scopes are allowed..
  generateClientIdDocument(
    ["https://decentphotos.example"],
    "https://decentphotos.example/webid#this",
    "webid openid custom_scope"
  );
});

test("redirect URIs", () => {
  // Invalid redirect uri.
  expect(() =>
    generateClientIdDocument(
      ["invalid uri"],
      "https://decentphotos.example/webid#this"
    )
  ).toThrow(/Redirect uri .* could not be parsed/);

  // Invalid redirect uri scheme.
  expect(() =>
    generateClientIdDocument(
      ["http://no-tls.example"],
      "https://decentphotos.example/webid#this"
    )
  ).toThrow(/redirect_uri .* must use https scheme/);

  // Uri scheme must not be http(s) for native clients (exepct for localhost).
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      "openid webid",
      ApplicationType.native
    )
  ).toThrow(
    /For application_type native, redirect URI hostnames must be either localhost or use a custom scheme/
  );
});

test("max_age param", () => {
  // Negative default_max_age should fail.
  expect(() =>
    generateClientIdDocument(
      ["https://decentphotos.example/code_callback"],
      "https://decentphotos.example/webid#this",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      -5n
    )
  ).toThrow(
    "The parameter default_max_age must be greater than 0 or undefined."
  );

  // Small default_max_age (produces warning).
  generateClientIdDocument(
    ["https://decentphotos.example/code_callback"],
    "https://decentphotos.example/webid#this",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    15n
  );
});
