package handler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

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
		// Check accessibility
		resp, err := http.Head(abs.String())
		if err != nil || (resp.StatusCode >= 400 && resp.StatusCode < 600) {
			inaccessibleLinks++
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

	result := CrawlResult{
		HTMLVersion:       htmlVersion,
		Title:             title,
		Headings:          headings,
		InternalLinks:     internalLinks,
		ExternalLinks:     externalLinks,
		InaccessibleLinks: inaccessibleLinks,
		HasLoginForm:      hasLoginForm,
	}
	c.JSON(http.StatusOK, result)
}
