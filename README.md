# Dynamic Web Crawler - Go & React

A comprehensive web crawler application with a Next.js frontend and Go backend. Features persistent SQLite storage, dashboard analytics, and bulk operations with start/stop processing controls.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```powershell
# Start all services (Backend + Frontend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Manual Setup

#### Prerequisites
- Go 1.23+
- Node.js 18+

#### Step 1: Start Backend
```powershell
cd backend
go mod download
go build -o crawler.exe main.go
.\crawler.exe
```

#### Step 2: Start Frontend
```powershell
cd frontend
npm install
npm run dev
```

#### Step 3: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: SQLite file (backend/crawl_data.db)

## ✨ Features

### Core Functionality
- **URL Crawling**: Analyze websites for HTML version, headings, links, and login forms
- **Start/Stop Processing**: Control crawling with start/stop buttons and batch processing
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

## 📊 Usage

1. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

2. **Crawl a Website**
   - Navigate to the crawl page
   - **Single URL**: Enter a URL and click "Start Crawl"
   - **Batch Processing**: Add multiple URLs and click "Start All"
   - **Control**: Use Stop button to cancel processing

3. **View Results**
   - Dashboard shows all crawl history with advanced table features
   - Click on any row to view detailed analytics with charts
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
│   └── Dockerfile           # Backend container config
├── frontend/
│   └── src/app/
│       ├── page.tsx         # Home page with crawl form
│       ├── crawl/           # Crawl page with start/stop controls
│       ├── dashboard/       # Dashboard and analytics
│       └── components/
│           └── Nav.tsx      # Modern navigation component
├── docker-compose.yml       # Full stack deployment
└── README.md               # This file
```

## � Troubleshooting

### Docker Issues
1. **Port conflicts**: Change ports in docker-compose.yml if needed
2. **Build failures**: Run `docker-compose build --no-cache`
3. **Database issues**: SQLite database is created automatically

### Manual Setup Issues
1. **SQLite database**: The database file is created automatically on first run
2. **Go dependencies**: Run `go mod download` in backend directory
3. **Node dependencies**: Run `npm install` in frontend directory
4. **File permissions**: Ensure write permissions for SQLite database creation

## � Environment Variables

```bash
# Backend
GIN_MODE=release

# Frontend
BACKEND_URL=http://localhost:8080
```

## 🚀 Production Deployment

For production deployment, update the docker-compose.yml:
1. Set proper domain names instead of localhost
2. Add SSL certificates for HTTPS
3. Configure proper resource limits
4. Ensure SQLite database persistence with proper volume mounts
2. Set proper domain names instead of localhost
3. Add SSL certificates for HTTPS
4. Configure proper resource limits

## � Features Overview

### Dashboard Features
- **Advanced Search & Filtering**: Global search and column-specific filters
- **Sortable Columns**: Click headers to sort by any field
- **Bulk Operations**: Select multiple items for batch actions
- **Detailed Views**: Click rows to see comprehensive analytics
- **Modern UI**: Responsive design with loading states

### Crawl Features
- **Single URL Processing**: Analyze individual websites
- **Batch Processing**: Queue multiple URLs for analysis
- **Start/Stop Controls**: Control processing with real-time feedback
- **Progress Tracking**: Visual indicators for processing status
- **Error Handling**: Graceful handling of failed requests

## � License

This project is open source and available under the MIT License.