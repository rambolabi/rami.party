package main

import (
	"reflect"
	"testing"
)

func TestMatchKeywords(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		keywords []string
		want     []string
	}{
		{
			name:     "single dutch keyword",
			text:     "Te koop: ruim magazijn met kantoorruimte in Gent",
			keywords: []string{"magazijn", "loods"},
			want:     []string{"magazijn"},
		},
		{
			name:     "case insensitive",
			text:     "GROTE GARAGE met oprit",
			keywords: []string{"grote garage"},
			want:     []string{"grote garage"},
		},
		{
			name:     "multi word phrase must match as a whole",
			text:     "grote woning met garage",
			keywords: []string{"grote garage"},
			want:     nil,
		},
		{
			name:     "english keyword",
			text:     "Charming house with a large shed in the garden",
			keywords: []string{"shed", "loods"},
			want:     []string{"shed"},
		},
		{
			name:     "multiple matches",
			text:     "Loods en magazijn te koop",
			keywords: []string{"magazijn", "loods"},
			want:     []string{"magazijn", "loods"},
		},
		{
			name:     "no match",
			text:     "Appartement met terras",
			keywords: []string{"magazijn"},
			want:     nil,
		},
		{
			name:     "empty keyword ignored",
			text:     "magazijn",
			keywords: []string{"", "  ", "magazijn"},
			want:     []string{"magazijn"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := matchKeywords(tt.text, tt.keywords)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("matchKeywords(%q, %v) = %v, want %v", tt.text, tt.keywords, got, tt.want)
			}
		})
	}
}

func TestParseKeywords(t *testing.T) {
	got := parseKeywords(" magazijn, loods ,, grote garage ")
	want := []string{"magazijn", "loods", "grote garage"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("parseKeywords = %v, want %v", got, want)
	}
	if parseKeywords("  ,  ") != nil {
		t.Error("parseKeywords of blanks should be nil")
	}
}

func TestCleanText(t *testing.T) {
	got := cleanText("<span>Ruim   magazijn</span> &amp; <b>loods</b>")
	want := "Ruim magazijn & loods"
	if got != want {
		t.Errorf("cleanText = %q, want %q", got, want)
	}
}

func TestAbsoluteURL(t *testing.T) {
	if got := absoluteURL("https://www.zimmo.be", "/nl/huis/te-koop/x"); got != "https://www.zimmo.be/nl/huis/te-koop/x" {
		t.Errorf("relative href not resolved: %q", got)
	}
	if got := absoluteURL("https://www.zimmo.be", "https://www.zimmo.be/nl/x"); got != "https://www.zimmo.be/nl/x" {
		t.Errorf("absolute href changed: %q", got)
	}
}

func TestTruncate(t *testing.T) {
	if got := truncate("short", 10); got != "short" {
		t.Errorf("truncate short = %q", got)
	}
	if got := truncate("abcdefghij", 5); got != "abcd…" {
		t.Errorf("truncate long = %q", got)
	}
}

func TestListingPatterns(t *testing.T) {
	tests := []struct {
		source string
		href   string
		want   bool
	}{
		{"Immoweb", "https://www.immoweb.be/nl/zoekertje/loods/te-koop/gent/9000/12345", true},
		{"Immoweb", "/nl/zoekertje/magazijn/te-koop/9000/1", true},
		{"Immoweb", "https://www.immoweb.be/nl/zoeken/te-koop", false},
		{"Zimmo", "https://www.zimmo.be/nl/gent-9000/te-koop/magazijn/ABC123/", true},
		{"Zimmo", "https://www.zimmo.be/nl/zoeken/", false},
		{"Immovlan", "https://immovlan.be/nl/detail/magazijn/te-koop/9000/gent/rbs12345", true},
		{"Immovlan", "https://immovlan.be/nl/vastgoed", false},
	}
	byName := map[string]Source{}
	for _, s := range sources {
		byName[s.Name] = s
	}
	for _, tt := range tests {
		src, ok := byName[tt.source]
		if !ok {
			t.Fatalf("unknown source %q", tt.source)
		}
		if got := src.listingPattern.MatchString(tt.href); got != tt.want {
			t.Errorf("%s pattern match %q = %v, want %v", tt.source, tt.href, got, tt.want)
		}
	}
}
