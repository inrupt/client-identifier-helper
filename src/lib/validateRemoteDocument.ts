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
import {
  UNAVAILABLE_API_RESULT,
  NO_GIVEN_DOCUMENT_IRI_RESULT,
} from "./staticValidationResult";
import validateLocalDocument from "./validateLocalDocument";
import { localRules } from "./validationRules";

export default async function validateRemoteDocument(
  documentIri: string
): Promise<ValidationResults> {
  if (!documentIri) {
    return [NO_GIVEN_DOCUMENT_IRI_RESULT];
  }
  let validationResponse: RemoteValidationResponse;
  try {
    const fetchResponse = await fetch(
      new URL(
        `/api/validate-remote-document?documentIri=${documentIri}`,
        window.location.origin
      ),
      {
        method: "POST",
      }
    );
    validationResponse = await fetchResponse.json();
  } catch (error) {
    return [UNAVAILABLE_API_RESULT];
  }

  const remoteResults = validationResponse.results;
  let localResults: ValidationResults = [];

  // if the document was empty,
  // the remoteResults will indicate so and there is nothing more to do..
  if (validationResponse.document) {
    localResults = await validateLocalDocument(
      validationResponse.document,
      localRules
    );
  }

  return [...remoteResults, ...localResults];
}
