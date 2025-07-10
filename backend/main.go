package main

import (
	"dynamic-crawler-golang-react/backend/handler"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.POST("/crawl", handler.CrawlHandler)
	r.Run(":8080")
}
