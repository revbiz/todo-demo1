'use client';

import { TodoCategory } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  selected?: TodoCategory | 'All';
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
      return 'bg-purple-200 hover:bg-purple-300';
    case 'EDUCATION':
      return 'bg-indigo-200 hover:bg-indigo-300';
    case 'OTHER':
      return 'bg-gray-200 hover:bg-gray-300';
    default:
      return 'bg-gray-100 hover:bg-gray-200';
  }
};

const getCategoryText = (category: TodoCategory | 'All'): string => {
  return category === 'All' ? 'All Categories' : category.toLowerCase();
};

export function CategoryFilter({ selected = 'All' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: TodoCategory | 'All') => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            getCategoryColor(category)
          } ${selected === category ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
        >
          {getCategoryText(category)}
        </button>
      ))}
    </div>
  );
}
