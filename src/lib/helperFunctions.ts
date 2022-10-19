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

export const underScoreToCamelCase = (str: string) => {
  return str
    .split("_")
    .map((part, idx) =>
      idx === 0 ? part : part.substring(0, 1).toUpperCase() + part.substring(1)
    )
    .join("");
};

export const statusToNumber = (
  state: undefined | "default" | "success" | "info" | "warning" | "error"
): number => {
  const statusToNumberMap = {
    error: 50,
    warning: 40,
    info: 30,
    success: 20,
    default: 10,
    undefined: 0,
  };

  if (state && Object.hasOwn(statusToNumberMap, state)) {
    return statusToNumberMap[state];
  }
  return 0;
};

const LOCALHOST_IP_REGEX = /^127.\d{1,3}.\d{1,3}.\d{1,3}$/;

export const isHostnameLocal = (hostname: string) => {
  if (hostname === "localhost" || hostname === "[::1]") {
    return true;
  }
  // Test 127.0.0.0/8 range.
  if (LOCALHOST_IP_REGEX.test(hostname)) {
    return true;
  }
  return false;
};

export const isUriLocalhost = (uri: string) => {
  try {
    return isHostnameLocal(new URL(uri).hostname);
  } catch (error) {
    return false;
  }
};
