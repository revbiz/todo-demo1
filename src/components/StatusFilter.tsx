'use client';

import { Status } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusFilterProps {
  selectedStatus: Status | 'All';
}

export function StatusFilter({ selectedStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statuses: (Status | 'All')[] = ['All', 'Active', 'Pending', 'Complete', 'Forget', 'OnHold'];

  const handleStatusChange = (status: Status | 'All') => {
    const category = searchParams.get('category') || 'All';
    const priority = searchParams.get('priority') || 'All';
    
    const params = new URLSearchParams();
    if (category !== 'All') params.append('category', category);
    if (priority !== 'All') params.append('priority', priority);
    if (status !== 'All') params.append('status', status);
    
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusChange(status)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedStatus === status
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
