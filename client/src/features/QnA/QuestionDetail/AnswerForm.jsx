import React, { useState } from "react";

const AnswerForm = ({
  open,
  handleClose,
  handleSubmitAnswer,
  answerContent,
  setAnswerContent,
  codeBlocks,
  setCodeBlocks,
}) => {
  const handleAnswerChange = (e) => setAnswerContent(e.target.value);

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "", content: "" }]);
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Answer</h2>
        <textarea
          placeholder="Your Answer"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          rows={4}
          value={answerContent}
          onChange={handleAnswerChange}
        />
        {codeBlocks.map((codeBlock, index) => (
          <div key={index} className="mb-4">
            <select
              value={codeBlock.language}
              onChange={(e) =>
                handleCodeBlockChange(index, "language", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="">Select Language</option>
              {["html", "css", "javascript", "php"].map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Code Content"
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              value={codeBlock.content}
              onChange={(e) =>
                handleCodeBlockChange(index, "content", e.target.value)
              }
            />
            <button
              onClick={() => handleRemoveCodeBlock(index)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Remove Code Block
            </button>
          </div>
        ))}
        <button
          onClick={handleAddCodeBlock}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Add Code Block
        </button>
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitAnswer}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerForm;
