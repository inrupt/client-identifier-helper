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

const descriptionMessage =
  "Client Identifier URIs must be dereferenced by the OIDC Provider and are therefore only useful for development when your client application and OIDC Provider run on the same machine.";

const noLocalhostClientId: ValidationRule = {
  rule: {
    type: "local",
    name: "The Client Identifier URI field should not use localhost",
    description: descriptionMessage,
  },
  check: async (context: ValidationContext) => {
    if (isUriLocalhost(String(context.document.client_id))) {
      return [
        {
          status: "warning",
          title: "Client Identifier uses localhost for `client_id`",
          description: descriptionMessage,
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
