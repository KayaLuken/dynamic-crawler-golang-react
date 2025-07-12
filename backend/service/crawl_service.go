package service

import (
	"dynamic-crawler-golang-react/backend/database"
	"dynamic-crawler-golang-react/backend/models"
	"encoding/json"
	"time"
)

// CrawlService handles crawl-related database operations
type CrawlService struct{}

// NewCrawlService creates a new CrawlService instance
func NewCrawlService() *CrawlService {
	return &CrawlService{}
}

// SaveCrawlResult saves a crawl result to the database
func (s *CrawlService) SaveCrawlResult(url, htmlVersion, title string, headings map[string]int, internalLinks, externalLinks, inaccessibleLinks int, brokenLinks []models.BrokenLink, hasLoginForm bool) (*models.CrawlRecord, error) {
	// Convert headings map to JSON string
	headingsJSON, err := json.Marshal(headings)
	if err != nil {
		return nil, err
	}

	// Convert broken links to JSON string
	brokenLinksJSON, err := json.Marshal(brokenLinks)
	if err != nil {
		return nil, err
	}

	crawlRecord := models.CrawlRecord{
		URL:               url,
		HTMLVersion:       htmlVersion,
		Title:             title,
		Headings:          string(headingsJSON),
		InternalLinks:     internalLinks,
		ExternalLinks:     externalLinks,
		InaccessibleLinks: inaccessibleLinks,
		BrokenLinks:       string(brokenLinksJSON),
		HasLoginForm:      hasLoginForm,
		CrawledAt:         time.Now(),
	}

	db := database.GetDB()
	result := db.Create(&crawlRecord)
	if result.Error != nil {
		return nil, result.Error
	}

	return &crawlRecord, nil
}

// GetAllCrawlResults retrieves all crawl results from the database
func (s *CrawlService) GetAllCrawlResults() ([]models.CrawlRecord, error) {
	var crawlRecords []models.CrawlRecord
	db := database.GetDB()
	result := db.Find(&crawlRecords)
	if result.Error != nil {
		return nil, result.Error
	}
	return crawlRecords, nil
}

// GetCrawlResultByID retrieves a specific crawl result by ID
func (s *CrawlService) GetCrawlResultByID(id uint) (*models.CrawlRecord, error) {
	var crawlRecord models.CrawlRecord
	db := database.GetDB()
	result := db.First(&crawlRecord, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &crawlRecord, nil
}

// GetCrawlResultsByURL retrieves crawl results for a specific URL
func (s *CrawlService) GetCrawlResultsByURL(url string) ([]models.CrawlRecord, error) {
	var crawlRecords []models.CrawlRecord
	db := database.GetDB()
	result := db.Where("url = ?", url).Find(&crawlRecords)
	if result.Error != nil {
		return nil, result.Error
	}
	return crawlRecords, nil
}
