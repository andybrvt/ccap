import React, { useState, useMemo } from 'react';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PaginationBar from '@/components/ui/pagination-bar';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  itemsPerPage?: number;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
  };
  className?: string;
  onRowClick?: (item: T) => void;
  sortable?: boolean;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  /** When provided, rows render as stacked cards below the md breakpoint. */
  renderMobileCard?: (item: T) => React.ReactNode;
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  filterOptions,
  itemsPerPage = 10,
  emptyState,
  className = "",
  onRowClick,
  sortable = false,
  defaultSortKey,
  defaultSortOrder = 'desc',
  renderMobileCard,
}: TableProps<T>) {
  const [searchTerm] = useState("");
  const [statusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(defaultSortKey || "");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filtered = data.filter((item) => {
      // Search filtering
      const matchesSearch = searchKeys.length === 0 || searchTerm === "" ||
        searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });

      // Status filtering (if filterOptions provided)
      let matchesFilter = true;
      if (filterOptions && statusFilter !== "all") {
        matchesFilter = item.status === statusFilter || item.is_analyzed === (statusFilter === "analyzed");
      }

      return matchesSearch && matchesFilter;
    });

    // Sorting
    if (sortable && sortKey) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === bValue) return 0;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, statusFilter, sortKey, sortOrder, searchKeys, filterOptions, sortable]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (!sortable) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortable || sortKey !== columnKey) return null;

    return (
      <span className="ml-1 text-inkmuted">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Mobile stacked cards */}
      {renderMobileCard && (
        <div className="md:hidden space-y-3">
          {paginatedData.map((item, index) => (
            <React.Fragment key={index}>{renderMobileCard(item)}</React.Fragment>
          ))}
        </div>
      )}

      {/* Table */}
      <div className={`bg-white rounded-[10px] border border-line shadow-card overflow-hidden ${renderMobileCard ? 'hidden md:block' : ''}`}>
        <div className="overflow-x-auto min-w-full max-h-[75vh] overflow-y-auto">
          <UITable className="min-w-full">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-canvas border-line hover:bg-canvas">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`font-semibold text-[13px] text-inkmuted uppercase tracking-wide bg-canvas border-line h-11 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${sortable && column.sortable ? 'cursor-pointer hover:text-ink' : ''
                      }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {renderSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className={`border-line hover:bg-canvas/60 transition-colors ${onRowClick ? 'cursor-default' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`border-line py-3.5 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                    >
                      {column.render ? column.render(item) : String(item[column.key] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>

        {/* Empty State */}
        {paginatedData.length === 0 && emptyState && (
          <div className="text-center py-12">
            {emptyState.icon}
            <h3 className="text-lg font-semibold text-ink mb-1">
              {emptyState.title}
            </h3>
            <p className="text-[15px] text-inkmuted">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>

      {/* Mobile empty state */}
      {renderMobileCard && paginatedData.length === 0 && emptyState && (
        <div className="md:hidden bg-white rounded-[10px] border border-line text-center py-12">
          {emptyState.icon}
          <h3 className="text-lg font-semibold text-ink mb-1">{emptyState.title}</h3>
          <p className="text-[15px] text-inkmuted">{emptyState.description}</p>
        </div>
      )}

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        summary={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} items`}
      />
    </div>
  );
}
