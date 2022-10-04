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

import { useState } from "react";

/**
 * Provides a type to store states of type State of a form
 * with field values of type `Value`.
 * Inspired by `FormikErrors<Values>` type.
 */
export declare type FormFieldStates<Values, State> = {
  [K in keyof Values]: { state?: State; childStates?: State[] };
};

/**
 * Provides a type to store string helper texts of a form
 * with field values of type `Value`.
 * Inspired by `FormikErrors<Values>` type.
 */
export declare type FormFieldHelperTexts<Values> = FormFieldStates<
  Values,
  string
>;

/**
 * Helper function to manage field values of verbose forms.
 *
 * @param initialValues
 * @returns [states, setStates, setFieldState, setArrayFieldState]
 */
export function useFieldStates<IFormParameters, V>(
  initialValues: FormFieldStates<IFormParameters, V>
): [
  FormFieldStates<IFormParameters, V>,
  React.Dispatch<React.SetStateAction<FormFieldStates<IFormParameters, V>>>,
  (fieldName: keyof IFormParameters, value: V) => void,
  (fieldName: keyof IFormParameters, value: V, index: number) => void,
  (fieldName: keyof IFormParameters, value: V[]) => void
] {
  const [states, setStates] = useState(initialValues);

  const setFieldState = (fieldName: keyof IFormParameters, value: V) => {
    setStates((previousState) => {
      const target = previousState[fieldName];
      target.state = value;
      return { ...previousState, [fieldName]: target };
    });
  };
  const setChildState = (
    fieldName: keyof IFormParameters,
    value: V,
    index: number
  ) => {
    setStates((previousState) => {
      const target = previousState[fieldName];

      if (!Array.isArray(target?.childStates)) {
        target.childStates = [];
      }
      target.childStates[index] = value;

      return { ...previousState, [fieldName]: target };
    });
  };

  const setChildStates = (fieldName: keyof IFormParameters, value: V[]) => {
    setStates((previousState) => {
      const target = previousState[fieldName];
      target.childStates = value;
      return { ...previousState, [fieldName]: target };
    });
  };

  return [states, setStates, setFieldState, setChildState, setChildStates];
}

export type FieldStatus = "error" | "warning" | "info" | "success" | undefined;

export interface VerboseFieldState {
  statusDescription?: string;
  statusValue?: FieldStatus;
}
