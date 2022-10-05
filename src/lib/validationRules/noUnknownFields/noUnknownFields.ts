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

const knownFields = new Set([
  "@context",
  "client_id",
  "client_name",
  "client_uri",
  "logo_uri",
  "policy_uri",
  "tos_uri",
  "redirect_uris",
  "require_auth_time",
  "default_max_age",
  "application_type",
  "contacts",
  "grant_types",
  "response_types",
  "scope",
  "token_endpoint_auth_method",
]);

const knownLocalizableFields = [
  "client_name",
  "client_uri",
  "logo_uri",
  "tos_uri",
  "policy_uri",
];

const noUnknownFields: ValidationRule = {
  rule: {
    type: "local",
    name: "Unknown fields might be ignored.",
    description: `If a field is not recognized, it might perhaps be misspelled and is not going to be recognized by the OIDC Provider. Known fields are: "${[
      ...knownFields,
    ].join('", "')}".`,
  },
  check: async (context: ValidationContext) => {
    const remainingFields = Object.keys(context.document).filter(
      (field) => !knownFields.has(field)
    );
    // For the remaining fields, check if those are localized fields ending with `#<locale>`
    const unknownFields = remainingFields.filter(
      (remainingField) =>
        !knownLocalizableFields.some((localizableFIeld) =>
          remainingField.startsWith(`${localizableFIeld}#`)
        )
    );

    return unknownFields.map((unknownField) => {
      return {
        status: "warning",
        title: `Unknown field \`${unknownField}\``,
        description: `The field \`${unknownField}\` is not recognized. Did you misspell it?`,
        affectedFields: [
          {
            fieldName: unknownField,
            fieldValue: context.document[unknownField],
          },
        ],
      };
    });
  },
};

export default noUnknownFields;
