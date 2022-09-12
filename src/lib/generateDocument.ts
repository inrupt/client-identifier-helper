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

import { ClientIdDocument } from "./types";

export interface GenerateClientIdDocumentParameters {
  clientId: string;
  clientName: string;
  clientUri: string;
  redirectUris: string | string[];
  useRefreshTokens: boolean;
  logoUri: string;
  tosUri: string;
  policyUri: string;
  contact: string;
  applicationType: "web" | "native";
  requireAuthTime?: boolean;
  defaultMaxAge?: number;
  compact: boolean;
}

export default function generateClientIdDocument({
  clientId,
  clientName,
  clientUri,
  redirectUris,
  useRefreshTokens,
  logoUri,
  tosUri,
  policyUri,
  contact,
  applicationType,
  requireAuthTime,
  defaultMaxAge,
  compact = false,
}: GenerateClientIdDocumentParameters) {
  const clientIdentifierDocument: ClientIdDocument = {
    "@context": ["https://www.w3.org/ns/solid/oidc-context.jsonld"],
    client_id: clientId,
    client_name: clientName,
    client_uri: clientUri,
    redirect_uris: Array.isArray(redirectUris) ? redirectUris : [redirectUris],
    grant_types: useRefreshTokens
      ? ["authorization_code", "refresh_token"]
      : ["authorization_code"],
    scope: useRefreshTokens ? "openid webid offline_access" : "openid webid",
    token_endpoint_auth_method: "none",
    logo_uri: logoUri,
    tos_uri: tosUri,
    policy_uri: policyUri,
    contacts: [contact],
    application_type: applicationType,
    require_auth_time: requireAuthTime,
    default_max_age: defaultMaxAge,
  };

  return JSON.stringify(
    clientIdentifierDocument,
    null,
    compact ? undefined : 2
  );
}
