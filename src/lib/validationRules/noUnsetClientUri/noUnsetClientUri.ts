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

const noUnsetClientUri: ValidationRule = {
  rule: {
    type: "local",
    name: "Client URI should be set",
    description:
      "The `client_uri`, which is supposed to link to the client's homepage, should be set.",
  },
  check: async (context: ValidationContext) => {
    // Type check is done separately
    if (!context.document.client_uri) {
      return [
        {
          status: "warning",
          title: "Client URI should be set",
          description:
            "The field `client_uri` should be set to the homepage of the client.",
          affectedFields: [
            {
              fieldName: "client_uri",
              fieldValue: context.document.client_uri,
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default noUnsetClientUri;
