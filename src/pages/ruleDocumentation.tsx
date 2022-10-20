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

import { Grid, Typography } from "@mui/material";
import ValidationRuleCard from "../components/ValidationRuleCard";
import { localRules, remoteRules } from "../lib/validationRules";

//
export default function ClientIdentifierDocumentation() {
  const rules = [...localRules, ...remoteRules];
  const rulesSorted = rules.sort((rule1, rule2) =>
    rule1.rule.name.localeCompare(rule2.rule.name)
  );

  return (
    <Grid
      container
      item
      marginLeft="auto"
      marginRight="auto"
      justifyContent="center"
      maxWidth="50em"
    >
      <Grid container item spacing={3}>
        <Grid container item>
          <Grid container item>
            <Typography variant="h2">Validation Rules Reference</Typography>
          </Grid>
        </Grid>
        <Grid container item>
          <Grid container item direction="column">
            <Typography variant="body1">
              Each of the following rules is used to validate a Client
              Identifier Document. You can find possibly generated results from
              those rules in the accordions.
            </Typography>
          </Grid>
        </Grid>
        <Grid container item>
          {rulesSorted.map((rule) => (
            <ValidationRuleCard
              resultDescriptions={rule.resultDescriptions}
              rule={rule.rule}
              key={rule.rule.name}
            />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
