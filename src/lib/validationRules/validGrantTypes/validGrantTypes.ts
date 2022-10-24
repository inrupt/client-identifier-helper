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
  grantTypeUnset: {
    status: "error",
    title: "Missing `grant_types` field",
    description:
      "Whilst this isn't required by spec, we strongly advise you to include the grant_types field in your client identifier document.",
  },
  grantTypeInvalid: {
    status: "error",
    title: "Invalid `grant_types` field",
    description: "The field `grant_type` must be an array of strings.",
  },
  grantTypeImplicit: {
    status: "error",
    title: "Wrong `grant_types` field value",
    description: "For Solid OIDC, implicit authentication flow is not allowed.",
  },
  grantTypeAuthorizationCodeMissing: {
    status: "error",
    title: "Missing Grant Type `authorization_code`",
    description: "The Grant Type `authorization_code` must be set.",
  },
  grantTypeDuplicates: {
    status: "warning",
    title: "Duplicate Grant Types",
    description: "There are duplicate values in the `grant_type` array.",
  },
  grantTypeUnknown: {
    status: "info",
    title: "Unknown Grant Types",
    description:
      "There are Grant Types present that are not specified in the OIDC spec. Are you sure, this is intended?",
  },
  grantTypesValid: {
    status: "success",
    title: "Grant Types look fine",
    description: "The field `grant_types` looks fine.",
  },
};

const validGrantTypes: ValidationRule = {
  rule: {
    type: "local",
    name: "Valid `grant_type` field",
    description:
      "The field `authorization_code` should be set and must not have value `implicit` set (implicit OIDC workflow is not supported).",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    if (typeof context.document.grant_types === "undefined") {
      return [
        {
          ...resultDescriptions.grantTypeUnset,
          affectedFields: [
            {
              fieldName: "grant_types",
              fieldValue: context.document.grant_types,
            },
          ],
        },
      ];
    }
    if (!Array.isArray(context.document.grant_types)) {
      return [
        {
          ...resultDescriptions.grantTypeInvalid,
          affectedFields: [
            {
              fieldName: "grant_types",
              fieldValue: context.document.grant_types,
            },
          ],
        },
      ];
    }

    const results: RuleResult[] = [];

    // No grant type `implicit`
    if (context.document.grant_types.includes("implicit")) {
      results.push({
        ...resultDescriptions.grantTypeImplicit,
        affectedFields: [
          {
            fieldName: "grant_types",
            fieldValue: context.document.grant_types,
          },
        ],
      });
    }
    // No missing authorization_code grant type
    if (!context.document.grant_types.includes("authorization_code")) {
      results.push({
        ...resultDescriptions.grantTypeAuthorizationCodeMissing,
        affectedFields: [
          {
            fieldName: "grant_types",
            fieldValue: context.document.grant_types,
          },
        ],
      });
    }
    // No duplicates
    if (
      new Set(context.document.grant_types).size !==
      context.document.grant_types.length
    ) {
      results.push({
        ...resultDescriptions.grantTypeDuplicates,
        affectedFields: [
          {
            fieldName: "grant_types",
            fieldValue: context.document.grant_types,
          },
        ],
      });
    }
    // No unknown fields
    const knownGrantTypes = ["authorization_code", "implicit", "refresh_token"];
    if (
      context.document.grant_types.filter(
        (grantType) => !knownGrantTypes.includes(grantType)
      ).length > 0
    ) {
      results.push({
        ...resultDescriptions.grantTypeUnknown,
        affectedFields: [
          {
            fieldName: "grant_types",
            fieldValue: context.document.grant_types,
          },
        ],
      });
    }

    if (results.length === 0) {
      results.push({
        ...resultDescriptions.grantTypesValid,
        affectedFields: [
          {
            fieldName: "grant_types",
            fieldValue: context.document.grant_types,
          },
        ],
      });
    }

    return results;
  },
};

export default validGrantTypes;
