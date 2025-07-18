import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Clock as ClockIcon, Search, Filter, FileCheck, Utensils, Shield, X } from 'lucide-react';
import DataTable, { Column, FilterOption } from '@/components/ui/data-table';
import Layout from '@/components/layout/AdminLayout';
import { useLocation } from "wouter";

// Custom hook to calculate dynamic itemsPerPage based on available height
function useDynamicItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!containerRef.current) return;

      // Get the container element
      const container = containerRef.current;

      // Get the table element within the container
      const table = container.querySelector('table');
      if (!table) return;

      // Calculate available height for the table
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const viewportHeight = window.innerHeight;

      // Reserve space for other elements (filters, pagination, margins)
      const reservedSpace = 300; // Adjust this value based on your layout
      const availableHeight = viewportHeight - containerTop - reservedSpace;

      // Get the height of a single table row (including header)
      const tableHeader = table.querySelector('thead');
      const tableBody = table.querySelector('tbody');

      if (!tableHeader || !tableBody) return;

      const headerHeight = tableHeader.getBoundingClientRect().height;
      const firstRow = tableBody.querySelector('tr');
      const rowHeight = firstRow ? firstRow.getBoundingClientRect().height : 80; // Fallback height

      // Calculate how many items can fit
      const tableContentHeight = availableHeight - headerHeight;
      const calculatedItemsPerPage = Math.max(1, Math.floor(tableContentHeight / rowHeight));

      // Set a reasonable range (between 3 and 20 items)
      const clampedItemsPerPage = Math.min(20, Math.max(3, calculatedItemsPerPage));

      setItemsPerPage(clampedItemsPerPage);
    };

    // Calculate on mount and window resize
    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);

    // Recalculate after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(calculateItemsPerPage, 100);

    return () => {
      window.removeEventListener('resize', calculateItemsPerPage);
      clearTimeout(timeoutId);
    };
  }, []);

  return { itemsPerPage, containerRef };
}

// Example data type
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
  [key: string]: unknown;
}

// Filter options 
const filterOptions: FilterOption[] = [
  {
    value: 'has_resume',
    label: 'Has Resume',
    icon: <FileCheck className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'currently_working',
    label: 'Currently Working',
    icon: <Briefcase className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'food_handlers',
    label: 'Food Handlers Card',
    icon: <Utensils className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'servsafe',
    label: 'ServSafe Certified',
    icon: <Shield className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'will_relocate',
    label: 'Willing to Relocate',
    icon: <MapPin className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'ready_to_work',
    label: 'Ready to Work',
    icon: <ClockIcon className="w-3 h-3 text-gray-700 mr-2" />,
  },
];

