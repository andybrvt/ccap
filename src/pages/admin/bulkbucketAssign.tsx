import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap, Filter } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={e => e.preventDefault()} className="w-full" style={{ maxWidth: '1000px' }}>
        <DialogHeader>
          <DialogTitle>Bulk Assign Bucket</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end mb-2">
          <Button variant="outline" onClick={handleResetFilters} className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-6">
            Reset All Filters
          </Button>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Candidates</label>
            <Input
              placeholder="Search by name, email, or school"
              value={filters.searchKey}
              onChange={e => setFilters((f) => ({ ...f, searchKey: e.target.value }))}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
            <Select value={filters.graduationYear || 'all'} onValueChange={value => setFilters((f) => ({ ...f, graduationYear: value === 'all' ? null : value }))}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State of Residence</label>
            <MultiSelect
              options={uniqueStatesOfResidence}
              onValueChange={v => setFilters((f) => ({ ...f, statesOfResidence: v }))}
              defaultValue={filters.statesOfResidence}
              placeholder="Select State of Residence"
              maxCount={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State of Relocation</label>
            <MultiSelect
              options={uniqueStatesOfRelocation}
              onValueChange={v => setFilters((f) => ({ ...f, statesOfRelocation: v }))}
              defaultValue={filters.statesOfRelocation}
              placeholder="Select State of Relocation"
              maxCount={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bucket</label>
            <MultiSelect
              options={uniqueBuckets}
              onValueChange={v => setFilters((f) => ({ ...f, buckets: v }))}
              defaultValue={filters.buckets}
              placeholder="Select Buckets"
              maxCount={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <Select value={filters.statusFilter} onValueChange={value => setFilters((f) => ({ ...f, statusFilter: value }))}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
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
        </div>
        {/* List of students with checkboxes */}
        <div className="border rounded-md max-h-72 overflow-y-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.submissionId}>
                  <td className="px-4 py-2">
                    <input type="checkbox" checked={selected.includes(item.submissionId)} onChange={() => toggleSelectOne(item.submissionId)} />
                  </td>
                  <td className="px-4 py-2">{item.firstName} {item.lastName}</td>
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item.mobileNumber}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-4">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
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
