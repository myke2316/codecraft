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
                <TableCell>{assignment.dateCreated || "X"}</TableCell>
                <TableCell>{assignment.dueDate || "X"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AssignmentTable;
