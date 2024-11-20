'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export type SortField = 'createdAt' | 'updatedAt' | 'priority' | 'status';
export type SortOrder = 'desc' | 'asc';

interface SortFilterProps {
  selectedSortField: SortField;
  selectedSortOrder: SortOrder;
}

export function SortFilter({ selectedSortField, selectedSortOrder }: SortFilterProps) {
  const searchParams = useSearchParams();
  
  const createSortURL = (field: SortField, order: SortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortField', field);
    params.set('sortOrder', order);
    if (!params.has('page')) {
      params.set('page', '1');
    }
    return `?${params.toString()}`;
  };

  const sortOptions = [
    { field: 'createdAt', label: 'Creation Date' },
    { field: 'updatedAt', label: 'Last Updated' },
    { field: 'priority', label: 'Priority' },
    { field: 'status', label: 'Status' },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.field}
            onClick={() => {
              const newOrder = selectedSortField === option.field && selectedSortOrder === 'desc' ? 'asc' : 'desc';
              window.location.href = createSortURL(option.field, newOrder);
            }}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1 ${
              selectedSortField === option.field
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
            {selectedSortField === option.field && (
              <span className="text-xs">
                {selectedSortOrder === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Click a field to sort. Click again to reverse order.
      </div>
    </div>
  );
}
