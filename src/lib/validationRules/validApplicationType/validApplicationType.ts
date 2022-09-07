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

const validApplicationType: ValidationRule = {
  rule: {
    type: "local",
    name: "Field `application_type` must be `web` or `native`",
    description:
      "For the field `application_type`, the two supported values are `web` or `native`. The default is `web`.",
  },
  check: async (context: ValidationContext) => {
    if (
      context.document.application_type === undefined ||
      context.document.application_type === "web" ||
      context.document.application_type === "native"
    ) {
      // Not emitting success value as field is not required.
      return [];
    }

    return [
      {
        status: "error",
        title: "Application Type invalid",
        description:
          "The field `application_type` must either be `web` or `native` (or unset, defaulting to `web`).",
        affectedFields: [
          {
            fieldName: "application_type",
            fieldValue: context.document.application_type,
          },
        ],
      },
    ];
  },
};

export default validApplicationType;
