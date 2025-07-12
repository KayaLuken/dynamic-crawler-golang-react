# Dynamic Web Crawler - Go & React

A comprehensive web crawler application with a Next.js frontend and Go backend. Features persistent storage, dashboard analytics, and bulk operations.

## ✨ Features

### Core Functionality
- **URL Crawling**: Analyze websites for HTML version, headings, links, and login forms
- **Persistent Storage**: SQLite database with automatic migration and unique URL constraints
- **Dashboard Analytics**: View crawl history with sorting, filtering, and pagination
- **Detailed Reports**: Individual crawl results with charts and broken link analysis
- **Bulk Operations**: Select multiple entries for bulk delete or re-analysis

### Technical Features
- **Robust Error Handling**: Graceful handling of timeouts and inaccessible links
- **Upsert Logic**: Automatic update of existing URLs to prevent duplicates
- **Responsive UI**: Modern, mobile-friendly interface with TailwindCSS
- **Real-time Updates**: Live data refresh and background processing
- **Advanced Filtering**: Search and filter by multiple criteria

## 🚀 Quick Start

### Option 1: Use the Batch Script (Recommended)
```cmd
start-all.bat
```

### Option 2: Use PowerShell Script
```powershell
# Start both services
.\start-services.ps1

# Start backend only
.\start-services.ps1 -Service backend

# Start frontend only
.\start-services.ps1 -Service frontend
```

### Option 3: Manual Setup
```cmd
# Terminal 1 - Backend
cd backend
go build -o crawler.exe main.go
.\crawler.exe

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## 📊 Usage

1. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

2. **Crawl a Website**
   - Navigate to the crawl page
   - Enter a URL (e.g., https://example.com)
   - Click "Analyze Website"

3. **View Results**
   - Dashboard shows all crawl history
   - Click on any row to view detailed analytics
   - Use search and filters to find specific results

4. **Bulk Operations**
   - Select multiple entries using checkboxes
   - Use "Delete Selected" to remove entries
   - Use "Re-run Analysis" to refresh data for selected URLs

## 🛠️ API Endpoints

### Crawl Operations
- `POST /crawl` - Crawl a single URL
- `GET /crawl/history` - Get all crawl results

### Bulk Operations
- `DELETE /crawl/bulk` - Delete multiple records
- `POST /crawl/bulk/rerun` - Re-analyze multiple URLs

## 🏗️ Project Structure

```
dynamic-crawler-golang-react/
├── backend/
│   ├── main.go              # Entry point and routing
│   ├── handler/
│   │   └── handler.go       # HTTP handlers and crawl logic
│   ├── service/
│   │   └── crawl_service.go # Business logic and database operations
│   ├── models/
│   │   └── crawl.go         # Data models and structs
│   ├── database/
│   │   └── db.go            # Database connection and migration
│   └── tests/
│       └── handler_test.go  # Unit tests
├── frontend/
│   └── src/app/
│       ├── page.tsx         # Home page with crawl form
│       ├── dashboard/       # Dashboard and analytics
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   │   └── page.tsx # Detailed view
│       │   └── components/
│       │       ├── CrawlResultsTable.tsx
│       │       ├── ColumnFilters.tsx
│       │       └── LoadingComponents.tsx
│       └── components/
│           └── Nav.tsx      # Navigation component
├── start-all.bat           # Windows batch script
├── start-services.ps1      # PowerShell script
└── README.md               # This file
```

## 📈 Dashboard Features

### Results Table
- **Sortable Columns**: Click headers to sort by any field
- **Global Search**: Search across all columns simultaneously
- **Column Filters**: Filter by specific criteria
- **Pagination**: Navigate through large datasets
- **Clickable Rows**: Click to view detailed analysis

### Bulk Actions
- **Checkbox Selection**: Select individual or all items
- **Bulk Delete**: Remove multiple entries at once
- **Bulk Re-analysis**: Refresh data for selected URLs
- **Selection Counter**: Shows number of selected items

### Detailed View
- **Visual Charts**: Pie and bar charts for link distribution
- **Broken Links**: List of inaccessible URLs with error details
- **SEO Metrics**: Heading structure analysis
- **Metadata**: HTML version, title, and crawl timestamp

## 🔧 Development

### Backend Dependencies
- Go 1.21+
- Gin web framework
- GORM for database operations
- GoQuery for HTML parsing
- SQLite driver

### Frontend Dependencies
- Next.js 14+
- React 18+
- TailwindCSS
- TanStack Table
- Recharts for visualizations
- Lucide React icons

### Database Schema
```sql
CREATE TABLE crawl_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    html_version TEXT,
    title TEXT,
    headings TEXT,
    internal_links INTEGER,
    external_links INTEGER,
    inaccessible_links INTEGER,
    broken_links TEXT,
    has_login_form BOOLEAN,
    crawled_at DATETIME
);
```

## 🐛 Troubleshooting

### Common Issues
1. **Port Already in Use**: Ensure ports 3000 and 8080 are available
2. **Database Locked**: Close any existing connections before restarting
3. **CORS Errors**: Backend includes CORS middleware for localhost:3000
4. **Build Failures**: Check Go version and dependencies

### Logs and Debugging
- Backend logs are displayed in the console
- Frontend errors appear in browser console
- Database file: `backend/crawl_data.db`

## 📝 License

This project is open source and available under the MIT License.