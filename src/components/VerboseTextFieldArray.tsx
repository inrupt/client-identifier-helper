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

import {
  Button,
  FormHelperText,
  FormLabel,
  Grid,
  TextFieldProps,
} from "@mui/material";
import VerboseTextField, { VerboseFieldState } from "./VerboseTextField";

export type VerboseFieldArrayRenderProps = TextFieldProps & {
  /** Label for the individual text fields */
  fieldLabel: string;
  description: string | string[];
  values: string[];
  fieldStates?: (VerboseFieldState | undefined)[];

  pushItem(obj: unknown): void;
  removeItem(index: number): void;
};

export default function VerboseTextFieldArray(
  props: VerboseFieldArrayRenderProps
) {
  if (!props) {
    return <Grid container item spacing={1} />;
  }
  const {
    name: fieldName,
    label: textFieldArrayLabel,
    fieldLabel,
    description,
    values,
    fieldStates = undefined,

    pushItem,
    removeItem,
    ...textFieldProps
  } = props;

  const descriptions = Array.isArray(description) ? description : [description];

  return (
    <Grid container item className="VerboseTextFieldArray">
      <Grid container item>
        <FormLabel>{textFieldArrayLabel}</FormLabel>
        <Grid item marginLeft={2} paddingRight={2}>
          {descriptions.map((descriptionParagraph) => (
            <FormHelperText>{descriptionParagraph}</FormHelperText>
          ))}
        </Grid>
      </Grid>

      <Grid container item spacing={1} className={fieldName}>
        {values.map((value: string, index: number) => {
          return (
            // index={key}, taken from https://formik.org/docs/examples/field-arrays
            // This seems fine in this context.
            // eslint-disable-next-line react/no-array-index-key
            <Grid container item key={index} spacing={1}>
              <Grid item sx={{ flexGrow: 1 }}>
                <VerboseTextField
                  // We pass all props, in order leave the flexibility
                  // of customizing the text field top level.
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...textFieldProps}
                  name={`${fieldName}.${index}`}
                  label={fieldLabel}
                  state={
                    Array.isArray(fieldStates) ? fieldStates[index] : undefined
                  }
                  value={value}
                />
              </Grid>
              <Grid item>
                <Button
                  type="button"
                  title="Remove this field"
                  className="RemoveItemButton"
                  onClick={() => removeItem(index)}
                  color="secondary"
                  variant="outlined"
                  sx={{ height: 40, width: 40 }}
                  disabled={values.length === 1}
                >
                  x
                </Button>
              </Grid>
            </Grid>
          );
        })}
        <Grid container item marginLeft={2}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => pushItem("")}
            className="AddNewButton"
          >
            Add new
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

VerboseTextFieldArray.defaultProps = {
  fieldStates: undefined,
};
