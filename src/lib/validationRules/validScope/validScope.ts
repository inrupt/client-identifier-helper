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
  ValidationRule,
  RuleResult,
  ValidationContext,
  ResultDescription,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  scopeInvalid: {
    status: "error",
    title: "Invalid `scope` field value",
    description:
      "The field `scope` must be a string (of space-separated values) or unset.",
  },
  scopeNotSet: {
    status: "warning",
    title: "Missing `scope` field",
    description:
      "The `scope` field is unset. It is strongly recommended to explicitly set it to `openid webid`.",
  },
  scopeMissesOpenid: {
    status: "error",
    title: "Missing Scope value `openid`",
    description:
      "If the `scope` field is set, it must contain the value `openid` (as a space-separated value).",
  },
  scopeMissesWebid: {
    status: "error",
    title: "Missing Scope value `webid`",
    description:
      "If the `scope` field is set, it must contain the value `webid` (as a space-separated value).",
  },
  scopeDuplicateValues: {
    status: "error",
    title: "Duplicate Scope values",
    description: "There are scope values present more than once..",
  },
  scopeUnknownValues: {
    status: "info",
    title: "Unknown Scope value",
    description: `There are unknown scope values present. Are you sure, this is intended?`,
  },
  scopeValid: {
    status: "success",
    title: "Scope looks fine",
    description: "The field `scope` looks fine.",
  },
};

const validScope: ValidationRule = {
  rule: {
    type: "local",
    name: "Field `scope` must be valid",
    description:
      "The field `scope` must contain `openid` and `webid` and no unknown values. Values are stored in a space-separated string.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    if (
      typeof context.document.scope !== "string" &&
      typeof context.document.scope !== "undefined"
    ) {
      return [
        {
          ...resultDescriptions.scopeInvalid,
          affectedFields: [
            { fieldName: "scope", fieldValue: context.document.scope },
          ],
        },
      ];
    }

    if (
      typeof context.document.scope === "undefined" ||
      context.document.scope === ""
    ) {
      return [
        {
          ...resultDescriptions.scopeNotSet,
          affectedFields: [
            { fieldName: "scope", fieldValue: context.document.scope },
          ],
        },
      ];
    }

    const scopes: string[] = context.document.scope.split(/\s+/);

    const results: RuleResult[] = [];
    if (!scopes.includes("openid")) {
      results.push({
        ...resultDescriptions.scopeMissesOpenid,
        affectedFields: [
          { fieldName: "scope", fieldValue: context.document.scope },
        ],
      });
    }
    if (!scopes.includes("webid")) {
      results.push({
        ...resultDescriptions.scopeMissesWebid,
        affectedFields: [
          { fieldName: "scope", fieldValue: context.document.scope },
        ],
      });
    }
    if (new Set(scopes).size !== scopes.length) {
      results.push({
        ...resultDescriptions.scopeDuplicateValues,
        affectedFields: [
          { fieldName: "scope", fieldValue: context.document.scope },
        ],
      });
    }
    const knownScopes = [
      "webid",
      "openid",
      "profile",
      "offline_access",
      "email",
      "address",
      "phone",
    ];
    if (scopes.filter((scope) => !knownScopes.includes(scope)).length > 0) {
      results.push({
        ...resultDescriptions.scopeUnknownValues,
        affectedFields: [
          { fieldName: "scope", fieldValue: context.document.scope },
        ],
      });
    }

    if (results.length === 0) {
      results.push({
        ...resultDescriptions.scopeValid,
        affectedFields: [
          { fieldName: "scope", fieldValue: context.document.scope },
        ],
      });
    }

    return results;
  },
};

export default validScope;
