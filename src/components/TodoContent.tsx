'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TodoContentProps {
  content: string;
  todoId: string;
  isTruncated: boolean;
}

export function TodoContent({ content, todoId, isTruncated }: TodoContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If content contains HTML tags, it's formatted content
  const isHtmlContent = content.includes('<') && content.includes('>');

  if (!mounted) {
    // For non-HTML content, display as plain text
    if (!isHtmlContent) {
      return <div className="text-gray-800">{content}</div>;
    }
    // For HTML content, display a loading state
    return <div className="text-gray-800">Loading...</div>;
  }

  return (
    <>
      <div 
        className="text-gray-800 [&_p]:mb-0 [&_span]:mb-0" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      {isTruncated && (
        <Link
          href={`/view?id=${todoId}`}
          className="text-blue-500 hover:text-blue-600 ml-1"
        >
          Read more...
        </Link>
      )}
    </>
  );
}
