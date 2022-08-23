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

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetch, Headers } from "undici";

export default async (request: VercelRequest, response: VercelResponse) => {
  const { documentIri } = request.query;

  if (request.method !== "GET") {
    return response.status(405).json({
      error: {
        message:
          "Method not allowed: This API endpoint only accepts GET requests",
      },
    });
  }

  if (!documentIri || Array.isArray(documentIri)) {
    return response.status(400).json({
      error: {
        message:
          "Missing documentIri query parameter, or multiple have been passed",
      },
    });
  }

  try {
    const res = await fetch(documentIri, {
      headers: new Headers({
        "User-Agent":
          "Inrupt Client Identifier Helper (https://solid-client-indentifier-helper.vercel.app/)",
      }),
    });

    const document = await res.text();

    // do validation on `res`

    response.status(200).json({
      results: [],
      document,
      documentIri,
    });
  } catch (err) {
    response.status(200).json({
      results: [{ error: "could not fetch" }],
      document: null,
      documentIri,
    });
  }
};
