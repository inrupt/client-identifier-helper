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

import { ValidationRule, RuleResult, ValidationContext } from "../../types";

const validRedirectUris: ValidationRule = {
  rule: {
    type: "local",
    name: "Well-formed correct Redirect URIs",
    description:
      "Redirect URIs must be well-formed (syntax, explicit path, no search parameters).",
  },
  check: async (context: ValidationContext) => {
    if (!Array.isArray(context.document.redirect_uris)) {
      return [
        {
          status: "error",
          title: "Redirect URIs field invalid",
          description:
            "The field `redirect_uris` must be set and must be an array of valid URI-strings.",
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
          status: "error",
          title: "No Redirect URIs set",
          description: "At least one Redirect URI must be set.",
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
      let url: URL;
      try {
        url = new URL(uri);
      } catch {
        return [
          {
            status: "error",
            title: "Redirect URI is malformed",
            description: "The redirect URI does not have a correct URI syntax.",
            affectedFields: [{ fieldName: "redirect_uris", fieldValue: uri }],
          },
        ];
      }
      const results: RuleResult[] = [];

      // Check, if path is set explicitly.
      // The URL constructor sets `pathname` in all cases. Thus, this comparison here.
      if (url.pathname === "/" && !uri.endsWith("/")) {
        results.push({
          status: "warning",
          title: "Redirect URI should have a path (`/`)",
          description: `Redirect URIs are usually compared for string equality. A path should be specified to reduce unexpected behavior. Affected URI: ${uri}`,
          affectedFields: [
            { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
          ],
        });
      }

      if (url.search !== "") {
        results.push({
          status: "warning",
          title: "Redirect URI has search parameters",
          description: `The redirect URI "${uri}" has search parameters attached. The redirect URI must be static. To store state, use the localStorage instead.`,
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
