'use client';

import { Status } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusFilterProps {
  selected?: Status | 'All';
}

const STATUSES: (Status | 'All')[] = ['All', 'ACTIVE', 'COMPLETE', 'PENDING', 'HOLD', 'SKIP'];

const getStatusStyle = (status: Status | 'All') => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'COMPLETE':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'HOLD':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'SKIP':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export function StatusFilter({ selected = 'All' }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: Status | 'All') => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'All') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusChange(status)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            getStatusStyle(status)
          } ${selected === status ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
        >
          {status === 'All' ? 'All Statuses' : status.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
