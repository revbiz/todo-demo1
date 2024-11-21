'use client';

import { Status } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusFilterProps {
  onStatusChange?: (status: Status | 'All') => void;
  selectedStatus?: Status | 'All';
}

export function StatusFilter({ onStatusChange, selectedStatus = 'All' }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statuses: (Status | 'All')[] = ['All', 'ACTIVE', 'COMPLETE', 'PENDING', 'HOLD', 'SKIP'];

  const handleStatusChange = (status: Status | 'All') => {
    const category = searchParams.get('category') || 'All';
    const priority = searchParams.get('priority') || 'All';
    const query = searchParams.get('q') || '';

    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (status !== 'All') params.set('status', status);
    if (priority !== 'All') params.set('priority', priority);
    if (query) params.set('q', query);

    router.push(`/?${params.toString()}`);
    if (onStatusChange) onStatusChange(status);
  };

  const getStatusColor = (status: Status | 'All') => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-200 hover:bg-blue-300';
      case 'COMPLETE':
        return 'bg-green-200 hover:bg-green-300';
      case 'PENDING':
        return 'bg-yellow-200 hover:bg-yellow-300';
      case 'HOLD':
        return 'bg-orange-200 hover:bg-orange-300';
      case 'SKIP':
        return 'bg-red-200 hover:bg-red-300';
      default:
        return 'bg-white hover:bg-gray-100';
    }
  };

  const getStatusText = (status: Status | 'All') => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETE':
        return 'Complete';
      case 'PENDING':
        return 'Pending';
      case 'HOLD':
        return 'Hold';
      case 'SKIP':
        return 'Skip';
      default:
        return 'All';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusChange(status)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            getStatusColor(status)
          } ${selectedStatus === status ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
        >
          {getStatusText(status)}
        </button>
      ))}
    </div>
  );
}
