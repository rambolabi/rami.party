# immocrawler

A portable Go application that crawls Belgian real-estate (immo) websites for
search terms you choose — for example `magazijn`, `shed`, `grote garage` or
`loods` — and reports every matching listing with its **link**, **source** and
**information**.

## Why a Go application and not a static website?

A crawler has to fetch pages from third-party sites (Immoweb, Zimmo,
Immovlan). Browsers block cross-origin requests to those sites (CORS), so a
purely static HTML/CSS/JS page under `rami.party` cannot crawl them. A single
portable Go executable can — and it still ships a built-in local web portal
(HTML/CSS/JS, embedded in the binary) so you get both worlds.

## Sources

| Source   | Website                  |
|----------|--------------------------|
| Immoweb  | https://www.immoweb.be   |
| Zimmo    | https://www.zimmo.be     |
| Immovlan | https://immovlan.be      |

## Build

Requires Go 1.21+ and no external dependencies (standard library only):

```sh
cd immocrawler
go build -o immocrawler .
```

Cross-compile portable executables for any platform:

```sh
GOOS=windows GOARCH=amd64 go build -o immocrawler.exe .
GOOS=linux   GOARCH=amd64 go build -o immocrawler-linux .
GOOS=darwin  GOARCH=arm64 go build -o immocrawler-mac .
```

## Usage

### CLI mode

```sh
./immocrawler magazijn loods "grote garage"
./immocrawler -json shed              # machine-readable output
./immocrawler -limit 5 -v magazijn    # fewer results, verbose errors
```

Example output:

```
1. Ruim magazijn met kantoorruimte — Gent
   Link:    https://www.immoweb.be/nl/zoekertje/...
   Source:  Immoweb
   Matched: magazijn
```

### Web portal mode

```sh
./immocrawler -serve
# then open http://127.0.0.1:8080
```

Type comma-separated terms (`magazijn, loods, grote garage`) and the portal
shows every matching listing as a card with the link, source badge and
matched keywords. The UI is embedded in the executable — nothing else to
deploy.

### Flags

| Flag     | Default          | Description                                    |
|----------|------------------|------------------------------------------------|
| `-serve` | off              | Start the local web portal                     |
| `-addr`  | `127.0.0.1:8080` | Listen address for the portal                  |
| `-json`  | off              | Print CLI results as JSON                      |
| `-limit` | `20`             | Max results per source per keyword             |
| `-v`     | off              | Log crawl errors/progress to stderr            |

## Test

```sh
go test ./...
```

## Notes & fair use

* The crawler identifies itself with a descriptive `User-Agent`, waits
  between requests to the same site and caps downloads at 5 MB per page.
* Website markup changes over time; each source's listing-URL pattern lives
  in `sources.go` and is easy to update.
* Use responsibly and respect each site's terms of service — this tool is
  meant for personal property searches, not bulk scraping.
