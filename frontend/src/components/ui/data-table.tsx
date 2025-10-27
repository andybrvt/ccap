import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filterOptions,
  onFilterChange,
  itemsPerPage = 10,
  emptyState,
  className = "",
  onRowClick,
  sortable = false,
  defaultSortKey,
  defaultSortOrder = 'desc'
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        // This is a simplified filter - you might need to customize based on your data structure
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

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    onFilterChange?.(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortable || sortKey !== columnKey) return null;

    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Filter Bar */}
      {/* {(searchKeys.length > 0 || filterOptions) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {searchKeys.length > 0 && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              )}
              {filterOptions && (
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-40 bg-gray-50 border-gray-200 text-gray-900">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          All
                        </div>
                      </SelectItem>
                      {filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-gray-100">
                          <div className="flex items-center">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* Results count */}
      {/* <div className="text-sm text-gray-600">
        Showing {paginatedData.length} of {filteredData.length} items
        {filteredData.length !== data.length && (
          <span className="ml-1">
            (filtered from {data.length} total)
          </span>
        )}
      </div> */}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <UITable className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-gray-200 hover:bg-gray-50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`font-semibold text-gray-900 border-gray-200 ${column.minWidth ? `min-w-[${column.minWidth}]` : ''
                      } ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
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
                  className={`border-gray-200 hover:bg-gray-50 transition-colors`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`border-gray-200 ${column.minWidth ? `min-w-[${column.minWidth}]` : ''
                        } ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState.title}
            </h3>
            <p className="text-gray-600">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-4 sm:px-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-4 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-900 font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <div className="text-xs text-gray-600">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const showPages = 3;
                  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                  const endPage = Math.min(totalPages, startPage + showPages - 1);

                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className={
                          currentPage === i
                            ? "bg-black hover:bg-gray-800 text-white border-black min-w-[32px] h-8 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent min-w-[32px] h-8 transition-all duration-200"
                        }
                      >
                        {i}
                      </Button>
                    );
                  }
                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-900 font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <div className="text-xs text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} items
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const showPages = 3;
                  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                  const endPage = Math.min(totalPages, startPage + showPages - 1);

                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className={
                          currentPage === i
                            ? "bg-black hover:bg-gray-800 text-white border-black min-w-[36px] h-9 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent min-w-[36px] h-9 transition-all duration-200"
                        }
                      >
                        {i}
                      </Button>
                    );
                  }
                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
