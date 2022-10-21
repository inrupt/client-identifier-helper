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

import { isUriLocalhost } from "../../helperFunctions";
import { ValidationRule, RuleResult, ValidationContext } from "../../types";

const redirectUrisApplicationTypeRule: ValidationRule = {
  rule: {
    type: "local",
    name: "Redirect URI scheme / destination must align with application type",
    description:
      "Apps with `application_type` `web` must use https protocol for remote hosts or at least http for localhost clients. Clients with `application_type` `native` must use a custom scheme or http(s) on localhost.",
  },
  check: async (context: ValidationContext) => {
    const checkUri = (uri: string, index: number): RuleResult[] => {
      let url: URL;
      try {
        url = new URL(uri);
      } catch {
        return [];
      }

      if (
        (context.document.application_type === "web" ||
          context.document.application_type === undefined) &&
        !isUriLocalhost(uri) &&
        url.protocol === "http:"
      ) {
        return [
          {
            status: "error",
            title: "Insecure http for Redirect URI",
            description:
              "Redirect URIs must use https for application type `web`, unless on localhost.",
            affectedFields: [
              { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
              {
                fieldName: "application_type",
                fieldValue: context.document.application_type,
              },
            ],
          },
        ];
      }

      if (
        (context.document.application_type === "web" ||
          context.document.application_type === undefined) &&
        !(url.protocol === "http:" || url.protocol === "https:")
      ) {
        return [
          {
            status: "error",
            title: "Wrong protocol for Redirect URI",
            description:
              "Redirect URIs must use http(s) for application type `web` on localhost (for remote URIs https).",
            affectedFields: [
              { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
              {
                fieldName: "application_type",
                fieldValue: context.document.application_type,
              },
            ],
          },
        ];
      }

      if (
        context.document.application_type === "native" &&
        !isUriLocalhost(uri) &&
        (url.protocol === "https:" || url.protocol === "http:")
      ) {
        return [
          {
            status: "error",
            title:
              "No remote http(s) allowed for `native` client's redirect URIs",
            description: `For \`application_type\` \`native\`, the redirect URIs must not use non-localhost http(s).`,
            affectedFields: [
              { fieldName: `redirect_uris[${index}]`, fieldValue: uri },
              {
                fieldName: "application_type",
                fieldValue: context.document.application_type,
              },
            ],
          },
        ];
      }
      return [];
    };

    if (!Array.isArray(context.document.redirect_uris)) {
      return [];
    }

    return context.document.redirect_uris.map(checkUri).flat();
  },
};

export default redirectUrisApplicationTypeRule;
