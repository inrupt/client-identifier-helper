import ClientIdentifierGenerator from './components/ClientIdentifierGenerator'
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <ClientIdentifierGenerator />
      </div>
    </ThemeProvider>
  )
}

export default App
