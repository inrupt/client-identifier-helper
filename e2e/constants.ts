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

export const DEFAULT_CLIENT_ID = "https://app.example/id";
export const DEFAULT_CLIENT_NAME = "My App";
export const DEFAULT_CLIENT_HOMEPAGE = "https://app.example/about";
export const DEFAULT_CLIENT_REDIRECT_URI = "https://app.example/callback";
export const DEFAULT_CLIENT_LOGO_URI = "https://app.example/logo";
export const DEFAULT_CLIENT_TOS_URI = "https://app.example/tos";
export const DEFAULT_CLIENT_POLICY_URI = "https://app.example/policy";
export const DEFAULT_CLIENT_EMAIL = "maintainers@app.example";

export const VALID_CLIENT_IDENTIFIER_DOCUMENT = JSON.stringify({
  "@context": ["https://www.w3.org/ns/solid/oidc-context.jsonld"],
  client_id: DEFAULT_CLIENT_ID,
  client_name: DEFAULT_CLIENT_NAME,
  client_uri: DEFAULT_CLIENT_HOMEPAGE,
  redirect_uris: [DEFAULT_CLIENT_REDIRECT_URI],
  grant_types: ["authorization_code", "refresh_token"],
  scope: "openid webid offline_access",
  token_endpoint_auth_method: "none",
});

export const VALID_CLIENT_IDENTIFIER_DOCUMENT_URI =
  "https://podbrowser.inrupt.com/api/app";
