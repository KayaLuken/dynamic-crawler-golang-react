package tests

import (
	"bytes"
	"dynamic-crawler-golang-react/backend/handler"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// Example HTML for testing
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Main Heading</h1>
    <h2>Sub Heading</h2>
    <a href="/internal">Internal Link</a>
    <a href="https://external.com">External Link</a>
    <form>
        <input type="password" name="pwd" />
    </form>
</body>
</html>
`

// Mock HTTP server to serve the test HTML
func startTestServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(testHTML))
	}))
}

func TestCrawlHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/crawl", handler.CrawlHandler)

	// Start mock server
	ts := startTestServer()
	defer ts.Close()

	// Prepare request payload
	payload := map[string]string{"url": ts.URL}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/crawl", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}

	// Parse response
	var resp map[string]interface{}
	data, _ := io.ReadAll(w.Body)
	if err := json.Unmarshal(data, &resp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if resp["title"] != "Test Page" {
		t.Errorf("Expected title 'Test Page', got '%v'", resp["title"])
	}
	if !resp["has_login_form"].(bool) {
		t.Errorf("Expected has_login_form true")
	}
	headings := resp["headings"].(map[string]interface{})
	if int(headings["h1"].(float64)) != 1 {
		t.Errorf("Expected 1 h1, got %v", headings["h1"])
	}
}
