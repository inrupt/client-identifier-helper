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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Card,
  Typography,
  CardHeader,
  CardContent,
  CardActions,
} from "@mui/material";

import { ValidationResult } from "../lib/types";

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
  return (
    <Grid
      container
      item
      direction="column"
      marginBottom={1}
      key={result.title + result.description}
    >
      <Card>
        <Grid container padding={1}>
          <CardHeader title={result.title} avatar={<ResultIcon />} />

          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {result.description}
            </Typography>
          </CardContent>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={
                  <CardActions>
                    <ExpandMoreIcon />
                  </CardActions>
                }
              >
                <Typography variant="body2" color="text.secondary">
                  Affected fields
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {JSON.stringify(result.affectedFields, undefined, 1)}
                  </Typography>
                </CardContent>
              </AccordionDetails>
            </Accordion>
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
        <ResultCard result={result} />
      ))}
    </Grid>
  );
}
