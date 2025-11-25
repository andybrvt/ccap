import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Building, MapPin, Calendar, CheckCircle, Clock, FileText, User, Mail, Phone, GraduationCap, Car, Clock as ClockIcon, Briefcase, FileCheck, Utensils, Shield, School, Search, Filter, X, MoreHorizontal, Trash2, Eye, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import DataTable, { Column, FilterOption } from '@/components/ui/data-table';
import Layout from '@/components/layout/AdminLayout';
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState as useReactState } from 'react';
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';
import { CCAP_CONNECTION_DROPDOWN_OPTIONS, PROGRAM_STAGE_DROPDOWN_OPTIONS } from '@/lib/constants';


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
  const [selectedCcapConnections, setSelectedCcapConnections] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [onboardingFilter, setOnboardingFilter] = useState("all"); // New: onboarding status filter
  const [resumeFilter, setResumeFilter] = useState("all"); // Resume filter: all, has, no

  // CSV Export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFields, setExportFields] = useState<string[]>([
    'firstName',
    'lastName',
    'email',
    'dateOfBirth',
    'ccapConnection',
    'bucket',
    'highSchool',
    'graduationYear',
    'submissionDate'
  ]);


  // Available fields for export
  const availableExportFields = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'preferredName', label: 'Preferred Name' },
    { value: 'email', label: 'Email' },
    { value: 'mobileNumber', label: 'Mobile Number' },
    { value: 'dateOfBirth', label: 'Date of Birth' },
    { value: 'ccapConnection', label: 'C-CAP Connection' },
    { value: 'bucket', label: 'Program Stage' },
    { value: 'highSchool', label: 'High School' },
    { value: 'graduationYear', label: 'Graduation Year' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'currentlyEmployed', label: 'Currently Employed' },
    { value: 'currentEmployer', label: 'Current Employer' },
    { value: 'readyToWork', label: 'Ready to Work' },
    { value: 'submissionDate', label: 'Submission Date' }
  ];

  // Dynamic items per page calculation
  const { itemsPerPage, containerRef } = useDynamicItemsPerPage();
  const [location, setLocation] = useLocation();

  // Track if we've initially loaded to prevent URL overwriting on first render
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Restore page from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');

    if (searchParams.has('page')) {
      const page = parseInt(searchParams.get('page') || '1');
      setCurrentPage(page);
    }

    setInitialLoadDone(true);
  }, []);


  // Track current page
  const [currentPage, setCurrentPage] = useState(1);

  // Update URL whenever page changes (but only after initial load)
  useEffect(() => {
    if (!initialLoadDone) return;

    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());

    const url = `/admin/submissions${params.toString() ? `?${params.toString()}` : ''}`;

    // Update URL with window.history to avoid wouter issues
    window.history.replaceState({}, '', url);
  }, [currentPage, initialLoadDone]);

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
              ccapConnection: profile.ccap_connection || "",
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

  const [selectedStudent, setSelectedStudent] = useState<Submission | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [portfolioPosts, setPortfolioPosts] = useState<any[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // State for individual post modal
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const handleViewDetails = async (item: Submission) => {
    setSelectedStudent(item);
    setShowPortfolioModal(true);
    setIsLoadingPortfolio(true);

    try {
      // Fetch full student data
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_STUDENT}${item.id}`);
      setPortfolioData(response.data);

      // Fetch posts
      const postsResponse = await api.get(`${API_ENDPOINTS.POSTS_GET_BY_USER}${item.id}`);
      setPortfolioPosts(postsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleOpenPost = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Admin: view student documents via signed URLs
  const handleAdminViewResume = async () => {
    if (!selectedStudent) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_RESUME_URL}${selectedStudent.id}/profile/resume`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get resume URL:', error);
      toast.error('Failed to view resume', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  const handleAdminViewCredential = async () => {
    if (!selectedStudent) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_CREDENTIAL_URL}${selectedStudent.id}/profile/credential`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get credential URL:', error);
      toast.error('Failed to view credential', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  const handleAdminViewServSafe = async () => {
    if (!selectedStudent) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_SERVSAFE_URL}${selectedStudent.id}/profile/servsafe`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get ServSafe URL:', error);
      toast.error('Failed to view ServSafe certificate', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Submission | null>(null);

  const handleDeleteClick = (item: Submission) => {
    setStudentToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      await api.delete(`${API_ENDPOINTS.ADMIN_DELETE_STUDENT}${studentToDelete.id}`);
      toast.success(`Deleted ${studentToDelete.firstName} ${studentToDelete.lastName}`);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      refreshStudents(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    console.log('Filter changed to:', value);
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (exportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    // Get column labels for selected fields
    const selectedFieldLabels = exportFields.map(field => {
      const fieldDef = availableExportFields.find(f => f.value === field);
      return fieldDef ? fieldDef.label : field;
    });

    // Create CSV header
    const csvHeader = selectedFieldLabels.join(',') + '\n';

    // Create CSV rows from filtered data
    const csvRows = filteredData.map(row => {
      return exportFields.map(field => {
        const value = row[field as keyof Submission];

        // Format the value for CSV (handle arrays, dates, etc.)
        if (value === null || value === undefined) {
          return '';
        }

        if (Array.isArray(value)) {
          return value.join('; ').replace(/,/g, ';');
        }

        // Handle dates
        if (field === 'submissionDate' || field === 'dateOfBirth') {
          return format(new Date(value as string), 'yyyy-MM-dd');
        }

        // Escape commas and quotes in the value
        const stringValue = String(value).replace(/"/g, '""');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue}"`;
        }

        return stringValue;
      }).join(',');
    }).join('\n');

    // Combine header and rows
    const csvContent = csvHeader + csvRows;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ccap-students-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredData.length} students to CSV`);
    setExportDialogOpen(false);
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
            ccapConnection: profile.ccap_connection || "",
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
    // Use centralized program stage constants
    return PROGRAM_STAGE_DROPDOWN_OPTIONS;
  }, []);

  const uniqueCcapConnections = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((item) => item.ccapConnection)
          .filter((connection) => connection !== undefined && connection !== '')
      )
    ).map((connection) => ({ value: connection, label: connection }));
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filtering
      const searchText = searchKey.toLowerCase();
      const matchesSearch = !searchKey ||
        `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase().includes(searchText) ||
        (item.email || '').toLowerCase().includes(searchText) ||
        (item.highSchool || '').toLowerCase().includes(searchText);

      // Graduation year filtering
      const matchesGraduationYear = !selectedGraduationYear ||
        item.graduationYear === selectedGraduationYear;

      // State of residence filtering
      const matchesStateOfResidence = selectedStatesOfResidence.length === 0 ||
        selectedStatesOfResidence.includes(item.state);

      // State of relocation filtering
      const matchesStateOfRelocation = selectedStatesOfRelocation.length === 0 ||
        (Array.isArray(item.relocationStates) && item.relocationStates.some((state) => selectedStatesOfRelocation.includes(state)));

      // Bucket filtering
      const matchesBucket = selectedBuckets.length === 0 ||
        (item.bucket && selectedBuckets.includes(item.bucket));

      // C-CAP Connection filtering
      const matchesCcapConnection = selectedCcapConnections.length === 0 ||
        (item.ccapConnection && selectedCcapConnections.includes(item.ccapConnection));

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

      // Resume filtering
      let matchesResume = true;
      if (resumeFilter !== "all") {
        if (resumeFilter === "has") {
          matchesResume = item.hasResume === "Yes";
        } else if (resumeFilter === "no") {
          matchesResume = item.hasResume !== "Yes";
        }
      }

      return matchesSearch && matchesGraduationYear && matchesStateOfResidence &&
        matchesStateOfRelocation && matchesBucket && matchesCcapConnection && matchesStatus && matchesOnboarding && matchesResume;
    });
  }, [data, searchKey, selectedGraduationYear, selectedStatesOfResidence, selectedStatesOfRelocation, selectedBuckets, selectedCcapConnections, statusFilter, onboardingFilter, resumeFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKey("");
    setSelectedGraduationYear(null);
    setSelectedStatesOfResidence([]);
    setSelectedStatesOfRelocation([]);
    setSelectedBuckets([]);
    setSelectedCcapConnections([]);
    setStatusFilter("all");
    setOnboardingFilter("all");
    setResumeFilter("all");
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
      header: 'Name',
      minWidth: '200px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900 font-medium text-sm">
              {item.firstName} {item.lastName}
              {item.preferredName && (
                <span className="text-gray-500 ml-1">({item.preferredName})</span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {item.email}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
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
      key: 'birthday',
      header: 'Date of Birth',
      minWidth: '100px',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm whitespace-nowrap">
            {item.dateOfBirth ? format(new Date(item.dateOfBirth), "MMM d, yyyy") : 'Not provided'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'location',
      header: 'C-CAP Connection',
      minWidth: '140px',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">
              {item.ccapConnection || 'Not specified'}
            </span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'programStages',
      header: 'Program Stage',
      minWidth: '160px',
      render: (item) => (
        <AssignBucketButton
          submission={item}
          onUpdate={refreshStudents}
          currentBucket={item.bucket}
        />
      ),
      sortable: true,
    },
    {
      key: 'education',
      header: 'Education',
      minWidth: '150px',
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
      key: 'submissionDate',
      header: 'Submitted Date',
      minWidth: '110px',
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
      minWidth: '80px',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200">
              <DropdownMenuItem
                onClick={() => handleViewDetails(item)}
                className="text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(item)}
                className="text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      {/* Portfolio Modal */}
      <Dialog open={showPortfolioModal} onOpenChange={setShowPortfolioModal}>
        <DialogContent
          className="max-h-[95vh] overflow-y-auto p-0"
          style={{ width: '95vw', maxWidth: 'none' }}
        >
          {isLoadingPortfolio ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading portfolio...</p>
              </div>
            </div>
          ) : portfolioData && selectedStudent ? (
            <div className="p-6 w-full">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setSelectedStudent(null);
                    setPortfolioData(null);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Submissions</span>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* LinkedIn-style Bio - Fixed width on large screens */}
                <div className="lg:w-2/4">
                  <Card className="shadow-lg border-blue-100">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar and Name */}
                        <div className="flex flex-col items-center md:items-start md:w-1/3 bg-blue-50 rounded-xl p-6 mb-4 md:mb-0">
                          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500 mb-4 border-4 border-blue-200">
                            {portfolioData.student_profile?.first_name?.charAt(0)}{portfolioData.student_profile?.last_name?.charAt(0)}
                          </div>
                          <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center md:text-left">
                            {portfolioData.student_profile?.first_name} {portfolioData.student_profile?.last_name}
                            {portfolioData.student_profile?.preferred_name && (
                              <span className="text-lg text-blue-400 ml-2">({portfolioData.student_profile?.preferred_name})</span>
                            )}
                          </h1>
                          <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                            {(portfolioData.student_profile?.interests || []).map((option: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-100">
                                {option}
                              </Badge>
                            ))}
                          </div>
                          {/* Program Status */}
                          <div className="flex justify-center md:justify-start mb-2">
                            <Badge variant="outline" className="text-xs">
                              {portfolioData.student_profile?.current_bucket || 'Pre-Apprentice Explorer'}
                            </Badge>
                          </div>
                          {/* Bio Section */}
                          {portfolioData.student_profile?.bio && (
                            <div className="w-full mt-4 p-4 bg-white rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-700 leading-relaxed">{portfolioData.student_profile?.bio}</p>
                            </div>
                          )}
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 flex flex-col gap-6">
                          {/* Contact Row */}
                          <div className="flex flex-wrap gap-4 text-blue-900 text-sm items-center">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-400" />{portfolioData.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-blue-400" />{portfolioData.student_profile?.phone || 'N/A'}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" />{portfolioData.student_profile?.city || 'N/A'}, {portfolioData.student_profile?.state || 'N/A'}</span>
                          </div>
                          <hr className="my-2 border-blue-100" />
                          {/* Education */}
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-blue-500" />Education</span>
                            <span className="ml-7 text-blue-900 text-sm">
                              <span className="font-semibold text-blue-600">{portfolioData.student_profile?.high_school || 'N/A'}</span> <span className="text-gray-500">({portfolioData.student_profile?.graduation_year || 'N/A'})</span>
                            </span>
                            {portfolioData.student_profile?.ccap_connection && (
                              <span className="ml-7 text-blue-600 text-sm font-semibold">
                                C-CAP Connection: <span className="text-gray-700 font-normal">{portfolioData.student_profile?.ccap_connection}</span>
                              </span>
                            )}
                            <span className="ml-7 text-blue-600 text-sm">Culinary Education: <span className="text-gray-900">{portfolioData.student_profile?.culinary_class_years || 0} years</span></span>
                          </div>
                          {/* Work */}
                          <div className="flex flex-col gap-1 mt-2">
                            <span className="font-semibold text-green-700 flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-green-500" />Work</span>
                            <span className="ml-7 text-green-700 text-sm">
                              <span className="font-semibold">{portfolioData.student_profile?.currently_employed === "Yes" ? "Currently at" : "Not currently working"}</span>
                              <span className="text-gray-900">{portfolioData.student_profile?.currently_employed === "Yes" ? ` ${portfolioData.student_profile?.current_employer || 'N/A'}` : ""}</span>
                            </span>
                            {portfolioData.student_profile?.previous_employment === "Yes" && (
                              <span className="ml-7 text-green-500 text-xs">Past: <span className="text-gray-700">{portfolioData.student_profile?.previous_position || 'N/A'} at {portfolioData.student_profile?.previous_employer || 'N/A'} ({portfolioData.student_profile?.previous_hours_per_week || 0} hrs/week)</span></span>
                            )}
                          </div>
                          {/* Credentials */}
                          <div className="flex flex-col gap-1 mt-2">
                            <span className="font-semibold text-purple-700 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5 text-purple-500" />Credentials</span>
                            <div className="ml-7 flex flex-col gap-2 text-purple-900 text-sm">
                              <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Resume:</span> <span className="text-gray-900">
                                {portfolioData.student_profile?.has_resume === "Yes" ? (
                                  <button onClick={handleAdminViewResume} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">
                                    View Resume
                                  </button>
                                ) : (
                                  "Not Provided"
                                )}
                              </span></span>
                              <span className="flex items-center gap-2"><Utensils className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Food Handler:</span> <span className="text-gray-900">
                                {portfolioData.student_profile?.has_food_handlers_card === "Yes" ? (
                                  <button onClick={handleAdminViewCredential} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View</button>
                                ) : (
                                  portfolioData.student_profile?.has_food_handlers_card || "No"
                                )}
                              </span></span>
                              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">ServSafe:</span> <span className="text-gray-900">
                                {portfolioData.student_profile?.has_servsafe === "Yes" ? (
                                  <button onClick={handleAdminViewServSafe} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View</button>
                                ) : (
                                  portfolioData.student_profile?.has_servsafe || "No"
                                )}
                              </span></span>
                            </div>
                          </div>
                          {/* Details */}
                          <div className="flex flex-col gap-1 mt-4">
                            <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg">Details</span>
                            <div className="ml-7 flex flex-col gap-y-1 text-xs text-gray-500 bg-blue-50 rounded-lg p-4 border border-blue-100 mt-1">
                              <span><span className="font-semibold text-blue-700">Date of Birth:</span> <span className="text-gray-900">{portfolioData.student_profile?.date_of_birth || 'N/A'}</span></span>
                              <span><span className="font-semibold text-blue-700">Transportation:</span> <span className="text-gray-900">{portfolioData.student_profile?.transportation || 'N/A'}</span></span>
                              <span><span className="font-semibold text-blue-700">Available Times:</span> <span className="text-gray-900">{portfolioData.student_profile?.availability?.join(", ") || 'N/A'}</span></span>
                              <span><span className="font-semibold text-blue-700">Available Weekends:</span> <span className="text-gray-900">{portfolioData.student_profile?.weekend_availability || 'N/A'}</span></span>
                              <span><span className="font-semibold text-blue-700">Ready to Work:</span> <span className="text-gray-900">{portfolioData.student_profile?.ready_to_work || 'N/A'} {portfolioData.student_profile?.available_date && `(from ${portfolioData.student_profile.available_date})`}</span></span>
                              <span><span className="font-semibold text-blue-700">Will Relocate:</span> <span className="text-gray-900">{portfolioData.student_profile?.willing_to_relocate || 'N/A'} {portfolioData.student_profile?.relocation_states && portfolioData.student_profile.relocation_states.length > 0 && `(${portfolioData.student_profile.relocation_states.join(", ")})`}</span></span>
                              <span><span className="font-semibold text-blue-700">Address:</span> <span className="text-gray-900">{portfolioData.student_profile?.address || 'N/A'} {portfolioData.student_profile?.address_line2 || ''}</span></span>
                              <span><span className="font-semibold text-blue-700">Zip:</span> <span className="text-gray-900">{portfolioData.student_profile?.zip_code || 'N/A'}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Instagram-style Posts Grid - Scrollable on large screens */}
                <div className="lg:w-2/4">
                  <div className="lg:sticky lg:top-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Posts</h2>
                    <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2">
                      {portfolioPosts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                          {portfolioPosts.map((post: any) => (
                            <button
                              key={post.id}
                              className="relative aspect-square bg-blue-100 rounded-lg overflow-hidden border border-blue-200 focus:outline-none group hover:opacity-90 transition-opacity"
                              onClick={() => handleOpenPost(post)}
                            >
                              <img src={post.image_url} alt={post.caption || 'Post'} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border border-blue-200 rounded-lg bg-blue-50">
                          <p className="text-blue-600 mb-4">No posts yet.</p>
                          <p className="text-blue-500 text-sm">This student hasn't shared any posts.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Post Modal - shown when clicking on a post */}
      {showPostModal && selectedPost && (
        <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
          <DialogContent
            className="max-h-[90vh] overflow-hidden p-0"
            style={{ width: '90vw', maxWidth: '900px' }}
          >
            <div className="flex flex-col h-[90vh]">
              {/* Back Button */}
              <div className="p-4 border-b flex items-center gap-2">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Portfolio</span>
                </button>
              </div>

              {/* Image - 70% height */}
              <div className="flex-1 overflow-hidden bg-black" style={{ height: '70%' }}>
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.caption || 'Post'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Caption and Featured Dish - 30% height */}
              <div className="p-4 bg-white border-t" style={{ height: '30%' }}>
                {selectedPost.featured_dish && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-900">Featured Dish:</span>
                    </div>
                    <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                      {selectedPost.featured_dish}
                    </Badge>
                  </div>
                )}

                {selectedPost.caption && (
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedPost.caption}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Submissions Table */}
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
                    key={`states-residence-${selectedStatesOfResidence.length}`}
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
                    key={`states-relocation-${selectedStatesOfRelocation.length}`}
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
                    key={`buckets-${selectedBuckets.length}`}
                    options={uniqueBuckets}
                    onValueChange={setSelectedBuckets}
                    defaultValue={selectedBuckets}
                    placeholder="Select Program Stages"
                    maxCount={3}
                  />
                </div>

                {/* C-CAP Connection Filter */}
                <div className="min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    C-CAP Connection
                  </label>
                  <MultiSelect
                    key={`ccap-connections-${selectedCcapConnections.length}`}
                    options={uniqueCcapConnections}
                    onValueChange={setSelectedCcapConnections}
                    defaultValue={selectedCcapConnections}
                    placeholder="Select C-CAP Connection"
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

                {/* Resume Filter */}
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume
                  </label>
                  <Select value={resumeFilter} onValueChange={setResumeFilter}>
                    <SelectTrigger className="w-full min-h-10 text-sm px-3 bg-gray-50 border-gray-200 text-gray-900">
                      <FileCheck className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All</SelectItem>
                      <SelectItem value="has" className="text-gray-900 hover:bg-gray-100">Has Resume</SelectItem>
                      <SelectItem value="no" className="text-gray-900 hover:bg-gray-100">No Resume</SelectItem>
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
              <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {studentToDelete?.firstName} {studentToDelete?.lastName} and all their associated data including posts, comments, and profile information. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Students to CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select the fields you want to include in the export. {filteredData.length} student(s) will be exported.
            </p>
            <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4">
              <div className="space-y-2">
                {availableExportFields.map(field => (
                  <label
                    key={field.value}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={exportFields.includes(field.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportFields([...exportFields, field.value]);
                        } else {
                          setExportFields(exportFields.filter(f => f !== field.value));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setExportFields(availableExportFields.map(f => f.value));
                }}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExportFields([]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportCSV} disabled={exportFields.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  ccapConnection: string;
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
  const bucketOptions = PROGRAM_STAGE_DROPDOWN_OPTIONS.map(option => option.value);

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
            className={`text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${currentBucket === 'Pre-Apprentice Explorer' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              currentBucket === 'Pre-Apprentice Candidate' ? 'bg-orange-50 text-orange-700 border-orange-200' :
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
