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
import { ValidationContext, ValidationRule } from "../../types";

const sameDomainForRedirectUris: ValidationRule = {
  rule: {
    type: "local",
    name: "Redirect URIs should be situated on the same domain",
    description:
      "Redirect URIs should usually be located within the same domain. Perhaps, setting up to clients / Client Identifier Documents is better.",
  },
  check: async (context: ValidationContext) => {
    if (!Array.isArray(context.document.redirect_uris)) {
      return [];
    }
    const hostNames = new Set(
      context.document.redirect_uris.map((uri) => {
        try {
          return new URL(uri).hostname;
        } catch {
          return "";
        }
      })
    );
    if (hostNames.size > 1) {
      return [
        {
          status: "warning",
          title: "Multiple redirect URI domains",
          description:
            "Redirect URIs should be situated within the same domain. Maybe separate apps for separate domains might be a better option..",
          affectedFields: [
            {
              fieldName: "redirect_uris",
              fieldValue: context.document.redirect_uris,
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default sameDomainForRedirectUris;
