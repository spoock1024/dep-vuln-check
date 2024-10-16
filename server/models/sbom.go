package handlers

import (
    "math/rand"
    "net/http"
    "sbom-server/models"
    "time"

    "github.com/gin-gonic/gin"
)

func DepCheck(c *gin.Context) {
    var req models.ScanRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Simulate processing time
    time.Sleep(2 * time.Second)

    // Generate mock data
    dependencies := generateMockDependencies()

    c.JSON(http.StatusOK, models.DepCheckResponse{Dependencies: dependencies})
}

func generateMockDependencies() map[string]models.Dependency {
    deps := map[string]models.Dependency{
        "org.springframework.boot:spring-boot-starter-data-jpa": {
            Version:        "2.5.4",
            DepType:        "Direct",
            Vulnerable:     false,
            Recommendation: "Consider upgrading to the latest version for performance improvements.",
        },
        "com.fasterxml.jackson.datatype:jackson-datatype-jsr310": {
            Version:        "2.12.3",
            DepType:        "Direct",
            Vulnerable:     true,
            Recommendation: "Urgent: Upgrade to version 2.12.6.1 or later to address critical vulnerabilities.",
        },
        "org.apache.logging.log4j:log4j-core": {
            Version:        "2.14.1",
            DepType:        "Transitive",
            Vulnerable:     true,
            Recommendation: "Critical: Upgrade to version 2.15.0 or later immediately to address security vulnerabilities.",
        },
    }

    return deps
}