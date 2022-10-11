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
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `"Raleway", "Roboto", "sans-serif"`,
    h1: {
      fontWeight: 800,
      fontSize: 22,
      marginLeft: "auto",
      marginRight: "auto",
    },
    h2: {
      fontWeight: 800,
      fontSize: 18,
    },
    h3: {
      fontWeight: 700,
      fontSize: 16,
    },
    button: {
      fontWeight: 800,
    },
  },
  palette: { primary: { main: "#7C4DFF" } },
});

/**
 * Useful for text components's sx property.
 * Targets both, the parent and child components.
 */
export const statusColors = {
  "& .Mui-error": {
    color: theme.palette.error.main,
  },
  "& .Mui-warning": {
    color: theme.palette.warning.main,
  },
  "& .Mui-info": {
    color: theme.palette.info.dark,
  },
  "& .Mui-success": {
    color: theme.palette.success.main,
  },
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
  "&.Mui-warning": {
    color: theme.palette.warning.main,
  },
  "&.Mui-info": {
    color: theme.palette.info.dark,
  },
  "&.Mui-success": {
    color: theme.palette.success.main,
  },
};

export default theme;
