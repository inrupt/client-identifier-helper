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
/* eslint-disable no-param-reassign */

import {
  ApplicationType,
  ClientIdDocument,
  GrantType,
  TokenEndpointAuthMethod,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localeRegex = require("ietf-language-tag-regex")();

function isUriValid(uri: string) {
  try {
    // if uri is invalid, the following will throw (and false returned)
    // eslint-disable-next-line no-new
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

/** Check, if given URIs are well-formed. If not, throw. */
function checkI18nUri(
  uriParam: undefined | string | { lang: string; val: string }[],
  pName: string
) {
  if (!uriParam) return;

  // method to actually ensure that the uri is well-formed
  const checkUri = (uri: string) => {
    if (!isUriValid(uri)) {
      throw new Error(`The parameter ${pName} is not a valid URI.`);
    }
  };

  if (typeof uriParam === "string") {
    checkUri(uriParam);
  } else {
    for (const i18n of uriParam) {
      checkUri(i18n.val);
    }
  }
}

/**
 * Check, that client_id is set and, if `client_id` is a URI, set to `none`.
 * (assuming the URI points to a valid client id document).
 */
function checkClientId(
  client_id: string,
  token_endpoint_auth_method?: TokenEndpointAuthMethod
) {
  if (client_id === "")
    throw new Error(
      "Client id must be set. Preferrably as URI to the cliend id document. " +
        "Otherewise, as registered to the OIDC provider."
    );

  // Check, that the authentication method is none, if the cliend_id is a URI,
  // assuming this implies the client_id points to a client id document.
  if (isUriValid(client_id)) {
    if (token_endpoint_auth_method !== TokenEndpointAuthMethod.none) {
      throw Error(
        "If the `client_id` is a uri dereferencing to the client id document, " +
          "the client authentication method (`token_endpoint_auth_method`) must be set to none."
      );
    }
  }
}

/** Check, that the correct grant types are present. If not, throw. */
function checkGrantTypes(grant_types?: GrantType[]) {
  let actual_grant_types = grant_types;
  // For validation purposes, we use explicit default values, if unset
  if (!actual_grant_types || actual_grant_types.length === 0)
    actual_grant_types = [GrantType.authorization_code];

  // Validate, that the required correspondence is met as defined by:
  // https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
  // ResponseType.code (here implicitly set as default) requires GrantType.authorization_code.
  if (
    actual_grant_types.filter((el) => el === GrantType.authorization_code)
      .length !== 1
  ) {
    throw new Error(
      "Solid OIDC requires the grant_type 'authorization_code' to be set (once). " +
        "This is because implicit token flow is not supported for security reasons. " +
        "See https://solidproject.org/TR/oidc-primer#authorization-code-pkce-flow-step-3"
    );
  }
}

/**
 * Set the values passed by `fields` with the parameter name `<pName>` to the `clientIdDocument`.
 * If the fields parameter is localized, check, that the `lang´-tag satisfies
 * the locale specs of IETF BCP 47 and locales are not defined more than once. If not, throw.
 */
function assignAndCheckI18nFields(
  clientIdDocument: ClientIdDocument,
  fields: undefined | string | { lang: string; val: string }[],
  pName: string
) {
  if (!fields) {
    return;
  }

  if (typeof fields === "string") {
    clientIdDocument[pName] = fields;
    return;
  }

  // Check, that language locales are unique
  const uniqueLocales = new Set(fields.map((f) => f.lang));
  if (uniqueLocales.size !== fields.length) {
    throw new Error(`Locales for parameter \`${pName}\` are not unique.`);
  }

  // assign values to locale-specific fields.
  for (const localizedField of fields) {
    if (localizedField.lang === "") {
      clientIdDocument[pName] = localizedField.val;
    } else {
      if (!localeRegex.test(localizedField.lang)) {
        throw new Error(
          `Language tag ${localizedField.lang} no valid IETF BCP 47 language tag in the field ${pName}.`
        );
      }

      clientIdDocument[`${pName}#${localizedField.lang}`] = localizedField.val;
    }
  }
}

/**
 * Check, if the scope string contains webid and openid keywords.
 * Throw, if requirements are not met.
 */
function checkScope(scope: string) {
  const scopeValues = scope.split(" ");

  if (
    scopeValues.filter((val) => val === "webid").length !== 1 ||
    scopeValues.filter((val) => val === "openid").length !== 1
  ) {
    throw new Error(
      'Parameter scope must include webid and openid once " ' +
        '(space-separated, e.g. "openid webid"). See: https://solidproject.org/TR/oidc#webid-scope'
    );
  }
}

/**
 * Check, if the redirect URIs meet the client id document requirements as defined by the specs.
 * Throw, if requirements are not met.
 *
 * @param application_type The client id document application_type parameter.
 * @param redirect_uris List of redirect URIs.
 */
function checkRedirectUris(
  application_type: undefined | ApplicationType,
  redirect_uris: string[]
) {
  if (redirect_uris.length === 0) {
    throw new Error(`At least one redirect uri is required.`);
  }

  for (const redirect_uri of redirect_uris) {
    let uri;
    // try parse uri
    try {
      uri = new URL(redirect_uri);
    } catch {
      throw new Error(`Redirect uri \`${redirect_uri}\` could not be parsed.`);
    }

    // check uri constraints regarding application_type
    // scheme must be https for web apps or, for native apps, http://localhost or a custom scheme
    if (
      application_type === undefined ||
      application_type === ApplicationType.web
    ) {
      if (uri.protocol !== "https:") {
        throw new Error(
          `redirect_uri ${redirect_uri} must use https scheme for application type \`web\`` +
            `(see: https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata application_type).`
        );
      }
    } else if (
      /* (application_type == "native") && */
      uri.protocol === "https:" ||
      (uri.protocol === "http:" && uri.hostname !== "localhost")
    ) {
      throw new Error(
        `For application_type native, redirect URI hostnames must be either localhost or use a custom scheme ` +
          `(see: https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata application_type).`
      );
    }
  }
}

/**
 * Check, that the parameter `default_max_age` is not negative and warn, if it uses a small value.
 */
function checkDefaultMaxAge(default_max_age: bigint | undefined) {
  if (default_max_age && default_max_age < 0)
    throw new Error(
      "The parameter default_max_age must be greater than 0 or undefined."
    );
  // QUESTION: should this be ommited?
  if (default_max_age && default_max_age < 60)
    console.warn(
      "The parameter default_max_age has a small value. Are you sure, this is intended?"
    );
}

/**
 * Generate a solid oidc client id document
 *
 * @param redirect_uris Required. localhost rules apply for application type `native`.
 * @param client_id Required. For solid, usually the dereferencable URI to the client
 *   id document. If the client_id dereferences to the, client id document, the
 *   `client_authentication_method` must be set to none.
 *   If the app doesn’t have a URI, you can either register the app using
 *   dynamic registration or static registration with a respective OIDC provider.
 * @param scope Required. Space-separated list of scope values. Must at least contain `webid` and `openid`.
 * @param application_type Optional. Default: `web`. The type of the client. Either `web` or `native`.
 * @param client_uri Optional. URI of the home page of the Client. Localization possible.
 * @param logo_uri Optional. URI of the client's logo. Localization possible.
 * @param client_name Optional. Human readable name of the client. Localization possible.
 * @param tos_uri Optional. URI to terms of service. Localization possible.
 * @param policy_uri Optional. URI to client's policy. Localization possible.
 * @param require_auth_time Optional. Default: `false`. Specifies, whether the `auth_time` claim
 *   in the ID Token is REQUIRED. See https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
 * @param default_max_age Optional. The default time in seconds that the client is authenticated for.
 * @param contacts Optional. Contact emails responsible for the client.
 * @param grant_types Optional. Default `authorization_code` (which is required in all cases).
 *   The parameter `offline_access` can be added (in a space separated manner) to request a refresh token.
 * @param auth_method Optional. General oidc Default: `client_secret_basic`. Solid default: `none`
 *   MUST be `none` for client ids dereferencing to the client id document.
 * @returns A client id document.
 */
export default function generateClientIdDocument(
  redirect_uris: string[],
  client_id: string,
  // eslint-disable-next-line default-param-last
  scope = "openid webid",
  application_type?: ApplicationType,
  client_uri?: string | { lang: string; val: string }[],
  logo_uri?: string | { lang: string; val: string }[],
  client_name?: string | { lang: string; val: string }[],
  tos_uri?: string | { lang: string; val: string }[],
  policy_uri?: string | { lang: string; val: string }[],
  require_auth_time?: boolean,
  default_max_age?: bigint,
  contacts?: string[],
  grant_types?: GrantType[],
  token_endpoint_auth_method?: TokenEndpointAuthMethod
) {
  // Perform parameter checks.

  checkRedirectUris(application_type, redirect_uris);

  let auth_method = token_endpoint_auth_method;
  // set default for `client_id`s dereferencing to client id document
  if (isUriValid(client_id) && !auth_method)
    auth_method = TokenEndpointAuthMethod.none;

  checkClientId(client_id, auth_method);

  checkScope(scope);

  checkI18nUri(client_uri, "client_uri");
  checkI18nUri(logo_uri, "logo_uri");
  checkI18nUri(tos_uri, "tos_uri");
  checkI18nUri(policy_uri, "policy_uri");

  checkGrantTypes(grant_types);

  checkDefaultMaxAge(default_max_age);

  // Transfer parameters to ClientIdDocument object.

  const ret = {} as ClientIdDocument;
  ret.redirect_uris = redirect_uris;
  ret.scope = scope;
  if (client_id) ret.client_id = client_id;
  if (default_max_age) ret.default_max_age = default_max_age;
  if (contacts && contacts.length > 0) ret.contacts = contacts;

  assignAndCheckI18nFields(ret, client_uri, "client_uri");
  assignAndCheckI18nFields(ret, logo_uri, "logo_uri");
  assignAndCheckI18nFields(ret, policy_uri, "policy_uri");
  assignAndCheckI18nFields(ret, client_name, "client_name");
  assignAndCheckI18nFields(ret, tos_uri, "tos_uri");

  // Only set, if `grant_types` not set to default (`[authorization_code]`).
  if (
    grant_types &&
    grant_types.length > 0 &&
    !(
      grant_types.length === 1 &&
      grant_types[0] === GrantType.authorization_code
    )
  ) {
    ret.grant_types = grant_types;
  }

  // only set, if not default (web)
  if (application_type && application_type !== ApplicationType.web)
    ret.application_type = application_type;

  // only set, if not default (false)
  if (require_auth_time) ret.require_auth_time = require_auth_time;

  // only set, if not default (client_secret_basic)
  if (
    auth_method &&
    auth_method !== TokenEndpointAuthMethod.client_secret_basic
  ) {
    ret.token_endpoint_auth_method = auth_method;
  }

  return ret;
}
