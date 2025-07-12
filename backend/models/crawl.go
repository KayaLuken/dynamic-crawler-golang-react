package models

import (
	"time"

	"gorm.io/gorm"
)

// CrawlRecord represents a crawl record in the database
type CrawlRecord struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	URL               string         `gorm:"not null" json:"url"`
	HTMLVersion       string         `json:"html_version"`
	Title             string         `json:"title"`
	Headings          string         `json:"headings"` // JSON string for map[string]int
	InternalLinks     int            `json:"internal_links"`
	ExternalLinks     int            `json:"external_links"`
	InaccessibleLinks int            `json:"inaccessible_links"`
	HasLoginForm      bool           `json:"has_login_form"`
	CrawledAt         time.Time      `json:"crawled_at"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

// TableName specifies the table name for CrawlRecord
func (CrawlRecord) TableName() string {
	return "crawl_records"
}
