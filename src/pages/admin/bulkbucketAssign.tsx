import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Clock as ClockIcon, Search, Filter } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/data-table';

// Import Submission type from submissions page or define here if needed
interface Submission {
  submissionId: string;
  formId: string;
  submissionDate: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  willRelocate: string;
  relocationStates: string[];
  dateOfBirth: string;
  mobileNumber: string;
  highSchool: string;
  graduationYear: string;
  transportation: string;
  hoursWanted: string;
  availableTimes: string;
  availableWeekends: string;
  hasResume: string;
  resumeUrl: string;
  currentJob: string;
  currentEmployer: string;
  currentPosition: string;
  currentHours: string;
  pastJob: string;
  pastEmployer: string;
  pastPosition: string;
  pastHours: string;
  readyToWork: string;
  readyDate: string;
  interestedOptions: string[];
  foodHandlersCard: string;
  servsafeCredentials: string;
  culinaryYears: string;
  bucket: string;
  id?: number;
  [key: string]: unknown; // <-- Add index signature for DataTable compatibility
}

interface BulkAssignFilters {
  searchKey: string;
  graduationYear: string | null;
  statesOfResidence: string[];
  statesOfRelocation: string[];
  buckets: string[];
  statusFilter: string;
}

interface OptionType {
  value: string;
  label: string;
}

interface BulkAssignProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: BulkAssignFilters;
  setFilters: React.Dispatch<React.SetStateAction<BulkAssignFilters>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  uniqueGraduationYears: OptionType[];
  uniqueStatesOfResidence: OptionType[];
  uniqueStatesOfRelocation: OptionType[];
  uniqueBuckets: OptionType[];
  filterOptions: OptionType[];
  filteredData: Submission[];
}

