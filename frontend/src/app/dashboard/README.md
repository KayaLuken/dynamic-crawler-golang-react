# Dashboard Features

## Overview
The dashboard provides a comprehensive view of all crawl results with advanced filtering, sorting, and pagination capabilities.

## Features

### 🔍 **Advanced Search & Filtering**
- **Global Search**: Search across all columns simultaneously
- **Column Filters**: Individual filters for each column
- **Fuzzy Matching**: Smart search that finds partial matches

### 📊 **Data Visualization**
- **Sortable Columns**: Click any column header to sort
- **Rich Data Display**: 
  - Clickable URLs that open in new tabs
  - Color-coded link counts (Internal: Green, External: Blue, Inaccessible: Red)
  - Login form indicators
  - Heading breakdowns (H1, H2, H3 counts)
  - Formatted timestamps

### 📄 **Pagination**
- **Configurable Page Size**: Default 10 rows per page
- **Navigation Controls**: Previous/Next buttons
- **Row Count Display**: Shows current page info

### 🎨 **Modern UI**
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Skeleton loaders for better UX
- **Hover Effects**: Interactive table rows
- **Clean Typography**: Easy to read data

## Components

### `CrawlResultsTable`
Main table component with TanStack Table integration

### `FiltersBar`
Collapsible filter controls for individual columns

### `LoadingComponents`
Skeleton loading states for better UX

### `useCrawlHistory`
React hook for fetching and managing crawl data

## Usage

```tsx
import { CrawlResultsTable } from "./components/CrawlResultsTable";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CrawlResultsTable />
      </div>
    </div>
  );
}
```

## Data Structure

The dashboard expects crawl results in this format:

```typescript
interface CrawlResult {
  id: number;
  url: string;
  html_version: string;
  title: string;
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  crawled_at: string;
  created_at: string;
  updated_at: string;
}
```

## Dependencies

- `@tanstack/react-table` - Table functionality
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `next.js` - React framework
- `tailwindcss` - Styling

## Performance

- **Virtualization**: Table handles large datasets efficiently
- **Memoization**: Columns are memoized for performance
- **Debounced Search**: Search input is optimized
- **Lazy Loading**: Data is fetched on demand
