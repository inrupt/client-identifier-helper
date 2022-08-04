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

/* eslint-disable-next-line no-shadow */
import { describe, expect, test } from "@jest/globals";
import fetchMock from "fetch-mock";
import { OIDC_CONTEXT } from "../../types";
import remoteDocumentAsJsonLd from "./remoteDocumentAsJsonLd";

describe("remote document as json-ld check", () => {
  test("succeeds for valid remote document with application/json header", async () => {
    fetchMock.mock("https://app.example/id-no-ld", {
      body: JSON.stringify({
        "@context": OIDC_CONTEXT,
        client_id: "https://app.example/id-no-ld",
      }),
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf8",
      },
    });

    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-no-ld",
      document: {},
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote Document is a valid JSON-LD document/
    );
  });

  test("succeeds for valid remote document with application/ld+json header", async () => {
    // fetch a good document with content-type application/json
    fetchMock.mock("https://app.example/id", {
      body: JSON.stringify({
        "@context": [OIDC_CONTEXT],
        client_id: "https://app.example/id",
      }),
      status: 200,
      headers: {
        "content-type": "application/ld+json; charset=utf8",
      },
    });

    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id",
      document: {},
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote Document is a valid JSON-LD document/
    );
  });

  test("errors if documentIri is undefined", async () => {
    const resultsForMissingDocumentUri = await remoteDocumentAsJsonLd.check({
      documentIri: undefined,
      document: {},
    });
    expect(resultsForMissingDocumentUri).toHaveLength(1);
    expect(resultsForMissingDocumentUri[0].title).toMatch(
      /No Client Identifier URI given/
    );
  });

  test("errors if documentIri is an invalid URI", async () => {
    const resultsForInvalidDocumentUri = await remoteDocumentAsJsonLd.check({
      documentIri: "https://invalid uri",
      document: {},
    });
    expect(resultsForInvalidDocumentUri).toHaveLength(1);
    expect(resultsForInvalidDocumentUri[0].title).toMatch(
      /Client Identifier not a valid URI/
    );
  });

  test("errors if documentIri results in a redirect", async () => {
    // fetch a good document with content-type application/json
    fetchMock.get("https://app.example/redirected", {
      status: 302,
      redirectUrl: "https://app.example/id",
    });

    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/redirected",
      document: {},
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Unexpected redirect/);
  });

  test("errors if documentIri results in a non-200 status code", async () => {
    // fetch a good document with content-type application/json
    fetchMock.get("https://app.example/non-200", {
      status: 201,
    });

    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/non-200",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Unexpected status code/);
  });

  test("errors if `@context` field is missing", async () => {
    fetchMock.get("https://app.example/id-missing-context", {
      status: 200,
      body: JSON.stringify({
        client_id: "https://app.example/id-missing-context",
      }),
      headers: {
        "content-type": "application/ld+json; charset=utf8",
      },
    });
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-missing-context",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/misses `@context` field/);
  });

  test("errors if `@context` field is invalid", async () => {
    fetchMock.get(/https:\/\/app.example\/id-invalid-context/, {
      status: 200,
      body: JSON.stringify({
        "@context": "https://invalid-schema.example/",
        client_id: "https://app.example/id-invalid-context",
      }),
      headers: {
        "content-type": "application/ld+json; charset=utf8",
      },
    });
    const resultsForInvalidContext = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-invalid-context",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(resultsForInvalidContext).toHaveLength(1);
    expect(resultsForInvalidContext[0].title).toMatch(/Invalid `@context`/);
  });

  test("errors if status code 404 is returned", async () => {
    fetchMock.get("https://app.example/id-bad-status", {
      status: 404,
      body: "not found",
      headers: {
        "content-type": "application/ld+json; charset=utf8",
      },
    });
    const resultsForBadStatus = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-bad-status",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(resultsForBadStatus).toHaveLength(1);
    expect(resultsForBadStatus[0].title).toMatch(/Unexpected status code/);
  });

  test("errors if the fetch fails", async () => {
    fetchMock.get(
      "https://app.example/fetch-will-fail",
      Promise.reject(new Error("this fetch was supposed to fail by test"))
    );
    const resultsForFailedFetch = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/fetch-will-fail",
      document: {},
    });
    expect(resultsForFailedFetch).toHaveLength(1);
    expect(resultsForFailedFetch[0].title).toMatch(/could not be fetched/);
  });

  test("errors if client identifier document cannot be parsed", async () => {
    fetchMock.get("https://app.example/id-not-parsable", {
      status: 200,
      body: "invalid json",
      headers: {
        "content-type": "application/ld+json; charset=utf8",
      },
    });
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-not-parsable",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/could not be parsed/);
  });

  test("errors on missing/wrong content type header", async () => {
    fetchMock.get("https://app.example/id-missing-content-type-header", {
      status: 200,
      body: JSON.stringify({
        "@context": OIDC_CONTEXT,
      }),
      headers: {
        "content-type": "",
      },
    });
    const results = await remoteDocumentAsJsonLd.check({
      documentIri: "https://app.example/id-missing-content-type-header",
      document: {},
    });
    expect(fetchMock.called()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/Invalid `content-type` header/);
  });
});
