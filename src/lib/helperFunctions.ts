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
  const parts = str.split("_");
  const partsCaps = parts
    .slice(1)
    .map((part) => part.substring(0, 1).toUpperCase() + part.substring(1));
  return [parts[0], partsCaps].join("");
};

export const statusToNumber = (
  state: undefined | "default" | "success" | "info" | "warning" | "error"
): number => {
  switch (state) {
    case "error":
      return 50;
    case "warning":
      return 40;
    case "info":
      return 30;
    case "success":
      return 20;
    case "default":
      return 10;
    case undefined:
      return 0;
    default:
      return 0;
  }
};
