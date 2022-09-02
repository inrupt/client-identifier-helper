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

/* eslint-disable no-shadow */

import { describe, expect, test } from "@jest/globals";
import { MockAgent, setGlobalDispatcher, fetch } from "undici";
import { OIDC_CONTEXT } from "../../types";
import remoteDocumentAsJsonLd from "./remoteDocumentAsJsonLd";

// The text Encoder / Decoders are implicitly used in node_modules/undici/lib/fetch/dataURL.js
// They are however not globally provided when testing. Therefore, the hack..
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe("remote document as json-ld check", () => {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
  const mockPool = mockAgent.get(/.*/);

  test("succeeds for valid remote document with application/json header", async () => {
    mockPool.intercept({ path: "https://app.example/id-no-ld" }).reply(
      200,
      JSON.stringify({
        "@context": OIDC_CONTEXT,
        client_id: "https://app.example/id-no-ld",
      }),
      {
        headers: {
          "content-type": "application/json; charset=utf8",
        },
      }
    );

    const fetchResponse = await fetch("https://app.example/id-no-ld");
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-no-ld",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote Document is a valid JSON-LD document/
    );
  });

  test("succeeds for valid remote document with application/ld+json header", async () => {
    // fetch a good document with content-type application/json
    mockPool.intercept({ path: "https://app.example/id" }).reply(
      200,
      JSON.stringify({
        "@context": [OIDC_CONTEXT],
        client_id: "https://app.example/id",
      }),
      {
        headers: {
          "content-type": "application/ld+json; charset=utf8",
        },
      }
    );

    const fetchResponse = await fetch("https://app.example/id");
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote Document is a valid JSON-LD document/
    );
  });

  test("errors if documentIri results in a redirect", async () => {
    // fetch a good document with content-type application/json
    mockPool
      .intercept({ path: "https://app.example/redirected" })
      .reply(302, "", {
        headers: {
          location: "https://app.example/id",
        },
      });

    mockPool.intercept({ path: "https://app.example/id" }).reply(200);

    const fetchResponse = await fetch("https://app.example/redirected");
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/redirected",
      document: {},
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Unexpected redirect/);
  });

  test("errors if documentIri results in a non-200 status code", async () => {
    // fetch a good document with content-type application/json
    mockPool.intercept({ path: "https://app.example/non-200" }).reply(201);

    const fetchResponse = await fetch("https://app.example/non-200");
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/non-200",
      document: {},
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Unexpected status code/);
  });

  test("errors if `@context` field is missing", async () => {
    mockPool
      .intercept({ path: "https://app.example/id-missing-context" })
      .reply(
        200,
        JSON.stringify({
          client_id: "https://app.example/id-missing-context",
        }),
        {
          headers: {
            "content-type": "application/ld+json; charset=utf8",
          },
        }
      );
    const fetchResponse = await fetch("https://app.example/id-missing-context");
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-missing-context",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/misses `@context` field/);
  });

  test("errors if `@context` field is invalid", async () => {
    mockPool
      .intercept({ path: "https://app.example/id-invalid-context" })
      .reply(
        200,
        JSON.stringify({
          "@context": "https://invalid-schema.example/",
          client_id: "https://app.example/id-invalid-context",
        }),
        {
          headers: {
            "content-type": "application/ld+json; charset=utf8",
          },
        }
      );

    const fetchResponse = await fetch("https://app.example/id-invalid-context");
    const resultsForInvalidContext = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-invalid-context",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(resultsForInvalidContext).toHaveLength(1);
    expect(resultsForInvalidContext[0].title).toMatch(/Invalid `@context`/);
  });

  test("errors if status code 404 is returned", async () => {
    mockPool
      .intercept({ path: "https://app.example/id-bad-status" })
      .reply(404, "not found", {
        headers: {
          "content-type": "application/ld+json; charset=utf8",
        },
      });

    const fetchResponse = await fetch("https://app.example/id-bad-status");
    const resultsForBadStatus = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-bad-status",
      document: {},
      fetchResponse,
    });
    expect(resultsForBadStatus).toHaveLength(1);
    expect(resultsForBadStatus[0].title).toMatch(/Unexpected status code/);
  });

  test("errors on missing/wrong content type header", async () => {
    mockPool
      .intercept({ path: "https://app.example/id-missing-content-type-header" })
      .reply(
        200,
        JSON.stringify({
          "@context": OIDC_CONTEXT,
        }),
        {
          headers: {
            "content-type": "",
          },
        }
      );

    const fetchResponse = await fetch(
      "https://app.example/id-missing-content-type-header"
    );
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-missing-content-type-header",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Invalid `content-type` header/);
  });
});
