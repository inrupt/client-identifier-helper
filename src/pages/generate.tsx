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
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import { useFormik } from "formik";
import { useState } from "react";
import generateClientIdDocument from "../lib/generateDocument";

export default function ClientIdentifierGenerator() {
  const [documentJson, setDocumentJson] = useState("");

  const form = useFormik({
    initialValues: {
      clientId: "",
      clientName: "",
      clientUri: "",
      redirectUris: "",
      useRefreshTokens: false,
    },
    onSubmit: (values) => {
      const generatedDocument = generateClientIdDocument({
        ...values,
        compact: false,
      });
      setDocumentJson(generatedDocument);
    },
    onReset: () => {
      setDocumentJson("");
    },
  });

  return (
    <>
      <Typography variant="h3">
        Generate a Client Identifier Document
      </Typography>
      <Grid container padding={2} direction="row">
        <Grid container item direction="column" md={6}>
          <form onSubmit={form.handleSubmit} onReset={form.handleReset}>
            <Grid container item direction="column" spacing={2}>
              <Grid item>
                <TextField
                  type="url"
                  name="clientId"
                  label="Client Identifier URI"
                  value={form.values.clientId}
                  onChange={form.handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  type="text"
                  name="clientName"
                  label="Client Name"
                  value={form.values.clientName}
                  onChange={form.handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  type="url"
                  name="clientUri"
                  label="Client Homepage URI"
                  value={form.values.clientUri}
                  onChange={form.handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  type="url"
                  name="redirectUris"
                  label="Redirect URI"
                  value={form.values.redirectUris}
                  onChange={form.handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  label="Support usage of refresh tokens / offline access"
                  control={
                    <Checkbox
                      name="useRefreshTokens"
                      value={form.values.useRefreshTokens}
                      onChange={form.handleChange}
                    />
                  }
                />
              </Grid>
              <Grid item container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <Button color="secondary" variant="outlined" type="reset">
                    Reset
                  </Button>
                </Grid>
                <Grid item>
                  <Button color="primary" variant="contained" type="submit">
                    Generate
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>

          <Grid
            marginTop={2}
            container
            item
            direction="column"
            justifyContent="space-between"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h4">
                Generated Client Identifier Document
              </Typography>
            </Grid>
            <Grid item>
              You can store this document at the location that your Client
              Identifier URI points to. It is the Client Identifier Document for
              your client.
            </Grid>
            <Grid item>
              <TextField
                label="Generated JSON"
                multiline
                readOnly
                value={documentJson}
                fullWidth
                minRows={15}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container item direction="column" alignContent="center" md={6}>
          <Typography variant="h3">Validation Results</Typography>
        </Grid>
      </Grid>
    </>
  );
}
