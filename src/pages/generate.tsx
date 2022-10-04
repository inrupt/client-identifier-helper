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

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
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
import FieldNameLabel from "../components/FieldNameLabel";
import {
  getEmptyFormState,
  FormParameters,
  getFormParametersKey,
} from "../lib/generatorFormParameters";
import VerboseSlider from "../components/VerboseSlider";
import VerboseTextFieldArray from "../components/VerboseTextFieldArray";
import generateClientIdDocument from "../lib/generateDocument/generateDocument";
import { statusToNumber } from "../lib/helperFunctions";
import { validateField } from "../lib/validateLocalDocument";
import { localRules } from "../lib/validationRules";
import {
  FieldStatus,
  useFieldStates,
  VerboseFieldState,
} from "../generatorFormValidationTypes";
import VerboseTextField from "../components/VerboseTextField";

export default function ClientIdentifierGenerator() {
  const [documentJson, setDocumentJson] = useState("");
  const [hasFormError, setHasFormError] = useState("");
  const [
    formFieldStates,
    setFormFieldStates,
    setFormFieldState,
    setFormArrayFieldState,
    setFormArrayFieldStates,
  ] = useFieldStates<FormParameters, VerboseFieldState | undefined>(
    getEmptyFormState()
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
    contacts: [""],
    applicationType: "web",
    requireAuthTime: false,
    defaultMaxAge: undefined,
  };

  const onReset = () => {
    setDocumentJson("");
    setHasFormError("");
    setFormFieldStates(getEmptyFormState());
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
    // In case, the field is in a text field array, it will have an index separated by a `.`.
    const [targetFieldName, arrayFieldIndexStr] = fieldName.split(".");
    const arrayFieldIndex =
      arrayFieldIndexStr && Number.isInteger(Number(arrayFieldIndexStr))
        ? Number(arrayFieldIndexStr)
        : undefined;

    // If validating an array field's child, validate the parent as well.
    if (arrayFieldIndex !== undefined) {
      await validateFormField(targetFieldName, formValues);
    }

    const targetFieldKey = getFormParametersKey(targetFieldName);

    // Generate document from current form state and validate the field.
    const clientIdDocument = generateClientIdDocument({
      ...formValues,
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
            setFormArrayFieldState(targetFieldKey, state, arrayFieldIndex);

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
    const hasErrors = Object.entries(formFieldStates).some(([, fieldState]) => {
      if (Array.isArray(fieldState.childStates)) {
        return fieldState.childStates.some(
          (state) => state?.statusValue === "error"
        );
      }
      return fieldState?.state?.statusValue === "error";
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
    const formValues = {
      ...form.values,
      contacts: form.values.contacts.filter((contact) => contact !== ""),
    };
    const fieldStatuses = (
      await Promise.all(
        Object.keys(formFieldStates).map(async (key) => {
          const formKey = getFormParametersKey(key);
          const value = formValues[formKey];

          // If the field is an array field, validate each child.
          if (Array.isArray(value) && value.length > 0) {
            return Promise.all(
              value.map(async (_, index) =>
                validateFormField(`${key}.${index}`, formValues)
              )
            );
          }
          return validateFormField(key, formValues);
        })
      )
    ).flat();

    // set all fields to touched
    Object.keys(formValues).forEach((field) =>
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
      contacts: form.values.contacts.filter((contact) => contact !== ""),
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
    <Grid container item>
      <Grid container item spacing={3}>
        <Grid container item>
          <Typography variant="h2">
            Generate a Client Identifier Document
          </Typography>
        </Grid>
        <Grid container item spacing={2}>
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

        <Grid container item direction="column" spacing={1}>
          <Grid item>
            <Typography variant="h2" marginBottom={1}>
              Your client&apos;s information
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
              {(form) => (
                <Form>
                  <Grid container item direction="column" spacing={2}>
                    <Grid container item>
                      <VerboseTextField
                        name="clientId"
                        fieldName="client_id"
                        label="Client Identifier URI"
                        description="The URI where your Client Identifier Document is
                          located. It identifies your application, the client,
                          to the Solid OIDC Provider. The Client Identifier
                          Document should be a static resource and publicly
                          accessible."
                        state={formFieldStates.clientId.state}
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
                        fieldName="client_name"
                        label="Client Name"
                        description="Your application name displayed to the user when
                          they are authenticating your application at the
                          Solid OIDC Provider."
                        state={formFieldStates.clientName.state}
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
                        fieldName="client_uri"
                        label="Client Homepage URI"
                        description="The URI of your application's homepage.
                          Displayed to the user when they are authenticating
                          your application at the Solid OIDC Provider."
                        state={formFieldStates.clientUri.state}
                        required
                        value={form.values.clientUri}
                        onChange={form.handleChange}
                        onBlur={(e) => handleFieldBlur(form, e)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item container marginTop={3}>
                      <FieldArray name="redirectUris">
                        {(props: FieldArrayRenderProps) => (
                          <VerboseTextFieldArray
                            label="Redirect URIs"
                            rowLabel="Redirect URI"
                            addRowLabel="Add Redirect URI"
                            componentFieldName="redirect_uris"
                            name="redirectUris"
                            description={[
                              "The URIs that the Solid OIDC Provider is allowed to redirect to after the user authenticated at the OIDC Provider.",
                              "Flow: Your application will send an authentication request to the OIDC Provider with one redirect URI. The OIDC Provider redirects the browser/user agent to the redirect URI after the user authenticated and issues a code to your application that it can use to complete authentication.",
                            ]}
                            state={formFieldStates.redirectUris.state}
                            childStates={
                              formFieldStates.redirectUris.childStates
                            }
                            values={form.values.redirectUris}
                            pushItem={props.push}
                            removeItem={(index) => {
                              props.remove(index);
                              if (!formFieldStates.redirectUris.childStates) {
                                return;
                              }
                              setFormArrayFieldStates(
                                "redirectUris",
                                formFieldStates.redirectUris.childStates.filter(
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

                    <Grid container item spacing={1} marginTop={1}>
                      <Grid item>
                        <Typography variant="h3">Refresh Tokens</Typography>
                      </Grid>
                      <Grid
                        item
                        sx={{
                          marginTop: -3,
                          // Prevent colliding caption.
                          "@media (max-width: 480px)": {
                            marginTop: 0,
                          },
                        }}
                      >
                        <Grid
                          container
                          item
                          direction="row"
                          spacing={1}
                          justifyContent="end"
                          sx={{
                            // Put the "Field name" label to the left for very small screens.
                            "@media (max-width: 330px)": {
                              justifyContent: "start",
                            },
                          }}
                        >
                          <Grid item>
                            <Typography fontSize={12}>Field names:</Typography>
                          </Grid>
                          <Grid item>
                            <Typography
                              fontSize={12}
                              fontFamily="Courier Prime"
                            >
                              grant_types = [&quot;refresh_token&quot;]
                            </Typography>

                            <Typography
                              fontSize={12}
                              fontFamily="Courier Prime"
                            >
                              scope = &quot;offline_access&quot;
                            </Typography>
                          </Grid>
                        </Grid>
                        <VerboseSlider
                          name="useRefreshTokens"
                          fieldName={undefined}
                          label="Support usage of refresh tokens / offline access"
                          description="Recommended. A refresh token can be used to request new access tokens
                            after they expire. If not requested, the user will have to
                            re-authenticate after the access token expires, which will happen
                            quite frequently (e.g. every 5 minutes or so). The field `scope`
                            will have the value `offline_access` set and the field `grant_types`
                            will have the value `refresh_token` set."
                          value={form.values.useRefreshTokens}
                          onChange={form.handleChange}
                        />
                      </Grid>
                    </Grid>
                    <Grid container item>
                      <Accordion
                        sx={{ boxShadow: "none" }}
                        className="MoreFieldsAccordion"
                      >
                        <AccordionSummary
                          className="AccordionSummary"
                          sx={{
                            paddingLeft: 0,
                            "&.Mui-expanded .ExpandIcon": {
                              transform: "rotate(-180deg)",
                            },
                            ".ExpandIcon": {
                              transition:
                                "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            },
                          }}
                        >
                          <Grid container>
                            <Grid item>
                              <Typography variant="h2">
                                Additional client information
                              </Typography>
                            </Grid>
                            <Grid item>
                              <ExpandMoreIcon className="ExpandIcon" />
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: 0 }}>
                          <Grid container spacing={2} paddingTop={-1}>
                            <Grid container item>
                              <VerboseTextField
                                name="logoUri"
                                fieldName="logo_uri"
                                label="Logo URI"
                                description="The URI to the logo of your application.
                                  This will be displayed by the OIDC Provider while
                                  the user is logging in."
                                state={formFieldStates.logoUri.state}
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
                                fieldName="policy_uri"
                                label="Policy URI"
                                description="The URI to the Policy terms of
                                  your application. This will be linked to by the
                                  OIDC Provider while the user is logging in."
                                state={formFieldStates.policyUri.state}
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
                                fieldName="tos_uri"
                                label="Terms of Service URI"
                                description="The URI to the Terms of Service of
                                  your application. This will be linked to by the
                                  OIDC Provider while the user is logging in."
                                state={formFieldStates.tosUri.state}
                                value={form.values.tosUri}
                                onChange={form.handleChange}
                                onBlur={(e) => handleFieldBlur(form, e)}
                                inputProps={{ inputMode: "url" }}
                                fullWidth
                                size="small"
                              />
                            </Grid>
                            <Grid container item>
                              <FieldArray name="contacts">
                                {(props: FieldArrayRenderProps) => (
                                  <VerboseTextFieldArray
                                    label="Maintainer contacts"
                                    rowLabel="Email"
                                    addRowLabel="Add Email"
                                    name="contacts"
                                    componentFieldName="contacts"
                                    description={[
                                      "Contact information for reaching out to the maintainers of the application.",
                                    ]}
                                    state={formFieldStates.contacts.state}
                                    childStates={
                                      formFieldStates.contacts.childStates
                                    }
                                    values={form.values.contacts}
                                    pushItem={props.push}
                                    removeItem={(index) => {
                                      props.remove(index);
                                      if (
                                        formFieldStates.contacts.childStates
                                      ) {
                                        setFormArrayFieldStates(
                                          "contacts",
                                          formFieldStates.contacts.childStates.filter(
                                            (_val, i) => index !== i
                                          )
                                        );
                                      }
                                    }}
                                    onChange={form.handleChange}
                                    onBlur={(e) => handleFieldBlur(form, e)}
                                    inputProps={{ inputMode: "email" }}
                                    fullWidth
                                    size="small"
                                    allowEmpty
                                  />
                                )}
                              </FieldArray>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                      <Accordion
                        sx={{
                          boxShadow: "none",
                          "&::before": { backgroundColor: "transparent" },
                        }}
                        className="AdvancedFieldsAccordion"
                      >
                        <AccordionSummary
                          className="AccordionSummary"
                          sx={{
                            paddingLeft: 0,
                            "&.Mui-expanded .ExpandIcon": {
                              transform: "rotate(-180deg)",
                            },
                            ".ExpandIcon": {
                              transition:
                                "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            },
                          }}
                        >
                          <Grid container>
                            <Grid item>
                              <Typography variant="h2">
                                Advanced OIDC options
                              </Typography>
                            </Grid>
                            <Grid item>
                              <ExpandMoreIcon className="ExpandIcon" />
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: 0 }}>
                          <Grid container spacing={2} paddingTop={-1}>
                            <Grid item>
                              <Grid container item justifyContent="end">
                                <FieldNameLabel fieldName="application_type" />
                              </Grid>
                              <FormControl>
                                <InputLabel
                                  variant="standard"
                                  id="applicationTypeLabel"
                                  shrink
                                  sx={{
                                    transform:
                                      "translate(14px, -9px) scale(0.75)",
                                  }}
                                >
                                  Application Type
                                </InputLabel>
                                <Select
                                  name="applicationType"
                                  labelId="applicationTypeLabel"
                                  label="Application Type"
                                  value={form.values.applicationType}
                                  onChange={form.handleChange}
                                  size="small"
                                  notched
                                >
                                  <MenuItem value="web">
                                    Web Application
                                  </MenuItem>
                                  <MenuItem value="native">
                                    Native Application
                                  </MenuItem>
                                </Select>
                                <Grid item>
                                  <FormHelperText>
                                    Usually, you will develop a Web Application.
                                    With a Client Identifier Document for a
                                    native application, your redirect urls will
                                    go to local host or use a non-http protocol.
                                  </FormHelperText>
                                </Grid>
                              </FormControl>
                            </Grid>
                            <Grid container item>
                              <VerboseTextField
                                name="defaultMaxAge"
                                fieldName="default_max_age"
                                label="Default maximum age"
                                description="The number of seconds after which the
                                  user must be actively re-authenticated."
                                state={formFieldStates.defaultMaxAge?.state}
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
                              <VerboseSlider
                                label="Request a time of authentication claim"
                                name="requireAuthTime"
                                fieldName="require_auth_time"
                                value={form.values.requireAuthTime}
                                onChange={form.handleChange}
                                description="Requests that the ID Token will contain a
                                  record (claim) with its time of creation, i.e.
                                  the authentication time."
                              />
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    container
                    sx={{
                      backgroundColor: "white",
                      zIndex: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                    position="sticky"
                    justifyContent="space-between"
                    bottom={0}
                    marginTop={2}
                    paddingBottom={1}
                    spacing={1}
                  >
                    <Grid item>
                      <Button
                        variant="text"
                        type="reset"
                        sx={{ textDecoration: "underline" }}
                      >
                        Reset
                      </Button>
                    </Grid>
                    <Grid item>
                      <Typography color="error">{hasFormError}</Typography>
                    </Grid>
                    <Grid item>
                      <Button
                        onClick={() => onSubmit(form)}
                        name="generateDocument"
                        color="primary"
                        variant="contained"
                        size="large"
                      >
                        Generate
                      </Button>
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
            <Grid container item direction="column" alignContent="center">
              <Grid item marginLeft="auto" marginRight="auto">
                <CheckCircleOutlineIcon fontSize="large" color="success" />
              </Grid>
              <Grid item>
                <Typography variant="h2" ref={jsonDocumentSectionRef}>
                  Generated Client Identifier Document
                </Typography>
              </Grid>
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
                  variant="text"
                  size="small"
                  onClick={onValidateButtonClick}
                >
                  Validate
                  <ArrowForwardIcon />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
