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

const rightAuthenticationMethod: ValidationRule = {
  rule: {
    type: "local",
    name: "Field `token_endpoint_auth_method` must be `none`.",
    description:
      "Solid OIDC connect does only support `token_endpoint_auth_method` set to `none`. This must be made explicit to comply with the OIDC specification.",
  },
  check: async (context: ValidationContext) => {
    // Emits warning, if unset, as this is not spec-compliant but would probably work with a solid OIDC server
    if (typeof context.document.token_endpoint_auth_method === "undefined") {
      return [
        {
          status: "error",
          title: "Field `token_endpoint_auth_method` unset.",
          description:
            "The field `token_endpoint_auth_method` should be explicitly set to `none`. As per the OpenID spec, the default value is `client_secret_basic` which is not valid for Solid OpenID. For a solid authentication server, an unset value might work but as of the spec, it is undefined behavior.",
          affectedFields: [
            {
              fieldName: "token_endpoint_auth_method",
              fieldValue: context.document.token_endpoint_auth_method,
            },
          ],
        },
      ];
    }

    if (context.document.token_endpoint_auth_method !== "none") {
      return [
        {
          status: "error",
          title: "Field `token_endpoint_auth_method` must be set to `none`.",
          description:
            "The field `token_endpoint_auth_method` must be set to `none`.",
          affectedFields: [
            {
              fieldName: "token_endpoint_auth_method",
              fieldValue: context.document.token_endpoint_auth_method,
            },
          ],
        },
      ];
    }

    return [
      {
        status: "success",
        title: "Auth method looks fine.",
        description: "No issues found for field `token_endpoint_auth_method`.",
        affectedFields: [
          {
            fieldName: "token_endpoint_auth_method",
            fieldValue: context.document.token_endpoint_auth_method,
          },
        ],
      },
    ];
  },
};

export default rightAuthenticationMethod;
