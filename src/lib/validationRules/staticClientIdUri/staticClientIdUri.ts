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

import { ValidationRule, ValidationContext } from "../../types";

const staticClientIdUri: ValidationRule = {
  rule: {
    type: "local",
    name: "Client Identifier URI should not have search parameters attached",
    description:
      "The Client Identifier Document should be hosted statically. Therefore, search parameters hint at an anti-pattern.",
  },
  check: async (context: ValidationContext) => {
    let url: URL;
    if (typeof context.document.client_id !== "string") {
      return [];
    }
    try {
      url = new URL(context.document.client_id);
    } catch {
      return [];
    }

    if (url.search !== "") {
      return [
        {
          status: "warning",
          title: "Search parameters in Client Identifier URI",
          description:
            "The Client Identifier URI should be hosted statically. Search parameters seem to be wrong at place.",
          affectedFields: [
            {
              fieldName: "client_id",
              fieldValue: context.document.client_id,
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default staticClientIdUri;
