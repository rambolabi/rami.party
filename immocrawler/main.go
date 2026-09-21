// Command immocrawler searches Belgian real-estate websites (Immoweb, Zimmo,
// Immovlan) for user-chosen keywords such as "magazijn", "loods", "shed" or
// "grote garage" and reports matching listings with their link, source and
// information.
//
// It is a single portable executable with two modes:
//
//	immocrawler magazijn loods "grote garage"   # CLI search
//	immocrawler -serve                          # local web portal
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

func main() {
	var (
		serveMode = flag.Bool("serve", false, "start the local web portal instead of a one-shot CLI search")
		addr      = flag.String("addr", "127.0.0.1:8080", "listen address for the web portal (with -serve)")
		jsonOut   = flag.Bool("json", false, "print CLI results as JSON")
		limit     = flag.Int("limit", 20, "maximum results per source per keyword")
		verbose   = flag.Bool("v", false, "log crawl errors and progress to stderr")
	)
	flag.Usage = usage
	flag.Parse()

	crawler := NewCrawler()
	crawler.Limit = *limit
	if *verbose {
		crawler.Logf = log.New(os.Stderr, "immocrawler: ", 0).Printf
	}

	if *serveMode {
		if err := serve(*addr, crawler); err != nil {
			log.Fatal(err)
		}
		return
	}

	keywords := flag.Args()
	if len(keywords) == 1 && strings.Contains(keywords[0], ",") {
		keywords = parseKeywords(keywords[0])
	}
	if len(keywords) == 0 {
		usage()
		os.Exit(2)
	}

	results := crawler.Search(context.Background(), keywords)

	if *jsonOut {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		if err := enc.Encode(searchResponse{Keywords: keywords, Count: len(results), Results: results}); err != nil {
			log.Fatal(err)
		}
		return
	}

	if len(results) == 0 {
		fmt.Println("No listings matched your terms.")
		return
	}
	for i, l := range results {
		fmt.Printf("%d. %s\n", i+1, l.Title)
		fmt.Printf("   Link:    %s\n", l.Link)
		fmt.Printf("   Source:  %s\n", l.Source)
		fmt.Printf("   Matched: %s\n", strings.Join(l.Matched, ", "))
		if l.Info != "" && l.Info != l.Title {
			fmt.Printf("   Info:    %s\n", l.Info)
		}
		fmt.Println()
	}
	fmt.Printf("%d listing(s) found.\n", len(results))
}

func usage() {
	fmt.Fprintf(os.Stderr, `immocrawler — search Belgian immo sites for your own terms

Usage:
  immocrawler [flags] <keyword> [keyword ...]
  immocrawler -serve [-addr 127.0.0.1:8080]

Examples:
  immocrawler magazijn loods "grote garage"
  immocrawler -json shed
  immocrawler -serve

Flags:
`)
	flag.PrintDefaults()
}
