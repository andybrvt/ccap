// C-CAP Connection Options
export const CCAP_CONNECTION_OPTIONS = [
    "Arizona - C-CAP",
    "Chicago - C-CAP",
    "Los Angeles - C-CAP",
    "New York/New Jersey - C-CAP",
    "Philadelphia - C-CAP",
    "Washington DC - C-CAP",
    "Miami - C-CAP",
    "Houston - C-CAP",
    "Other"
];

// Format options for dropdown components
export const CCAP_CONNECTION_DROPDOWN_OPTIONS = CCAP_CONNECTION_OPTIONS.map(option => ({
    value: option,
    label: option
}));

// Culinary Interest Options
export const CULINARY_INTEREST_OPTIONS = [
    "Cook",
    "Baker",
    "Front of the house"
];

// Program Stage Options
export const PROGRAM_STAGE_OPTIONS = [
    "Pre-Apprentice Explorer",
    "Pre-Apprentice Candidate",
    "Apprentice",
    "Completed Pre-Apprentice",
    "Completed Apprentice",
    "Not Active"
];

// Format options for dropdown components
export const PROGRAM_STAGE_DROPDOWN_OPTIONS = PROGRAM_STAGE_OPTIONS.map(option => ({
    value: option,
    label: option
}));

// Chapter-based Dish Options for Posts
export const CHAPTER_DISH_OPTIONS = [
    "Chapter 1 - Eggs Jeannette",
    "Chapter 2 - Maman's Cheese Souffle",
    "Chapter 3 - Chicken with Cream Sauce",
    "Chapter 4 - Swiss Cheese Fondue",
    "Chapter 5 - Onion Soup Gratinee",
    "Chapter 6 - Roman Gnocchi",
    "Chapter 7 - Roast Leg of Lamb Provencal",
    "Chapter 8 - Maman's Apple Tart",
    "Chapter 9A - Braised Striped Bass Pavillon",
    "Chapter 9B - Ruben Sandwich",
    "Chapter 10 - New England Clam Chowder",
    "Chapter 11 - Mussels Ravigote",
    "Chapter 12 - Gloria's Pork Ribs and Red Beans",
    "Chapter 13A - Wild Mushrooms with Lardons",
    "Chapter 13B - Smoked Trout Gloria",
    "Chapter 14A - Split Pea Soup with Ham and Croutons",
    "Chapter 14B - Oatmeal Breakfast Soup",
    "Chapter 15 - Braised Rabbit en Cocotte with Mustard Sauce",
    "Chapter 16 - Chicken Salad a la Danny Kaye",
    "Chapter 17 - Semi-Dry Tomatoes and Mozzarella Salad",
    "Chapter 18A - Giobbi's Primavera Pasta",
    "Chapter 18B - Dandelion Salad",
    "Chapter 18C - Locust Flower Fritters",
    "Chapter 19 - Seviche of Scallops"
];

// Format options for dropdown components
export const CHAPTER_DISH_DROPDOWN_OPTIONS = CHAPTER_DISH_OPTIONS.map(option => ({
    value: option,
    label: option
}));
