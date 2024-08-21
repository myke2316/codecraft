import React, { useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, Paper, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { formatTime } from '../../../../utils/formatTime';

const AdminUserAnalytics = ({ userAnalytics, users }) => {
  const [sortDirection, setSortDirection] = useState('desc'); // Default to descending for top values first
  const [orderBy, setOrderBy] = useState('totalPointsEarned');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handler for sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handler for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Map userId to username
  const userMap = users.reduce((acc, user) => {
    acc[user._id] = user.username;
    return acc;
  }, {});

  // Filtered and sorted data
  const sortedData = [...userAnalytics].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        User Analytics
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Sort By</InputLabel>
        <Select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="totalPointsEarned">Total Points Earned</MenuItem>
          <MenuItem value="totalTimeSpent">Total Time Spent</MenuItem>
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'username'}
                  direction={orderBy === 'username' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('username')}
                >
                  Username
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'userId'}
                  direction={orderBy === 'userId' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('userId')}
                >
                  User ID
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'totalPointsEarned'}
                  direction={orderBy === 'totalPointsEarned' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('totalPointsEarned')}
                >
                  Total Points Earned
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'totalTimeSpent'}
                  direction={orderBy === 'totalTimeSpent' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('totalTimeSpent')}
                >
                  Total Time Spent
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{userMap[user.userId]}</TableCell>
                <TableCell>{user.userId}</TableCell>
                <TableCell align="right">{user.totalPointsEarned}</TableCell>
                <TableCell align="right">{formatTime(user.totalTimeSpent)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={userAnalytics.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default AdminUserAnalytics;
