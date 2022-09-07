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

import { RemoteValidationContext, RemoteValidationRule } from "../../types";

const remoteMatchingClientId: RemoteValidationRule = {
  rule: {
    type: "remote",
    name: "Client Identifier in remote document matches local one",
    description:
      "The Client Identifier URI specified in the remote document and the local Client Identifier URI must match exactly.",
  },
  check: async (context: RemoteValidationContext) => {
    if (!context.documentIri) {
      // errors for missing fields are handled in remoteDocumentAsJsonLD
      return [];
    }

    if (!context.document.client_id) {
      return [
        {
          status: "error",
          title: "Remote Client Identifier Document has no `client_id` set",
          description:
            "The remote Remote Client Identifier Document must have the Client Identifier URI set to the field `client_id`.",
          affectedFields: [],
        },
      ];
    }

    if (context.document.client_id !== context.documentIri) {
      return [
        {
          status: "error",
          title: "Remote and local Client Identifier mismatch",
          description:
            "The remote and the local Client Identifier URI must be equal (string equality).",
          affectedFields: [
            { fieldName: "client_id", fieldValue: context.document.client_id },
            { fieldName: "client_id", fieldValue: context.documentIri },
          ],
        },
      ];
    }

    return [
      {
        status: "success",
        title: "Remote and local Client Identifiers match",
        description:
          "The remote `client-id` field matches the local Client Identifier.",
        affectedFields: [
          { fieldName: "client_id", fieldValue: context.document.client_id },
        ],
      },
    ];
  },
};

export default remoteMatchingClientId;
