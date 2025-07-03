import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Building, MapPin, Calendar, CheckCircle, Clock, FileText, User, Mail, Phone, GraduationCap, Car, Clock as ClockIcon, Briefcase, FileCheck, Utensils, Shield, School, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
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
      const reservedSpace = 400; // Adjust this value based on your layout
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

export default function Submissions() {
  // State for search
  const [searchKey, setSearchKey] = useState("");

  // State for filters
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<string | null>(null);
  const [selectedStatesOfResidence, setSelectedStatesOfResidence] = useState<string[]>([]);
  const [selectedStatesOfRelocation, setSelectedStatesOfRelocation] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Dynamic items per page calculation
  const { itemsPerPage, containerRef } = useDynamicItemsPerPage();
  const [, setLocation] = useLocation();

  const handleRowClick = (item: Submission) => {
    console.log('Clicked on:', item);
  };

  const handleViewDetails = (item: Submission) => {
    setLocation(`/admin/portfolio/${item.id}`);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    console.log('Filter changed to:', value);
  };

  // Get unique values for dropdowns
  const uniqueGraduationYears = useMemo(() => {
    return Array.from(
      new Set(
        exampleData
          .map((item) => item.graduationYear)
          .filter((year) => year !== undefined && year !== "")
      )
    ).map((year) => ({ value: year, label: year }));
  }, []);

  const uniqueStatesOfResidence = useMemo(() => {
    return Array.from(
      new Set(exampleData.map((item) => item.state))
    ).map((state) => ({ value: state, label: state }));
  }, []);

  const uniqueStatesOfRelocation = useMemo(() => {
    return Array.from(
      new Set(exampleData.flatMap((item) => item.relocationStates))
    ).map((state) => ({ value: state, label: state }));
  }, []);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return exampleData.filter((item) => {
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
        matchesStateOfRelocation && matchesStatus;
    });
  }, [searchKey, selectedGraduationYear, selectedStatesOfResidence, selectedStatesOfRelocation, statusFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKey("");
    setSelectedGraduationYear(null);
    setSelectedStatesOfResidence([]);
    setSelectedStatesOfRelocation([]);
    setStatusFilter("all");
  };

  // Column definitions
const columns: Column<Submission>[] = [
  {
    key: 'name',
    header: 'Candidate',
    minWidth: '280px',
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
          <span className="truncate">
            {item.email}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {item.mobileNumber}
          </span>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'location',
    header: 'Location',
    minWidth: '200px',
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
    minWidth: '180px',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">
            {item.highSchool}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Graduates: {item.graduationYear}
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'availability',
    header: 'Availability',
    minWidth: '200px',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">
            {item.hoursWanted} hrs/week
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {item.availableTimes}
        </div>
        <div className="text-xs text-gray-500">
          Weekends: {item.availableWeekends}
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'experience',
    header: 'Experience',
    minWidth: '150px',
    render: (item) => (
      <div className="space-y-1">
        {item.currentJob === "Yes" ? (
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 text-gray-700 mr-2 flex-shrink-0" />
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Currently Working
            </Badge>
          </div>
        ) : (
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              No Current Job
            </Badge>
          </div>
        )}
        <div className="text-xs text-gray-500">
          {item.culinaryYears} years culinary
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'credentials',
    header: 'Credentials',
    minWidth: '150px',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {item.foodHandlersCard === "Yes" ? (
            <Utensils className="w-4 h-4 text-green-600" />
          ) : (
            <Utensils className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-600">Food Handler</span>
        </div>
        <div className="flex items-center space-x-2">
          {item.servsafeCredentials === "Yes" ? (
            <Shield className="w-4 h-4 text-green-600" />
          ) : (
            <Shield className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-600">ServSafe</span>
        </div>
        <div className="flex items-center space-x-2">
          {item.hasResume === "Yes" ? (
            <FileCheck className="w-4 h-4 text-green-600" />
          ) : (
            <FileCheck className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-600">Resume</span>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'interests',
    header: 'Interests',
    minWidth: '150px',
    render: (item) => (
      <div className="space-y-1">
        {item.interestedOptions.map((option, index) => (
          <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
            {option}
          </Badge>
        ))}
      </div>
    ),
    sortable: true,
  },
  {
    key: 'submissionDate',
    header: 'Submitted',
    minWidth: '120px',
    render: (item) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-gray-700 text-sm whitespace-nowrap">
          {format(new Date(item.submissionDate), "MMM d, yyyy")}
        </span>
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
      <div className="p-6" ref={containerRef}>
        <h1 className="text-2xl font-bold mb-6">C-CAP Submission Data</h1>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            {/* Filters in one line */}
            <div className="flex flex-wrap items-end gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Candidates
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or school"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Graduation Year Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <Select value={selectedGraduationYear || "all"} onValueChange={(value) => setSelectedGraduationYear(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">
                      All Years
                    </SelectItem>
                    {uniqueGraduationYears.map((year) => (
                      <SelectItem key={year.value} value={year.value} className="text-gray-900 hover:bg-gray-100">
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State of Residence Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State of Residence
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State of Relocation
                </label>
                <MultiSelect
                  options={uniqueStatesOfRelocation}
                  onValueChange={setSelectedStatesOfRelocation}
                  defaultValue={selectedStatesOfRelocation}
                  placeholder="Select State of Relocation"
                  maxCount={3}
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <Select value={statusFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
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
            </div>

            {/* Reset Button below filters */}
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

        {/* Applied Filters Display */}
        {(selectedGraduationYear || selectedStatesOfResidence.length > 0 || selectedStatesOfRelocation.length > 0 || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGraduationYear && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                Graduation Year: {selectedGraduationYear}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-blue-600"
                  onClick={() => setSelectedGraduationYear(null)}
                />
              </Badge>
            )}
            {selectedStatesOfResidence.map((state) => (
              <Badge key={state} variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                Residence: {state}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-green-600"
                  onClick={() => setSelectedStatesOfResidence(prev => prev.filter(s => s !== state))}
                />
              </Badge>
            ))}
            {selectedStatesOfRelocation.map((state) => (
              <Badge key={state} variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1">
                Relocation: {state}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-purple-600"
                  onClick={() => setSelectedStatesOfRelocation(prev => prev.filter(s => s !== state))}
                />
              </Badge>
            ))}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center gap-1">
                {filterOptions.find(opt => opt.value === statusFilter)?.label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-orange-600"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        <DataTable<Submission>
          data={filteredData}
          columns={columns}
          searchPlaceholder=""
          searchKeys={[]}
          filterOptions={[]}
          onFilterChange={handleFilterChange}
          itemsPerPage={itemsPerPage}
          sortable={true}
          defaultSortKey="submissionDate"
          defaultSortOrder="desc"
          onRowClick={handleRowClick}
          emptyState={{
            icon: <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />,
            title: "No submissions found",
            description: "Try adjusting your search or filter criteria",
          }}
        />
      </div>
    </Layout>
  );
}

// Example data type based on Google Sheets structure
interface Submission extends Record<string, unknown> {
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
}

// Example data based on Google Sheets structure
const exampleData: Submission[] = [
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
    culinaryYears: "1"
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
    culinaryYears: "2"
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
    culinaryYears: "0"
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
    culinaryYears: "2"
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
    culinaryYears: "3"
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
    culinaryYears: "3"
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
    culinaryYears: "3"
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
    culinaryYears: "3"
  }
];

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
    icon: <Clock className="w-3 h-3 text-gray-700 mr-2" />,
  },
];
