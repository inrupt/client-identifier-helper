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
import { RuleResult, ValidationContext, ValidationRule } from "../../types";

const noUnsetClientUri: ValidationRule = {
  rule: {
    type: "local",
    name: "Document should provide contact information",
    description:
      "The field `contacts` should provide at least one maintainer contact. It is stored as array of strings.",
  },
  check: async (context: ValidationContext) => {
    if (
      !context.document.contacts ||
      (Array.isArray(context.document.contacts) &&
        context.document.contacts.length === 0)
    ) {
      return [
        {
          status: "info",
          title: "No maintainer contact information",
          description:
            "The field `contacts` should provide email address information to the client's maintainers.",
          affectedFields: [
            {
              fieldName: "contacts",
              fieldValue: context.document.contacts,
            },
          ],
        },
      ];
    }

    if (!Array.isArray(context.document.contacts)) {
      return [
        {
          status: "error",
          title: "Invalid `contacts` field",
          description:
            "The field `contacts` must be a string array containing email addresses of the client's maintainers.",
          affectedFields: [
            {
              fieldName: "contacts",
              fieldValue: context.document.contacts,
            },
          ],
        },
      ];
    }

    const resultValues: RuleResult[] = [];
    context.document.contacts.forEach((contact, index) => {
      if (typeof contact !== "string") {
        resultValues.push({
          status: "error",
          title: "Invalid contact type",
          description: "Contact fields must be strings.",
          affectedFields: [
            { fieldName: `contacts[${index}]`, fieldValue: contact },
          ],
        });
      }
      if (contact === "") {
        resultValues.push({
          status: "warning",
          title: "Empty contact field",
          description:
            "The field should contain contact information to reach out to the maintainers of the application." +
            " Consider filling it or leaving it out",
          affectedFields: [
            { fieldName: `contacts[${index}]`, fieldValue: contact },
          ],
        });
      }
    });

    return resultValues;
  },
};

export default noUnsetClientUri;
