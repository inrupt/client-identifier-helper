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
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import type { FieldArrayRenderProps } from "formik";
import { FieldArray, Form, Formik } from "formik";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ValidationResults from "../components/validationResults";
import generateClientIdDocument from "../lib/generateDocument";
import { localRules } from "../lib/validationRules";
import validateLocalDocument from "../lib/validateLocalDocument";
import { ValidationResult } from "../lib/types";

function RedirectUrisComponent(props: FieldArrayRenderProps | void) {
  if (!props) {
    return <Grid container item spacing={1} />;
  }
  const { push, remove, form } = props;
  return (
    <Grid container item spacing={1}>
      {form.values.redirectUris.map((redirectUri: string, index: number) => {
        return (
          // index={key} taken from https://formik.org/docs/examples/field-arrays
          // this seems fine in this context
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
                size="small"
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
                disabled={form.values.redirectUris.length === 1}
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
  logoUri: string;
  tosUri: string;
  policyUri: string;
  contact: string;
  applicationType: "web" | "native";
  requireAuthTime?: boolean;
  defaultMaxAge?: number;
};

export default function ClientIdentifierGenerator() {
  const [documentJson, setDocumentJson] = useState("");
  const [validationResults, setValidationResults] = useState(
    [] as ValidationResult[]
  );
  const [expandedPanel, setExpandedPanel] = useState(
    undefined as string | undefined
  );
  const initialFormValues: FormParameters = {
    clientId: "",
    clientName: "",
    clientUri: "",
    redirectUris: [""],
    useRefreshTokens: true,
    logoUri: "",
    tosUri: "",
    policyUri: "",
    contact: "",
    applicationType: "web",
    requireAuthTime: false,
    defaultMaxAge: undefined,
  };

  const onSubmit = async (values: FormParameters) => {
    const clientIdDocument = generateClientIdDocument({
      ...values,
      redirectUris: values.redirectUris.filter((s) => s.length > 0),
      compact: false,
    });
    setDocumentJson(clientIdDocument);

    const results = await validateLocalDocument(clientIdDocument, localRules);
    setValidationResults(results);
  };

  const onReset = () => {
    setDocumentJson("");
  };

  const onPanelChange =
    (panel: string) => (e: React.SyntheticEvent, newExpanded: boolean) => {
      setExpandedPanel(newExpanded ? panel : false);
    };

  return (
    <>
      <Typography variant="h4">
        Generate a Client Identifier Document
      </Typography>
      <Grid container padding={2} direction="row">
        <Grid container item direction="column" md={6} spacing={1}>
          <Typography variant="h5">
            Generate a Client Identifier Document
          </Typography>
          <Grid item>
            <Typography variant="body1">
              This generator helps you set up a Client Identifier Document. A
              Client Identifier Document describes your application, the client,
              to a Solid OpenID Connect Provider (Solid OIDC Provider).
            </Typography>
            <Typography variant="body1">
              You need a Client Identifier Document to authenticate your
              application, i.e. gain an OIDC ID token.
            </Typography>
          </Grid>
          <Grid item>
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
                        name="clientId"
                        inputProps={{ inputMode: "url" }}
                        required
                        value={form.values.clientId}
                        onChange={form.handleChange}
                        fullWidth
                        size="small"
                        label="Client Identifier URI"
                        helperText="The URI that locates the
                          Client Identifier Document. It identifies your
                          application, the client, to the Solid OIDC Provider.
                          The Client Identifier Document should be static and
                          publicly accessible
                          Field name: `client_id`"
                      />
                    </Grid>
                    <Grid container item>
                      <TextField
                        name="clientName"
                        type="text"
                        required
                        value={form.values.clientName}
                        onChange={form.handleChange}
                        fullWidth
                        size="small"
                        label="Client Name"
                        helperText="Your application name
                        displayed to the user when they are authenticating
                        your application at the Solid OIDC Provider. Field name: `client_name`"
                      />
                    </Grid>
                    <Grid container item>
                      <TextField
                        type="url"
                        name="clientUri"
                        required
                        value={form.values.clientUri}
                        onChange={form.handleChange}
                        fullWidth
                        size="small"
                        label="Client Homepage URI"
                        helperText="The URI of your application's homepage.
                        Displayed to the user when they are authenticating
                        your application at the Solid OIDC Provider.
                        Field name: `client_uri`"
                      />
                    </Grid>
                    <Grid container item>
                      <FormLabel>Redirect URIs</FormLabel>
                      <Grid container>
                        <Grid item marginLeft={2} paddingRight={2}>
                          <FormHelperText>
                            The URIs that the Solid OIDC Provider is allowed to
                            redirect to after the user authenticated at the OIDC
                            Provider.
                          </FormHelperText>
                          <FormHelperText>
                            Flow: Your application will send an authentication
                            request to the OIDC Provider with one redirect URI.
                            The OIDC Provider redirects the browser/user agent
                            to the redirect URI after the user authenticated and
                            issues a code to your application that it can use to
                            complete authentication. Field name: `redirect_uris`
                          </FormHelperText>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item container marginLeft={2} paddingRight={2}>
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
                      <Grid item marginLeft={2} paddingRight={2}>
                        <FormHelperText>
                          A refresh token can be used to request new access
                          tokens after they expire. If not requested, the user
                          will have to re-authenticate after the access token
                          expires. Field names: The field `scope` will have the
                          value `offline_access` set and the field `grant_types`
                          will have the value `refresh_token` set.
                        </FormHelperText>
                      </Grid>
                    </Grid>
                    <Grid container item>
                      <Accordion
                        expanded={expandedPanel === "panelAppURIs"}
                        onChange={onPanelChange("panelAppURIs")}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          More fields
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container item>
                            <TextField
                              name="logoUri"
                              inputProps={{ inputMode: "url" }}
                              value={form.values.logoUri}
                              onChange={form.handleChange}
                              fullWidth
                              size="small"
                              label="Logo URI"
                              helperText="The URI to the logo of your application.
                                This will be displayed by the OIDC Provider while
                                the user is logging in. Field name: `logo_uri`"
                            />
                          </Grid>
                          <TextField
                            name="policyUri"
                            inputProps={{ inputMode: "url" }}
                            value={form.values.policyUri}
                            onChange={form.handleChange}
                            fullWidth
                            size="small"
                            label="Policy URI"
                            helperText="The URI to the Policy terms of
                              your application. This will be linked to by the
                              OIDC Provider while the user is logging in.
                              Field name: `policy_uri`"
                          />
                          <TextField
                            name="tosUri"
                            inputProps={{ inputMode: "url" }}
                            value={form.values.tosUri}
                            onChange={form.handleChange}
                            fullWidth
                            size="small"
                            label="Terms of Service URI"
                            helperText="The URI to the Terms of Service of
                              your application. This will be linked to by the
                              OIDC Provider while the user is logging in.
                              Field name: `tos_uri`"
                          />
                          <TextField
                            name="contact"
                            inputProps={{ inputMode: "url" }}
                            value={form.values.contact}
                            onChange={form.handleChange}
                            fullWidth
                            size="small"
                            label="Contact"
                            helperText="An email address to reach out to the
                              application owners/developers.
                              Field name: `contacts`"
                          />
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    <Grid container item>
                      <Accordion
                        expanded={expandedPanel === "panelTechnicalFields"}
                        onChange={onPanelChange("panelTechnicalFields")}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          More technical fields
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid item>
                            <InputLabel
                              variant="standard"
                              id="applicationTypeLabel"
                            >
                              Application Type
                            </InputLabel>
                            <Select
                              name="applicationType"
                              value={form.values.applicationType}
                              labelId="applicationTypeLabel"
                              onChange={form.handleChange}
                              size="small"
                            >
                              <MenuItem value="web">Web Application</MenuItem>
                              <MenuItem value="native">
                                Native Application
                              </MenuItem>
                            </Select>
                          </Grid>
                          <TextField
                            type="number"
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }}
                            name="defaultMaxAge"
                            value={form.values.defaultMaxAge}
                            onChange={form.handleChange}
                            fullWidth
                            size="small"
                            label="Default maximum age"
                            helperText="TODO: description"
                          />
                          <FormControlLabel
                            label="Require Auth Time?"
                            control={
                              <Checkbox
                                name="requireAuthTime"
                                value={form.values.requireAuthTime}
                                checked={form.values.requireAuthTime}
                                onChange={form.handleChange}
                              />
                            }
                          />{" "}
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    <Grid item container justifyContent="flex-end" spacing={2}>
                      <Grid item>
                        <Button
                          color="secondary"
                          variant="outlined"
                          type="reset"
                        >
                          Reset
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          color="primary"
                          variant="contained"
                          type="submit"
                        >
                          Generate
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Grid>

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
                inputProps={{ readOnly: true }}
                value={documentJson}
                fullWidth
                minRows={15}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container item direction="column" md={6}>
          <Grid
            container
            item
            justifyContent="center"
            alignContent="start"
            xs={12}
          >
            <Grid item>
              <Typography variant="h3">Validation Results</Typography>
            </Grid>
            <ValidationResults results={validationResults} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
