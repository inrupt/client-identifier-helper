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

import { useEffect, useRef, useState } from "react";
import { Typography, Grid, TextField, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useSearchParams } from "react-router-dom";
import ValidationResults from "../components/validationResults";
import { localRules } from "../lib/validationRules";
import validateRemoteDocument from "../lib/validateRemoteDocument";
import validateLocalDocument from "../lib/validateLocalDocument";
import { ValidationResult } from "../lib/types";

function ClientIdentifierValidator() {
  // Get the document from search parameter, if supplied.
  const [searchParams] = useSearchParams();
  const searchParamsDocument = searchParams.get("document");
  const searchParamsDocumentIri = searchParams.get("documentIri");

  const [documentJson, setDocumentJson] = useState(searchParamsDocument || "");
  const [clientIdentifierUri, setClientIdentifierUri] = useState(
    searchParamsDocumentIri || ""
  );
  const [isValidatingRemotely, setIsValidatingRemotely] = useState(false);
  const [validationResults, setValidationResults] = useState(
    [] as ValidationResult[]
  );

  const onValidateBtnClick = async () => {
    const results = await validateLocalDocument(documentJson, localRules);
    setValidationResults(results);
  };

  const fetchAndValidate = async () => {
    setIsValidatingRemotely(true);
    const { validationResults: remoteResults, document: remoteDocument } =
      await validateRemoteDocument(clientIdentifierUri);
    setValidationResults(remoteResults);
    if (remoteDocument) setDocumentJson(remoteDocument);
    setIsValidatingRemotely(false);
  };

  // Scroll to validation results, once they are loaded.
  const ValidationResultsRef = useRef<null | HTMLParagraphElement>(null);
  useEffect(() => {
    ValidationResultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [validationResults]);

  // If the form was pre-filled (from search params),
  // trigger validation.
  useEffect(() => {
    if (validationResults.length === 0) {
      if (documentJson) {
        onValidateBtnClick()
          .then(() => {})
          .catch(() => {});
      } else if (clientIdentifierUri) {
        fetchAndValidate()
          .then(() => {})
          .catch(() => {});
      }
    }
    // We only want to auto-validate on initial load,
    // to prevent auto-validation on user input changes.
    // Therefore, we will pass an empty array of deps to useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      container
      item
      marginLeft="auto"
      marginRight="auto"
      justifyContent="center"
      maxWidth="50em"
    >
      <Grid container item spacing={2}>
        <Grid container item>
          <Grid container item>
            <Typography variant="h2">
              Validate a Client Identifier Document
            </Typography>
          </Grid>
        </Grid>
        <Grid container item>
          <Grid container item direction="column">
            <Grid item>
              <Typography variant="h3">Validate from URI</Typography>
            </Grid>
            <Typography variant="body1">
              Enter the URI to a Client Identifier Document. Our server will
              fetch the document (due to CORS restrictions, your browser may not
              be authorized to do so itself) and validate it.
            </Typography>
            <Typography variant="body1">
              This will also check, if the REST resource is set up correctly and
              the remote Client Identifier matches the one you enter here.
            </Typography>
            <Grid
              marginTop={2}
              container
              item
              direction="column"
              justifyContent="space-between"
              spacing={2}
            >
              <Grid item container justifyContent="flex-end" spacing={1}>
                <Grid item xs={12}>
                  <TextField
                    name="clientIdentifierUri"
                    type="url"
                    label="Client Identifier URI"
                    value={clientIdentifierUri}
                    onChange={(e) => setClientIdentifierUri(e.target.value)}
                    onKeyUp={async (e) => {
                      if (e.key === "Enter") await fetchAndValidate();
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid
                  container
                  item
                  spacing={1}
                  alignItems="center"
                  justifyContent="end"
                >
                  <Grid item>
                    <LoadingButton
                      name="fetchDocument"
                      color="primary"
                      onClick={() => fetchAndValidate()}
                      variant="contained"
                      loading={isValidatingRemotely}
                    >
                      Fetch & Validate
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="h3">Validate from JSON text</Typography>
              </Grid>

              <Grid item container justifyContent="flex-end" spacing={1}>
                <Grid item xs={12}>
                  <TextField
                    label="Paste your JSON formatted document here"
                    name="jsonDocument"
                    multiline
                    fullWidth
                    minRows={15}
                    spellCheck="false"
                    value={documentJson}
                    onChange={(e) => setDocumentJson(e.target.value)}
                    onKeyUp={async (e) => {
                      if (e.key === "Enter" && e.ctrlKey)
                        await onValidateBtnClick();
                    }}
                  />
                </Grid>
                <Grid
                  container
                  item
                  spacing={1}
                  alignItems="center"
                  justifyContent="end"
                >
                  <Grid item>
                    <Button
                      color="primary"
                      name="validateDocument"
                      variant="contained"
                      onClick={() => onValidateBtnClick()}
                      disabled={isValidatingRemotely}
                    >
                      Validate
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        display={validationResults.length ? undefined : "none"}
        container
        item
        justifyContent="start"
        direction="column"
        ref={ValidationResultsRef}
      >
        <Grid container item alignContent="center">
          <Typography variant="h2">Validation Results</Typography>
        </Grid>

        <Grid item>
          <ValidationResults results={validationResults} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ClientIdentifierValidator;
