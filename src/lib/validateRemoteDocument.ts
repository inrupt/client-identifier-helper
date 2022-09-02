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
import { RemoteValidationResponse, ValidationResults } from "./types";
import validateLocalDocument from "./validateLocalDocument";
import { localRules } from "./validationRules";

export default async function validateRemoteDocument(
  documentIri: string
): Promise<ValidationResults> {
  let response: RemoteValidationResponse;
  try {
    const fetchResponse = await fetch(
      `/api/validate-remote-document?documentIri=${documentIri}`,
      {
        method: "POST",
      }
    );
    response = await fetchResponse.json();
  } catch (error) {
    return [
      {
        rule: {
          type: "remote",
          name: "API must be available",
          description:
            "To generate remote validation results and fetch remote Client Identifier Documents, the validator api must be available.",
        },
        status: "error",
        title: "Validation service not available",
        description:
          "Requesting remote validation failed because the validation server could not be reached or returned an invalid response. Are you connected to the internet?",
        affectedFields: [],
      },
    ];
  }

  const remoteResults = response.results;
  let localResults: ValidationResults = [];

  // if the document was empty,
  // the remoteResults will indicate so and there is nothing more to do..
  if (response.document) {
    localResults = await validateLocalDocument(response.document, localRules);
  }

  return [...remoteResults, ...localResults];
}
