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
import { FormHelperText, FormHelperTextProps, styled } from "@mui/material";

export type FieldStatus = "error" | "warning" | "info" | "success" | undefined;

export interface VerboseFieldState {
  statusDescription: string;
  statusValue: FieldStatus;
}

export interface FormTextFieldProps extends OutlinedTextFieldProps {
  state?: VerboseFieldState;
  description?: string;
  formDescriptionTextProps?: FormHelperTextProps;
}

const StyledTextField = styled(TextField)<FormTextFieldProps>(({ theme }) => ({
  "& .Mui-error": {
    color: theme.palette.error.main,
  },
  "& .Mui-warning": {
    color: theme.palette.warning.main,
  },
  "& .Mui-info": {
    color: theme.palette.info.dark,
  },
  "& .Mui-success": {
    color: theme.palette.success.main,
  },
}));

/**
 * Text field with an additional description field used to give additional information
 * about the use of the field and state prop to indicate, if the text field is in
 * an error, warning, info, or success state.
 * @param props.description The description text for the field.
 * @param props.state The status color of the text field.
 * @returns
 */
export default function VerboseTextField(
  props: Omit<FormTextFieldProps, "variant">
) {
  const {
    state = undefined,
    description = undefined,
    formDescriptionTextProps = {},
  } = props;

  const labelColor = !state?.statusValue ? "primary" : state.statusValue;

  return (
    <>
      <StyledTextField
        helperText={state?.statusDescription}
        InputLabelProps={{ className: `Mui-${labelColor}` }}
        size="small"
        variant="outlined"
        {...props}
        FormHelperTextProps={{
          className: `Mui-${labelColor}`,
        }}
      />

      {!description ? null : (
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
