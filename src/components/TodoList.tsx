'use client';

import { TodoCategory, Priority, Status, Todo } from '@/types/todo';
import { RichTextContent } from './RichTextContent';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TodoListProps {
  todos: Todo[];
  selectedCategory: TodoCategory | 'All';
  selectedPriority: Priority | 'All';
  selectedStatus: Status | 'All';
  currentPage: number;
  totalCount: number;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function TodoItem({ todo, onDelete, isDeleting }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TITLE_WORD_LIMIT = 100;
  const DESCRIPTION_PREVIEW_LENGTH = 150;
  
  // Function to check if content is longer than preview
  const isContentLong = (content: string, type: 'title' | 'description'): boolean => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || '';

    if (type === 'title') {
      const wordCount = text.trim().split(/\s+/).length;
      return wordCount > TITLE_WORD_LIMIT;
    }
    
    return text.length > DESCRIPTION_PREVIEW_LENGTH;
  };

  // Function to process title content
  const processTitle = (title: string): string => {
    if (!title) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = title;
    const text = tempDiv.textContent || '';
    const words = text.trim().split(/\s+/);
    
    if (!isExpanded && words.length > TITLE_WORD_LIMIT) {
      const truncatedWords = words.slice(0, TITLE_WORD_LIMIT);
      return truncatedWords.join(' ') + '...';
    }
    
    return title;
  };

  // Process description to be more compact
  const processDescription = (description: string): string => {
    if (!description) return '';
    
    let processed = description;
    
    // Function to process list content
    const processListContent = (match: string, listType: 'ul' | 'ol'): string => {
      // Extract list items and clean them
      const items = match.match(/<li[^>]*>(.*?)<\/li>/gs)
        ?.map(item => {
          // Remove HTML tags and clean up whitespace
          return item
            .replace(/<li[^>]*>(.*?)<\/li>/s, '$1')
            .replace(/<[^>]+>/g, '') // Remove any other HTML tags
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
        })
        .filter(item => item.length > 0) || [];

      if (items.length === 0) return '';

      // Join items with appropriate separator
      const separator = listType === 'ul' ? ' • ' : ', ';
      const listContent = items.join(separator);

      // For ordered lists, add "List: " prefix
      const prefix = listType === 'ol' ? 'List: ' : '';
      
      return `<span class="inline-block whitespace-normal">${prefix}${listContent}</span>`;
    };

    // First clean up any newlines and spaces
    processed = processed.replace(/\n\s*/g, ' ');
    processed = processed.replace(/\s+/g, ' ');

    // Replace unordered lists
    processed = processed.replace(
      /<ul[^>]*>.*?<\/ul>/gs,
      match => processListContent(match, 'ul')
    );

    // Replace ordered lists
    processed = processed.replace(
      /<ol[^>]*>.*?<\/ol>/gs,
      match => processListContent(match, 'ol')
    );

    // Final cleanup of any remaining newlines or extra spaces
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  };

  const hasTitleOrDescriptionLong = 
    (todo.title && isContentLong(todo.title, 'title')) || 
    (todo.description && isContentLong(todo.description, 'description'));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`${!isExpanded ? 'line-clamp-1' : ''}`}>
            <RichTextContent
              content={processTitle(todo.title)}
              className="text-lg font-semibold mb-2"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              todo.category === 'WORK'
                ? 'bg-blue-100 text-blue-800'
                : todo.category === 'PERSONAL'
                ? 'bg-green-100 text-green-800'
                : todo.category === 'SHOPPING'
                ? 'bg-yellow-100 text-yellow-800'
                : todo.category === 'HEALTH'
                ? 'bg-red-100 text-red-800'
                : todo.category === 'EDUCATION'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {todo.category.toLowerCase().replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              todo.priority === 'HIGH'
                ? 'bg-red-100 text-red-800'
                : todo.priority === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {todo.priority.toLowerCase()}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              todo.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : todo.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800'
                : todo.status === 'NOT_STARTED'
                ? 'bg-gray-100 text-gray-800'
                : todo.status === 'CANCELLED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {todo.status.toLowerCase().replace('_', ' ')}
            </span>
            {todo.dueDate && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Description */}
          {todo.description && (
            <div className={`prose prose-sm max-w-none ${!isExpanded ? 'line-clamp-2' : ''}`}>
              <div
                dangerouslySetInnerHTML={{ 
                  __html: processDescription(todo.description)
                }}
                className="text-sm text-gray-600 whitespace-normal"
              />
            </div>
          )}

          {/* URL */}
          {todo.url && (
            <div className="mt-2">
              <a 
                href={todo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {todo.url.length > 50 ? todo.url.substring(0, 50) + '...' : todo.url}
              </a>
            </div>
          )}

          {/* Read More Button */}
          {hasTitleOrDescriptionLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-600 text-sm mt-1"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 mt-2">
            <span>Created: {formatDate(todo.createdAt)}</span>
            {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
              <span className="ml-2">Updated: {formatDate(todo.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <Link
            href={`/view/${todo.id}`}
            className="text-blue-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors text-sm"
          >
            View
          </Link>
          <Link
            href={`/edit/${todo.id}`}
            className="text-green-500 hover:text-green-600 px-2 py-1 rounded-md hover:bg-green-50 transition-colors text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodoList({ 
  todos, 
  selectedCategory, 
  selectedPriority, 
  selectedStatus,
  currentPage,
  totalCount
}: TodoListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      router.refresh();
    } catch (error) {
      setDeleteError('Failed to delete todo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!todos.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No todos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {deleteError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {deleteError}
        </div>
      )}

      <div className="grid gap-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
