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
import { ValidationResult } from "./types";

export const UNAVAILABLE_API_RESULT: ValidationResult = {
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
};

export const INVALID_LOCAL_JSON_DOCUMENT_RESULT: ValidationResult = {
  rule: {
    type: "local",
    name: "Document must be valid JSON",
    description: "The document must be a valid JSON string.",
  },
  status: "error",
  title: "Invalid JSON",
  description: "The document could not be parsed to JSON.",
  affectedFields: [],
};

export const NO_GIVEN_DOCUMENT_IRI_RESULT: ValidationResult = {
  rule: {
    type: "remote",
    name: "Client Identifier URI must be present",
    description:
      "The Client Identifier URI needs to be present in order to fetch the client identifier document.",
  },
  status: "error",
  title: "No Client Identifier URI given",
  description:
    "Please enter a Client Identifier URI to validate the remote Client Identifier Document.",
  affectedFields: [],
};
