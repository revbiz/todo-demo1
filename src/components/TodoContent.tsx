'use client';

import { useEffect, useState } from 'react';

interface TodoContentProps {
  description: string;
}

export function TodoContent({ description }: TodoContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-gray-800">{description}</div>;
  }

  return (
    <div className="text-gray-800 [&_p]:mb-0 [&_span]:mb-0">
      {description}
    </div>
  );
}
