'use client';

import Link from 'next/link';
import { TodoCategory, Priority, Status } from '@prisma/client';
import type { SortField, SortOrder } from './SortFilter';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: {
    page?: string;
    category?: TodoCategory | 'All';
    priority?: Priority | 'All';
    status?: Status | 'All';
    sortBy?: SortField;
    sortOrder?: SortOrder;
  };
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const getPageUrl = (page: number) => {
    const newSearchParams = new URLSearchParams();
    
    // Add all current search params except page
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== 'page' && value) {
        newSearchParams.set(key, value);
      }
    }
    
    // Add the new page number
    newSearchParams.set('page', page.toString());
    
    return `${baseUrl}?${newSearchParams.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Link
        href={getPageUrl(1)}
        className={`px-4 py-2 text-sm rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border`}
      >
        First
      </Link>
      
      <Link
        href={getPageUrl(currentPage - 1)}
        className={`px-4 py-2 text-sm rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border`}
      >
        <span className="sr-only">Previous</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          
          // Always show first page, last page, current page, and one page before and after current
          const showPage = pageNumber === 1 ||
            pageNumber === totalPages ||
            pageNumber === currentPage ||
            pageNumber === currentPage - 1 ||
            pageNumber === currentPage + 1;

          // Show ellipsis for gaps
          if (!showPage) {
            // Show ellipsis only once between gaps
            if (pageNumber === 2 || pageNumber === totalPages - 1) {
              return <span key={pageNumber} className="px-2">...</span>;
            }
            return null;
          }

          return (
            <Link
              key={pageNumber}
              href={getPageUrl(pageNumber)}
              className={`px-4 py-2 text-sm rounded-md ${
                currentPage === pageNumber
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      <Link
        href={getPageUrl(currentPage + 1)}
        className={`px-4 py-2 text-sm rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border`}
      >
        <span className="sr-only">Next</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      <Link
        href={getPageUrl(totalPages)}
        className={`px-4 py-2 text-sm rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border`}
      >
        Last
      </Link>
    </div>
  );
}
