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

import validDefaultMaxAge from "./validationRules/validDefaultMaxAge/validDefaultMaxAge";
import refreshTokenRule from "./validationRules/refreshTokenRule/refreshTokenRule";
import validRedirectUris from "./validationRules/validRedirectUris/validRedirectUris";
import validContext from "./validationRules/validContext/validContext";
import decentClientName from "./validationRules/decentClientName/decentClientName";
import validUriFields from "./validationRules/validUriFields/validUriFields";
import sameDomainForRedirectUris from "./validationRules/sameDomainForRedirectUris/sameDomainForRedirectUris";
import noMixedRedirectUrls from "./validationRules/noMixedRedirectUris/noMixedRedirectUrls";
import validResponseType from "./validationRules/validResponseType/validResponseType";
import validApplicationType from "./validationRules/validApplicationType/validApplicationType";
import rightAuthenticationMethod from "./validationRules/rightAuthenticationMethod/rightAuthenticationMethod";
import noUnknownFields from "./validationRules/noUnknownFields/noUnknownFields";
import validScope from "./validationRules/validScope/validScope";
import validGrantTypes from "./validationRules/validGrantTypes/validGrantTypes";
import noUnsetClientUri from "./validationRules/noUnsetClientUri/noUnsetClientUri";

import { RemoteValidationRule, ValidationRule } from "./types";
import remoteDocumentAsJsonLd from "./validationRules/remoteDocumentAsJsonLd/remoteDocumentAsJsonLd";
import remoteMatchingClientId from "./validationRules/remoteMatchingClientId/remoteMatchingClientId";
import staticClientIdUri from "./validationRules/staticClientIdUri/staticClientIdUri";
import redirectUrisApplicationTypeRule from "./validationRules/redirectUrisApplicationTypeRule/redirectUrisApplicationTypeRule";

export const localRules: ValidationRule[] = [
  decentClientName,
  noMixedRedirectUrls,
  noUnknownFields,
  noUnsetClientUri,
  redirectUrisApplicationTypeRule,
  refreshTokenRule,
  rightAuthenticationMethod,
  sameDomainForRedirectUris,
  staticClientIdUri,
  validApplicationType,
  validContext,
  validDefaultMaxAge,
  validGrantTypes,
  validRedirectUris,
  validResponseType,
  validScope,
  validUriFields,
  // We omit localization validation as it is not supported by ESS or NSS (as of 2022-08-17) but leave the comment it here for spec-compliance guidance.
];

export const remoteRules: RemoteValidationRule[] = [
  remoteDocumentAsJsonLd,
  remoteMatchingClientId,
];
