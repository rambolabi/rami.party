"""
WATTWARDEN — local P1 meter relay for the Wattwarden webpage.
https://rami.party/workshop/wattwarden/

The HomeWizard P1 Meter (and compatible dongles) serve their readings as
plain-HTTP JSON on your LAN: http://<meter>/api/v1/data. A secure webpage
may not fetch that directly (mixed content, and the meter sends no CORS
headers), so this relay runs on your own machine, polls the meter, and
forwards each reading to the page over ws://127.0.0.1:7101.

Why WebSocket instead of HTTP?
Chrome 130+ blocks fetch() from public https:// origins to loopback
addresses (Private Network Access policy) before even checking CORS
headers. WebSocket connections are not subject to that restriction.

Usage:
    pip install websockets
    python p1-bridge.py

Then open the Wattwarden webpage and set the meter's IP in its settings.
Enable "Local API" for the meter in the HomeWizard Energy app first
(Settings > Meters > your meter).

Security:
  * Binds to 127.0.0.1 only (never exposed to the network).
  * Only relays to private / mDNS addresses (192.168.x.x, 10.x, .local, ...),
    so a rogue website cannot use it as a proxy to the internet.
  * Only accepts WebSocket connections from the Wattwarden page or
    localhost dev servers (Origin allowlist below).
"""

import asyncio
import ipaddress
import json
import re
import urllib.request
import urllib.error

try:
    from websockets.asyncio.server import serve
    from websockets.http11 import Response
    from websockets.datastructures import Headers
except ImportError:
    raise SystemExit("Install the required library: pip install websockets")

PORT = 7101
MIN_INTERVAL_MS = 1000
MAX_INTERVAL_MS = 60000

ALLOWED_ORIGIN_RE = re.compile(
    r"^(https://rami\.party"
    r"|https?://(127\.0\.0\.1|localhost|\[::1\])(:\d+)?)$"
)

# CORS + Chrome Private Network Access headers for the plain-HTTP status path
_CORS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, OPTIONS"),
    ("Access-Control-Allow-Headers", "*"),
    ("Access-Control-Allow-Private-Network", "true"),
    ("Cache-Control", "no-store"),
]


def host_is_allowed(host):
    """Accept only LAN-ish targets: private/loopback IPs and mDNS .local names."""
    bare = host.rsplit(":", 1)[0] if re.match(r"^[^:]+:\d+$", host) else host
    try:
        ip = ipaddress.ip_address(bare)
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        return bool(re.fullmatch(r"[a-zA-Z0-9\-]+\.local\.?", bare))


def fetch_meter(host):
    """Blocking: GET the meter's most recent measurement. Returns (data, err)."""
    url = f"http://{host}/api/v1/data"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read().decode("utf-8")), None
    except urllib.error.HTTPError as err:
        if err.code == 403:
            return None, "the meter refused (enable Local API in the HomeWizard app)"
        return None, f"meter answered HTTP {err.code}"
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        reason = getattr(err, "reason", err)
        return None, f"no reply from {host} ({reason})"
    except ValueError:
        return None, "the reply was not JSON (is this really a P1 meter?)"


async def poll_loop(ws, host, interval_ms):
    """Poll one meter for one connected page until cancelled."""
    while True:
        data, err = await asyncio.to_thread(fetch_meter, host)
        if data is not None:
            await ws.send(json.dumps({"type": "data", "host": host, "data": data}))
        else:
            await ws.send(json.dumps({"type": "error", "host": host, "msg": err}))
        await asyncio.sleep(interval_ms / 1000)


async def process_request(connection, request):
    """Plain HTTP GET returns status JSON; WebSocket upgrades are origin-checked."""
    origin = request.headers.get("Origin", "")
    if not request.headers.get("Upgrade"):
        body = json.dumps({"bridge": "wattwarden-p1", "version": 1}).encode()
        headers = Headers([*_CORS, ("Content-Type", "application/json"),
                           ("Content-Length", str(len(body)))])
        return Response(200, "OK", headers, body)
    if origin and not ALLOWED_ORIGIN_RE.match(origin):
        print(f"Bridge: refused connection from origin {origin!r}")
        return Response(403, "Forbidden", Headers([("Content-Length", "0")]), b"")
    return None  # proceed with the WebSocket upgrade


async def ws_handler(ws):
    print("Bridge: page connected.")
    await ws.send(json.dumps({"type": "hello", "bridge": "wattwarden-p1", "version": 1}))
    task = None
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except ValueError:
                continue
            cmd = msg.get("cmd")
            if task:
                task.cancel()
                task = None
            if cmd == "watch":
                host = str(msg.get("host", "")).strip()
                if not host_is_allowed(host):
                    await ws.send(json.dumps({"type": "error", "host": host,
                                              "msg": "only private network addresses are relayed"}))
                    continue
                interval = min(MAX_INTERVAL_MS, max(MIN_INTERVAL_MS, int(msg.get("interval", 5000))))
                print(f"Bridge: watching {host} every {interval / 1000:g}s")
                task = asyncio.create_task(poll_loop(ws, host, interval))
    finally:
        if task:
            task.cancel()
        print("Bridge: page disconnected.")


async def main():
    async with serve(ws_handler, "127.0.0.1", PORT, process_request=process_request):
        print(f"WATTWARDEN relay listening on ws://127.0.0.1:{PORT}")
        print("Open https://rami.party/workshop/wattwarden/ and set the meter IP in its settings.")
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.")
