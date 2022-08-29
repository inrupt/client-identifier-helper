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

import { ValidationResults, ValidationRule } from "../types";

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
  jsonDocument: string,
  rules: ValidationRule[]
): Promise<ValidationResults> {
  // try parsing first..
  let clientIdDocument = {};
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
  let response: Response;
  try {
    response = await await fetch(
      `/api/validate-remote-document?documentIri=${documentIri}`,
      {
        method: "POST",
      }
    );
  } catch (error) {
    return [
      {
        status: "error",
        affectedFields: [],
        rule: { description: "", name: "", type: "remote" },
        title: `Fetching resource was not successful`,
        description: `An error ocured while trying to fetch the resource: ${error}`,
      },
    ];
  }
  let jsonResponse: any;
  try {
    jsonResponse = await response.json();
  } catch (error) {
    return [
      {
        status: "error",
        affectedFields: [],
        rule: { description: "", name: "", type: "remote" },
        title: `Fetching resource was not successful`,
        description: `The validation result could not be parsed.`,
      },
    ];
  }

  if (jsonResponse?.error) {
    return [
      {
        status: "error",
        affectedFields: [],
        rule: { description: "", name: "", type: "remote" },
        title: `Validation not successful`,
        description: `The resource could not be validated: ${jsonResponse.error}`,
      },
    ];
  }

  if (!Array.isArray(jsonResponse.results)) {
    return [
      {
        status: "error",
        affectedFields: [],
        rule: { description: "", name: "", type: "remote" },
        title: `Fetching resource was not successful`,
        description: `The validation result could not be parsed.`,
      },
    ];
  }

  const remoteResults: ValidationResults = jsonResponse.results;
  const localResults = await validateDocument(
    jsonResponse.document,
    offlineRules
  );

  return [...remoteResults, ...localResults];
}