export default function BulkBucketAssignDialog({
  open,
  onOpenChange,
  filters,
  setFilters,
  selected,
  setSelected,
  uniqueGraduationYears,
  uniqueStatesOfResidence,
  uniqueStatesOfRelocation,
  uniqueBuckets,
  filterOptions,
  filteredData,
}: BulkAssignProps) {
  // Selection logic
  const allBulkIds = filteredData.map((item) => item.submissionId);
  const allSelected = selected.length === allBulkIds.length && allBulkIds.length > 0;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : allBulkIds);
  };
  const toggleSelectOne = (id: string) => {
    setSelected((prev: string[]) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const [assignBucket, setAssignBucket] = React.useState<string | null>(null);

  // Reset all filters to initial state
  const handleResetFilters = () => {
    setFilters({
      searchKey: '',
      graduationYear: null,
      statesOfResidence: [],
      statesOfRelocation: [],
      buckets: [],
      statusFilter: 'all',
    });
  };

  // Columns for DataTable
  const columns: Column<Submission>[] = [
    {
      key: 'select',
      header: '', // Use empty string for header
      render: (item) => (
        <input
          type="checkbox"
          checked={selected.includes(item.submissionId)}
          onChange={() => toggleSelectOne(item.submissionId)}
          aria-label={`Select ${item.firstName} ${item.lastName}`}
        />
      ),
      minWidth: '40px',
      align: 'center',
    },
    {
      key: 'name',
      header: 'Candidate',
      minWidth: '220px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900 font-medium">
              {item.firstName} {item.lastName}
              {item.preferredName && (
                <span className="text-gray-500 ml-1">({item.preferredName})</span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.mobileNumber}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'location',
      header: 'Location',
      minWidth: '160px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">
              {item.city}, {item.state}
            </span>
          </div>
          {item.willRelocate === "Yes" && item.relocationStates.length > 0 && (
            <div className="text-xs text-gray-500">
              Will relocate to: {item.relocationStates.join(", ")}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'education',
      header: 'Education',
      minWidth: '140px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{item.highSchool}</span>
          </div>
          <div className="text-xs text-gray-500">Graduates: {item.graduationYear}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'experience',
      header: 'Experience',
      minWidth: '120px',
      render: (item) => (
        <div className="space-y-1">
          {item.currentJob === "Yes" ? (
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 text-gray-700 mr-2 flex-shrink-0" />
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Currently Working</span>
            </div>
          ) : (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">No Current Job</span>
            </div>
          )}
          <div className="text-xs text-gray-500">{item.culinaryYears} years culinary</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'availability',
      header: 'Availability',
      minWidth: '140px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{item.hoursWanted} hrs/week</span>
          </div>
          <div className="text-xs text-gray-500">{item.availableTimes}</div>
          <div className="text-xs text-gray-500">Weekends: {item.availableWeekends}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '100px',
      align: 'right',
      render: (item) => null, // No per-row action, only bulk assign
    },
  ];

  // Filtered data for DataTable (apply filters like in submissions page)
  const tableData = useMemo(() => filteredData, [filteredData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={e => e.preventDefault()} className="w-full" style={{ maxWidth: '1100px' }}>
        <DialogHeader>
          <DialogTitle>Bulk Assign Bucket</DialogTitle>
        </DialogHeader>
        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-2 pb-4">
          <div className="bg-white rounded-lg pl-0 p-2">
            <div className="flex flex-wrap items-end gap-4">
              {/* Graduation Year Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                <Select value={filters.graduationYear || 'all'} onValueChange={value => setFilters((f) => ({ ...f, graduationYear: value === 'all' ? null : value }))}>
                  <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Years</SelectItem>
                    {uniqueGraduationYears.map((year) => (
                      <SelectItem key={year.value} value={year.value} className="text-gray-900 hover:bg-gray-100">{year.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* State of Residence Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">State of Residence</label>
                <MultiSelect
                  options={uniqueStatesOfResidence}
                  onValueChange={v => setFilters((f) => ({ ...f, statesOfResidence: v }))}
                  defaultValue={filters.statesOfResidence}
                  placeholder="Select State of Residence"
                  maxCount={3}
                />
              </div>
              {/* State of Relocation Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">State of Relocation</label>
                <MultiSelect
                  options={uniqueStatesOfRelocation}
                  onValueChange={v => setFilters((f) => ({ ...f, statesOfRelocation: v }))}
                  defaultValue={filters.statesOfRelocation}
                  placeholder="Select State of Relocation"
                  maxCount={3}
                />
              </div>
              {/* Bucket Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bucket</label>
                <MultiSelect
                  options={uniqueBuckets}
                  onValueChange={v => setFilters((f) => ({ ...f, buckets: v }))}
                  defaultValue={filters.buckets}
                  placeholder="Select Buckets"
                  maxCount={3}
                />
              </div>
              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <Select value={filters.statusFilter} onValueChange={value => setFilters((f) => ({ ...f, statusFilter: value }))}>
                  <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All</SelectItem>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-gray-100">{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Reset Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-6"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </div>
          {/* Search Bar */}
          <div className="flex-1 min-w-[200px] max-w-[400px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Candidates</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or school"
                value={filters.searchKey}
                onChange={e => setFilters((f) => ({ ...f, searchKey: e.target.value }))}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>
        {/* DataTable with selection checkboxes */}
        <div className="mt-2">
          <DataTable<Submission>
            data={tableData}
            columns={columns}
            searchPlaceholder=""
            searchKeys={[]}
            filterOptions={[]}
            itemsPerPage={8}
            sortable={true}
            defaultSortKey="name"
            defaultSortOrder="asc"
            emptyState={{
              icon: <span className="text-gray-400">No students found</span>,
              title: "No students found",
              description: "Try adjusting your search or filter criteria",
            }}
          />
        </div>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between">
            <Select value={assignBucket || ''} onValueChange={setAssignBucket}>
              <SelectTrigger className="w-full sm:w-64 bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Select Bucket to Assign" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {uniqueBuckets.map((bucket) => (
                  <SelectItem key={bucket.value} value={bucket.value} className="text-gray-900 hover:bg-gray-100">
                    {bucket.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <Button
                disabled={selected.length === 0 || !assignBucket}
                // onClick={...}
              >
                Assign Bucket
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
