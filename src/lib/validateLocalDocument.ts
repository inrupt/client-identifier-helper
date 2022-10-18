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
import { INVALID_LOCAL_JSON_DOCUMENT_RESULT } from "./staticValidationResults";
import { ValidationResults, ValidationRule } from "./types";
import { underScoreToCamelCase } from "./helperFunctions";

export default async function validateLocalDocument(
  jsonDocument: string | object,
  rules: ValidationRule[]
): Promise<ValidationResults> {
  // Try parsing first..
  let clientIdDocument = {};
  if (typeof jsonDocument === "string") {
    try {
      clientIdDocument = JSON.parse(jsonDocument);
    } catch {
      return [INVALID_LOCAL_JSON_DOCUMENT_RESULT];
    }
  } else {
    clientIdDocument = jsonDocument;
  }

  const validationPromises = rules.map(async (rule) => {
    const results = await rule.check({ document: clientIdDocument });
    return results.map((result) => ({
      rule: rule.rule,
      ...result,
    }));
  });

  return (await Promise.all(validationPromises)).flat();
}

/**
 * Validates jsonDocument and returns all validation results where the result's
 * affected fields contain the `validationFieldName`
 * @param jsonDocument the Client Identifier Document to validate
 * @param validationFieldName the field name in camelCase notation
 * @param rules the rules to validate against
 * @returns an array of ValidationResult
 */
export async function validateField(
  jsonDocument: string | object,
  validationFieldName: string,
  rules: ValidationRule[]
) {
  const results = await validateLocalDocument(jsonDocument, rules);
  const rulesWithField = results.filter((result) => {
    return result.affectedFields.some(
      (affectedField) =>
        underScoreToCamelCase(affectedField.fieldName) === validationFieldName
    );
  });
  return rulesWithField;
}
