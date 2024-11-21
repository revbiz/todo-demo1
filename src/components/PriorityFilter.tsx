'use client';

import { Priority } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface PriorityFilterProps {
  selected?: Priority | 'All';
}

const PRIORITIES: (Priority | 'All')[] = ['All', 'HIGH', 'MEDIUM', 'LOW'];

const getPriorityStyle = (priority: Priority | 'All') => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'All':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export function PriorityFilter({ selected = 'All' }: PriorityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePriorityChange = (priority: Priority | 'All') => {
    const params = new URLSearchParams(searchParams.toString());
    if (priority === 'All') {
      params.delete('priority');
    } else {
      params.set('priority', priority);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PRIORITIES.map((priority) => (
        <button
          key={priority}
          onClick={() => handlePriorityChange(priority)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            getPriorityStyle(priority)
          } ${selected === priority ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
        >
          {priority === 'All' ? 'All Priorities' : priority.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
