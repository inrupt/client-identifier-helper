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

export const OIDC_CONTEXT = "https://www.w3.org/ns/solid/oidc-context.jsonld";

export interface ClientIdDocument extends Record<string, unknown> {
  client_id?: unknown;
  client_uri?: unknown;
  logo_uri?: unknown;
  policy_uri?: unknown;
  tos_uri?: unknown;
  redirect_uris?: unknown;
  require_auth_time?: unknown;
  default_max_age?: unknown;
  application_type?: unknown;
  client_name?: unknown;
  contacts?: unknown;
  grant_types?: unknown;
  response_types?: unknown;
  scope?: unknown;
  token_endpoint_auth_method?: unknown;
}

export interface ValidationContext {
  document: ClientIdDocument;
  documentIri?: string;
  // for remote documents, the fetched response
  fetchResponse?: Response;
}

export interface ValidationRuleMetadata {
  name: string;
  description: string;
  type: "local" | "remote";
}

export interface ValidationRule {
  rule: ValidationRuleMetadata;
  check(context: ValidationContext): Promise<RuleResult[]>;
}

export interface RuleResult {
  status: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
  affectedFields: { fieldName: string; fieldValue: unknown }[];
}

export interface ValidationResult extends RuleResult {
  rule: ValidationRuleMetadata;
}

export type ValidationResults = ValidationResult[];
