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
import { Typography, Grid, TextField, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import ValidationResults from "../components/validationResults";
import { localRules } from "../lib/validationRules";
import validateRemoteDocument from "../lib/validateRemoteDocument";
import validateLocalDocument from "../lib/validateLocalDocument";
import { ValidationResult } from "../lib/types";

function ClientIdentifierValidator() {
  // get the document from search parameter, if supplied
  const searchParamsDocument = new URLSearchParams(window.location.search).get(
    "document"
  );
  const searchParamsDocumentIri = new URLSearchParams(
    window.location.search
  ).get("documentIri");

  const [documentJson, setDocumentJson] = useState(searchParamsDocument || "");
  const [clientIdentifierUri, setClientIdentifierUri] = useState(
    searchParamsDocumentIri || ""
  );
  const [isValidatingRemotely, setIsFetchingAndValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(
    [] as ValidationResult[]
  );

  const onValidateBtnClick = async () => {
    const results = await validateLocalDocument(documentJson, localRules);
    setValidationResults(results);
  };

  const fetchAndValidate = async () => {
    setIsFetchingAndValidating(true);
    const remoteResults = await validateRemoteDocument(clientIdentifierUri);
    setValidationResults(remoteResults);
    setIsFetchingAndValidating(false);
  };

  if (documentJson) {
    onValidateBtnClick()
      .then(() => {})
      .catch(() => {});
  } else if (clientIdentifierUri) {
    fetchAndValidate()
      .then(() => {})
      .catch(() => {});
  }

  return (
    <Grid
      container
      item
      marginLeft="auto"
      marginRight="auto"
      justifyContent="center"
    >
      <Grid container item maxWidth="50em" md={6}>
        <Grid container item justifyContent="center">
          <Grid item>
            <Typography variant="h4">
              Validate a Client Identifier Document
            </Typography>
          </Grid>
        </Grid>
        <Grid container item padding={2}>
          <Grid container item direction="column">
            <Grid item>
              <Typography variant="h5">Validate from URI</Typography>
            </Grid>
            <Typography variant="body1">
              Enter the URI to a Client Identifier Document. Our server will
              fetch the document (due to cors restrictions) and validate it.
            </Typography>
            <Typography variant="body1">
              This will also check, if the REST resource is set up correctly and
              the remote Client Identifier matches the here given.
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
                    type="url"
                    label="Client Identifier URI"
                    value={clientIdentifierUri}
                    onChange={(e) => setClientIdentifierUri(e.target.value)}
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
                <Typography variant="h5">Validate from JSON text</Typography>
              </Grid>

              <Grid item container justifyContent="flex-end" spacing={1}>
                <Grid item xs={12}>
                  <TextField
                    label="Paste your JSON formatted document here"
                    multiline
                    fullWidth
                    minRows={15}
                    spellCheck="false"
                    value={documentJson}
                    onChange={(e) => setDocumentJson(e.target.value)}
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
        maxWidth="50em"
        md={6}
        justifyContent="start"
        direction="column"
      >
        <Grid container item alignContent="center" justifyContent="center">
          <Typography variant="h4">Validation Results</Typography>
        </Grid>
        <Grid item>
          <ValidationResults results={validationResults} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ClientIdentifierValidator;
