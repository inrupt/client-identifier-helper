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
  multipleRedirectDomains: {
    status: "warning",
    title: "Multiple redirect URI domains",
    description:
      "Redirect URIs should be situated within the same domain. Maybe separate apps for separate domains might be a better option..",
  },
};

const sameDomainForRedirectUris: ValidationRule = {
  rule: {
    type: "local",
    name: "Redirect URIs should be located under the same domain",
    description:
      "Redirect URIs should usually be located under the same domain. Perhaps, setting up two clients / Client Identifier Documents is better.",
  },
  resultDescriptions,
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
          ...resultDescriptions.multipleRedirectDomains,
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
