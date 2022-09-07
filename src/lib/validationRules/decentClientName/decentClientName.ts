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

const decentClientName: ValidationRule = {
  rule: {
    type: "local",
    name: "Useful and Present Client Name",
    description:
      "The client name should not be longer than 50 characters and should be present.",
  },
  check: async (context: ValidationContext) => {
    if (!context.document.client_name) {
      return [
        {
          status: "warning",
          title: "No Client Name present",
          description:
            "The document has no Client Name set. It should be set for authentication providers to display useful information to the end-user.",
          affectedFields: [{ fieldName: "client_name", fieldValue: undefined }],
        },
      ];
    }

    if (typeof context.document.client_name !== "string") {
      return [
        {
          status: "error",
          title: "Invalid Client Name",
          description: "The Client Name is not of type string",
          affectedFields: [
            {
              fieldName: "client_name",
              fieldValue: context.document.client_name,
            },
          ],
        },
      ];
    }

    if (context.document.client_name.length > 50) {
      return [
        {
          status: "warning",
          title: "Long Client Name",
          description:
            "The length of the Client Name is longer than 50 characters. This might cause presentation problems.",
          affectedFields: [
            {
              fieldName: "client_name",
              fieldValue: context.document.client_name,
            },
          ],
        },
      ];
    }

    return [];
  },
};

export default decentClientName;
