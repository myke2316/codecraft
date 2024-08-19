import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchQuestionsMutation } from "./questionService";

const QuestionList = ({ userId }) => {
  const [selectedTag, setSelectedTag] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch questions using the provided format
  const [fetchQuestions, { isLoading: isLoadingFetchQuestions }] =
    useFetchQuestionsMutation();

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await fetchQuestions();
      // Ensure that you're setting a new array, not mutating the fetched data
      setQuestions([...data.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const handleRefresh = () => {
    loadQuestions();
  };

  const filteredQuestions = selectedTag
    ? questions.filter((question) => question.tags.includes(selectedTag))
    : questions;

  // Create a new sorted array to avoid mutating the original state
  const sortedQuestions = [...filteredQuestions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleQuestionClick = (id) => {
    navigate(`question/${id}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading questions: {error.message}</div>;

  return (
    <div className="max-full mx-auto p-4 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Questions</h2>
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>
      <select
        className="w-full p-2 mb-4 border border-gray-400 rounded"
        value={selectedTag}
        onChange={handleTagChange}
      >
        <option value="">All</option>
        {["html", "css", "javascript", "php"].map((tag) => (
          <option key={tag} value={tag}>
            {tag.toUpperCase()}
          </option>
        ))}
      </select>
      <ul>
        {sortedQuestions.map((question) => (
          <li
            key={question._id} // Use _id if that's the field in your database
            className="flex items-start mb-4 cursor-pointer"
            onClick={() => handleQuestionClick(question._id)} // Use _id if that's the field in your database
          >
            <div className="mr-4">
              <img
                src={`https://via.placeholder.com/40x40?text=${question.author.username}`}
                alt={question.author.username}
                className="w-10 h-10 rounded-full"
              />
              {question.author.username}
            </div>
            <div>
              <h3 className="text-lg font-bold">{question.title}</h3>
              <p className="text-gray-600">{question.content}</p>
              <div className="mt-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-200 rounded px-2 py-1 text-sm mr-2"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionList;