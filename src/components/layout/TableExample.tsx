import React from 'react';
import { Building, MapPin, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Table, { Column, FilterOption } from './Table';

// Example data type
interface Submission extends Record<string, unknown> {
  id: number;
  business_name: string;
  business_address: string;
  business_type: string;
  created_at: string;
  is_analyzed: boolean;
  applicant_name: string;
}

// Example data
const exampleData: Submission[] = [
  {
    id: 1,
    business_name: "Bella Vista Restaurant",
    business_address: "245 Main Street, Downtown",
    business_type: "Liquor License",
    created_at: "2025-05-20",
    is_analyzed: false,
    applicant_name: "Maria Rodriguez",
  },
  {
    id: 2,
    business_name: "Tech Solutions Inc",
    business_address: "123 Innovation Drive",
    business_type: "Business Registration",
    created_at: "2025-04-16",
    is_analyzed: true,
    applicant_name: "John Smith",
  },
  {
    id: 3,
    business_name: "Coastal Coffee Co",
    business_address: "48 Ocean Boulevard, Suite 100",
    business_type: "Food Service Permit",
    created_at: "2025-04-22",
    is_analyzed: false,
    applicant_name: "Sarah Chen",
  },
  {
    id: 4,
    business_name: "Mountain View Logistics",
    business_address: "789 Industrial Park Road",
    business_type: "Transportation License",
    created_at: "2025-04-25",
    is_analyzed: true,
    applicant_name: "Michael Johnson",
  },
  {
    id: 5,
    business_name: "Creative Design Studio",
    business_address: "156 Arts District Lane",
    business_type: "Business Registration",
    created_at: "2025-04-10",
    is_analyzed: false,
    applicant_name: "Emily Davis",
  },
  {
    id: 6,
    business_name: "Sunshine Fitness Center",
    business_address: "1801 Health & Wellness Blvd",
    business_type: "Health Facility License",
    created_at: "2025-04-24",
    is_analyzed: true,
    applicant_name: "Robert Wilson",
  },
  {
    id: 7,
    business_name: "Harbor Electronics",
    business_address: "92 Technology Circle",
    business_type: "Retail License",
    created_at: "2025-03-05",
    is_analyzed: false,
    applicant_name: "Lisa Thompson",
  },
  {
    id: 8,
    business_name: "Metro Construction",
    business_address: "5420 Builder's Avenue",
    business_type: "Contractor License",
    created_at: "2025-04-10",
    is_analyzed: true,
    applicant_name: "David Martinez",
  },
  {
    id: 9,
    business_name: "Green Thumb Nursery",
    business_address: "321 Garden Center Way",
    business_type: "Agricultural License",
    created_at: "2025-03-28",
    is_analyzed: false,
    applicant_name: "Jennifer Brown",
  },
  {
    id: 10,
    business_name: "Blue Sky Aviation",
    business_address: "456 Airport Terminal Drive",
    business_type: "Aviation License",
    created_at: "2025-04-18",
    is_analyzed: true,
    applicant_name: "Christopher Lee",
  },
  {
    id: 11,
    business_name: "Golden State Brewery",
    business_address: "789 Craft Beer Lane",
    business_type: "Brewery License",
    created_at: "2025-04-12",
    is_analyzed: false,
    applicant_name: "Alexandra Garcia",
  },
  {
    id: 12,
    business_name: "Urban Dance Academy",
    business_address: "567 Performance Arts Street",
    business_type: "Educational License",
    created_at: "2025-04-30",
    is_analyzed: true,
    applicant_name: "Marcus Johnson",
  },
  {
    id: 13,
    business_name: "Ocean View Marina",
    business_address: "890 Harbor Point Road",
    business_type: "Maritime License",
    created_at: "2025-03-15",
    is_analyzed: false,
    applicant_name: "Rachel Green",
  },
];

// Column definitions
const columns: Column<Submission>[] = [
  {
    key: 'business_name',
    header: 'Business',
    minWidth: '280px',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-900 font-medium">
            {item.business_name}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {item.business_address}
          </span>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'business_type',
    header: 'Type',
    minWidth: '150px',
    render: (item) => (
      <span className="text-gray-700 text-sm">
        {item.business_type}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Date',
    minWidth: '120px',
    render: (item) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-gray-700 text-sm whitespace-nowrap">
          {format(new Date(item.created_at), "MMM d, yyyy")}
        </span>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'is_analyzed',
    header: 'Status',
    minWidth: '150px',
    render: (item) => (
      item.is_analyzed ? (
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-gray-700 mr-2 flex-shrink-0" />
          <Badge variant="default" className="bg-green-100 text-green-800">
            Analyzed
          </Badge>
        </div>
      ) : (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Quote Requested
          </Badge>
        </div>
      )
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
        <Button size="sm" className="bg-black text-white hover:bg-gray-800">
          View Details
        </Button>
      </div>
    ),
  },
];

// Filter options
const filterOptions: FilterOption[] = [
  {
    value: 'analyzed',
    label: 'Analyzed',
    icon: <CheckCircle className="w-3 h-3 text-gray-700 mr-2" />,
  },
  {
    value: 'quote_requested',
    label: 'Quote Requested',
    icon: <Clock className="w-3 h-3 text-gray-700 mr-2" />,
  },
];

export default function TableExample() {
  const handleRowClick = (item: Submission) => {
    console.log('Clicked on:', item);
  };

  const handleFilterChange = (value: string) => {
    console.log('Filter changed to:', value);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dynamic Table Example</h1>
      
      <Table<Submission>
        data={exampleData}
        columns={columns}
        searchPlaceholder="Search by business name or applicant..."
        searchKeys={['business_name', 'applicant_name']}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        itemsPerPage={5}
        sortable={true}
        defaultSortKey="created_at"
        defaultSortOrder="desc"
        onRowClick={handleRowClick}
        emptyState={{
          icon: <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />,
          title: "No submissions found",
          description: "Try adjusting your search or filter criteria",
        }}
      />
    </div>
  );
} 