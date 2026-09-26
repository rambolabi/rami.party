package main

// Listing represents a single real-estate listing found by the crawler.
type Listing struct {
	Title    string   `json:"title"`
	Link     string   `json:"link"`
	Source   string   `json:"source"`
	Info     string   `json:"info,omitempty"`
	Matched  []string `json:"matched"`
	Keyword  string   `json:"keyword"`
	Location string   `json:"location,omitempty"`
	Price    string   `json:"price,omitempty"`
}
