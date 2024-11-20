'use client';

import { Priority } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface PriorityFilterProps {
  selectedPriority: Priority | 'All';
}

export function PriorityFilter({ selectedPriority }: PriorityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priorities: (Priority | 'All')[] = ['All', 'High', 'Medium', 'Low'];

  const handlePriorityChange = (priority: Priority | 'All') => {
    const category = searchParams.get('category') || 'All';
    if (priority === 'All') {
      if (category === 'All') {
        router.push('/');
      } else {
        router.push(`/?category=${category}`);
      }
    } else {
      router.push(`/?priority=${priority}${category !== 'All' ? `&category=${category}` : ''}`);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      {priorities.map((priority) => (
        <button
          key={priority}
          onClick={() => handlePriorityChange(priority)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedPriority === priority
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {priority}
        </button>
      ))}
    </div>
  );
}
