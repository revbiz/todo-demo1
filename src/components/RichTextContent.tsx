'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  if (!content) return null;

  return (
    <div 
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}
