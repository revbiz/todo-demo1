'use client';

import { useEffect, useState } from 'react';

interface TodoContentProps {
  content: string;
}

export function TodoContent({ content }: TodoContentProps) {
  // If the content is already HTML, render it directly
  if (content.includes('<p>')) {
    return (
      <div
        className="prose prose-sm sm:prose-base max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise, render as plain text
  return <div className="text-gray-800">{content}</div>;
}
