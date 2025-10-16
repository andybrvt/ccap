// CCAP Connection Options
export const CCAP_CONNECTION_OPTIONS = [
    "Arizona - CCAP",
    "Chicago - CCAP",
    "Los Angeles - CCAP",
    "New York/New Jersey - CCAP",
    "Philadelphia - CCAP",
    "Washington DC - CCAP",
    "Miami - CCAP",
    "Houston - CCAP",
    "Other"
];

// Format options for dropdown components
export const CCAP_CONNECTION_DROPDOWN_OPTIONS = CCAP_CONNECTION_OPTIONS.map(option => ({
    value: option,
    label: option
}));
