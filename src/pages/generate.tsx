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

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { FieldArrayRenderProps } from "formik";
import { FieldArray, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import generateClientIdDocument from "../lib/generateDocument/generateDocument";

function RedirectUrisComponent(props: FieldArrayRenderProps | void) {
  if (!props) {
    return <Grid container item spacing={1} />;
  }
  const { push, remove, form } = props;
  return (
    <Grid container item spacing={1}>
      {form.values.redirectUris.map((redirectUri: string, index: number) => {
        return (
          // index={key}, taken from https://formik.org/docs/examples/field-arrays
          // This seems fine in this context.
          // eslint-disable-next-line react/no-array-index-key
          <Grid container item key={index} spacing={1}>
            <Grid item sx={{ flexGrow: 1 }}>
              <TextField
                label="Redirect URI"
                name={`redirectUris.${index}`}
                value={redirectUri}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                inputProps={{ inputMode: "url" }}
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
                sx={{ height: 40, width: 40 }}
                disabled={form.values.redirectUris.length === 1}
              >
                x
              </Button>
            </Grid>
          </Grid>
        );
      })}
      <Grid container item marginLeft={2}>
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
  };

  const onReset = () => {
    setDocumentJson("");
  };

  const navigate = useNavigate();
  const onValidateButtonClick = () => {
    navigate(`/validator?document=${encodeURI(documentJson)}`);
  };

  // Scroll to validation results, once they are loaded.
  const jsonDocumentSectionRef = useRef<null | HTMLParagraphElement>(null);
  useEffect(() => {
    jsonDocumentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [documentJson]);

  return (
    <Grid
      container
      item
      maxWidth="50em"
      direction="column"
      marginLeft="auto"
      marginRight="auto"
    >
      <Grid container item>
        <Grid container item justifyContent="center">
          <Grid item>
            <Typography variant="h4">
              Generate a Client Identifier Document
            </Typography>
          </Grid>
        </Grid>
        <Grid container item padding={2} spacing={1} marginLeft={2}>
          <Grid item>
            <Typography variant="body1">
              This generator helps you set up a{" "}
              <a href="https://solid.github.io/solid-oidc/#clientids-document">
                Client Identifier Document
              </a>
              . A Client Identifier Document describes your application (i.e.
              the client), to a Solid OIDC Provider.
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              Do you want your users to grant your app granular access to their
              Solid Pods? Then you need a Client Identifier Document! The
              user&apos;s Identity Provider will check your Client Identifier
              Document, let the user authenticate, and issue an ID token to your
              application proving the user&apos;s identity.
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              Thanks to the Client Identifier, your application has a unique,
              global identity. It may be granted specific access, and users will
              have a better understanding of how their data is shared.
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          paddingLeft={2}
          paddingRight={2}
          direction="column"
          spacing={1}
        >
          <Grid item>
            <Typography variant="h5">
              Your app&apos;s (client&apos;s) essential information
            </Typography>
          </Grid>
          <Grid container item>
            <Formik
              onSubmit={onSubmit}
              onReset={onReset}
              initialValues={initialFormValues}
            >
              {(form) => (
                <Form>
                  <Grid
                    container
                    item
                    direction="column"
                    spacing={2}
                    padding={1}
                  >
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
                        helperText="The URI where your
                          Client Identifier Document is located. It identifies your
                          application, the client, to the Solid OIDC Provider.
                          The Client Identifier Document should be publicly accessible.
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

                    <Grid item container>
                      <FieldArray
                        name="redirectUris"
                        component={RedirectUrisComponent}
                      />
                    </Grid>
                    <Grid container item>
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
                          Recommended. A refresh token can be used to request
                          new access tokens after they expire. If not requested,
                          the user will have to re-authenticate after the access
                          token expires, which will happen quite frequently
                          (e.g. every 5 minutes or so). Field names: The field
                          `scope` will have the value `offline_access` set and
                          the field `grant_types` will have the value
                          `refresh_token` set.
                        </FormHelperText>
                      </Grid>
                    </Grid>
                    <Grid container item>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          Additional information displayed to users
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
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
                            <Grid container item>
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
                            </Grid>
                            <Grid container item>
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
                            </Grid>
                            <Grid container item>
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
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    <Grid container item>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          Advanced OIDC options
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container item spacing={2}>
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
                              <Grid item marginLeft={2} paddingRight={2}>
                                <FormHelperText>
                                  Usually, you will develop a Web Application.
                                  With a Client Identifier Document for a native
                                  application, your redirect urls will go to
                                  local host or use a non-http protocol. Field
                                  name: `application_type`
                                </FormHelperText>
                              </Grid>
                            </Grid>
                            <Grid item>
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
                                helperText="The number of seconds after which the
                              user must be actively re-authenticated.
                              Field name: `default_max_age`"
                              />
                            </Grid>
                            <Grid item>
                              <FormControlLabel
                                label="Request a time of authentication claim"
                                control={
                                  <Checkbox
                                    name="requireAuthTime"
                                    value={form.values.requireAuthTime}
                                    checked={form.values.requireAuthTime}
                                    onChange={form.handleChange}
                                  />
                                }
                              />
                              <Grid item marginLeft={2} paddingRight={2}>
                                <FormHelperText>
                                  Requests that the ID Token will contain a
                                  record (claim) with its time of creation, i.e.
                                  the authentication time. Field name:
                                  `require_auth_time`
                                </FormHelperText>
                              </Grid>
                            </Grid>
                          </Grid>
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
            display={documentJson ? undefined : "none"}
            marginTop={2}
            container
            item
            direction="column"
            justifyContent="space-between"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h4" ref={jsonDocumentSectionRef}>
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
            <Grid item container justifyContent="flex-end">
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={onValidateButtonClick}
                >
                  Validate Document
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
