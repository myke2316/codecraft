import React from "react";
import AnswerItem from "./AnswerItem";

const AnswerList = ({ answers, currentUserId, questionAuthorId, question }) => {
  return (
    <ul>
      {answers.map((answer) => (
        <AnswerItem
          key={answer._id} // Use unique ID for better performance and reliability
          answer={answer}
          currentUserId={currentUserId}
          isQuestionAuthor={questionAuthorId === currentUserId}
          currentQuestion={question}
        />
      ))}
    </ul>
  );
};

export default AnswerList;
