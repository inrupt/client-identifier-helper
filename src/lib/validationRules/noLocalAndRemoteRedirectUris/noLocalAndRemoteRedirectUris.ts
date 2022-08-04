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

const noLocalAndRemoteRedirectUris: ValidationRule = {
  rule: {
    type: "local",
    name: "No mixed localhost and remote redirect URIs",
    description:
      "Redirect URIs must must not contain localhost _and_ remote URIs.",
  },
  check: async (context: ValidationContext) => {
    if (!Array.isArray(context.document.redirect_uris)) {
      return [];
    }
    const localHostCount = context.document.redirect_uris.filter((uri) => {
      try {
        const url = new URL(uri);
        return (
          url.hostname === "localhost" ||
          url.hostname === "[::1]" ||
          (url.hostname.startsWith("127.0.0.") && url.hostname.length <= 11)
        );
      } catch {
        return false;
      }
    }).length;

    if (
      localHostCount !== 0 &&
      localHostCount !== context.document.redirect_uris.length
    ) {
      return [
        {
          status: "error",
          title: "Mixed localhost and remote redirect URIs",
          description:
            "Redirect URIs must only have remote _or_ localhost URIs.",
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

export default noLocalAndRemoteRedirectUris;
