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

import { FormHelperText, Grid, Switch, Typography } from "@mui/material";

export default function VerboseCheckBox({
  name: fieldName,
  label,
  description,
  value,
  onChange,
}: {
  name: string;
  label: string;
  description: string;
  value: boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}) {
  return (
    <Grid
      item
      sx={{
        borderRadius: "4px",
        border: 1,
        borderColor: "rgba(0,0,0,0.23)",
        "&:hover": { borderColor: "rgba(0, 0, 0, 0.87)" },
      }}
      padding={2}
    >
      <Grid container alignItems="center" sx={{ flexFlow: "row" }}>
        <Grid item flexGrow={1}>
          <Typography>{label}</Typography>
        </Grid>
        <Grid item>
          <Switch
            sx={{ marginTop: "-8px", marginBottom: "-8px" }}
            name={fieldName}
            value={value}
            checked={value}
            onChange={onChange}
          />
        </Grid>
      </Grid>

      <Grid item>
        <FormHelperText>{description}</FormHelperText>
      </Grid>
    </Grid>
  );
}
