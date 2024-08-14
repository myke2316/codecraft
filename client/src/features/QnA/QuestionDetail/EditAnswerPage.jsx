import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateAnswerMutation,
  useFetchAnswerByIdQuery,
} from "../questionService"; // Adjust import path as needed
import { useSelector } from "react-redux";

const languageOptions = ["HTML", "CSS", "JavaScript", "PHP"];

const EditAnswerPage = () => {
  const { questionId, answerId } = useParams();
  const navigate = useNavigate();
  const authorId = useSelector((state) => state.user.userDetails._id);
  const [updateAnswer, { isLoading: isUpdating }] = useUpdateAnswerMutation();
  const {
    data: answer,
    isLoading: isFetching,
    error,
  } = useFetchAnswerByIdQuery({ questionId, answerId });

  const [content, setContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([
    { language: "html", content: "" },
  ]);

  useEffect(() => {
    if (answer) {
      setContent(answer.content);
      setCodeBlocks(answer.codeBlocks.map(block => ({
        ...block,
        language: block.language.toLowerCase() // Ensure lowercase
      })));
    }
  }, [answer]);

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index] = { ...newCodeBlocks[index], [field]: value.toLowerCase() }; // Ensure lowercase
    setCodeBlocks(newCodeBlocks);
  };

  const addCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "html", content: "" }]); // Default to lowercase
  };

  const removeCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAnswer({
        questionId,
        answerId,
        content,
        codeBlocks,
        authorId,
      }).unwrap();
      navigate(`/qna/${authorId}/question/${questionId}`); // Redirect after successful update
    } catch (err) {
      console.error("Failed to update answer:", err);
    }
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading answer details</div>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Edit Answer</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Answer Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        {codeBlocks.map((block, index) => (
          <div
            key={index}
            className="mb-4 border p-4 border-gray-200 rounded-md"
          >
            <button
              type="button"
              onClick={() => removeCodeBlock(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove Code Block
            </button>
            <div className="mt-2">
              <label
                htmlFor={`language-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Language
              </label>
              <select
                id={`language-${index}`}
                value={block.language}
                onChange={(e) =>
                  handleCodeBlockChange(index, "language", e.target.value)
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                required
              >
                {languageOptions.map((lang) => (
                  <option key={lang.toLowerCase()} value={lang.toLowerCase()}>
                    {lang}
                  </option>
                ))}
              </select>
              <label
                htmlFor={`content-${index}`}
                className="block text-sm font-medium text-gray-700 mt-2"
              >
                Code Content
              </label>
              <textarea
                id={`content-${index}`}
                value={block.content}
                onChange={(e) =>
                  handleCodeBlockChange(index, "content", e.target.value)
                }
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCodeBlock}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Add Code Block
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update Answer"}
        </button>
      </form>
    </div>
  );
};

export default EditAnswerPage;
