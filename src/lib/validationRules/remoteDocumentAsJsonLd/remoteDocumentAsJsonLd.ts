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

// eslint-disable-next-line no-shadow
import { fetch, request, Response } from "undici";
import {
  ValidationRule,
  RuleResult,
  ValidationContext,
  OIDC_CONTEXT,
  ClientIdDocument,
} from "../../types";

const remoteDocumentAsJsonLd: ValidationRule = {
  rule: {
    type: "remote",
    name: "Remote Document must be a correct ld+json document",
    description:
      "The Client Identifier Document must contain the correct Solid OIDC context. The server must serve a mime type of `application/json` or `application/ld+json`",
  },
  check: async (context: ValidationContext) => {
    if (!context.documentIri) {
      return [
        {
          status: "error",
          title: "No Client Identifier URI given",
          description:
            "Cannot fetch the Client Identifier Document without the Client Identifier URI.",
          affectedFields: [],
        },
      ];
    }
    try {
      // check for syntax here only..
      // eslint-disable-next-line no-new
      new URL(context.documentIri);
    } catch {
      return [
        {
          status: "error",
          title: "Client Identifier not a valid URI",
          description: "The Client Identifier must be a URI to fetch.",
          affectedFields: [],
        },
      ];
    }

    let fetchResult: Response;
    try {
      fetchResult = await fetch(context.documentIri);
    } catch (error) {
      return [
        {
          status: "error",
          title: `Client Identifier Document could not be fetched`,
          description: `The URI \`${context.documentIri}\` could not be resolved:\n${error}`,
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.documentIri },
          ],
        },
      ];
    }

    if (fetchResult.redirected) {
      return [
        {
          status: "warning",
          title: "Unexpected redirect",
          description:
            "Upon fetching Client Identifier Document, redirect happened",
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.documentIri },
          ],
        },
      ];
    }

    if (fetchResult.status !== 200) {
      return [
        {
          status: "error",
          title: "Unexpected status code",
          description: `The status code from fetching Client Identifier Document was ${fetchResult.status} but should have been 200.`,
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.documentIri },
          ],
        },
      ];
    }

    const results: RuleResult[] = [];

    let remoteDocument: ClientIdDocument;
    try {
      // we need this to allow error-less passing from .json() to ClientIdDocument
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      remoteDocument = (await fetchResult.json()) as any;
    } catch (error) {
      results.push({
        status: "error",
        title: "Remote Client Identifier Document could not be parsed",
        description:
          "The resource located at the Client Identifier URI is not a valid JSON document.",
        affectedFields: [
          { fieldName: "client_id", fieldValue: context.documentIri },
        ],
      });
      return results;
    }

    const contentType = fetchResult.headers.get("content-type");
    const mimeType = !contentType ? "" : contentType.replace(/;.*/, "");

    if (mimeType !== "application/json" && mimeType !== "application/ld+json") {
      results.push({
        status: "error",
        title: "Invalid `content-type` header fetching Client Identifier",
        description: `The Response Header \`content-type\` must have a MIME type of \`application/ld+json\` or \`application/json\` but was \`${mimeType}\``,
        affectedFields: [
          { fieldName: "content-type", fieldValue: contentType },
        ],
      });
    }

    if (!remoteDocument["@context"]) {
      results.push({
        status: "error",
        title: "Remote Client Identifier Document misses `@context` field",
        description: `The remote Client Identifier Document has no @context field set but it should be set to \`${OIDC_CONTEXT}\`.`,
        affectedFields: [
          { fieldName: "content-type", fieldValue: contentType },
        ],
      });
      return results;
    }

    if (
      remoteDocument["@context"] !== OIDC_CONTEXT &&
      !(
        Array.isArray(remoteDocument["@context"]) &&
        remoteDocument["@context"].length === 1 &&
        remoteDocument["@context"][0] === OIDC_CONTEXT
      )
    ) {
      results.push({
        status: "error",
        title: "Invalid `@context` for Remote Client Identifier Document",
        description: `The remote Client Identifier Document has an incorrect \`@context\` field set. It must be set to \`${OIDC_CONTEXT}\` or [\`${OIDC_CONTEXT}\`].`,
        affectedFields: [
          { fieldName: "content-type", fieldValue: contentType },
        ],
      });
    }

    if (results.length !== 0) {
      return results;
    }

    return [
      {
        status: "success",
        title: "Remote Document is a valid JSON-LD document",
        description:
          "The Remote Document located at the Client Identifier URI could be fetched and has the right `@context` value set.",
        affectedFields: [
          { fieldName: "client_id", fieldValue: context.documentIri },
        ],
      },
    ];
  },
};

export default remoteDocumentAsJsonLd;
