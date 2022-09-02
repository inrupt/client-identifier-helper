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

import { fetch, Headers } from "undici";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ValidationRule } from "../src/lib/types";
import remoteDocumentAsJsonLd from "../src/lib/validationRules/remoteDocumentAsJsonLd/remoteDocumentAsJsonLd";
import remoteMatchingClientId from "../src/lib/validationRules/remoteMatchingClientId/remoteMatchingClientId";

const remoteRules: ValidationRule[] = [
  remoteDocumentAsJsonLd,
  remoteMatchingClientId,
];

async function validateRemoteDocument(documentIri: string) {
  const validationPromises = remoteRules.map(async (rule) => {
    const results = await rule.check({
      documentIri,
      document: {},
    });
    return results.map((result) => ({
      rule: rule.rule,
      ...result,
    }));
  });
  return (await Promise.all(validationPromises)).flat();
}

export default async (request: VercelRequest, response: VercelResponse) => {
  const { documentIri } = request.query;

  if (request.method !== "POST") {
    return response.status(405).json({
      documentIri,
      error: {
        message:
          "Method not allowed: This API endpoint only accepts POST requests",
      },
      results: null,
      document: null,
    });
  }

  if (!documentIri || Array.isArray(documentIri)) {
    return response.status(400).json({
      documentIri,
      error: {
        message:
          "Missing documentIri query parameter, or multiple have been passed",
      },
      results: null,
      document: null,
    });
  }

  try {
    const fetchResponse = await fetch(documentIri, {
      headers: new Headers({
        "User-Agent":
          "Inrupt Client Identifier Helper (https://solid-client-indentifier-helper.vercel.app/)",
      }),
    });

    const document = await fetchResponse.text();

    const validationResults = await validateRemoteDocument(documentIri);

    return response.status(200).json({
      results: validationResults,
      document,
      documentIri,
    });
  } catch (err) {
    return response.status(200).json({
      error: { message: "could not fetch" },
      documentIri,
      results: null,
      document: null,
    });
  }
};
