'use client';

interface DateDisplayProps {
  date: string;
}

export default function DateDisplay({ date }: DateDisplayProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return <span>{formattedDate}</span>;
}
