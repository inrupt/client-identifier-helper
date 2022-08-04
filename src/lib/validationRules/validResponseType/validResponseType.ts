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

const validResponseType: ValidationRule = {
  rule: {
    type: "local",
    name: "Response Types field should remain unset",
    description:
      "For Solid OIDC, the only valid value is `code` (which is the default).",
  },
  check: async (context: ValidationContext) => {
    if (typeof context.document.response_types === "undefined") {
      return [];
    }
    if (!Array.isArray(context.document.response_types)) {
      return [
        {
          status: "error",
          title: "Invalid `response_types`",
          description:
            'The field `response_types` should be left unset (or set to default `["code"]`).',
          affectedFields: [
            {
              fieldName: "response_types",
              fieldValue: context.document.response_types,
            },
          ],
        },
      ];
    }

    if (!context.document.response_types.includes("code")) {
      return [
        {
          status: "error",
          title: "Missing value in `response_types`",
          description:
            'The field `response_types` should be left unset (or set to default `["code"]`).',
          affectedFields: [
            {
              fieldName: "application_type",
              fieldValue: context.document.application_type,
            },
          ],
        },
      ];
    }
    // response_type includes more then one element
    if (context.document.response_types.length > 1) {
      return [
        {
          status: "warning",
          title: "Field `response_types` has more values than expected",
          description:
            'The field `response_types` should be left unset (or set to default `["code"]`). There are no other valid options as per the Solid OIDC spec.',
          affectedFields: [
            {
              fieldName: "application_type",
              fieldValue: context.document.application_type,
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default validResponseType;
