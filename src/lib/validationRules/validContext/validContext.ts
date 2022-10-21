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
  OIDC_CONTEXT,
  ResultDescription,
  ValidationContext,
  ValidationRule,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  contextFieldMissing: {
    status: "error",
    title: "`@context` field missing",
    description: `The Client Identifier Document must have an \`@context\` field with a value of \`["${OIDC_CONTEXT}"]\` or just "${OIDC_CONTEXT}".`,
  },
  contextFieldValid: {
    status: "success",
    title: "Document has valid json+ld context",
    description: "The document has the correct `@context` value set.",
  },
  contextFieldInvalid: {
    status: "error",
    title: "@context must be set correctly",
    description: `The @context must be set to \`https://www.w3.org/ns/solid/oidc-context.jsonld\` or \`[${OIDC_CONTEXT}]\``,
  },
};

const validContext: ValidationRule = {
  rule: {
    type: "local",
    name: "Correct ld+json @context",
    description: "The document must have a correct ld+json @context field.",
  },
  resultDescriptions,
  check: async (context: ValidationContext) => {
    if (!context.document["@context"]) {
      return [
        {
          ...resultDescriptions.contextFieldMissing,
          affectedFields: [
            { fieldName: "@context", fieldValue: context.document["@context"] },
          ],
        },
      ];
    }

    if (
      context.document["@context"] === OIDC_CONTEXT ||
      (Array.isArray(context.document["@context"]) &&
        context.document["@context"].length === 1 &&
        context.document["@context"][0] === OIDC_CONTEXT)
    ) {
      return [
        {
          ...resultDescriptions.contextFieldValid,
          affectedFields: [
            { fieldName: "@context", fieldValue: context.document["@context"] },
          ],
        },
      ];
    }

    return [
      {
        ...resultDescriptions.contextFieldInvalid,
        affectedFields: [
          { fieldName: "@context", fieldValue: context.document["@context"] },
        ],
      },
    ];
  },
};

export default validContext;
