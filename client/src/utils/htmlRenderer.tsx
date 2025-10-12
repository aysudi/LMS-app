import React from "react";
import DOMPurify from "dompurify";

interface HTMLRendererProps {
  content: string;
  className?: string;
  maxLength?: number;
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  content,
  className = "",
  maxLength,
}) => {
  let processedContent = content;

  if (maxLength && content.length > maxLength) {
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    processedContent =
      lastSpace > maxLength * 0.8
        ? truncated.substring(0, lastSpace) + "..."
        : truncated + "...";
  }

  const sanitizedHTML = DOMPurify.sanitize(processedContent, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "span",
      "div",
      "a",
    ],
    ALLOWED_ATTR: ["class", "href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      style={{
        fontSize: "inherit",
        lineHeight: "inherit",
        color: "inherit",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export const extractTextFromHTML = (
  html: string,
  maxLength?: number
): string => {
  const div = document.createElement("div");
  div.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  const text = div.textContent || div.innerText || "";

  if (maxLength && text.length > maxLength) {
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > maxLength * 0.8
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  }

  return text;
};

export default HTMLRenderer;
