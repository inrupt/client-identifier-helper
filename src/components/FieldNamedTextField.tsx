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

import { Grid, Typography } from "@mui/material";
import VerboseTextField, { VerboseTextFieldProps } from "./VerboseTextField";

export interface FieldNamedTextFieldProps extends VerboseTextFieldProps {
  fieldName: string;
}

export default function FieldNamedTextField(props: FieldNamedTextFieldProps) {
  const { fieldName, ...restProps } = props;
  return (
    <Grid container item>
      <Grid container item direction="row" spacing={1} justifyContent="end">
        <Grid item>
          <Typography fontSize={12}>Field name:</Typography>
        </Grid>
        <Grid item>
          <Typography fontSize={12} fontFamily="Courier Prime">
            {fieldName}
          </Typography>
        </Grid>
      </Grid>

      <VerboseTextField
        // Pass all remaining props down to the text field.
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
      />
    </Grid>
  );
}
