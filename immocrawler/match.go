package main

import "strings"

// matchKeywords returns the subset of keywords that occur (case-insensitively)
// in the given text. Multi-word keywords such as "grote garage" are matched as
// a whole phrase.
func matchKeywords(text string, keywords []string) []string {
	lower := strings.ToLower(text)
	var matched []string
	for _, kw := range keywords {
		kw = strings.TrimSpace(kw)
		if kw == "" {
			continue
		}
		if strings.Contains(lower, strings.ToLower(kw)) {
			matched = append(matched, kw)
		}
	}
	return matched
}

// parseKeywords splits a comma-separated keyword string into a clean list.
func parseKeywords(raw string) []string {
	var keywords []string
	for _, part := range strings.Split(raw, ",") {
		part = strings.TrimSpace(part)
		if part != "" {
			keywords = append(keywords, part)
		}
	}
	return keywords
}
