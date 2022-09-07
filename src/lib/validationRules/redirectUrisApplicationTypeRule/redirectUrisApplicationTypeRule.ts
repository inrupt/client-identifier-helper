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

const redirectUrisApplicationTypeRule: ValidationRule = {
  rule: {
    type: "local",
    name: "Redirect URI scheme/destination must align application type",
    description:
      "Apps with `application_type` `web` must use http(s), apps with `native` must only use http(s) on localhost or a custom scheme.",
  },
  check: async (context: ValidationContext) => {
    const isUrlLocalhost = (url: URL): boolean => {
      return (
        url.hostname === "localhost" ||
        (url.hostname.startsWith("127.0.0.") && url.hostname.length <= 11) ||
        url.hostname === "[::1]"
      );
    };

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
        !isUrlLocalhost(url) &&
        url.protocol === "http:"
      ) {
        return [
          {
            status: "error",
            title: "Insecure http for Redirect URI",
            description:
              "Redirect URIs must use https for application type `web`.",
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
              "Redirect URIs must use http(s) for application type `web` on localhost (for remote URis https).",
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
        !isUrlLocalhost(url) &&
        (url.protocol === "https:" || url.protocol === "http:")
      ) {
        return [
          {
            status: "error",
            title: "No remote http(s) allowed for `native` apps Redirect URIs",
            description: `For \`application_type\` \`native\`, the Redirect URI \`${uri}\` must not use non-localhost http(s).`,
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
