import React, { useState } from "react";
import AnswerItem from "./AnswerItem";
import { FormControl, InputLabel, Select, MenuItem, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";

const AnswerList = ({ answers, currentUserId, questionAuthorId, question, fetchQuestionData }) => {
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filter, setFilter] = useState("all");

  const filteredAnswers = answers.filter((answer) => {
    if (filter === "own") {
      return answer.author._id === currentUserId;
    } else if (filter === "verified") {
      return answer.status === "accepted";
    }
    return true; // "all" filter
  });

  const sortedAnswers = [...filteredAnswers].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return sortOrder === "asc"
        ? a.voteCount - b.voteCount
        : b.voteCount - a.voteCount;
    }
  });

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <FormControl variant="outlined" size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="date">Date Uploaded</MenuItem>
            <MenuItem value="votes">Vote Count</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </Button>
      </div>
      <div className="mb-4">
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, newFilter) => setFilter(newFilter)}
          aria-label="answer filter"
        >
          <ToggleButton value="all" aria-label="all answers">
            All
          </ToggleButton>
          <ToggleButton value="own" aria-label="own answers">
            My Answers
          </ToggleButton>
          <ToggleButton value="verified" aria-label="verified answers">
            Verified
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <ul>
        {sortedAnswers.map((answer) => (
          <AnswerItem
            fetchQuestionData={fetchQuestionData}
            key={answer._id}
            answer={answer}
            currentUserId={currentUserId}
            isQuestionAuthor={questionAuthorId === currentUserId}
            currentQuestion={question}
          />
        ))}
      </ul>
    </div>
  );
};

export default AnswerList;