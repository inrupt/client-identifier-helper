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
import {
  validateDocument,
  offlineRules,
  runRemoteChecks,
} from "../lib/validationRules/index";
import { RuleResult } from "../lib/types";

function ClientIdentifierValidator() {
  const [documentJson, setDocumentJson] = useState("");
  const [clientIdentifierUri, setClientIdentifierUri] = useState("");
  const [isFetchingAndValidating, setIsFetchingAndValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(
    [] as RuleResult[]
  );

  const onValidateBtnClick = async () => {
    const results = await validateDocument(documentJson, offlineRules);
    setValidationResults(results);
  };

  const fetchAndValidate = async () => {
    setIsFetchingAndValidating(true);
    const results = await runRemoteChecks(clientIdentifierUri);
    setValidationResults(results);
    setIsFetchingAndValidating(false);
  };

  return (
    <>
      <Typography variant="h3">
        Validate a Client Identifier Document
      </Typography>
      <Grid container padding={2}>
        <Grid container item direction="column" md={6}>
          <Grid item>
            <Typography variant="h4">Validate from URI</Typography>
          </Grid>
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
                    loading={isFetchingAndValidating}
                  >
                    Fetch & Validate
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="h4">Validate from JSON text</Typography>
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
                    disabled={isFetchingAndValidating}
                  >
                    Validate
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container item justifyContent="start" direction="column" md={6}>
          <Grid container item alignContent="center" justifyContent="center">
            <Typography variant="h3">Validation Results</Typography>
          </Grid>
          <Grid item>
            <ValidationResults results={validationResults} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ClientIdentifierValidator;
