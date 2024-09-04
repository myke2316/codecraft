import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
function formatDateToReadable(dateString) {
  const date = new Date(dateString);
  const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day < 10 ? '0' + day : day}, ${year}`;
}

function AssignmentTable({ onCreate, assignments }) {
  return (
    <TableContainer component={Paper}>
      {" "}
      <Button
        variant="contained"
        color="primary"
        onClick={onCreate}
        style={{ margin: 20 }}
      >
        Create Assignment
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Submissions</TableCell>
            <TableCell>Graded</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography align="center" color="textSecondary">
                  No assignments available.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment, index) => (
              <TableRow key={index}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.submissions}</TableCell> 
                <TableCell>{assignment.graded}</TableCell>
                <TableCell>{formatDateToReadable(assignment.createdAt)|| "X"}</TableCell>
                <TableCell>{formatDateToReadable(assignment.dueDate) || "X"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AssignmentTable;
