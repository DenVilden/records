import { CssBaseline } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { StrictMode } from "react"
import { render } from "react-dom"

import App from "./App"

const theme = createTheme({
  palette: {
    mode: "dark",
  },
})

render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
  document.getElementById("root")
)
