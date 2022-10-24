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
  ValidationRule,
  RuleResult,
  ValidationContext,
  ResultDescription,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  missingRedirectUrisField: {
    status: "error",
    title: "Missing `redirect_uris` field",
    description:
      "The field `redirect_uris` must be set as an array of URI strings.",
  },
  redirectUrisFieldInvalid: {
    status: "error",
    title: "Invalid `redirect_uris` field",
    description:
      "The field `redirect_uris` must be set and must be an array of valid URI-strings.",
  },
  redirectUrisUnset: {
    status: "error",
    title: "Missing Redirect URIs",
    description: "At least one Redirect URI must be set.",
  },
  redirectUriEmpty: {
    status: "error",
    title: "Missing Redirect URI",
    description: "The redirect URI is not set.",
  },
  redirectUriMalformed: {
    status: "error",
    title: "Malformed Redirect URI",
    description: "The redirect URI does not have a correct URI syntax.",
  },
  redirectUriMissingPath: {
    status: "warning",
    title: "Redirect URI should have a path (`/`)",
    description: `Redirect URIs are usually compared for string equality. A path should be specified to reduce unexpected behavior.`,
  },
  redirectUriWithSearchParams: {
    status: "warning",
    title: "Redirect URI has search parameters",
    description: `The redirect URI has search parameters attached. The redirect URI must be static. To maintain state, use the localStorage instead.`,
  },
};

const validRedirectUris: ValidationRule = {
  rule: {
    type: "local",
    name: "Well-formed correct Redirect URIs",
    description:
      "Redirect URIs must be well-formed. They should have an explicit path, as they are compared for string equality. Search parameters are discouraged.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    if (context.document.redirect_uris === undefined) {
      return [
        {
          ...resultDescriptions.missingRedirectUrisField,
          affectedFields: [
            {
              fieldName: "redirect_uris",
              fieldValue: context.document.redirect_uris,
            },
          ],
        },
      ];
    }

    if (!Array.isArray(context.document.redirect_uris)) {
      return [
        {
          ...resultDescriptions.redirectUrisFieldInvalid,
          affectedFields: [
            {
              fieldName: "redirect_uris",
              fieldValue: context.document.redirect_uris,
            },
          ],
        },
      ];
    }

    if (context.document.redirect_uris.length === 0) {
      return [
        {
          ...resultDescriptions.redirectUrisUnset,
          affectedFields: [
            {
              fieldName: "redirect_uris",
              fieldValue: context.document.redirect_uris,
            },
          ],
        },
      ];
    }

    const validateRedirectUri = (uri: string, index: number): RuleResult[] => {
      if (!uri) {
        return [
          {
            ...resultDescriptions.redirectUriEmpty,
            affectedFields: [
              { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
            ],
          },
        ];
      }
      let url: URL;
      try {
        url = new URL(uri);
      } catch {
        return [
          {
            ...resultDescriptions.redirectUriMalformed,
            affectedFields: [
              { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
            ],
          },
        ];
      }
      const results: RuleResult[] = [];

      // Check, if path is set explicitly.
      // The URL constructor sets `pathname` in all cases. Thus, this comparison here.
      if (url.pathname === "/" && !uri.endsWith("/")) {
        results.push({
          ...resultDescriptions.redirectUriMissingPath,
          affectedFields: [
            { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
          ],
        });
      }

      if (url.search !== "") {
        results.push({
          ...resultDescriptions.redirectUriWithSearchParams,
          affectedFields: [
            { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
          ],
        });
      }

      return results;
    };

    const resultArrays =
      context.document.redirect_uris.map(validateRedirectUri);
    return resultArrays.flatMap((array) => array);
  },
};

export default validRedirectUris;
