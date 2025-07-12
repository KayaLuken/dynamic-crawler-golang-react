package handler

import (
	"dynamic-crawler-golang-react/backend/models"
	"dynamic-crawler-golang-react/backend/service"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
)

type CrawlRequest struct {
	URL string `json:"url" binding:"required"`
}

type CrawlResult struct {
	HTMLVersion       string         `json:"html_version"`
	Title             string         `json:"title"`
	Headings          map[string]int `json:"headings"`
	InternalLinks     int            `json:"internal_links"`
	ExternalLinks     int            `json:"external_links"`
	InaccessibleLinks int            `json:"inaccessible_links"`
	HasLoginForm      bool           `json:"has_login_form"`
}

func CrawlHandler(c *gin.Context) {
	var req CrawlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	resp, err := http.Get(req.URL)
	if err != nil || resp.StatusCode != 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch URL"})
		return
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse HTML"})
		return
	}

	// HTML version
	htmlVersion := "Unknown"
	doc.Find("html").Each(func(i int, s *goquery.Selection) {
		if v, exists := s.Attr("xmlns"); exists && strings.Contains(v, "xhtml") {
			htmlVersion = "XHTML"
		} else if d, exists := s.Attr("lang"); exists && d != "" {
			htmlVersion = "HTML5"
		}
	})
	// Try to detect doctype
	if len(doc.Selection.Nodes) > 0 {
		if doc.Selection.Nodes[0].Type == 10 { // DoctypeNode
			htmlVersion = "HTML5"
		}
	}

	// Title
	title := doc.Find("title").Text()

	// Headings count
	headings := map[string]int{}
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("h%d", i)
		headings[tag] = doc.Find(tag).Length()
	}

	// Links
	baseURL, _ := url.Parse(req.URL)
	internalLinks := 0
	externalLinks := 0
	inaccessibleLinks := 0
	var brokenLinks []models.BrokenLink

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		link, err := url.Parse(href)
		if err != nil || href == "" {
			return
		}
		abs := baseURL.ResolveReference(link)
		if abs.Host == baseURL.Host {
			internalLinks++
		} else {
			externalLinks++
		}
		// Check accessibility with timeout
		client := &http.Client{
			Timeout: 2 * time.Second,
		}
		resp, err := client.Head(abs.String())
		if err != nil {
			inaccessibleLinks++
			brokenLinks = append(brokenLinks, models.BrokenLink{
				URL:          abs.String(),
				StatusCode:   0,
				ErrorMessage: err.Error(),
			})
		} else if resp != nil && resp.StatusCode >= 400 && resp.StatusCode < 600 {
			inaccessibleLinks++
			brokenLinks = append(brokenLinks, models.BrokenLink{
				URL:        abs.String(),
				StatusCode: resp.StatusCode,
			})
		}
		if resp != nil {
			resp.Body.Close()
		}
	})

	// Login form
	hasLoginForm := false
	doc.Find("form").Each(func(i int, s *goquery.Selection) {
		if s.Find("input[type='password']").Length() > 0 {
			hasLoginForm = true
		}
	})

	// Save to database
	crawlService := service.NewCrawlService()
	savedRecord, err := crawlService.SaveCrawlResult(
		req.URL,
		htmlVersion,
		title,
		headings,
		internalLinks,
		externalLinks,
		inaccessibleLinks,
		brokenLinks,
		hasLoginForm,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save crawl result"})
		return
	}

	result := CrawlResult{
		HTMLVersion:       htmlVersion,
		Title:             title,
		Headings:          headings,
		InternalLinks:     internalLinks,
		ExternalLinks:     externalLinks,
		InaccessibleLinks: inaccessibleLinks,
		HasLoginForm:      hasLoginForm,
	}

	// Return both the result and the saved record ID
	response := gin.H{
		"result":    result,
		"record_id": savedRecord.ID,
		"message":   "Crawl result saved successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetCrawlHistoryHandler retrieves all crawl history
func GetCrawlHistoryHandler(c *gin.Context) {
	crawlService := service.NewCrawlService()
	history, err := crawlService.GetAllCrawlResults()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve crawl history"})
		return
	}

	// Transform the data for better JSON response
	var historyResponse []gin.H
	for _, record := range history {
		// Parse headings JSON string back to map
		var headings map[string]int
		json.Unmarshal([]byte(record.Headings), &headings)

		// Parse broken links JSON string back to slice
		var brokenLinks []models.BrokenLink
		json.Unmarshal([]byte(record.BrokenLinks), &brokenLinks)

		historyResponse = append(historyResponse, gin.H{
			"id":                 record.ID,
			"url":                record.URL,
			"html_version":       record.HTMLVersion,
			"title":              record.Title,
			"headings":           headings,
			"internal_links":     record.InternalLinks,
			"external_links":     record.ExternalLinks,
			"inaccessible_links": record.InaccessibleLinks,
			"broken_links":       brokenLinks,
			"has_login_form":     record.HasLoginForm,
			"crawled_at":         record.CrawledAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"history": historyResponse,
		"count":   len(historyResponse),
	})
}

// BulkDeleteRequest represents the request for bulk delete operation
type BulkDeleteRequest struct {
	IDs []uint `json:"ids" binding:"required"`
}

// BulkDeleteHandler deletes multiple crawl records by their IDs
func BulkDeleteHandler(c *gin.Context) {
	var req BulkDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}

	crawlService := service.NewCrawlService()
	deletedCount, err := crawlService.BulkDeleteCrawlResults(req.IDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete crawl results"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Successfully deleted %d crawl results", deletedCount),
		"deleted_count": deletedCount,
	})
}

