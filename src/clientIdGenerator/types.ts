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

/* eslint-disable camelcase */

export enum ApplicationType {
  web = "web",
  native = "native",
}

export enum GrantType {
  authorization_code = "authorization_code",
  refresh_token = "refresh_token",
}

export enum TokenEndpointAuthMethod {
  client_secret_basic = "client_secret_basic",
  client_secret_post = "client_secret_post",
  client_secret_jwt = "client_secret_jwt",
  private_key_jwt = "private_key_jwt",
  none = "none",
}

export interface ClientIdDocument {
  redirect_uris: string[];
  client_id?: string;
  scope: string;
  application_type?: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  tos_uri?: string;
  policy_uri?: string;
  require_auth_time?: boolean;
  default_max_age?: bigint;
  contacts?: string[];
  grant_types?: string[];
  token_endpoint_auth_method?: string;
  // allows for additional properties as required for the localizable props client_name#*, client_uri#*, logo_uri#*, tos_uri#*, policy_uri#*
  [key_and_lang: string]: unknown;
}
