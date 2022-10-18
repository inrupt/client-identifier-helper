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
import { describe, expect, it } from "@jest/globals";

import {
  isHostnameLocal,
  isUriLocalhost,
  statusToNumber,
  underScoreToCamelCase,
} from "./helperFunctions";

describe("helper functions", () => {
  describe("underScoreToCamelCase", () => {
    it("converts name with single underscore", async () => {
      expect(underScoreToCamelCase("part1_part2")).toBe("part1Part2");
    });
    it("converts name with multiple underscores", async () => {
      expect(underScoreToCamelCase("part1_part2_part3")).toBe(
        "part1Part2Part3"
      );
    });
    it("leaves name with no underscore", async () => {
      expect(underScoreToCamelCase("part1")).toBe("part1");
    });
  });

  describe("statusToNumber", () => {
    it("returns 50 for error", async () => {
      expect(statusToNumber("error")).toBe(50);
    });
    it("returns 40 for warning", async () => {
      expect(statusToNumber("warning")).toBe(40);
    });
    it("returns 30 for info", async () => {
      expect(statusToNumber("info")).toBe(30);
    });
    it("returns 20 for success", async () => {
      expect(statusToNumber("success")).toBe(20);
    });
    it("returns 10 for default", async () => {
      expect(statusToNumber("default")).toBe(10);
    });
    it("returns 0 for undefined", async () => {
      expect(statusToNumber(undefined)).toBe(0);
    });
  });

  describe("isHostNameLocal", () => {
    it("returns true for 'localhost'", async () => {
      expect(isHostnameLocal("localhost")).toBe(true);
    });
    it("returns true for '127.0.0.1'", async () => {
      expect(isHostnameLocal("127.0.0.1")).toBe(true);
    });
    it("returns true for '127.0.0.100'", async () => {
      expect(isHostnameLocal("127.0.0.100")).toBe(true);
    });
    it("returns false for '127.0.0.1000'", async () => {
      expect(isHostnameLocal("127.0.0.1000")).toBe(false);
    });
    it("returns false for '127.0.0.1.2'", async () => {
      expect(isHostnameLocal("127.0.0.1.2")).toBe(false);
    });
    it("returns true for '[::1]'", async () => {
      expect(isHostnameLocal("[::1]")).toBe(true);
    });
  });

  describe("isUriLocalHost", () => {
    it("returns true for 'https://localhost:300/foo/bar'", async () => {
      expect(isUriLocalhost("https://localhost:300/foo/bar")).toBe(true);
    });
    it("returns true for 'https://[0000:0000::1]:300/foo/bar'", async () => {
      expect(isUriLocalhost("https://[0000:0000::1]:300/foo/bar")).toBe(true);
    });
    it("returns true for 'http://127.0.0.5/'", async () => {
      expect(isUriLocalhost("http://127.0.0.5/")).toBe(true);
    });
    it("returns true for 'http://127.0.0.2.3/'", async () => {
      expect(isUriLocalhost("http://127.0.2.3/")).toBe(false);
    });
    it("returns false for 'http://127.0.0.500/'", async () => {
      // In Firefox, this will parse as URL,
      // Chromium and the jest environment throw.
      expect(isUriLocalhost("http://127.0.0.500/")).toBeFalsy();
    });
    it("returns false for 'tel:12345'", async () => {
      expect(isUriLocalhost("tel:12345")).toBe(false);
    });
    it("returns undefined for 'invalid uri'", async () => {
      expect(isUriLocalhost("invalid uri")).toBeUndefined();
    });
  });
});
