'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextContentProps {
  content: string;
  className?: string;
}

export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  // Process content to ensure proper spacing and formatting
  const processContent = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    let processed = htmlContent;
    
    // Remove any existing classes
    processed = processed.replace(/class="[^"]*"/g, '');
    
    // Clean the HTML content
    processed = DOMPurify.sanitize(processed);
    
    // Remove empty paragraphs
    processed = processed.replace(/<p>\s*<\/p>/g, '');
    
    // Add proper spacing for paragraphs
    if (className.includes('text-2xl')) {
      // For titles, use smaller margins
      processed = processed.replace(/<p>/g, '<p class="mb-2 last:mb-0">');
    } else {
      // For content, use regular margins
      processed = processed.replace(/<p>/g, '<p class="mb-4 last:mb-0">');
      
      // Add proper spacing for lists
      processed = processed.replace(/<ul>/g, '<ul class="list-disc ml-4 space-y-2 mb-4">');
      processed = processed.replace(/<ol>/g, '<ol class="list-decimal ml-4 space-y-2 mb-4">');
      processed = processed.replace(/<li>/g, '<li class="mb-1">');
    }
    
    return processed;
  };

  return (
    <div
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
}
