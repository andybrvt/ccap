import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** e.g. "Showing 1-25 of 187 students" */
  summary?: string;
  disabled?: boolean;
}

/**
 * Shared pagination control: Previous / numbered pages / Next.
 * Used by every paginated page in the app.
 */
export default function PaginationBar({ currentPage, totalPages, onPageChange, summary, disabled = false }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
      <div className="text-[13px] text-inkmuted">
        {summary || `Page ${currentPage} of ${totalPages}`}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={disabled || currentPage === 1}
          className="border-line bg-white text-ink hover:bg-secondary disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={
                currentPage === page
                  ? 'bg-ink text-white hover:bg-ink/90 hover:text-white min-w-[36px] h-9'
                  : 'text-inkmuted hover:bg-secondary hover:text-ink min-w-[36px] h-9'
              }
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={disabled || currentPage === totalPages}
          className="border-line bg-white text-ink hover:bg-secondary disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
