package main

import (
	"context"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

const userAgent = "immocrawler/1.0 (+https://rami.party; personal property search)"

// Source describes one Belgian immo website that the crawler knows how to
// query. searchURL builds the search-results URL for a keyword and
// listingPattern recognises links that point to individual listings.
type Source struct {
	Name           string
	BaseURL        string
	searchURL      func(keyword string) string
	listingPattern *regexp.Regexp
}

// sources holds the built-in Belgian immo websites.
var sources = []Source{
	{
		Name:    "Immoweb",
		BaseURL: "https://www.immoweb.be",
		searchURL: func(kw string) string {
			return "https://www.immoweb.be/nl/zoeken/te-koop?countries=BE&searchQuery=" + url.QueryEscape(kw)
		},
		listingPattern: regexp.MustCompile(`^(?:https://www\.immoweb\.be)?/(?:nl|fr|en)/zoekertje/[^"']+`),
	},
	{
		Name:    "Zimmo",
		BaseURL: "https://www.zimmo.be",
		searchURL: func(kw string) string {
			return "https://www.zimmo.be/nl/zoeken/?search=" + url.QueryEscape(kw)
		},
		listingPattern: regexp.MustCompile(`^(?:https://www\.zimmo\.be)?/(?:nl|fr)/[^"']+/te-koop/[^"']+`),
	},
	{
		Name:    "Immovlan",
		BaseURL: "https://immovlan.be",
		searchURL: func(kw string) string {
			return "https://immovlan.be/nl/vastgoed?transactiontypes=te-koop&freetext=" + url.QueryEscape(kw)
		},
		listingPattern: regexp.MustCompile(`^(?:https://(?:www\.)?immovlan\.be)?/(?:nl|fr)/detail/[^"']+`),
	},
}

// anchorRe extracts anchors (link + inner content) from an HTML page.
var anchorRe = regexp.MustCompile(`(?is)<a\b[^>]*href=["']([^"'#]+)["'][^>]*>(.*?)</a>`)

// tagRe strips HTML tags from anchor contents.
var tagRe = regexp.MustCompile(`(?s)<[^>]*>`)

// spaceRe collapses runs of whitespace.
var spaceRe = regexp.MustCompile(`\s+`)

// Crawler queries every source for every keyword and returns the listings
// whose text matches at least one keyword.
type Crawler struct {
	Client  *http.Client
	Sources []Source
	Limit   int // max results per source per keyword (0 = no limit)
	Verbose bool
	Logf    func(format string, args ...any)
}

// NewCrawler returns a crawler with sane defaults.
func NewCrawler() *Crawler {
	return &Crawler{
		Client:  &http.Client{Timeout: 20 * time.Second},
		Sources: sources,
		Limit:   20,
		Logf:    func(string, ...any) {},
	}
}

// Search runs all keyword searches against all sources concurrently
// (one goroutine per source, sequential per keyword to stay polite).
func (c *Crawler) Search(ctx context.Context, keywords []string) []Listing {
	var (
		mu      sync.Mutex
		results []Listing
		wg      sync.WaitGroup
	)
	seen := map[string]bool{}

	for _, src := range c.Sources {
		wg.Add(1)
		go func(src Source) {
			defer wg.Done()
			for _, kw := range keywords {
				listings, err := c.searchSource(ctx, src, kw, keywords)
				if err != nil {
					c.Logf("%s (%q): %v", src.Name, kw, err)
					continue
				}
				mu.Lock()
				for _, l := range listings {
					if !seen[l.Link] {
						seen[l.Link] = true
						results = append(results, l)
					}
				}
				mu.Unlock()
				// Small delay between keyword queries to the same site.
				select {
				case <-ctx.Done():
					return
				case <-time.After(500 * time.Millisecond):
				}
			}
		}(src)
	}
	wg.Wait()
	return results
}

// searchSource fetches one search-results page and extracts matching listings.
func (c *Crawler) searchSource(ctx context.Context, src Source, keyword string, allKeywords []string) ([]Listing, error) {
	pageURL := src.searchURL(keyword)
	body, err := c.fetch(ctx, pageURL)
	if err != nil {
		return nil, err
	}

	var listings []Listing
	for _, m := range anchorRe.FindAllStringSubmatch(body, -1) {
		href, inner := m[1], m[2]
		if !src.listingPattern.MatchString(href) {
			continue
		}
		text := cleanText(inner)
		if text == "" {
			continue
		}
		matched := matchKeywords(text, allKeywords)
		info := text
		if len(matched) == 0 {
			// The anchor text itself may not repeat the search term the
			// site already filtered on; still return it, attributed to
			// the keyword used for the query.
			matched = []string{keyword}
			info = text + " (found via search for \"" + keyword + "\")"
		}
		listings = append(listings, Listing{
			Title:   truncate(text, 120),
			Link:    absoluteURL(src.BaseURL, href),
			Source:  src.Name,
			Info:    info,
			Matched: matched,
			Keyword: keyword,
		})
		if c.Limit > 0 && len(listings) >= c.Limit {
			break
		}
	}
	return listings, nil
}

// fetch downloads a URL and returns its body as a string.
func (c *Crawler) fetch(ctx context.Context, pageURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, pageURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml")
	req.Header.Set("Accept-Language", "nl-BE,nl;q=0.9,fr-BE;q=0.8,en;q=0.7")

	resp, err := c.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GET %s: %s", pageURL, resp.Status)
	}
	data, err := io.ReadAll(io.LimitReader(resp.Body, 5<<20))
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// cleanText strips tags, unescapes entities and collapses whitespace.
func cleanText(s string) string {
	s = tagRe.ReplaceAllString(s, " ")
	s = html.UnescapeString(s)
	return strings.TrimSpace(spaceRe.ReplaceAllString(s, " "))
}

// absoluteURL resolves a possibly-relative href against the source base URL.
func absoluteURL(base, href string) string {
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}
	return strings.TrimSuffix(base, "/") + "/" + strings.TrimPrefix(href, "/")
}

// truncate shortens a string to at most n runes.
func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n-1]) + "…"
}
