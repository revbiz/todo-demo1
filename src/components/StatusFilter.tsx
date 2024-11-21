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
  const statuses: (Status | 'All')[] = ['All', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];

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
      case 'NOT_STARTED':
        return 'bg-gray-200 hover:bg-gray-300';
      case 'IN_PROGRESS':
        return 'bg-blue-200 hover:bg-blue-300';
      case 'COMPLETED':
        return 'bg-green-200 hover:bg-green-300';
      case 'CANCELLED':
        return 'bg-red-200 hover:bg-red-300';
      case 'ON_HOLD':
        return 'bg-yellow-200 hover:bg-yellow-300';
      default:
        return 'bg-white hover:bg-gray-100';
    }
  };

  const getStatusText = (status: Status | 'All') => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'ON_HOLD':
        return 'On Hold';
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
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            getStatusColor(status)
          } ${selectedStatus === status ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
        >
          {getStatusText(status)}
        </button>
      ))}
    </div>
  );
}
