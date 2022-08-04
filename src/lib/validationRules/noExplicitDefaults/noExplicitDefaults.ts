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

import { RuleResult, ValidationRule, ValidationContext } from "../../types";

const noExplicitDefaults: ValidationRule = {
  rule: {
    type: "local",
    name: "No explicit defaults needed",
    description:
      "If a field is set to its default value, this is not necessary and can be left out, unless useful for clarity of understanding.",
  },
  check: async (context: ValidationContext) => {
    // helper to create info messages
    const createValidationResultForDefaultValue = (
      fieldName: string
    ): RuleResult => {
      return {
        status: "info",
        title: `Field \`${fieldName}\` has explicit default`,
        description: `The field \`${fieldName}\` is explicitly set to its default value. You do not need to set it (unless supportive for clarity of understanding).`,
        affectedFields: [
          { fieldName, fieldValue: context.document[fieldName] },
        ],
      };
    };

    const results: RuleResult[] = [];
    if (
      Array.isArray(context.document.grant_types) &&
      context.document.grant_types.length === 1 &&
      context.document.grant_types[0] === "authorization_code"
    ) {
      results.push(createValidationResultForDefaultValue("grant_types"));
    }

    if (context.document.application_type === "web") {
      results.push(createValidationResultForDefaultValue("application_type"));
    }

    if (context.document.require_auth_time === false) {
      results.push(createValidationResultForDefaultValue("require_auth_time"));
    }

    if (
      Array.isArray(context.document.response_types) &&
      context.document.response_types.length === 1 &&
      context.document.response_types[0] === "code"
    ) {
      results.push(createValidationResultForDefaultValue("response_types"));
    }

    if (
      typeof context.document.scope === "string" &&
      context.document.scope.split(" ").length === 2 &&
      context.document.scope.split(" ").includes("webid") &&
      context.document.scope.split(" ").includes("openid")
    ) {
      results.push(createValidationResultForDefaultValue("scope"));
    }

    return results;
  },
};

export default noExplicitDefaults;
