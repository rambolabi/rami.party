$ErrorActionPreference = 'Stop'
$tmp = Join-Path $env:TEMP ("ostedge-" + [guid]::NewGuid().ToString('N'))
$dump = Join-Path $env:TEMP 'ost-dump.html'
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $edge)) { $edge = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$args = @(
    '--headless=new', '--disable-gpu', '--no-sandbox',
    "--user-data-dir=$tmp",
    '--window-size=1400,1000',
    '--virtual-time-budget=20000',
    '--dump-dom',
    'http://127.0.0.1:8822/workshop/opensource/_selftest.html'
)
Start-Process -FilePath $edge -ArgumentList $args -Wait -NoNewWindow -RedirectStandardOutput $dump
$html = Get-Content $dump -Raw
if ($html -match '(?s)<pre id="out">(.*?)</pre>') { $matches[1] -replace '&amp;', '&' } else { 'NO OUTPUT (dump size ' + $html.Length + ')' }
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $dump -Force -ErrorAction SilentlyContinue
