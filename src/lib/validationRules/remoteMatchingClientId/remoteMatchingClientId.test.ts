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
import { MockAgent, setGlobalDispatcher, fetch, Response } from "undici";
import remoteMatchingClientId from "./remoteMatchingClientId";

// The text Encoder / Decoders are implicitly used in node_modules/undici/lib/fetch/dataURL.js
// They are however not globally provided when testing. Therefore, the hack..
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe("remote document Client Identifier URI check", () => {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
  const mockPool = mockAgent.get(/.*/);

  test("fails for missing remote `client_id` field", async () => {
    mockPool
      .intercept({ path: "https://app.example/id-missing" })
      .reply(200, "{}", {
        headers: {
          "content-type": "application/ld+json; charset=utf8",
        },
      });

    const fetchResponse = await fetch("https://app.example/id-missing");
    const results = await remoteMatchingClientId.check({
      documentIri: "https://app.example/id-missing",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote Client Identifier Document has no `client_id` set/
    );
  });

  test("fails for mismatching Client Identifiers", async () => {
    mockPool.intercept({ path: "https://app.example/id-mismatching" }).reply(
      200,
      JSON.stringify({
        client_id: "https://app.example/id",
      }),
      {
        headers: {
          "content-type": "application/ld+json; charset=utf8",
        },
      }
    );

    const fetchResponse = await fetch("https://app.example/id-mismatching");
    const results = await remoteMatchingClientId.check({
      documentIri: "https://app.example/id-mismatching",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote and local Client Identifier mismatch/
    );
  });

  test("ignores for missing documentIri", async () => {
    const results = await remoteMatchingClientId.check({
      documentIri: undefined,
      document: {},
      fetchResponse: new Response(),
    });
    expect(results).toHaveLength(0);
  });

  test("succeeds for matching Client Identifiers", async () => {
    mockPool.intercept({ path: "https://app.example/id" }).reply(
      200,
      JSON.stringify({
        client_id: "https://app.example/id",
      }),
      {
        headers: {
          "content-type": "application/ld+json; charset=utf8",
        },
      }
    );

    const fetchResponse = await fetch("https://app.example/id");
    const results = await remoteMatchingClientId.check({
      documentIri: "https://app.example/id",
      document: JSON.parse(await fetchResponse.text()),
      fetchResponse,
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(
      /Remote and local Client Identifiers match/
    );
  });
});
