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
  Paper,
  Typography,
} from "@mui/material";

import { RuleResult } from "../lib/types";

export default function ValidationResults({
  results,
}: {
  results: RuleResult[];
}) {
  const iconForResult = (result: RuleResult) =>
    ({
      success: <CheckCircleIcon color="success" />,
      info: <InfoIcon color="info" />,
      warning: <WarningIcon color="warning" />,
      error: <ErrorIcon color="error" />,
    }[result.status]);

  const resultCard = (result: RuleResult) => (
    <Grid container item direction="column" marginBottom={1}>
      <Paper sx={{ border: 1, borderRadius: 0, borderColor: "lightgrey" }}>
        <Grid container padding={1}>
          <Grid container item>
            <Grid container item xs={3}>
              <Grid item alignContent="center">
                {iconForResult(result)}
              </Grid>
              <Grid item>{result.status}</Grid>
            </Grid>

            <Grid item>
              <Typography variant="h6">{result.title}</Typography>
            </Grid>
          </Grid>

          <Grid item>{result.description}</Grid>

          <Grid item xs={12}>
            <Accordion sx={{ borderRadius: 0 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Affected fields
              </AccordionSummary>
              <AccordionDetails>
                {JSON.stringify(result.affectedFields, undefined, 1)}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );

  const sortedResultsByStatus = results
    .sort(
      (result1, result2) =>
        // define order here..
        ["error", "warning", "info", "success"].indexOf(result1.status) -
        ["error", "warning", "info", "success"].indexOf(result2.status)
    )
    .map(resultCard);

  return (
    <Grid
      container
      direction="column"
      margin={2}
      sx={{ border: 1, borderRadius: 1, borderColor: "lightgrey" }}
    >
      {sortedResultsByStatus}
    </Grid>
  );
}
