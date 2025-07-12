# Dynamic Crawler - Backend with Persistence

This Go backend application crawls websites and persists the crawl data to a JSON file for future retrieval.

## Features

- **Web Crawling**: Analyze websites for HTML version, title, headings, links, and login forms
- **Data Persistence**: All crawl results are saved to a JSON file (`crawl_data.json`)
- **RESTful API**: Endpoints for crawling and retrieving crawl history
- **CORS Support**: Configured for frontend integration

## API Endpoints

### POST /crawl
Crawls a website and saves the results to the database.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "result": {
    "html_version": "Unknown",
    "title": "Example Domain",
    "headings": {"h1": 1, "h2": 0, "h3": 0, "h4": 0, "h5": 0, "h6": 0},
    "internal_links": 0,
    "external_links": 1,
    "inaccessible_links": 0,
    "has_login_form": false
  },
  "record_id": 1,
  "message": "Crawl result saved successfully"
}
```

### GET /crawl/history
Retrieves all crawl results from the database.

**Response:**
```json
{
  "count": 1,
  "history": [
    {
      "id": 1,
      "url": "https://example.com",
      "html_version": "Unknown",
      "title": "Example Domain",
      "headings": {"h1": 1, "h2": 0, "h3": 0, "h4": 0, "h5": 0, "h6": 0},
      "internal_links": 0,
      "external_links": 1,
      "inaccessible_links": 0,
      "has_login_form": false,
      "crawled_at": "2025-07-12T15:49:36.9309171+02:00"
    }
  ]
}
```

## Getting Started

1. Make sure you have Go installed (https://golang.org/dl/).
2. Open a terminal in this directory.
3. Build the application:

```
go build -o crawler.exe .
```

4. Run the application:

```
./crawler.exe
```

The server will start on port 8080.

## Database Implementation

The application uses a custom file-based database implementation:

- **File Storage**: Data is stored in JSON format for easy reading and portability
- **Thread Safety**: Uses mutexes to ensure concurrent access safety
- **Auto-increment IDs**: Automatically assigns unique IDs to each record
- **CRUD Operations**: Supports Create, Read operations with Find by ID/URL functionality

## Storage Files

- `crawl_data.db` - SQLite database file containing all crawl records

The application uses SQLite for excellent performance, data integrity, and query capabilities.

## Project Structure

```
├── main.go                 # Application entry point
├── database/
│   └── db.go              # File-based database implementation
├── models/
│   └── crawl.go           # Data models
├── service/
│   └── crawl_service.go   # Business logic
├── handler/
│   └── handler.go         # HTTP handlers
└── crawl_data.json        # Persistent data storage
```

## Dependencies

- `github.com/gin-gonic/gin` - Web framework
- `github.com/PuerkitoBio/goquery` - HTML parsing
- `github.com/gin-contrib/cors` - CORS middleware
- `gorm.io/gorm` - ORM framework
- `github.com/glebarez/sqlite` - Pure Go SQLite driver (CGO-free)

---

For workspace-specific Copilot instructions, see `.github/copilot-instructions.md`.
