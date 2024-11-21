'use client';

import { TodoCategory } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  onCategoryChange?: (category: TodoCategory | 'All') => void;
  selectedCategory?: TodoCategory | 'All';
}

const CATEGORIES: (TodoCategory | 'All')[] = ['All', 'WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'];

const getCategoryColor = (category: TodoCategory | 'All') => {
  switch (category) {
    case 'WORK':
      return 'bg-blue-200 hover:bg-blue-300';
    case 'PERSONAL':
      return 'bg-green-200 hover:bg-green-300';
    case 'SHOPPING':
      return 'bg-yellow-200 hover:bg-yellow-300';
    case 'HEALTH':
      return 'bg-red-200 hover:bg-red-300';
    case 'EDUCATION':
      return 'bg-purple-200 hover:bg-purple-300';
    case 'OTHER':
      return 'bg-gray-200 hover:bg-gray-300';
    default:
      return 'bg-white hover:bg-gray-100';
  }
};

const getCategoryText = (category: TodoCategory | 'All') => {
  if (category === 'All') return 'All';
  return category.toLowerCase().replace('_', ' ');
};

export function CategoryFilter({ onCategoryChange, selectedCategory = 'All' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: TodoCategory | 'All') => {
    const status = searchParams.get('status') || 'All';
    const priority = searchParams.get('priority') || 'All';
    const query = searchParams.get('q') || '';

    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (status !== 'All') params.set('status', status);
    if (priority !== 'All') params.set('priority', priority);
    if (query) params.set('q', query);

    router.push(`/?${params.toString()}`);
    if (onCategoryChange) onCategoryChange(category);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${getCategoryColor(category)} ${
            selectedCategory === category ? 'ring-2 ring-offset-2 ring-blue-500' : ''
          }`}
        >
          {getCategoryText(category)}
        </button>
      ))}
    </div>
  );
}
