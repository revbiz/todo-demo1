'use client';

interface ColoredContentProps {
  content: string;
}

export function ColoredContent({ content }: ColoredContentProps) {
  if (!content) return null;

  return (
    <div 
      className="colored-content" 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}
