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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState as useReactState } from 'react';
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';


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

export default function Submissions() {
  // State for data
  const [data, setData] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for search
  const [searchKey, setSearchKey] = useState("");

  // State for filters
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<string | null>(null);
  const [selectedStatesOfResidence, setSelectedStatesOfResidence] = useState<string[]>([]);
  const [selectedStatesOfRelocation, setSelectedStatesOfRelocation] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [onboardingFilter, setOnboardingFilter] = useState("all"); // New: onboarding status filter

  // Dynamic items per page calculation
  const { itemsPerPage, containerRef } = useDynamicItemsPerPage();
  const [, setLocation] = useLocation();

  // Fetch all students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(API_ENDPOINTS.ADMIN_GET_ALL_STUDENTS);

        if (response.data) {
          // Transform backend data to match frontend Submission interface
          const transformedData: Submission[] = response.data.map((student: any) => {
            const profile = student.student_profile || {};
            return {
              id: student.id,
              submissionId: student.id,
              formId: student.id,
              submissionDate: profile.created_at || student.created_at,
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              preferredName: profile.preferred_name || "",
              email: student.email || profile.email || "",
              address: profile.address || "",
              address2: profile.address_line2 || "",
              city: profile.city || "",
              state: profile.state || "",
              zipCode: profile.zip_code || "",
              willRelocate: profile.willing_to_relocate || "",
              relocationStates: profile.relocation_states || [],
              dateOfBirth: profile.date_of_birth || "",
              mobileNumber: profile.phone || "",
              highSchool: profile.high_school || "",
              graduationYear: profile.graduation_year || "",
              transportation: profile.transportation || "",
              hoursWanted: profile.hours_per_week?.toString() || "0",
              availableTimes: profile.availability?.join(", ") || "",
              availableWeekends: profile.weekend_availability || "",
              hasResume: profile.has_resume || "",
              resumeUrl: profile.resume_url || "",
              currentJob: profile.currently_employed || "",
              currentEmployer: profile.current_employer || "",
              currentPosition: profile.current_position || "",
              currentHours: profile.current_hours_per_week?.toString() || "",
              pastJob: profile.previous_employment || "",
              pastEmployer: profile.previous_employer || "",
              pastPosition: profile.previous_position || "",
              pastHours: profile.previous_hours_per_week?.toString() || "",
              readyToWork: profile.ready_to_work || "",
              readyDate: profile.available_date || "",
              interestedOptions: profile.interests || [],
              foodHandlersCard: profile.has_food_handlers_card || "",
              servsafeCredentials: profile.has_servsafe || "",
              culinaryYears: profile.culinary_class_years?.toString() || "0",
              bucket: profile.current_bucket || "",
              onboardingStep: profile.onboarding_step || 0,
            };
          });

          setData(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

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

  // Refresh student data after updates
  const refreshStudents = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN_GET_ALL_STUDENTS);

      if (response.data) {
        const transformedData: Submission[] = response.data.map((student: any) => {
          const profile = student.student_profile || {};
          return {
            id: student.id,
            submissionId: student.id,
            formId: student.id,
            submissionDate: profile.created_at || student.created_at,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            preferredName: profile.preferred_name || "",
            email: student.email || profile.email || "",
            address: profile.address || "",
            address2: profile.address_line2 || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zip_code || "",
            willRelocate: profile.willing_to_relocate || "",
            relocationStates: profile.relocation_states || [],
            dateOfBirth: profile.date_of_birth || "",
            mobileNumber: profile.phone || "",
            highSchool: profile.high_school || "",
            graduationYear: profile.graduation_year || "",
            transportation: profile.transportation || "",
            hoursWanted: profile.hours_per_week?.toString() || "0",
            availableTimes: profile.availability?.join(", ") || "",
            availableWeekends: profile.weekend_availability || "",
            hasResume: profile.has_resume || "",
            resumeUrl: profile.resume_url || "",
            currentJob: profile.currently_employed || "",
            currentEmployer: profile.current_employer || "",
            currentPosition: profile.current_position || "",
            currentHours: profile.current_hours_per_week?.toString() || "",
            pastJob: profile.previous_employment || "",
            pastEmployer: profile.previous_employer || "",
            pastPosition: profile.previous_position || "",
            pastHours: profile.previous_hours_per_week?.toString() || "",
            readyToWork: profile.ready_to_work || "",
            readyDate: profile.available_date || "",
            interestedOptions: profile.interests || [],
            foodHandlersCard: profile.has_food_handlers_card || "",
            servsafeCredentials: profile.has_servsafe || "",
            culinaryYears: profile.culinary_class_years?.toString() || "0",
            bucket: profile.current_bucket || "",
            onboardingStep: profile.onboarding_step || 0,
          };
        });

        setData(transformedData);
      }
    } catch (error) {
      console.error('Failed to refresh students:', error);
      toast.error('Failed to refresh student data');
    }
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
      new Set(data.map((item) => item.state).filter(Boolean))
    ).map((state) => ({ value: state, label: state }));
  }, [data]);

  const uniqueStatesOfRelocation = useMemo(() => {
    return Array.from(
      new Set(data.flatMap((item) => item.relocationStates))
    ).map((state) => ({ value: state, label: state }));
  }, [data]);

  const uniqueBuckets = useMemo(() => {
    // Hardcoded program stages for consistency
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

      // Onboarding status filtering
      let matchesOnboarding = true;
      if (onboardingFilter !== "all") {
        if (onboardingFilter === "complete") {
          matchesOnboarding = item.onboardingStep === 0;
        } else if (onboardingFilter === "incomplete") {
          matchesOnboarding = item.onboardingStep > 0;
        }
      }

      return matchesSearch && matchesGraduationYear && matchesStateOfResidence &&
        matchesStateOfRelocation && matchesBucket && matchesStatus && matchesOnboarding;
    });
  }, [data, searchKey, selectedGraduationYear, selectedStatesOfResidence, selectedStatesOfRelocation, selectedBuckets, statusFilter, onboardingFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKey("");
    setSelectedGraduationYear(null);
    setSelectedStatesOfResidence([]);
    setSelectedStatesOfRelocation([]);
    setSelectedBuckets([]);
    setStatusFilter("all");
    setOnboardingFilter("all");
  };

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [bulkFilters, setBulkFilters] = useState({
    searchKey: '',
    graduationYear: null as string | null,
    statesOfResidence: [] as string[],
    statesOfRelocation: [] as string[],
    buckets: [] as string[],
    statusFilter: 'all',
  });

  // Filtered data for bulk dialog
  const bulkFilteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filtering
      const matchesSearch = !bulkFilters.searchKey ||
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(bulkFilters.searchKey.toLowerCase()) ||
        item.email.toLowerCase().includes(bulkFilters.searchKey.toLowerCase()) ||
        item.highSchool.toLowerCase().includes(bulkFilters.searchKey.toLowerCase());
      const matchesGraduationYear = !bulkFilters.graduationYear ||
        item.graduationYear === bulkFilters.graduationYear;
      const matchesStateOfResidence = bulkFilters.statesOfResidence.length === 0 ||
        bulkFilters.statesOfResidence.includes(item.state);
      const matchesStateOfRelocation = bulkFilters.statesOfRelocation.length === 0 ||
        item.relocationStates.some((state) => bulkFilters.statesOfRelocation.includes(state));
      const matchesBucket = bulkFilters.buckets.length === 0 ||
        (item.bucket && bulkFilters.buckets.includes(item.bucket));
      let matchesStatus = true;
      if (bulkFilters.statusFilter !== 'all') {
        switch (bulkFilters.statusFilter) {
          case 'has_resume':
            matchesStatus = item.hasResume === 'Yes';
            break;
          case 'currently_working':
            matchesStatus = item.currentJob === 'Yes';
            break;
          case 'food_handlers':
            matchesStatus = item.foodHandlersCard === 'Yes';
            break;
          case 'servsafe':
            matchesStatus = item.servsafeCredentials === 'Yes';
            break;
          case 'will_relocate':
            matchesStatus = item.willRelocate === 'Yes';
            break;
          case 'ready_to_work':
            matchesStatus = item.readyToWork === 'Yes';
            break;
        }
      }
      return matchesSearch && matchesGraduationYear && matchesStateOfResidence && matchesStateOfRelocation && matchesBucket && matchesStatus;
    })
      // Only show students with no bucket ("", null, or undefined)
      .filter((item) => !item.bucket);
  }, [bulkFilters]);

  const allBulkIds = bulkFilteredData.map((item) => item.submissionId);
  const allSelected = bulkSelected.length === allBulkIds.length && allBulkIds.length > 0;
  const toggleSelectAll = () => {
    setBulkSelected(allSelected ? [] : allBulkIds);
  };
  const toggleSelectOne = (id: string) => {
    setBulkSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
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
      key: 'programStages',
      header: 'Program Stage',
      minWidth: '180px',
      render: (item) => (
        item.onboardingStep === 0 ? (
          <AssignBucketButton
            submission={item}
            onUpdate={refreshStudents}
            currentBucket={item.bucket}
          />
        ) : (
          <span className="text-xs text-gray-400">Pending onboarding</span>
        )
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
            {/* <div className="text-xs max-w-[150px] break-words whitespace-pre-line text-gray-500 "> */}
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


  if (isLoading) {
    return (
      <Layout>
        <div className="py-4 px-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-4 px-6" ref={containerRef}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">C-CAP Student Management</h1>
        </div>

        <div className="flex flex-col gap-2 pb-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg p-4 w-full">
            <div className="w-full">
              {/* Filters with responsive flex layout */}
              <div className="flex flex-wrap items-end  gap-4">
                {/* Graduation Year Filter */}
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Year
                  </label>
                  <Select value={selectedGraduationYear || "all"} onValueChange={(value) => setSelectedGraduationYear(value === "all" ? null : value)}>
                    <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
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

                {/* Bucket Filter */}
                <div className="min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Stages
                  </label>
                  <MultiSelect
                    options={uniqueBuckets}
                    onValueChange={setSelectedBuckets}
                    defaultValue={selectedBuckets}
                    placeholder="Select Program Stages"
                    maxCount={3}
                  />
                </div>

                {/* Status Filter */}
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
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

                {/* Onboarding Status Filter */}
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Onboarding Status
                  </label>
                  <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
                    <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All</SelectItem>
                      <SelectItem value="complete" className="text-gray-900 hover:bg-gray-100">Complete</SelectItem>
                      <SelectItem value="incomplete" className="text-gray-900 hover:bg-gray-100">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
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
          </div>

          <div className="flex md:flex-row flex-col md:items-end md:justify-between gap-4">

            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-[400px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Candidates
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or school"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="default" onClick={() => setLocation(`/admin/assign-program-status`)}>
                Assign Program Stages
              </Button>
            </div>
          </div>
        </div>

        {/* Applied Filters Display */}
        {/* {(selectedGraduationYear || selectedStatesOfResidence.length > 0 || selectedStatesOfRelocation.length > 0 || selectedBuckets.length > 0 || statusFilter !== "all") && (
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
            {selectedBuckets.map((bucket) => (
              <Badge key={bucket} variant="secondary" className="bg-indigo-100 text-indigo-800 flex items-center gap-1">
                Bucket: {bucket}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-indigo-600"
                  onClick={() => setSelectedBuckets(prev => prev.filter(b => b !== bucket))}
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
        )} */}

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

// Student data interface
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
  bucket: string;
  onboardingStep: number; // 0 = complete, 1-6 = in progress
  id?: string;
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
    icon: <Clock className="w-3 h-3 text-gray-700 mr-2" />,
  },
];

function AssignBucketButton({ submission, onUpdate, currentBucket }: { submission: Submission; onUpdate: () => void; currentBucket?: string }) {
  const [open, setOpen] = useReactState(false);
  const [selectedBucket, setSelectedBucket] = useReactState<string | null>(currentBucket || null);
  const [isAssigning, setIsAssigning] = useReactState(false);
  const bucketOptions = [
    'Pre-Apprentice',
    'Apprentice',
    'Completed Pre-Apprentice',
    'Completed Apprentice',
    'Not Active',
  ];

  // Update selected bucket when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedBucket(currentBucket || null);
    }
    setOpen(isOpen);
  };

  const handleAssign = async () => {
    if (!selectedBucket) return;

    setIsAssigning(true);
    try {
      // Update the student's bucket/program status
      await api.put(`${API_ENDPOINTS.ADMIN_GET_STUDENT}${submission.id}/profile`, {
        current_bucket: selectedBucket,
      });

      const action = currentBucket ? 'Updated' : 'Assigned';
      toast.success(`${action} ${submission.firstName} ${submission.lastName} to ${selectedBucket}`);
      setOpen(false);
      onUpdate(); // Refresh the student list
    } catch (error) {
      console.error('Failed to assign bucket:', error);
      toast.error('Failed to update program stage');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <>
      {currentBucket ? (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${currentBucket === 'Pre-Apprentice' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              currentBucket === 'Apprentice' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                currentBucket === 'Completed Pre-Apprentice' ? 'bg-green-50 text-green-700 border-green-200' :
                  currentBucket === 'Completed Apprentice' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            onClick={() => setOpen(true)}
          >
            {currentBucket}
          </Badge>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="text-xs border-gray-200 border-2" onClick={() => setOpen(true)}>
          Assign Program Stage
        </Button>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{currentBucket ? 'Change' : 'Assign'} Program Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 mb-2">
              {currentBucket ? 'Change' : 'Assign'} program stage for <span className="font-semibold">{submission.firstName} {submission.lastName}</span>
              {currentBucket && (
                <div className="mt-2 text-xs text-gray-500">
                  Current: <span className="font-semibold">{currentBucket}</span>
                </div>
              )}
            </div>
            <Select value={selectedBucket || ''} onValueChange={setSelectedBucket}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Select Program Stage" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {bucketOptions.map((bucket) => (
                  <SelectItem key={bucket} value={bucket} className="text-gray-900 hover:bg-gray-100">
                    {bucket}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign} disabled={!selectedBucket || isAssigning || selectedBucket === currentBucket}>
              {isAssigning ? 'Saving...' : currentBucket ? 'Update' : 'Assign'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isAssigning}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
