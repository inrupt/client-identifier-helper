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
import {
  ResultDescription,
  ValidationContext,
  ValidationRule,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  defaultMaxAgeSmall: {
    status: "info",
    title: "Small `default_max_age` value",
    description:
      "The value of `default_max_age` is set to less than 60 seconds. Thus, the end user must be re-authenticated after this period. Are you sure, this is intended?",
  },
  defaultMaxAgeInvalid: {
    status: "error",
    title: "Invalid `default_max_age` value",
    description: "The value of `default_max_age` must be a positive integer.",
  },
};

const validDefaultMaxAge: ValidationRule = {
  rule: {
    type: "local",
    name: "If set, `default_max_age` should have reasonable integer values.",
    description:
      "If set, the optional field `default_max_age` (expressed in seconds) needs to be a positive integer. The user has to re-authenticate every time, the time span is expired. Therefore, small values are discouraged.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    if (
      Number(context.document.default_max_age) ===
        context.document.default_max_age &&
      Number.isSafeInteger(context.document.default_max_age) &&
      context.document.default_max_age > 0
    ) {
      if (context.document.default_max_age < 60) {
        return [
          {
            ...resultDescriptions.defaultMaxAgeSmall,
            affectedFields: [
              {
                fieldName: "default_max_age",
                fieldValue: context.document.default_max_age,
              },
            ],
          },
        ];
      }
      return [];
    }
    if (context.document.default_max_age !== undefined) {
      return [
        {
          ...resultDescriptions.defaultMaxAgeInvalid,
          affectedFields: [
            {
              fieldName: "default_max_age",
              fieldValue: context.document.default_max_age,
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default validDefaultMaxAge;
