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

import { Box, CssBaseline, Grid, Tab, Tabs, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ClientIdentifierGenerator from "./pages/generate";
import ClientIdentifierValidator from "./pages/validate";
import theme from "./theme";
import inruptLogoUrl from "../static/inruptLogo.svg";

function TabsComponent() {
  const currentTab = useLocation().pathname;

  return (
    <Box
      sx={{
        borderBottom: 2,
        borderColor: "divider",
        width: "100%",
        marginBottom: 4,
      }}
    >
      <Tabs
        value={currentTab}
        sx={{
          ".MuiTab-root": { textDecoration: "none" },
          "& .MuiTypography-root": {
            textTransform: "none",
          },
          "&& .Mui-selected": {
            color: "black",
          },
        }}
      >
        <Tab
          to="/generator"
          value="/generator"
          label={<Typography variant="h2">Generator</Typography>}
          component={Link}
          className="openGeneratorPage"
        />
        <Tab
          to="/validator"
          value="/validator"
          label={<Typography variant="h2">Validator</Typography>}
          component={Link}
          className="openValidatorPage"
        />
      </Tabs>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid
        container
        sx={{ maxWidth: "50em" }}
        marginLeft="auto"
        marginRight="auto"
        padding={2}
      >
        <BrowserRouter>
          <Grid container spacing={3} marginTop={-1}>
            <Grid container item flex={1} justifyContent="center">
              <img
                src={inruptLogoUrl}
                alt="Inrupt Logo"
                style={{ maxWidth: "180px" }}
              />
            </Grid>
            <Grid container item>
              <Typography variant="h1">
                Client Identifier Document Helper
              </Typography>
            </Grid>
            <Grid container item>
              <TabsComponent />
            </Grid>
          </Grid>

          <Routes>
            <Route path="*" element={<Navigate replace to="/generator" />} />
            <Route path="/generator" element={<ClientIdentifierGenerator />} />
            <Route path="/validator" element={<ClientIdentifierValidator />} />
          </Routes>
        </BrowserRouter>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
