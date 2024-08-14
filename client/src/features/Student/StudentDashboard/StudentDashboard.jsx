import Dashboard from "./Dashboard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
const theme = createTheme();
const StudentDashboard = () => {
  return (
    <ThemeProvider theme={theme}>
      {" "}
      <Dashboard />
    </ThemeProvider>
  );
};
export default StudentDashboard;
