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

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

import {
  Grid,
  Card,
  Typography,
  CardHeader,
  CardContent,
  Divider,
  Box,
} from "@mui/material";

import { ValidationResult } from "../lib/types";

function AffectedField({
  fieldName,
  fieldValue,
}: {
  fieldName: string;
  fieldValue: unknown;
}) {
  return (
    <Typography variant="body2">
      <Box component="span" color="text.primary">
        {fieldName}
      </Box>
      {fieldValue ? (
        <Box component="span">
          : &nbsp;
          <Box component="span" color="text.secondary">
            {JSON.stringify(fieldValue)}
          </Box>
        </Box>
      ) : (
        ""
      )}
    </Typography>
  );
}

const iconForResult = {
  success: <CheckCircleIcon color="success" />,
  info: <InfoIcon color="info" />,
  warning: <WarningIcon color="warning" />,
  error: <ErrorIcon color="error" />,
};

function ResultCard(
  // eslint-disable-next-line no-shadow
  { result }: { result: ValidationResult }
) {
  const ResultIcon = () => iconForResult[result.status];

  const AffectedFields = result.affectedFields.map(
    ({ fieldName, fieldValue }) =>
      AffectedField({
        fieldName,
        fieldValue,
      })
  );

  return (
    <Grid container item direction="column" marginBottom={1}>
      <Card>
        <Grid container padding={1}>
          <Grid item>
            <CardHeader title={result.title} avatar={<ResultIcon />} />
          </Grid>
          <Grid item xs={12}>
            <CardContent sx={{ padding: ".5em" }}>
              <Typography variant="body2" color="text.secondary">
                {result.description}
              </Typography>
              <Divider light sx={{ mb: 1, mt: 1 }} />
              <Grid container item direction="row" alignItems="stretch">
                <Grid item>
                  <Typography variant="body2" color="info.dark">
                    Affected fields:
                  </Typography>
                </Grid>
                <Grid item paddingLeft={2} flex={1}>
                  {AffectedFields}
                </Grid>
              </Grid>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}

export default function ValidationResults({
  results,
}: {
  results: ValidationResult[];
}) {
  const sortedResults = results.sort(
    (result1, result2) =>
      // define order here..
      ["error", "warning", "info", "success"].indexOf(result1.status) -
      ["error", "warning", "info", "success"].indexOf(result2.status) +
      // remote document results are shown first
      (result1.rule.type === "remote" ? -100 : 0) -
      (result2.rule.type === "remote" ? -100 : 0)
  );
  return (
    <Grid container direction="column" margin={2}>
      {sortedResults.map((result) => (
        <ResultCard result={result} key={result.title + result.description} />
      ))}
    </Grid>
  );
}
