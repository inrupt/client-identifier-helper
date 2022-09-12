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

import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline, Tab, Tabs } from "@mui/material";
import {
  Route,
  Link,
  BrowserRouter,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import theme from "./theme";
import ClientIdentifierGenerator from "./pages/generate";
import ClientIdentifierValidator from "./pages/validate";

function TabsComponent() {
  const currentTab = useLocation().pathname;
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={currentTab}>
        <Tab
          to="/generator"
          value="/generator"
          label="Generator"
          component={Link}
        />
        <Tab
          to="/validator"
          value="/validator"
          label="Validator"
          component={Link}
        />
      </Tabs>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <TabsComponent />

        <Routes>
          <Route path="*" element={<Navigate replace to="/generator" />} />
          <Route path="/generator" element={<ClientIdentifierGenerator />} />
          <Route path="/validator" element={<ClientIdentifierValidator />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
