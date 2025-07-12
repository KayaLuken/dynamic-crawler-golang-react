package main

import (
	"dynamic-crawler-golang-react/backend/database"
	"dynamic-crawler-golang-react/backend/handler"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	err := database.InitDB("crawl_data.db")
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	r := gin.Default()

	// Add CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/crawl", handler.CrawlHandler)

	// Add endpoint to get all crawl results
	r.GET("/crawl/history", handler.GetCrawlHistoryHandler)

	// Add endpoint for bulk delete
	r.DELETE("/crawl/bulk", handler.BulkDeleteHandler)

	// Add endpoint for bulk re-run
	r.POST("/crawl/bulk/rerun", handler.BulkRerunHandler)

	r.Run(":8080")
}
