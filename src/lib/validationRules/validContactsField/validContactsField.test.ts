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
import validContactsField from "./validContactsField";

describe("maintainer contacts email fields should be set", () => {
  it("infos on unset email", async () => {
    const resultsForNoUrl = await validContactsField.check({
      document: {
        contacts: undefined,
      },
    });
    expect(resultsForNoUrl).toHaveLength(1);
    expect(resultsForNoUrl[0].title).toMatch(
      /No maintainer contact information/
    );
  });

  it("errors on non-array contacts field", async () => {
    const resultsForNoUrl = await validContactsField.check({
      document: {
        contacts: "mailNotAsArray@app.example",
      },
    });
    expect(resultsForNoUrl).toHaveLength(1);
    expect(resultsForNoUrl[0].title).toMatch(/Invalid `contacts` field/);
  });

  it("passes on filled contacts array field", async () => {
    const resultsForSuccess = await validContactsField.check({
      document: {
        contacts: ["maintainers@app.example"],
      },
    });
    expect(resultsForSuccess).toHaveLength(0);
  });

  it("errors on non-string contact field", async () => {
    const resultsForInvalidContactField = await validContactsField.check({
      document: {
        contacts: ["maintainers@app.example", 3],
      },
    });
    expect(resultsForInvalidContactField).toHaveLength(1);
    expect(resultsForInvalidContactField[0].title).toMatch(
      /Invalid type for contact/
    );
    expect(resultsForInvalidContactField[0].affectedFields[0].fieldName).toBe(
      "contacts[1]"
    );
  });
  it("warns on empty string in contact field", async () => {
    const resultsForWarning = await validContactsField.check({
      document: {
        contacts: ["", "maintainers@app.example"],
      },
    });
    expect(resultsForWarning).toHaveLength(1);
    expect(resultsForWarning[0].title).toMatch(/Empty contact field/);
    expect(resultsForWarning[0].affectedFields[0].fieldName).toMatch(
      "contacts[0]"
    );
  });
});
