import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TableSortLabel, TablePagination, Paper, MenuItem, Select, InputLabel, FormControl,
  TextField, InputAdornment, Card, CardContent, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { formatTime } from '../../../../utils/formatTime';
import { useGetScoreByStudentIdQuery } from '../../../Class/submissionAssignmentService';
import { useGetUserVoteQuery } from '../../../QnA/questionService';

const AdminUserAnalytics = ({ userAnalytics, users }) => {
  const [sortDirection, setSortDirection] = useState('desc');
  const [orderBy, setOrderBy] = useState('totalPointsEarned'); // Updated initial orderBy
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const userMap = users.reduce((acc, user) => {
    acc[user._id] = user.username;
    return acc;
  }, {});

  const enhancedUserAnalytics = userAnalytics.map(user => {
    const { data: scoresData } = useGetScoreByStudentIdQuery(user.userId);
    const { data: userVote } = useGetUserVoteQuery({ userId: user.userId });

    const qnaPoints = (userVote?.totalVotes || 0) * 5;
    const submissionPoints = scoresData?.scores.reduce((acc, score) => acc + (score.grade || 0), 0) || 0;
    const combinedScore = qnaPoints + submissionPoints;

    return {
      ...user,
      qnaPoints,
      submissionPoints,
      combinedScore
    };
  });


  const filteredAndSortedData = useMemo(() => {
    return [...enhancedUserAnalytics]
      .filter(user => userMap[user.userId]?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        let aValue, bValue;
        if (orderBy === 'totalPointsEarned' || orderBy === 'combinedScore') {
          aValue = a.totalPointsEarned + a.combinedScore;
          bValue = b.totalPointsEarned + b.combinedScore;
        } else {
          aValue = a[orderBy];
          bValue = b[orderBy];
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [enhancedUserAnalytics, userMap, searchTerm, orderBy, sortDirection]);

  const paginatedData = filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card elevation={3} className="overflow-hidden">
      <CardContent>
        <Typography variant="h4" gutterBottom className="mb-6 text-gray-800 font-bold">
          User Analytics
        </Typography>
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="totalPointsEarned">Total Points</MenuItem>
                <MenuItem value="totalTimeSpent">Total Time Spent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <TableContainer component={Paper} elevation={0}>
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
                    active={orderBy === 'totalPointsEarned' || orderBy === 'combinedScore'}
                    direction={orderBy === 'totalPointsEarned' || orderBy === 'combinedScore' ? sortDirection : 'asc'}
                    onClick={() => handleRequestSort('totalPointsEarned')}
                  >
                    Total Points
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
                <TableRow key={user.userId} hover>
                  <TableCell>{userMap[user.userId]}</TableCell>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell align="right">{user.totalPointsEarned + user.combinedScore}</TableCell>
                  <TableCell align="right">{formatTime(user.totalTimeSpent)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box className="mt-4">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminUserAnalytics;