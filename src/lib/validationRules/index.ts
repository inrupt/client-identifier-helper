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

import defaultMaxAgeRule from "./validDefaultMaxAge/validDefaultMaxAge";
import refreshTokenRule from "./refreshTokenRule/refreshTokenRule";
import validRedirectUris from "./validRedirectUris/validRedirectUris";
import validContext from "./validContext/validContext";
import decentClientName from "./decentClientName/decentClientName";
import validUriFields from "./validUriFields/validUriFields";
import sameDomainForRedirectUris from "./sameDomainForRedirectUris/sameDomainForRedirectUris";
import noLocalAndRemoteRedirectUris from "./noLocalAndRemoteRedirectUris/noLocalAndRemoteRedirectUris";
import validResponseType from "./validResponseType/validResponseType";
import validApplicationType from "./validApplicationType/validApplicationType";
import rightAuthenticationMethod from "./rightAuthenticationMethod/rightAuthenticationMethod";
import noUnknownFields from "./noUnknownFields/noUnknownFields";
import validScope from "./validScope/validScope";
import validGrantTypes from "./validGrantTypes/validGrantTypes";
import noUnsetClientUri from "./noUnsetClientUri/noUnsetClientUri";

import {
  RemoteValidationResponse,
  ValidationResults,
  ValidationRule,
} from "../types";

export const offlineRules: ValidationRule[] = [
  decentClientName,
  validUriFields,
  validContext,
  validRedirectUris,
  refreshTokenRule,
  validGrantTypes,
  validScope,
  noUnknownFields,
  defaultMaxAgeRule,
  validApplicationType,
  rightAuthenticationMethod,
  validResponseType,
  sameDomainForRedirectUris,
  noLocalAndRemoteRedirectUris,
  noUnsetClientUri,
  // We omit localization validation as it is not supported by ESS or NSS (as of 2022-08-17) but leave it here for spec-compliance guidance.
];

export async function validateDocument(
  jsonDocument: string | object,
  rules: ValidationRule[]
): Promise<ValidationResults> {
  // try parsing first..
  let clientIdDocument = {};
  if (typeof jsonDocument === "string") {
    try {
      clientIdDocument = JSON.parse(jsonDocument);
    } catch {
      return [
        {
          rule: {
            type: "local",
            name: "Document must be valid JSON",
            description: "The document must be a valid JSON string.",
          },
          status: "error",
          title: "Invalid JSON",
          description: "The document could not be parsed to JSON.",
          affectedFields: [],
        },
      ];
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

export async function requestRemoteValidation(
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
    localResults = await validateDocument(response.document, offlineRules);
  }

  return [...remoteResults, ...localResults];
}
