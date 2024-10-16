package models

type Dependency struct {
    Version        string `json:"version"`
    DepType        string `json:"depType"`
    Vulnerable     bool   `json:"vulnerable"`
    Recommendation string `json:"recommendation"`
}

type DepCheckResponse struct {
    Dependencies map[string]Dependency `json:"dependencies"`
}

type ScanRequest struct {
    Repository string `json:"repository"`
    Branch     string `json:"branch"`
}