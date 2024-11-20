'use client';

import { TodoCategory } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  selectedCategory: TodoCategory | 'All';
}

const CATEGORIES: (TodoCategory | 'All')[] = ['All', 'Event', 'Reminder', 'Someday', 'Now'];

const getCategoryStyle = (category: TodoCategory | 'All') => {
  switch (category) {
    case 'Event':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'Reminder':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Someday':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'Now':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories: (TodoCategory | 'All')[] = ['All', 'Event', 'Reminder', 'Someday', 'Now'];

  const handleCategoryChange = (category: TodoCategory | 'All') => {
    const priority = searchParams.get('priority') || 'All';
    if (category === 'All') {
      if (priority === 'All') {
        router.push('/');
      } else {
        router.push(`/?priority=${priority}`);
      }
    } else {
      router.push(`/?category=${category}${priority !== 'All' ? `&priority=${priority}` : ''}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
            getCategoryStyle(category)
          } ${
            selectedCategory === category
              ? 'ring-2 ring-offset-2 ring-blue-500'
              : ''
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
