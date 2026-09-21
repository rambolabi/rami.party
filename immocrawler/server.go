package main

import (
	"embed"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

//go:embed web
var webFS embed.FS

// searchResponse is the payload returned by /api/search.
type searchResponse struct {
	Keywords []string  `json:"keywords"`
	Count    int       `json:"count"`
	Results  []Listing `json:"results"`
}

// serve starts the local web portal on addr.
func serve(addr string, crawler *Crawler) error {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		data, err := webFS.ReadFile("web/index.html")
		if err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(data)
	})

	mux.HandleFunc("/api/search", func(w http.ResponseWriter, r *http.Request) {
		keywords := parseKeywords(r.URL.Query().Get("q"))
		if len(keywords) == 0 {
			http.Error(w, "missing q parameter (comma-separated keywords)", http.StatusBadRequest)
			return
		}
		results := crawler.Search(r.Context(), keywords)
		if results == nil {
			results = []Listing{}
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		json.NewEncoder(w).Encode(searchResponse{
			Keywords: keywords,
			Count:    len(results),
			Results:  results,
		})
	})

	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Printf("immocrawler web portal listening on http://%s", addr)
	return srv.ListenAndServe()
}
