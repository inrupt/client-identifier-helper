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
  uriNotSet: {
    status: "unknown",
    title: `URI not set`,
    description: "The given URI field is not present.",
  },
  uriNoString: {
    status: "error",
    title: `URI field not a string`,
    description: "The given URI field is not a string.",
  },
  uriMalformed: {
    status: "error",
    title: `URI malformed`,
    description: "The field is not a valid URI.",
  },
  uriNoHttps: {
    status: "warning",
    title: `URI does not use https`,
    description: `URIs should use the https protocol.`,
  },
  uriValid: {
    status: "success",
    title: `URI syntax looks good`,
    description: "No issues detected.",
  },
};

/** Helper function to check each of the URI fields applied to this rule. */
export const checkUrlSyntax = (
  uri: unknown,
  fieldName: string,
  resultIfMissing: "error" | "warning" | "info" | "success",
  emitSuccess = false
): RuleResult[] => {
  if (!uri) {
    return [
      {
        ...resultDescriptions.uriNotSet,
        status: resultIfMissing,
        affectedFields: [{ fieldName, fieldValue: uri }],
      },
    ];
  }

  if (typeof uri !== "string") {
    return [
      {
        ...resultDescriptions.uriNoString,
        affectedFields: [{ fieldName, fieldValue: uri }],
      },
    ];
  }
  // Check URI syntax.
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(uri);
  } catch {
    return [
      {
        ...resultDescriptions.uriMalformed,
        affectedFields: [{ fieldName, fieldValue: uri }],
      },
    ];
  }
  if (parsedUrl.protocol !== "https:") {
    return [
      {
        ...resultDescriptions.uriNoHttps,
        affectedFields: [{ fieldName, fieldValue: uri }],
      },
    ];
  }

  if (emitSuccess) {
    return [
      {
        ...resultDescriptions.uriValid,
        affectedFields: [{ fieldName, fieldValue: uri }],
      },
    ];
  }
  return [];
};

const validUriFields: ValidationRule = {
  rule: {
    type: "local",
    name: "URIs must be syntactically correct",
    description:
      "Fields ending with `_uri` and the field`client_id` must adhere to URI syntax.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    const results: RuleResult[] = [
      ...checkUrlSyntax(context.document.client_id, "client_id", "error", true),
      ...checkUrlSyntax(context.document.client_uri, "client_uri", "warning"),
      ...checkUrlSyntax(context.document.logo_uri, "logo_uri", "info"),
      ...checkUrlSyntax(context.document.tos_uri, "tos_uri", "info"),
      ...checkUrlSyntax(context.document.policy_uri, "policy_uri", "info"),
    ];

    return results;
  },
};

export default validUriFields;
