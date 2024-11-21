'use client';

import React from 'react';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  // Process content to ensure single line returns and compact lists
  const processContent = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    let processed = htmlContent;
    processed = processed.replace(/\n\s*\n/g, '\n');
    processed = processed.replace(/<\/li>\s*<li>/g, '</li><li>');
    processed = processed.replace(/<\/ul>\s*<ul>/g, '</ul><ul>');
    processed = processed.replace(/<\/ol>\s*<ol>/g, '</ol><ol>');
    
    // Add classes for compact lists
    processed = processed.replace(/<ul>/g, '<ul class="list-disc ml-4 space-y-0">');
    processed = processed.replace(/<ol>/g, '<ol class="list-decimal ml-4 space-y-0">');
    
    return processed;
  };

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
}
