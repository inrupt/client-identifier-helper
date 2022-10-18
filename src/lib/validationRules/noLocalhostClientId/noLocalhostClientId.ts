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
import { ValidationContext, ValidationRule } from "../../types";

const noLocalhostClientId: ValidationRule = {
  rule: {
    type: "local",
    name: "Localhost Client IDs in development only",
    description:
      "Localhost Client Identifiers should be used for development purposes only.",
  },
  check: async (context: ValidationContext) => {
    if (isUriLocalhost(String(context.document.client_id))) {
      return [
        {
          status: "warning",
          title: "Localhost Client Identifier",
          description:
            "Client Identifier URIs must be dereferenced by the OIDC Provider and are therefore only useful for development when your client and OP run on the same machine.",
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.document.client_id },
          ],
        },
      ];
    }
    return [];
  },
};

export default noLocalhostClientId;
