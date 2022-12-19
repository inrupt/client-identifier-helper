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

import { FormikValues, useFormik } from "formik";
import {
  FormFieldStates,
  useFieldStates,
  VerboseFieldState,
} from "../lib/formValidationTypes";

/**
 * Extends the {@link useFormik} function by adding state property supporting
 * verbose field state management.
 *
 * @param initialValues The initial values for the form fields.
 * @param initialStates The initial states of the form fields.
 *
 * @returns formik object
 */
export default function useVerboseFormik<FormParameters extends FormikValues>({
  initialValues,
  initialStates,
}: {
  initialValues: FormParameters;
  initialStates: FormFieldStates<FormParameters, VerboseFieldState | undefined>;
}) {
  const states = useFieldStates<FormParameters, VerboseFieldState | undefined>(
    initialStates
  );

  const formik = useFormik<FormParameters>({
    initialValues,
    onSubmit: () => {},
    validateOnBlur: false,
    validateOnChange: false,
  });

  const modifiedFormik: Omit<
    typeof formik,
    "errors" | "setErrors" | "initialErrors" | "setFieldErrors"
  > & {
    states: typeof states;
  } = { ...formik, states };

  // Helper to add an array field's child value.
  const addChild = async (fieldName: keyof FormParameters, value: unknown) => {
    await formik.setValues({
      ...formik.values,
      [fieldName]: [...formik.values[fieldName], value],
    });
    states.setChildren(fieldName, [
      ...(states.all[fieldName].childStates || []),
      undefined,
    ]);
  };

  // Helper to remove an array field's child value.
  const removeChild = async (
    fieldName: keyof FormParameters,
    index: number
  ) => {
    const values = formik.values[fieldName];
    if (!Array.isArray(values)) {
      throw new Error(
        "Cannot remove child form value from an object that's not an array."
      );
    }
    await formik.setValues({
      ...formik.values,
      [fieldName]: values.filter((_: unknown, i: number) => i !== index),
    });
    states.setChildren(
      fieldName,
      states.all[fieldName].childStates?.filter((_, i) => i !== index) || []
    );
  };

  return { ...modifiedFormik, addChild, removeChild };
}