// BulkRerunRequest represents the request for bulk re-run operation
type BulkRerunRequest struct {
	IDs []uint `json:"ids" binding:"required"`
}

// BulkRerunResponse represents the response for bulk re-run operation
type BulkRerunResponse struct {
	SuccessCount int      `json:"success_count"`
	FailedCount  int      `json:"failed_count"`
	FailedURLs   []string `json:"failed_urls"`
}

// BulkRerunHandler re-runs crawl analysis for multiple records by their IDs
func BulkRerunHandler(c *gin.Context) {
	var req BulkRerunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}

	// Get the URLs for the given IDs
	crawlService := service.NewCrawlService()
	var failedURLs []string
	successCount := 0
	failedCount := 0

	for _, id := range req.IDs {
		record, err := crawlService.GetCrawlResultByID(id)
		if err != nil {
			failedCount++
			continue
		}

		// Re-crawl the URL
		success := recrawlURL(record.URL)
		if success {
			successCount++
		} else {
			failedCount++
			failedURLs = append(failedURLs, record.URL)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       fmt.Sprintf("Re-run completed: %d successful, %d failed", successCount, failedCount),
		"success_count": successCount,
		"failed_count":  failedCount,
		"failed_urls":   failedURLs,
	})
}

// recrawlURL performs the crawl operation for a single URL
func recrawlURL(targetURL string) bool {
	resp, err := http.Get(targetURL)
	if err != nil || resp.StatusCode != 200 {
		return false
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return false
	}

	// HTML version
	htmlVersion := "Unknown"
	doc.Find("html").Each(func(i int, s *goquery.Selection) {
		if v, exists := s.Attr("xmlns"); exists && strings.Contains(v, "xhtml") {
			htmlVersion = "XHTML"
		} else if d, exists := s.Attr("lang"); exists && d != "" {
			htmlVersion = "HTML5"
		}
	})
	// Try to detect doctype
	if len(doc.Selection.Nodes) > 0 {
		if doc.Selection.Nodes[0].Type == 10 { // DoctypeNode
			htmlVersion = "HTML5"
		}
	}

	// Title
	title := doc.Find("title").Text()

	// Headings count
	headings := map[string]int{}
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("h%d", i)
		headings[tag] = doc.Find(tag).Length()
	}

	// Links
	baseURL, _ := url.Parse(targetURL)
	internalLinks := 0
	externalLinks := 0
	inaccessibleLinks := 0
	var brokenLinks []models.BrokenLink

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		link, err := url.Parse(href)
		if err != nil || href == "" {
			return
		}
		abs := baseURL.ResolveReference(link)
		if abs.Host == baseURL.Host {
			internalLinks++
		} else {
			externalLinks++
		}
		// Check accessibility with timeout
		client := &http.Client{
			Timeout: 2 * time.Second,
		}
		resp, err := client.Head(abs.String())
		if err != nil {
			inaccessibleLinks++
			brokenLinks = append(brokenLinks, models.BrokenLink{
				URL:          abs.String(),
				StatusCode:   0,
				ErrorMessage: err.Error(),
			})
		} else if resp != nil && resp.StatusCode >= 400 && resp.StatusCode < 600 {
			inaccessibleLinks++
			brokenLinks = append(brokenLinks, models.BrokenLink{
				URL:        abs.String(),
				StatusCode: resp.StatusCode,
			})
		}
		if resp != nil {
			resp.Body.Close()
		}
	})

	// Login form
	hasLoginForm := false
	doc.Find("form").Each(func(i int, s *goquery.Selection) {
		if s.Find("input[type='password']").Length() > 0 {
			hasLoginForm = true
		}
	})

	// Save to database
	crawlService := service.NewCrawlService()
	_, err = crawlService.SaveCrawlResult(
		targetURL,
		htmlVersion,
		title,
		headings,
		internalLinks,
		externalLinks,
		inaccessibleLinks,
		brokenLinks,
		hasLoginForm,
	)
	
	return err == nil
}
