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

import {
  ClientIdDocument,
  RemoteValidationContext,
  RemoteValidationResponse,
  ValidationResults,
} from "../src/lib/types";
import { remoteRules } from "../src/lib/validationRules";

const createErrorResult = (
  errorTitle: string,
  errorDescription: string
): ValidationResults => {
  return [
    {
      rule: {
        name: "Remote validation",
        description: "",
        type: "remote",
      },
      affectedFields: [],
      status: "error",
      title: errorTitle,
      description: errorDescription,
    },
  ];
};

async function validateRemoteDocument({
  documentIri,
  document,
  fetchResponse,
}: RemoteValidationContext) {
  const validationPromises = remoteRules.map(async (rule) => {
    const results = await rule.check({
      documentIri,
      document,
      fetchResponse,
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

  const createResponse = ({
    document,
    results,
  }: {
    document: ClientIdDocument | null;
    results: ValidationResults;
  }): RemoteValidationResponse => {
    return {
      documentIri,
      document,
      results,
    };
  };

  if (request.method !== "POST") {
    return response.status(405).json(
      createResponse({
        document: null,
        results: createErrorResult(
          "Remote validation failed",
          "Method not allowed: The validation API endpoint only accepts POST requests."
        ),
      })
    );
  }

  if (!documentIri || Array.isArray(documentIri)) {
    return response.status(400).json(
      createResponse({
        document: null,
        results: createErrorResult(
          "Remote validation failed",
          "The validation API endpoint needs exactly one documentIri parameter."
        ),
      })
    );
  }

  // is documentIRI well-formed?
  try {
    // eslint-disable-next-line no-new
    new URL(documentIri);
  } catch {
    return response.status(200).json(
      createResponse({
        document: null,
        results: createErrorResult(
          "Document URI invalid",
          `\`${documentIri}\` is not a valid URI`
        ),
      })
    );
  }

  try {
    // fetch
    const fetchResponse = await fetch(documentIri, {
      headers: new Headers({
        Accept: "application/ld+json, application/json",
        "User-Agent": `Inrupt Client Identifier Helper (${request.headers.origin})`,
      }),
    });

    let documentJson: ClientIdDocument;
    try {
      documentJson = JSON.parse(await fetchResponse.text());
    } catch {
      return response.status(200).json(
        createResponse({
          document: null,
          results: createErrorResult(
            "Remote document could not be parsed",
            "The remote document is not valid JSON"
          ),
        })
      );
    }

    const results = await validateRemoteDocument({
      documentIri,
      document: documentJson,
      fetchResponse,
    });

    return response
      .status(200)
      .json(createResponse({ document: documentJson, results }));
  } catch (err) {
    return response.status(200).json(
      createResponse({
        document: null,
        results: createErrorResult(
          "Remote document could not be fetched",
          "The remote document could not be fetched. Is it available?"
        ),
      })
    );
  }
};
