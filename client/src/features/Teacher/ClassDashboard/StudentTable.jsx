import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  TableSortLabel,
  Box,
  Typography,
  IconButton,
  Link,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router";
const StudentTable = ({ students, totalAnalytics, selectedClass }) => {
  const [page, setPage] = useState(0);
  console.log(selectedClass);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("points");
  const [order, setOrder] = useState("desc");

  const navigate = useNavigate();
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedStudents = useMemo(() => {
    return students
      .map((student) => {
        const analytics = totalAnalytics.find((a) => a.userId === student._id);
        return {
          ...student,
          totalPoints: analytics ? analytics.totalPointsEarned : 0,
          totalTimeSpent: analytics ? analytics.totalTimeSpent : 0,
          badges: analytics ? analytics.badges : 0,
        };
      })
      .filter((student) =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (orderBy === "username") {
          return order === "asc"
            ? a.username.localeCompare(b.username)
            : b.username.localeCompare(a.username);
        }
        return order === "asc"
          ? a[orderBy] - b[orderBy]
          : b[orderBy] - a[orderBy];
      });
  }, [students, totalAnalytics, searchTerm, orderBy, order]);

  const paginatedStudents = filteredAndSortedStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={3} sx={{ width: "100%", overflow: "hidden" }}>
      <Typography variant="h6" sx={{ mt: 2, ml: 2 }} gutterBottom>
        Student List
      </Typography>
      <TextField
        fullWidth
        label="Search students"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ m: 2, width: "calc(100% - 32px)" }}
      />
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}>
              <TableCell sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}>
                <TableSortLabel
                  active={orderBy === "username"}
                  direction={orderBy === "username" ? order : "asc"}
                  onClick={() => handleSort("username")}
                >
                  Username
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}
              >
                <TableSortLabel
                  active={orderBy === "totalPoints"}
                  direction={orderBy === "totalPoints" ? order : "asc"}
                  onClick={() => handleSort("totalPoints")}
                >
                  Total Points
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}
              >
                <TableSortLabel
                  active={orderBy === "totalTimeSpent"}
                  direction={orderBy === "totalTimeSpent" ? order : "asc"}
                  onClick={() => handleSort("totalTimeSpent")}
                >
                  Total Time Spent
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}
              >
                <TableSortLabel
                  active={orderBy === "badges"}
                  direction={orderBy === "badges" ? order : "asc"}
                  onClick={() => handleSort("badges")}
                >
                  Badges
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={student._id}>
                <TableCell>
                
                    <IconButton
                      onClick={() =>
                        navigate(
                          `/profile/students/${student._id}`
                        )
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
             

                  {student.username}
                </TableCell>
                <TableCell align="right">{student.totalPoints}</TableCell>
                <TableCell align="right">
                  {Math.floor(student.totalTimeSpent / 60)} minutes
                </TableCell>
                <TableCell align="right">{student.badges}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredAndSortedStudents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default StudentTable;
