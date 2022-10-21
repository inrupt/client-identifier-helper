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
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";

import { ResultDescription, ValidationRule } from "../lib/types";
import statusIcons from "./statusIcons";

function ResultDescriptionCard(props: ResultDescription) {
  const { status: resultStatus, title, description } = props;
  return (
    <Grid container item direction="column" marginBottom={1}>
      <Card>
        <Grid container padding={1}>
          <Grid item>
            <CardHeader
              title={title}
              avatar={
                (resultStatus && statusIcons[resultStatus]) ||
                statusIcons.unknown
              }
            />
          </Grid>
          <Grid item xs={12}>
            <CardContent sx={{ padding: ".5em" }}>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}

export default function ValidationRuleCard(
  props: Omit<ValidationRule, "check">
) {
  const { resultDescriptions, rule } = props;

  return (
    <Grid container item direction="column" marginBottom={1}>
      <Card>
        <Grid
          container
          spacing={2}
          sx={{ padding: "1.5em" }}
          direction="column"
        >
          <Grid
            container
            item
            alignContent="center"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="h3">{rule.name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">validates {rule.type}</Typography>
            </Grid>
          </Grid>

          <Grid item>
            <Typography variant="body2" color="text.secondary">
              {rule.description}
            </Typography>
          </Grid>

          {/* results */}
          <Grid item xs={12}>
            <Accordion
              sx={{ boxShadow: "none" }}
              className="RuleResultsAccordion"
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
                  <Grid item>Possible results</Grid>
                  <Grid item>
                    <ExpandMoreIcon className="ExpandIcon" />
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Grid container item spacing={0.51}>
                  {Object.values(resultDescriptions).map(
                    (resultDescription) => (
                      <Grid container item>
                        <ResultDescriptionCard
                          status={resultDescription.status}
                          title={resultDescription.title}
                          description={resultDescription.description}
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
