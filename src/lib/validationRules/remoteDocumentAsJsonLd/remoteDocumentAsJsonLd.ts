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

import {
  RemoteValidationContext,
  RemoteValidationRule,
  ResultDescription,
} from "../../types";

const resultDescriptions: Record<string, ResultDescription> = {
  unexpectedRedirect: {
    status: "warning",
    title: "Unexpected redirect",
    description: "Upon fetching Client Identifier Document, redirect happened",
  },
  unexpectedStatusCode: {
    status: "error",
    title: "Unexpected status code",
    description: `The status code from fetching Client Identifier Document should have been 200.`,
  },
  jsonContentTypeHeader: {
    status: "warning",
    title:
      "Use `content-type` header `application/ld+json` over `application/json`",
    description: `The Response Header \`content-type\` should return \`application/ld+json\`.`,
  },
  invalidContentTypeHeader: {
    status: "error",
    title: "Invalid `content-type` header fetching Client Identifier",
    description: `The Response Header \`content-type\` must have a MIME type of \`application/ld+json\` or \`application/json\``,
  },
  validJsonLdDocument: {
    status: "success",
    title: "Remote Document is a valid JSON-LD document",
    description:
      "The Remote Document located at the Client Identifier URI could be fetched and has the right `@context` value set.",
  },
};

const remoteDocumentAsJsonLd: RemoteValidationRule = {
  rule: {
    type: "remote",
    name: "Remote Document must be a correct ld+json document",
    description:
      "The Client Identifier Document must contain the correct Solid OIDC context. The server must serve a mime type of `application/json` or `application/ld+json`",
  },
  resultDescriptions,
  check: async (context: RemoteValidationContext) => {
    if (context.fetchResponse.redirected) {
      return [
        {
          ...resultDescriptions.unexpectedRedirect,
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.documentIri },
          ],
        },
      ];
    }

    if (context.fetchResponse.status !== 200) {
      return [
        {
          ...resultDescriptions.unexpectedStatusCode,
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.documentIri },
            {
              fieldName: "status code",
              fieldValue: context.fetchResponse.status,
            },
          ],
        },
      ];
    }

    const contentType = context.fetchResponse.headers.get("content-type");
    const mimeType = !contentType ? "" : contentType.replace(/;.*/, "");

    if (mimeType === "application/json") {
      return [
        {
          ...resultDescriptions.jsonContentTypeHeader,
          affectedFields: [
            { fieldName: "content-type", fieldValue: contentType },
          ],
        },
      ];
    }

    if (mimeType !== "application/ld+json") {
      return [
        {
          ...resultDescriptions.invalidContentTypeHeader,
          affectedFields: [
            { fieldName: "content-type", fieldValue: contentType },
          ],
        },
      ];
    }

    return [
      {
        ...resultDescriptions.validJsonLdDocument,
        affectedFields: [
          { fieldName: "client_id", fieldValue: context.documentIri },
        ],
      },
    ];
  },
};

export default remoteDocumentAsJsonLd;