export default function BulkBucketAssignPage() {
  // Local state for data (so we can update buckets)
  const [data, setData] = useState<Submission[]>(initialData);

  // State for search and filters
  const [searchKey, setSearchKey] = useState("");
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<string | null>(null);
  const [selectedStatesOfResidence, setSelectedStatesOfResidence] = useState<string[]>([]);
  const [selectedStatesOfRelocation, setSelectedStatesOfRelocation] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [assignBucket, setAssignBucket] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Dynamic items per page calculation
  const { itemsPerPage, containerRef } = useDynamicItemsPerPage();

  const handleViewDetails = (item: Submission) => {
    setLocation(`/admin/portfolio/${item.id}`);
  };

  // Get unique values for dropdowns
  const uniqueGraduationYears = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((item) => item.graduationYear)
          .filter((year) => year !== undefined && year !== "")
      )
    ).map((year) => ({ value: year, label: year }));
  }, [data]);

  const uniqueStatesOfResidence = useMemo(() => {
    return Array.from(
      new Set(data.map((item) => item.state))
    ).map((state) => ({ value: state, label: state }));
  }, [data]);

  const uniqueStatesOfRelocation = useMemo(() => {
    return Array.from(
      new Set(data.flatMap((item) => item.relocationStates))
    ).map((state) => ({ value: state, label: state }));
  }, [data]);

  const uniqueBuckets = useMemo(() => {
    return [
      { value: 'Pre-Apprentice', label: 'Pre-Apprentice' },
      { value: 'Apprentice', label: 'Apprentice' },
      { value: 'Completed Pre-Apprentice', label: 'Completed Pre-Apprentice' },
      { value: 'Completed Apprentice', label: 'Completed Apprentice' },
      { value: 'Not Active', label: 'Not Active' },
    ];
  }, []);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filtering
      const matchesSearch = !searchKey ||
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchKey.toLowerCase()) ||
        item.email.toLowerCase().includes(searchKey.toLowerCase()) ||
        item.highSchool.toLowerCase().includes(searchKey.toLowerCase());

      // Graduation year filtering
      const matchesGraduationYear = !selectedGraduationYear ||
        item.graduationYear === selectedGraduationYear;

      // State of residence filtering
      const matchesStateOfResidence = selectedStatesOfResidence.length === 0 ||
        selectedStatesOfResidence.includes(item.state);

      // State of relocation filtering
      const matchesStateOfRelocation = selectedStatesOfRelocation.length === 0 ||
        item.relocationStates.some((state) => selectedStatesOfRelocation.includes(state));

      // Bucket filtering
      const matchesBucket = selectedBuckets.length === 0 ||
        (item.bucket && selectedBuckets.includes(item.bucket));

      // Status filtering
      let matchesStatus = true;
      if (statusFilter !== "all") {
        switch (statusFilter) {
          case 'has_resume':
            matchesStatus = item.hasResume === "Yes";
            break;
          case 'currently_working':
            matchesStatus = item.currentJob === "Yes";
            break;
          case 'food_handlers':
            matchesStatus = item.foodHandlersCard === "Yes";
            break;
          case 'servsafe':
            matchesStatus = item.servsafeCredentials === "Yes";
            break;
          case 'will_relocate':
            matchesStatus = item.willRelocate === "Yes";
            break;
          case 'ready_to_work':
            matchesStatus = item.readyToWork === "Yes";
            break;
        }
      }

      return matchesSearch && matchesGraduationYear && matchesStateOfResidence &&
        matchesStateOfRelocation && matchesBucket && matchesStatus;
    })
      // Only show students with no bucket ("", null, or undefined)
      .filter((item) => !item.bucket);
  }, [data, searchKey, selectedGraduationYear, selectedStatesOfResidence, selectedStatesOfRelocation, selectedBuckets, statusFilter]);

  // Selection logic
  const allBulkIds = filteredData.map((item) => item.submissionId);
  const allSelected = selected.length === allBulkIds.length && allBulkIds.length > 0;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : allBulkIds);
  };
  const toggleSelectOne = (id: string) => {
    setSelected((prev: string[]) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  // Reset all filters to initial state
  const handleResetFilters = () => {
    setSearchKey("");
    setSelectedGraduationYear(null);
    setSelectedStatesOfResidence([]);
    setSelectedStatesOfRelocation([]);
    setSelectedBuckets([]);
    setStatusFilter("all");
  };

  // Bulk assign handler
  const handleBulkAssign = () => {
    if (!assignBucket || selected.length === 0) return;
    setData((prev) =>
      prev.map((item) =>
        selected.includes(item.submissionId)
          ? { ...item, bucket: assignBucket }
          : item
      )
    );
    setSelected([]);
    setAssignBucket(null);
  };

  // Get selected candidates for display in slide panel
  const selectedCandidates = useMemo(() => {
    return filteredData.filter(item => selected.includes(item.submissionId));
  }, [filteredData, selected]);

  // Columns for DataTable
  const columns: Column<Submission>[] = [
    {
      key: 'select',
      header: (
        <div className="flex justify-center w-full px-1">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
        </div>
      ),
      render: (item) => (
        <div className="flex justify-center">
          <Checkbox
            checked={selected.includes(item.submissionId)}
            onCheckedChange={() => toggleSelectOne(item.submissionId)}
            aria-label={`Select ${item.firstName} ${item.lastName}`}
          />
        </div>
      ),
      minWidth: '50px',
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
      minWidth: '120px',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          <Button size="sm" className="bg-black text-white hover:bg-gray-800 hover:cursor-pointer" onClick={() => handleViewDetails(item)}>
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="py-4 px-6" ref={containerRef}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Program Status Assignment</h1>
        </div>
        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-2 pb-4">
          <div className="bg-white rounded-lg pl-0 p-2">
            <div className="flex flex-wrap items-end gap-4">
              {/* Graduation Year Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                <Select value={selectedGraduationYear || 'all'} onValueChange={value => setSelectedGraduationYear(value === 'all' ? null : value)}>
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
                  onValueChange={setSelectedStatesOfResidence}
                  defaultValue={selectedStatesOfResidence}
                  placeholder="Select State of Residence"
                  maxCount={3}
                />
              </div>
              {/* State of Relocation Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">State of Relocation</label>
                <MultiSelect
                  options={uniqueStatesOfRelocation}
                  onValueChange={setSelectedStatesOfRelocation}
                  defaultValue={selectedStatesOfRelocation}
                  placeholder="Select State of Relocation"
                  maxCount={3}
                />
              </div>
              {/* Bucket Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bucket</label>
                <MultiSelect
                  options={uniqueBuckets}
                  onValueChange={setSelectedBuckets}
                  defaultValue={selectedBuckets}
                  placeholder="Select Buckets"
                  maxCount={3}
                />
              </div>
              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  className="border-gray-300 h-10 bg-white text-gray-700 hover:bg-gray-50 px-6"
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
                value={searchKey}
                onChange={e => setSearchKey(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Main content with table and slide panel */}
        <div className="flex flex-wrap gap-4">
          {/* DataTable with selection checkboxes */}
          <div className="flex-1 min-w-0">
          <p className="text-gray-800 text-sm font-medium mb-2 block lg:hidden">Select Candidates
          to assign a program status</p>
            <DataTable<Submission>
              data={filteredData}
              columns={columns}
              searchPlaceholder=""
              searchKeys={[]}
              filterOptions={[]}
              itemsPerPage={itemsPerPage}
              sortable={true}
              defaultSortKey="name"
              defaultSortOrder="asc"
              emptyState={{
                icon: '',
                title: "No students found",
                description: "Try adjusting your search or filter criteria",
              }}
            />
          </div>

          {/* Action Panel - Desktop and Tablet */}
          <div className="h-full bg-black hidden lg:block w-80 border border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Assign Program Status</h3>
            </div>

            <div className="space-y-4">
              {selected.length > 0 ? (
                <>
                  {/* Selected count */}
                  <div className="text-sm text-gray-300">
                    {selected.length} candidate{selected.length !== 1 ? 's' : ''} selected
                  </div>

                  {/* Selected candidates list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidates.map((candidate) => (
                        <div key={candidate.submissionId} className="flex items-center space-x-1 px-2 py-1 bg-gray-800 rounded text-xs border border-gray-600">
                          <User className="h-3 w-3 text-gray-300 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap text-gray-200">
                            {candidate.firstName} {candidate.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bucket selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Select Program Status
                    </label>
                    <Select value={assignBucket || ''} onValueChange={setAssignBucket}>
                      <SelectTrigger className="w-full bg-gray-900 border-blue-500 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Choose a program status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-blue-500">
                        {uniqueBuckets.map((bucket) => (
                          <SelectItem key={bucket.value} value={bucket.value} className="text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white">
                            {bucket.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleBulkAssign}
                      disabled={!assignBucket}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 font-semibold shadow-lg"
                    >
                      Assign to {selected.length} Candidate{selected.length !== 1 ? 's' : ''}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelected([])}
                      className="w-full bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* No selection state */}
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <User className="h-12 w-12 mx-auto mb-3" />
                    </div>
                    <p className="text-gray-300 text-sm font-medium mb-2">
                      Select Candidates
                    </p>
                    <p className="text-gray-400 text-xs">
                      to assign a program status
                    </p>
                  </div>

                  {/* Bucket selection (disabled) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Select Program Status
                    </label>
                    <Select value={assignBucket || ''} onValueChange={setAssignBucket} disabled>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed">
                        <SelectValue placeholder="Choose a program status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {uniqueBuckets.map((bucket) => (
                          <SelectItem key={bucket.value} value={bucket.value} className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">
                            {bucket.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disabled button */}
                  <div className="space-y-2">
                    <Button
                      disabled
                      className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                    >
                      Assign Program Status
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Action Panel - Below table */}
          <div className="lg:hidden w-full bg-black border border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Assign Program Status</h3>
            </div>

            <div className="space-y-4">
              {selected.length > 0 ? (
                <>
                  {/* Selected count */}
                  <div className="text-sm text-gray-300">
                    {selected.length} candidate{selected.length !== 1 ? 's' : ''} selected
                  </div>

                  {/* Selected candidates list */}
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidates.map((candidate) => (
                        <div key={candidate.submissionId} className="flex items-center space-x-1 px-2 py-1 bg-gray-800 rounded text-xs border border-gray-600">
                          <User className="h-3 w-3 text-gray-300 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap text-gray-200">
                            {candidate.firstName} {candidate.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bucket selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Select Program Status
                    </label>
                    <Select value={assignBucket || ''} onValueChange={setAssignBucket}>
                      <SelectTrigger className="w-full bg-gray-900 border-blue-500 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Choose a program status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-blue-500">
                        {uniqueBuckets.map((bucket) => (
                          <SelectItem key={bucket.value} value={bucket.value} className="text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white">
                            {bucket.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleBulkAssign}
                      disabled={!assignBucket}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 font-semibold shadow-lg"
                    >
                      Assign to {selected.length} Candidate{selected.length !== 1 ? 's' : ''}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelected([])}
                      className="w-full bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* No selection state */}
                  <div className="text-center py-4">
                    <div className="text-gray-400 mb-2">
                      <User className="h-8 w-8 mx-auto mb-2" />
                    </div>
                    <p className="text-gray-300 text-sm font-medium mb-1">
                      Select Candidates
                    </p>
                    <p className="text-gray-400 text-xs">
                      to assign a program status
                    </p>
                  </div>

                  {/* Bucket selection (disabled) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Select Program Status
                    </label>
                    <Select value={assignBucket || ''} onValueChange={setAssignBucket} disabled>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed">
                        <SelectValue placeholder="Choose a program status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {uniqueBuckets.map((bucket) => (
                          <SelectItem key={bucket.value} value={bucket.value} className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">
                            {bucket.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disabled button */}
                  <div className="space-y-2">
                    <Button
                      disabled
                      className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                    >
                      Assign Program Status
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


// Example data 
const initialData: Submission[] = [
  {
    id: 1,
    submissionId: "JxDW8d",
    formId: "6r5BRY",
    submissionDate: "2024-09-10 19:38:29",
    firstName: "Taelyn",
    lastName: "Morton",
    preferredName: "",
    email: "goldannmorton@gmail.com",
    address: "14043 N 57th Way",
    address2: "",
    city: "Scottsdale",
    state: "AZ",
    zipCode: "85254",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2008-10-01",
    mobileNumber: "16028317803",
    highSchool: "Paradise Valley Highschool",
    graduationYear: "2026",
    transportation: "I will drive myself",
    hoursWanted: "25",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "Yes",
    hasResume: "No",
    resumeUrl: "",
    currentJob: "No",
    currentEmployer: "",
    currentPosition: "",
    currentHours: "",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "Yes",
    readyDate: "",
    interestedOptions: ["Culinary", "Baking and Pastry"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "1",
    bucket: ""
  },
  {
    id: 2,
    submissionId: "x1ylvJ",
    formId: "gWroN4",
    submissionDate: "2024-09-10 19:39:18",
    firstName: "Madison",
    lastName: "Yob",
    preferredName: "",
    email: "madisonyob13@gmail.com",
    address: "3728 East Taro lane",
    address2: "",
    city: "Phoenix",
    state: "CA",
    zipCode: "85050",
    willRelocate: "No",
    relocationStates: ["KY", "IA", "ID", "GA", "DE"],
    dateOfBirth: "2007-03-08",
    mobileNumber: "15205914355",
    highSchool: "Paradise Valley High School",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "30",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "Yes",
    hasResume: "Yes",
    resumeUrl: "https://storage.tally.so/private/Morton-Resume.pdf?id=MEDodk&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik1FRG9kayIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.k0TkChgdfD7z4_0WZlMWap53E-1bE9q5t6CsKPb5Eh0&signature=ef97b8d0f622c45a7c8aa42937b1c2544dbb759d151deaada05fbd1a7b708b87",
    currentJob: "Yes",
    currentEmployer: "Yogurtini",
    currentPosition: "Employee",
    currentHours: "20",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2025-03-08",
    interestedOptions: ["Baking and Pastry", "Culinary"],
    foodHandlersCard: "No",
    servsafeCredentials: "",
    culinaryYears: "2",
    // bucket: "Apprentice"
    bucket: ""
  },
  {
    id: 3,
    submissionId: "ZKYZev",
    formId: "yeka0x",
    submissionDate: "2024-09-10 19:39:32",
    firstName: "Elyse",
    lastName: "Chavez",
    preferredName: "",
    email: "elysemaria07@gmail.com",
    address: "4722 East Bell Rd, Apt. 2143",
    address2: "",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2007-05-01",
    mobileNumber: "16027626552",
    highSchool: "PVHS",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "25",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "Yes",
    hasResume: "Yes",
    resumeUrl: "",
    currentJob: "Yes",
    currentEmployer: "QuikTrip",
    currentPosition: "Clerk",
    currentHours: "30",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2024-12-01",
    interestedOptions: ["Baking and Pastry"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "0",
    // bucket: "Completed Pre-Apprentice"
    bucket: ""
  },
  {
    id: 4,
    submissionId: "r1LkgL",
    formId: "K8yj88",
    submissionDate: "2024-09-10 19:39:56",
    firstName: "Aiden",
    lastName: "Hancharik",
    preferredName: "",
    email: "wynterhancharik@gmail.com",
    address: "9415 N 32nd st",
    address2: "",
    city: "phoenix",
    state: "AZ",
    zipCode: "85028",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2006-09-25",
    mobileNumber: "16028829770",
    highSchool: "paradise valley high school",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "34",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "No",
    hasResume: "No",
    resumeUrl: "",
    currentJob: "No",
    currentEmployer: "",
    currentPosition: "",
    currentHours: "",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2025-12-25",
    interestedOptions: ["Culinary"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "2",
    bucket: "Completed Apprentice"
  },
  {
    id: 5,
    submissionId: "r1Lkgp",
    formId: "zWv6WR",
    submissionDate: "2024-09-10 19:40:00",
    firstName: "Ibrahim",
    lastName: "Haddad",
    preferredName: "",
    email: "ibrahimhaddad07@gmail.com",
    address: "3826 west fallen leaf lane",
    address2: "",
    city: "Glendale",
    state: "AZ",
    zipCode: "85310",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2023-12-07",
    mobileNumber: "14802400020",
    highSchool: "3",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "16",
    availableTimes: "Morning (6AM - 10AM), Afternoon (10AM - 2PM)",
    availableWeekends: "Yes",
    hasResume: "Yes",
    resumeUrl: "",
    currentJob: "Yes",
    currentEmployer: "Slim chicken",
    currentPosition: "Qb1",
    currentHours: "10",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2024-12-27",
    interestedOptions: ["Culinary"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "3",
    bucket: "Not Active"
  },
  {
    id: 6,
    submissionId: "agEakW",
    formId: "O8yN8R",
    submissionDate: "2024-09-10 19:40:01",
    firstName: "Russell",
    lastName: "Johnson",
    preferredName: "",
    email: "russellpj55@gmail.com",
    address: "3056 E Siesta Lane",
    address2: "",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2007-04-21",
    mobileNumber: "16023612341",
    highSchool: "Paradise valley high school",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "40",
    availableTimes: "Evening (2PM - 6PM), Afternoon (10AM - 2PM)",
    availableWeekends: "Yes",
    hasResume: "Yes",
    resumeUrl: "https://storage.tally.so/private/RUSSELL-JOHNSON-RESUME-2.docx?id=kN9MOe&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtOOU1PZSIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.6LBqo8Y_BQ8mG-7MPpVbxRW-nVkk1I48I_rk2JktHUU&signature=a4866eeacacb23e1b02678c0c5bc3633b1fd93d8002620bc58af51dbdabd4cb2",
    currentJob: "Yes",
    currentEmployer: "The Mighty Axe",
    currentPosition: "Axepert",
    currentHours: "40",
    pastJob: "Yes",
    pastEmployer: "Tj maxx",
    pastPosition: "Employee",
    pastHours: "30",
    readyToWork: "No",
    readyDate: "2025-04-21",
    interestedOptions: ["Culinary"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "3",
    bucket: ""
  },
  {
    id: 7,
    submissionId: "RaYVgv",
    formId: "745k1Z",
    submissionDate: "2024-09-10 19:40:06",
    firstName: "Amaree",
    lastName: "Vega",
    preferredName: "",
    email: "amareevega@gmail.com",
    address: "E Hartford ave 3529",
    address2: "",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2007-08-06",
    mobileNumber: "16023125383",
    highSchool: "Paradise Valley High School",
    graduationYear: "2025",
    transportation: "I will be dropped off",
    hoursWanted: "18",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "No",
    hasResume: "No",
    resumeUrl: "",
    currentJob: "No",
    currentEmployer: "",
    currentPosition: "",
    currentHours: "",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2025-08-06",
    interestedOptions: ["Culinary", "Baking and Pastry"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "3",
    bucket: "Pre-Apprentice"
  },
  {
    id: 8,
    submissionId: "LNY6yz",
    formId: "D0yGAR",
    submissionDate: "2024-09-10 19:40:13",
    firstName: "Aisha",
    lastName: "Preciado",
    preferredName: "",
    email: "ishapc222@gmail.con",
    address: "2950 E Greenway Rd",
    address2: "",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
    willRelocate: "No",
    relocationStates: [],
    dateOfBirth: "2008-02-02",
    mobileNumber: "14808098395",
    highSchool: "Paradise Valley High School",
    graduationYear: "2026",
    transportation: "I will be dropped off",
    hoursWanted: "23",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "No",
    hasResume: "Yes",
    resumeUrl: "",
    currentJob: "Yes",
    currentEmployer: "Target",
    currentPosition: "Style",
    currentHours: "19",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2025-01-25",
    interestedOptions: ["Baking and Pastry"],
    foodHandlersCard: "Yes",
    servsafeCredentials: "",
    culinaryYears: "3",
    bucket: ""
  }
];