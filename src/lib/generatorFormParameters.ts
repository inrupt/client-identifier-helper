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

export type FormParameters = {
  clientId: string;
  clientName: string;
  clientUri: string;
  redirectUris: string[];
  useRefreshTokens: boolean;
  logoUri: string;
  tosUri: string;
  policyUri: string;
  contacts: string[];
  applicationType: "web" | "native";
  requireAuthTime?: boolean;
  defaultMaxAge?: number;
};

const emptyFormState: Record<keyof FormParameters, object> = {
  clientId: {},
  clientName: {},
  clientUri: {},
  redirectUris: {},
  useRefreshTokens: {},
  logoUri: {},
  tosUri: {},
  policyUri: {},
  contacts: {},
  applicationType: {},
  requireAuthTime: {},
  defaultMaxAge: {},
};

export function getEmptyFormState() {
  return structuredClone(emptyFormState);
}

/**
 * Return the FormParameters typed key for the string key.
 * Throws an error if the key is not a member of FormParameters .
 *
 * @param key The FormParameters key as string.
 * @returns FormParameters key
 */
export function getFormParametersKey(key: string): keyof FormParameters {
  const parameterMap: Record<string, keyof FormParameters> = {
    clientId: "clientId",
    clientName: "clientName",
    clientUri: "clientUri",
    redirectUris: "redirectUris",
    useRefreshTokens: "useRefreshTokens",
    logoUri: "logoUri",
    tosUri: "tosUri",
    policyUri: "policyUri",
    contacts: "contacts",
    applicationType: "applicationType",
    requireAuthTime: "requireAuthTime",
    defaultMaxAge: "defaultMaxAge",
  };

  if (Object.hasOwn(parameterMap, key)) {
    return parameterMap[key];
  }

  throw new Error(`The key \`${key}\` is not a member of FormParameters`);
}
