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
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import type { FieldArrayRenderProps } from "formik";
import { FieldArray, Form, Formik } from "formik";
import generateClientIdDocument from "../lib/generateDocument";

function RedirectUrisComponent({ push, remove, form }: FieldArrayRenderProps) {
  return (
    <Grid container item spacing={1}>
      {form.values.redirectUris.map((redirectUri: string, index: number) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Grid container item key={index}>
            <Grid container item xs>
              <TextField
                label="Redirect URI"
                name={`redirectUris.${index}`}
                value={redirectUri}
                onChange={form.handleChange}
                type="url"
                variant="outlined"
                required
                fullWidth
              />
            </Grid>
            <Grid item>
              <Button
                type="button"
                title="Remove Redirect URI of this row"
                onClick={() => remove(index)}
                color="secondary"
                variant="outlined"
                style={{ height: "100%" }}
              >
                x
              </Button>
            </Grid>
          </Grid>
        );
      })}
      <Grid item>
        <Button type="button" variant="outlined" onClick={() => push("")}>
          Add new
        </Button>
      </Grid>
    </Grid>
  );
}

type FormParameters = {
  clientId: string;
  clientName: string;
  clientUri: string;
  redirectUris: string[];
  useRefreshTokens: boolean;
};

export default function ClientIdentifierGenerator() {
  const [documentJson, setDocumentJson] = useState("");

  const initialFormValues: FormParameters = {
    clientId: "",
    clientName: "",
    clientUri: "",
    redirectUris: [""],
    useRefreshTokens: true,
  };

  const onSubmit = (values: FormParameters) => {
    const clientIdDocument = generateClientIdDocument({
      ...values,
      redirectUris: values.redirectUris.filter((s) => s.length > 0),
      compact: false,
    });
    setDocumentJson(clientIdDocument);
  };

  const onReset = () => {
    setDocumentJson("");
  };

  return (
    <>
      <Typography variant="h3">
        Generate a Client Identifier Document
      </Typography>
      <Grid container padding={2} direction="row">
        <Grid container item direction="column" md={6}>
          <Formik
            onSubmit={onSubmit}
            onReset={onReset}
            initialValues={initialFormValues}
          >
            {(form) => (
              <Form>
                <Grid container item direction="column" spacing={2}>
                  <Grid container item>
                    <TextField
                      type="url"
                      name="clientId"
                      label="Client Identifier URI"
                      value={form.values.clientId}
                      onChange={form.handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid container item>
                    <TextField
                      type="text"
                      name="clientName"
                      label="Client Name"
                      value={form.values.clientName}
                      onChange={form.handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid container item>
                    <TextField
                      type="url"
                      name="clientUri"
                      label="Client Homepage URI"
                      value={form.values.clientUri}
                      onChange={form.handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid container item>
                    <FormLabel>Redirect URIs</FormLabel>
                  </Grid>
                  <Grid item container marginLeft={3} paddingRight={3}>
                    <FieldArray
                      name="redirectUris"
                      component={RedirectUrisComponent}
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      label="Support usage of refresh tokens / offline access"
                      control={
                        <Checkbox
                          name="useRefreshTokens"
                          value={form.values.useRefreshTokens}
                          checked={form.values.useRefreshTokens}
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
              </Form>
            )}
          </Formik>
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
        <Grid container item direction="column" md={6} alignContent="center">
          <Typography variant="h3">Validation Results</Typography>
        </Grid>
      </Grid>
    </>
  );
}
