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

/* eslint-disable react/jsx-props-no-spreading */

import TextField, { OutlinedTextFieldProps } from "@mui/material/TextField";
import { FormHelperText, FormHelperTextProps, Grid } from "@mui/material";
import { statusColors } from "../theme";
import VerboseHelperText from "./VerboseHelperText";
import { VerboseFieldState } from "../lib/formValidationTypes";
import FieldNameLabel from "./FieldNameLabel";

export interface VerboseTextFieldProps
  extends Omit<OutlinedTextFieldProps, "variant"> {
  state?: VerboseFieldState;
  description?: string;
  fieldName?: string;
  formDescriptionTextProps?: FormHelperTextProps;
}

/**
 * Text field with an additional description field used to give additional information
 * about the use of the field and state prop to indicate, if the text field is in
 * an error, warning, info, or success state.
 * @param props.description The description text for the field.
 * @param props.state The status color of the text field.
 * @returns
 */
export default function VerboseTextField(props: VerboseTextFieldProps) {
  const {
    state = undefined,
    description = undefined,
    fieldName = undefined,
    formDescriptionTextProps = {},
  } = props;

  const labelColor = !state?.statusValue ? "primary" : state.statusValue;

  return (
    <>
      {fieldName && (
        <Grid container item justifyContent="end">
          <FieldNameLabel fieldName={fieldName} />
        </Grid>
      )}

      <TextField
        InputLabelProps={{ className: `Mui-${labelColor}` }}
        size="small"
        variant="outlined"
        sx={statusColors}
        {...props}
      />

      <Grid item sx={{ paddingLeft: 2, marginTop: 0 }}>
        <VerboseHelperText state={state} />
      </Grid>

      {!description ? (
        <> </>
      ) : (
        <FormHelperText
          sx={{ paddingLeft: 2, marginTop: 0 }}
          {...formDescriptionTextProps}
        >
          {description}
        </FormHelperText>
      )}
    </>
  );
}

VerboseTextField.defaultProps = {
  state: undefined,
  description: undefined,
  fieldName: undefined,
  formDescriptionTextProps: undefined,
};
