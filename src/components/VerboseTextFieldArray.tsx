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

import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  FormHelperText,
  Grid,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { VerboseFieldState } from "../lib/formValidationTypes";
import FieldNameLabel from "./FieldNameLabel";
import VerboseHelperText from "./VerboseHelperText";
import VerboseTextField from "./VerboseTextField";

export type VerboseFieldArrayRenderProps = TextFieldProps & {
  /** Label for the individual text fields */
  rowLabel: string;
  addRowLabel?: string;
  componentFieldName?: string;
  description: string | string[];
  values: string[];
  state?: VerboseFieldState | undefined;
  childStates?: (VerboseFieldState | undefined)[];
  allowEmpty?: boolean;
  pushItem(obj: unknown): void;
  removeItem(index: number): void;
};

export default function VerboseTextFieldArray(
  props: VerboseFieldArrayRenderProps
) {
  if (!props) {
    return <Grid container item spacing={1} />;
  }
  const {
    name: componentName,
    label: componentLabel,
    componentFieldName,
    rowLabel,
    addRowLabel,
    description,
    values,
    state = undefined,
    childStates = undefined,
    allowEmpty = false,

    pushItem,
    removeItem,
    ...textFieldProps
  } = props;

  const descriptions = Array.isArray(description) ? description : [description];

  return (
    <Grid
      container
      item
      className="VerboseTextFieldArray"
      spacing={2}
      id={componentName}
    >
      {/* Heading + Description */}
      <Grid container item direction="column">
        <Typography variant="h3" marginBottom={1}>
          {componentLabel}
        </Typography>
        <Grid item>
          {descriptions.map((descriptionParagraph) => (
            <FormHelperText>{descriptionParagraph}</FormHelperText>
          ))}
        </Grid>
      </Grid>

      <VerboseHelperText state={state} />

      {/* Field name label */}
      <Grid container item spacing={1}>
        {componentFieldName === undefined ? (
          <> </>
        ) : (
          <Grid container item justifyContent="end" marginBottom={1}>
            <FieldNameLabel fieldName={componentFieldName} />
          </Grid>
        )}

        {/* Field rows */}
        <Grid
          container
          item
          spacing={2}
          className={`${componentName} TextFieldArrayRows`}
        >
          {values.map((value: string, index: number) => {
            return (
              <Grid
                container
                item
                // Example with index={key}, taken from https://formik.org/docs/examples/field-arrays
                // This seems fine in this context.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                spacing={1}
                sx={{ pt: "0 !important" }}
                flexWrap="nowrap"
              >
                <Grid item flexGrow={1} className="test">
                  <VerboseTextField
                    // We pass all props, in order leave the flexibility
                    // of customizing the text field top level.
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...textFieldProps}
                    name={`${componentName}.${index}`}
                    label={rowLabel}
                    state={
                      Array.isArray(childStates)
                        ? childStates[index]
                        : undefined
                    }
                    value={value}
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="button"
                    title="Remove this field"
                    className="RemoveItemButton"
                    onClick={() => removeItem(index)}
                    color="secondary"
                    variant="outlined"
                    sx={{ height: 40, width: 40 }}
                    disabled={values.length === 1 && !allowEmpty}
                  >
                    x
                  </Button>
                </Grid>
              </Grid>
            );
          })}
          <Grid container item marginLeft={2}>
            <Button
              type="button"
              variant="text"
              onClick={() => pushItem("")}
              className="AddNewButton"
            >
              <AddIcon />
              <Typography variant="button" sx={{ textDecoration: "underline" }}>
                {addRowLabel ?? "Add row"}
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

VerboseTextFieldArray.defaultProps = {
  state: undefined,
  childStates: undefined,
  componentFieldName: undefined,
  addRowLabel: "Add row",
  allowEmpty: false,
};
