'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  if (!content) return null;

  // Only convert newlines to <br> tags if the content doesn't contain HTML
  const processedContent = content.includes('<') && content.includes('>')
    ? content // If content contains HTML tags, preserve as is
    : content.replace(/\r\n|\r|\n/g, '<br />'); // Otherwise, convert newlines to <br>

  // Configure DOMPurify to allow certain HTML tags and attributes
  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code',
      'pre', 'hr', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  };

  return (
    <div 
      className={`rich-text-content prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(processedContent, sanitizeConfig) 
      }}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}
