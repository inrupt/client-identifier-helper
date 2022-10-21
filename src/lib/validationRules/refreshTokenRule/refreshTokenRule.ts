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
import {
  ResultDescription,
  ValidationContext,
  ValidationRule,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  invalidRefreshTokenConfig: {
    status: "error",
    title: "Invalid Refresh Token request.",
    description:
      "To request a Refresh Token, the `grant_types` must include a `refresh_token` value _and_ the `scope` value must include an `offline_access` value.",
  },
  refreshTokenRequested: {
    status: "success",
    title: "Refresh Token rules are met",
    description:
      `The \`grant_types\` and the \`scope\` field align in properties (\`refresh_token\` and \`offline_access\`, respectively).` +
      ` A refresh token is requested.`,
  },
  refreshTokenNotRequested: {
    status: "info",
    title: "Refresh Token rules are met",
    description:
      `The \`grant_types\` and the \`scope\` field align in properties (\`refresh_token\` and \`offline_access\`, respectively).` +
      ` A refresh token is _not_ requested.`,
  },
};

const refreshTokenRule: ValidationRule = {
  rule: {
    type: "local",
    name: "Valid `refresh_token` field",
    description:
      "To request refresh tokens, `grant_types` must have `refresh_token` set and `scope`, `offline_access`. Only setting both is valid.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    let scopeHasOfflineAccessSet: boolean;
    let grantTypesHasRefreshTokenSet: boolean;

    // Invalid scope or grantType fields are handled separately..
    if (typeof context.document.scope !== "string") {
      scopeHasOfflineAccessSet = false;
    } else {
      scopeHasOfflineAccessSet = context.document.scope
        .split(/\s+/)
        .some((scopeValue) => scopeValue === "offline_access");
    }

    if (Array.isArray(context.document.grant_types)) {
      grantTypesHasRefreshTokenSet = context.document.grant_types.some(
        (grantValue) => grantValue === "refresh_token"
      );
    } else {
      grantTypesHasRefreshTokenSet = false;
    }

    const affectedFields = [
      {
        fieldName: "grant_types",
        fieldValue: context.document.grant_types,
      },
      { fieldName: "scope", fieldValue: context.document.scope },
    ];

    if (grantTypesHasRefreshTokenSet !== scopeHasOfflineAccessSet) {
      return [
        {
          ...resultDescriptions.invalidRefreshTokenConfig,
          affectedFields,
        },
      ];
    }

    return [
      {
        ...(grantTypesHasRefreshTokenSet
          ? resultDescriptions.refreshTokenRequested
          : resultDescriptions.refreshTokenNotRequested),
        affectedFields,
      },
    ];
  },
};

export default refreshTokenRule;
