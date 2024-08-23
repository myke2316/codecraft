import React from "react";
import DOMPurify from "dompurify";
import "./ContentRenderer.css";
function ContentRenderer({ content }) {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "span",
      "ul",
      "ol",
      "li",
      "br",
      "h1",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div
      className="content-renderer"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export default ContentRenderer;
