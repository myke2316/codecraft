import React from "react";

const QuestionContent = ({ question }) => {
  return (
    <div>
      <p className="text-lg mb-4">{question.content}</p>
      {question.codeBlocks.map((block, index) => (
        <div key={index} className="mb-4">
          <div className="text-sm font-medium">
            {block.language.toUpperCase()}
          </div>
          <pre className="p-2 bg-gray-100 rounded">{block.content}</pre>
        </div>
      ))}
      <div className="mb-4 flex flex-wrap">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="mr-2 mb-2 px-3 py-1 border border-gray-300 rounded text-sm"
          >
            {tag.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QuestionContent;
