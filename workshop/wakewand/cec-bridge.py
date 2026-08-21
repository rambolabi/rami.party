"""
WAKEWAND — local HDMI-CEC bridge for the Wakewand webpage.
https://rami.party/workshop/wakewand/

A browser cannot reach the HDMI-CEC pin of the machine it runs on, so this
bridge runs next to the hardware (a Raspberry Pi behind the TV wall, a
signage box, a media PC) and does the wire work. It exposes a WebSocket on
ws://127.0.0.1:3308 (3308 = 0xCEC) that the webpage connects to; on command
it tells every CEC output it can find to wake ("Image View On") or sleep
("Standby") the attached TV.

Why WebSocket instead of HTTP?
Chrome 130+ blocks fetch() from public https:// origins to loopback
addresses (Private Network Access policy) before even checking CORS
headers. WebSocket connections are not subject to that restriction.

Backends, tried in this order:
  * cec-ctl     (v4l-utils; the kernel CEC framework: Raspberry Pi /dev/cecX)
  * cec-client  (libCEC; Pulse-Eight USB-CEC adapters on Linux/Windows/macOS)

Usage:
    pip install websockets
    python cec-bridge.py

Then open the Wakewand webpage anywhere on the same machine: it connects to
this bridge automatically and wakes the TVs on page load.

Note: do not point BOTH the webpage's Web Serial channel and this bridge at
the same USB adapter on the same machine; only one program can hold the
serial port at a time.

Security: binds to 127.0.0.1 only (never exposed to the network).
"""

import asyncio
import glob
import json
import os
import shutil
import subprocess
import sys

try:
    from websockets.asyncio.server import serve
    from websockets.http11 import Response
    from websockets.datastructures import Headers
except ImportError:
    raise SystemExit("Install the required library: pip install websockets")

PORT = 3308
CMD_TIMEOUT_S = 30

# CORS + Chrome Private Network Access headers for the plain-HTTP status path
_CORS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, OPTIONS"),
    ("Access-Control-Allow-Headers", "*"),
    ("Access-Control-Allow-Private-Network", "true"),
    ("Cache-Control", "no-store"),
]

# Default libCEC install locations on Windows (cec-client is rarely on PATH there)
_WIN_CEC_CLIENT = [
    r"C:\Program Files (x86)\Pulse-Eight\USB-CEC Adapter\x64\cec-client.exe",
    r"C:\Program Files (x86)\Pulse-Eight\USB-CEC Adapter\cec-client.exe",
    r"C:\Program Files\Pulse-Eight\USB-CEC Adapter\cec-client.exe",
]


# ---- CEC backends ----------------------------------------------------------

class Backend:
    """Finds a CEC tool + its outputs, and runs wake/standby against them."""

    def __init__(self):
        self.name = "none"
        self.tool = None
        self.devices = []
        self.scan()

    def scan(self):
        self.name, self.tool, self.devices = "none", None, []

        cec_ctl = shutil.which("cec-ctl")
        if cec_ctl:
            nodes = sorted(glob.glob("/dev/cec*"))
            if nodes:
                self.name, self.tool, self.devices = "cec-ctl", cec_ctl, nodes
                return

        cec_client = shutil.which("cec-client")
        if not cec_client and sys.platform == "win32":
            cec_client = next((p for p in _WIN_CEC_CLIENT if os.path.exists(p)), None)
        if cec_client:
            self.name, self.tool = "cec-client", cec_client
            try:
                out = subprocess.run([cec_client, "-l"], capture_output=True,
                                     text=True, timeout=CMD_TIMEOUT_S).stdout
                self.devices = [line.split(":", 1)[1].strip()
                                for line in out.splitlines()
                                if line.strip().lower().startswith("com port:")]
            except (OSError, subprocess.TimeoutExpired):
                self.devices = []

    def run(self, action, device):
        """Blocking: send wake/standby to one CEC output. Returns (ok, detail)."""
        try:
            if self.name == "cec-ctl":
                # claim a playback logical address, then one-touch-play the TV
                subprocess.run([self.tool, "-d", device, "--playback"],
                               capture_output=True, timeout=CMD_TIMEOUT_S)
                op = "--image-view-on" if action == "wake" else "--standby"
                r = subprocess.run([self.tool, "-d", device, "--to", "0", op],
                                   capture_output=True, text=True, timeout=CMD_TIMEOUT_S)
            elif self.name == "cec-client":
                line = "on 0" if action == "wake" else "standby 0"
                r = subprocess.run([self.tool, device, "-s", "-d", "1"],
                                   input=line, capture_output=True, text=True,
                                   timeout=CMD_TIMEOUT_S)
            else:
                return False, "no CEC tool found (install v4l-utils or libcec-utils)"
            ok = r.returncode == 0
            detail = "" if ok else (r.stderr or r.stdout or "").strip()[-200:]
            return ok, detail
        except subprocess.TimeoutExpired:
            return False, "timed out"
        except OSError as err:
            return False, str(err)


BACKEND = Backend()


# ---- WebSocket server ------------------------------------------------------

def _hello():
    return json.dumps({"type": "hello", "backend": BACKEND.name,
                       "devices": BACKEND.devices})


async def process_request(connection, request):
    """Plain HTTP GET on the WebSocket port returns the status as JSON."""
    if not request.headers.get("Upgrade"):
        body = _hello().encode()
        headers = Headers([*_CORS, ("Content-Type", "application/json"),
                           ("Content-Length", str(len(body)))])
        return Response(200, "OK", headers, body)
    return None  # proceed with the WebSocket upgrade


async def ws_handler(ws):
    print("Bridge: page connected.")
    await ws.send(_hello())
    async for raw in ws:
        try:
            cmd = json.loads(raw).get("cmd")
        except (ValueError, AttributeError):
            continue

        if cmd == "rescan":
            await asyncio.to_thread(BACKEND.scan)
            await ws.send(_hello())
        elif cmd in ("wake", "standby"):
            ok_count = 0
            for device in BACKEND.devices:
                verb = "waking" if cmd == "wake" else "sending standby to"
                await ws.send(json.dumps({"type": "log",
                                          "msg": f"{verb} TV on {device} ({BACKEND.name})"}))
                ok, detail = await asyncio.to_thread(BACKEND.run, cmd, device)
                if ok:
                    ok_count += 1
                else:
                    await ws.send(json.dumps({"type": "log",
                                              "msg": f"{device}: {detail or 'failed'}"}))
            await ws.send(json.dumps({"type": "result", "action": cmd,
                                      "ok": ok_count > 0 and ok_count == len(BACKEND.devices),
                                      "outputs": ok_count}))
            print(f"Bridge: {cmd} done on {ok_count}/{len(BACKEND.devices)} output(s).")


async def main():
    print(f"WAKEWAND bridge: backend '{BACKEND.name}', "
          f"{len(BACKEND.devices)} CEC output(s): {BACKEND.devices or '-'}")
    if BACKEND.name == "none":
        print("  No CEC tool found. Install one:")
        print("    Raspberry Pi / Linux:  sudo apt install v4l-utils   (cec-ctl)")
        print("    Pulse-Eight adapter:   sudo apt install cec-utils   (cec-client)")
    async with serve(ws_handler, "127.0.0.1", PORT, process_request=process_request):
        print(f"Listening on ws://127.0.0.1:{PORT} — open https://rami.party/workshop/wakewand/")
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.")
