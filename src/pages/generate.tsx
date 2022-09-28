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
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { FieldArrayRenderProps, FormikProps } from "formik";
import { FieldArray, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VerboseTextField, {
  FieldStatus,
  VerboseFieldState,
} from "../components/VerboseTextField";
import generateClientIdDocument from "../lib/generateDocument/generateDocument";
import { statusToNumber } from "../lib/helperFunctions";
import { validateField } from "../lib/validateLocalDocument";
import { localRules } from "../lib/validationRules";
import { useFieldStates } from "../components/generatorFormValidation";
import VerboseTextFieldArray from "../components/VerboseTextFieldArray";
import {
  FormParameters,
  getFormParametersKey,
} from "../lib/generatorFormParameters";

export default function ClientIdentifierGenerator() {
  const [documentJson, setDocumentJson] = useState("");
  const [hasFormError, setHasFormError] = useState("");
  const [
    formFieldStates,
    setFormFieldStates,
    setFormFieldState,
    setFormArrayFieldStates,
  ] = useFieldStates<FormParameters, VerboseFieldState | undefined>({
    redirectUris: [],
  });

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

  const onReset = () => {
    setDocumentJson("");
    setHasFormError("");
    setFormFieldStates({
      redirectUris: [],
    });
  };

  const navigate = useNavigate();
  const onValidateButtonClick = () => {
    navigate(`/validator?document=${encodeURI(documentJson)}`);
  };

  // Validates field and sets validation result status.
  const validateFormField = async (
    fieldName: string,
    formValues: FormParameters
  ): Promise<FieldStatus> => {
    // In case, the field is in a text field array,
    // it will have an index separated by a `.`.
    const [targetFieldName, arrayFieldIndexStr] = fieldName.split(".");
    const arrayFieldIndex =
      arrayFieldIndexStr && Number.isInteger(Number(arrayFieldIndexStr))
        ? Number(arrayFieldIndexStr)
        : undefined;

    const targetFieldKey = getFormParametersKey(targetFieldName);

    // If the field is an array field and no index was given, validate all children.
    const targetField = formValues[targetFieldKey];
    if (Array.isArray(targetField) && arrayFieldIndex === undefined) {
      const validationStatusPromises = targetField.map((value, index) =>
        validateFormField(`${targetFieldKey}.${index}`, formValues)
      );
      const resultStatusesSorted = (
        await Promise.all(validationStatusPromises)
      ).sort(
        (status1, status2) => statusToNumber(status2) - statusToNumber(status1)
      );
      // Return most severe status.
      return resultStatusesSorted[0];
    }

    // Generate document from current form state and validate the field.
    const clientIdDocument = generateClientIdDocument({
      ...formValues,
      compact: false,
    });
    const fieldValidationResults = await validateField(
      clientIdDocument,
      targetFieldKey +
        (arrayFieldIndex !== undefined ? `[${arrayFieldIndex}]` : ""),
      localRules
    );

    // Order fields by status severity.
    const resultsByStatus = fieldValidationResults.sort(
      (r1, r2) => statusToNumber(r2.status) - statusToNumber(r1.status)
    );
    // Set status of field with highest severity present in results.
    const mostSevereStatus = resultsByStatus[0]?.status;

    // Function to set the state of the target field.
    const setFieldState =
      arrayFieldIndex === undefined
        ? (state?: VerboseFieldState) =>
            setFormFieldState(targetFieldKey, state)
        : (state?: VerboseFieldState) =>
            setFormArrayFieldStates(targetFieldKey, state, arrayFieldIndex);

    // Omit showing success messages on fields.
    if (mostSevereStatus !== "success") {
      // Show all result descriptions in helper text.
      setFieldState({
        statusValue: mostSevereStatus,
        statusDescription: resultsByStatus
          .map((result) => result.description)
          .join("\n"),
      });
    } else {
      // Remove status notes.
      setFieldState(undefined);
    }

    return mostSevereStatus;
  };

  const formHasErrors = () => {
    const hasErrors = Object.entries(formFieldStates).some(([, state]) => {
      if (Array.isArray(state)) {
        return state.some((stat) => stat?.statusValue === "error");
      }
      return state.statusValue === "error";
    });
    return hasErrors;
  };

  /**
   * Handles field validation triggers
   */
  const handleFieldBlur = async (
    form: FormikProps<FormParameters>,
    blurEvent: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    form.handleBlur(blurEvent);

    const fieldName = blurEvent.target.name;

    if (!fieldName) {
      return;
    }

    // If the value has not initially been set, do not validate.
    if (!form.getFieldMeta(fieldName).touched && !blurEvent.target.value) {
      return;
    }

    await validateFormField(fieldName, form.values);

    if (!formHasErrors()) {
      setHasFormError("");
    }
  };

  /** Set field validation status for each field.
   * @returns true, if form has errors.
   */
  const validateAll = async (form: FormikProps<FormParameters>) => {
    const fieldStatuses = await Promise.all(
      Object.keys(form.values).map((parameter) =>
        validateFormField(parameter, form.values)
      )
    );

    // set all fields to touched
    Object.keys(form.values).forEach((field) =>
      form.setFieldTouched(field, true)
    );

    return fieldStatuses.some((s) => s === "error");
  };

  const onSubmit = async (form: FormikProps<FormParameters>) => {
    const hasErrors = await validateAll(form);

    if (hasErrors) {
      setHasFormError("There are errors in the form.");
      return;
    }
    setHasFormError("");

    const clientIdDocument = generateClientIdDocument({
      ...form.values,
      compact: false,
    });
    setDocumentJson(clientIdDocument);
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
              onReset={onReset}
              onSubmit={() => {}}
              initialValues={initialFormValues}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {(form) => {
                return (
                  <Form>
                    <Grid
                      container
                      item
                      direction="column"
                      spacing={3}
                      padding={1}
                    >
                      <Grid container item>
                        <VerboseTextField
                          name="clientId"
                          label="Client Identifier URI"
                          description="The URI where your Client Identifier Document is
                            located. It identifies your application, the client,
                            to the Solid OIDC Provider. The Client Identifier
                            Document should be a static resource and publicly
                            accessible. Field name: `client_id`"
                          state={formFieldStates.clientId}
                          required
                          value={form.values.clientId}
                          onChange={form.handleChange}
                          onBlur={(e) => handleFieldBlur(form, e)}
                          inputProps={{ inputMode: "url" }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid container item>
                        <VerboseTextField
                          name="clientName"
                          label="Client Name"
                          description="Your application name displayed to the user when
                              they are authenticating your application at the
                              Solid OIDC Provider. Field name: `client_name`"
                          state={formFieldStates.clientName}
                          required
                          value={form.values.clientName}
                          onChange={form.handleChange}
                          onBlur={(e) => handleFieldBlur(form, e)}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid container item>
                        <VerboseTextField
                          name="clientUri"
                          label="Client Homepage URI"
                          description="The URI of your application's homepage.
                              Displayed to the user when they are authenticating
                              your application at the Solid OIDC Provider. Field
                              name: `client_uri`"
                          state={formFieldStates.clientUri}
                          required
                          value={form.values.clientUri}
                          onChange={form.handleChange}
                          onBlur={(e) => handleFieldBlur(form, e)}
                          fullWidth
                          size="small"
                        />
                      </Grid>

                      <Grid item container>
                        <FieldArray name="redirectUris">
                          {(props: FieldArrayRenderProps) => (
                            <VerboseTextFieldArray
                              label="Redirect URIs"
                              fieldLabel="Redirect URI"
                              name="redirectUris"
                              description={[
                                "The URIs that the Solid OIDC Provider is allowed to redirect to after the user authenticated at the OIDC Provider.",
                                "Flow: Your application will send an authentication request to the OIDC Provider with one redirect URI. The OIDC Provider redirects the browser/user agent to the redirect URI after the user authenticated and issues a code to your application that it can use to complete authentication. Field name: `redirect_uris`",
                              ]}
                              fieldStates={formFieldStates.redirectUris}
                              values={form.values.redirectUris}
                              pushItem={props.push}
                              removeItem={(index) => {
                                props.remove(index);
                                setFormFieldState(
                                  "redirectUris",
                                  formFieldStates.redirectUris?.filter(
                                    (_val, i) => index !== i
                                  )
                                );
                              }}
                              onChange={form.handleChange}
                              onBlur={(e) => handleFieldBlur(form, e)}
                              inputProps={{ inputMode: "url" }}
                              fullWidth
                              size="small"
                              required
                            />
                          )}
                        </FieldArray>
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
                            new access tokens after they expire. If not
                            requested, the user will have to re-authenticate
                            after the access token expires, which will happen
                            quite frequently (e.g. every 5 minutes or so). Field
                            names: The field `scope` will have the value
                            `offline_access` set and the field `grant_types`
                            will have the value `refresh_token` set.
                          </FormHelperText>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Accordion>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            className="UserInformationFieldsHead"
                          >
                            Additional information displayed to users
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid container item>
                                <VerboseTextField
                                  name="logoUri"
                                  label="Logo URI"
                                  description="The URI to the logo of your application.
                                  This will be displayed by the OIDC Provider while
                                  the user is logging in. Field name: `logo_uri`"
                                  state={formFieldStates.logoUri}
                                  value={form.values.logoUri}
                                  onChange={form.handleChange}
                                  onBlur={(e) => handleFieldBlur(form, e)}
                                  inputProps={{ inputMode: "url" }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid container item>
                                <VerboseTextField
                                  name="policyUri"
                                  label="Policy URI"
                                  description="The URI to the Policy terms of
                                    your application. This will be linked to by the
                                    OIDC Provider while the user is logging in.
                                    Field name: `policy_uri`"
                                  state={formFieldStates.policyUri}
                                  value={form.values.policyUri}
                                  onChange={form.handleChange}
                                  onBlur={(e) => handleFieldBlur(form, e)}
                                  inputProps={{ inputMode: "url" }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid container item>
                                <VerboseTextField
                                  name="tosUri"
                                  label="Terms of Service URI"
                                  description="The URI to the Terms of Service of
                                    your application. This will be linked to by the
                                    OIDC Provider while the user is logging in.
                                    Field name: `tos_uri`"
                                  state={formFieldStates.tosUri}
                                  value={form.values.tosUri}
                                  onChange={form.handleChange}
                                  onBlur={(e) => handleFieldBlur(form, e)}
                                  inputProps={{ inputMode: "url" }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid container item>
                                <VerboseTextField
                                  name="contact"
                                  label="Contact"
                                  description="An email address to reach out to the
                                    application owners/developers.
                                    Field name: `contacts`"
                                  state={formFieldStates.tosUri}
                                  value={form.values.contact}
                                  onChange={form.handleChange}
                                  onBlur={(e) => handleFieldBlur(form, e)}
                                  inputProps={{ inputMode: "url" }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                      <Grid container item>
                        <Accordion>
                          <AccordionSummary
                            className="AdvancedFieldsHead"
                            expandIcon={<ExpandMoreIcon />}
                          >
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
                                  <MenuItem value="web">
                                    Web Application
                                  </MenuItem>
                                  <MenuItem value="native">
                                    Native Application
                                  </MenuItem>
                                </Select>
                                <Grid item marginLeft={2} paddingRight={2}>
                                  <FormHelperText>
                                    Usually, you will develop a Web Application.
                                    With a Client Identifier Document for a
                                    native application, your redirect urls will
                                    go to local host or use a non-http protocol.
                                    Field name: `application_type`
                                  </FormHelperText>
                                </Grid>
                              </Grid>
                              <Grid item>
                                <VerboseTextField
                                  name="defaultMaxAge"
                                  label="Default maximum age"
                                  description="The number of seconds after which the
                                    user must be actively re-authenticated.
                                    Field name: `default_max_age`"
                                  type="number"
                                  state={formFieldStates.defaultMaxAge}
                                  value={form.values.defaultMaxAge}
                                  onChange={form.handleChange}
                                  onBlur={(e) => handleFieldBlur(form, e)}
                                  inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                  }}
                                  fullWidth
                                  size="small"
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
                                    record (claim) with its time of creation,
                                    i.e. the authentication time. Field name:
                                    `require_auth_time`
                                  </FormHelperText>
                                </Grid>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                      <Grid
                        item
                        container
                        justifyContent="flex-end"
                        spacing={2}
                      >
                        <Typography color="error">{hasFormError}</Typography>
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
                            onClick={() => onSubmit(form)}
                            name="generateDocument"
                            color="primary"
                            variant="contained"
                          >
                            Generate
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
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
                name="generatedJson"
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
