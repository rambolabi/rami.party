"""
SUNSEER: local Solis inverter relay for the Sunseer webpage.
https://rami.party/workshop/sunseer/

Solis inverters talk Modbus RTU over RS485. Their dataloggers put that on
your LAN in one of three ways, and this relay speaks all of them:

  * solarman : most Solis Wi-Fi sticks (10-digit serial) speak the Solarman
               V5 protocol on TCP port 8899. The Modbus frame rides inside a
               V5 envelope addressed with the stick's serial number.
  * modbus   : LAN sticks and RS485-to-TCP gateways speak plain Modbus TCP,
               usually on port 502.
  * http     : every stick also serves a small status page (admin/admin by
               default) with current power, today and total generation.

A browser cannot open raw TCP sockets and may not fetch plain-HTTP LAN
devices from a secure page (mixed content, no CORS), so this relay runs on
your own machine and forwards readings to the page over ws://127.0.0.1:7102.
Loopback WebSockets are exempt from Chrome's Private Network Access rules:
same pattern as the ghosttooth, wakewand and wattwarden bridges.

Usage:
    pip install websockets
    python solis-bridge.py

Then open the Sunseer webpage and add your inverters in its settings.

Register maps: the hybrid map follows the Solis ESINV RS485 protocol
(RHI/S5-EH1P/S6-EH1P, 33000 range) and the string map the INV protocol
(S5/S6-GR1P, 3000 range), as verified by the home_assistant_solarman
definitions for RHI-(3-6)K-48ES-5G and S6-GR1P4.6K.

Security:
  * Binds to 127.0.0.1 only (never exposed to the network).
  * Only relays to private / mDNS addresses (192.168.x.x, 10.x, .local, ...),
    so a rogue website cannot use it as a proxy to the internet.
  * Only accepts WebSocket connections from the Sunseer page or localhost
    dev servers (Origin allowlist below).
"""

import asyncio
import base64
import ipaddress
import json
import re
import socket
import struct
import urllib.error
import urllib.request

try:
    from websockets.asyncio.server import serve
    from websockets.http11 import Response
    from websockets.datastructures import Headers
except ImportError:
    raise SystemExit("Install the required library: pip install websockets")

PORT = 7102
MIN_INTERVAL_MS = 2000
MAX_INTERVAL_MS = 120000
MAX_DEVICES = 6
TCP_TIMEOUT = 8

ALLOWED_ORIGIN_RE = re.compile(
    r"^(https://rami\.party"
    r"|https?://(127\.0\.0\.1|localhost|\[::1\])(:\d+)?)$"
)

_CORS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, OPTIONS"),
    ("Access-Control-Allow-Headers", "*"),
    ("Access-Control-Allow-Private-Network", "true"),
    ("Cache-Control", "no-store"),
]

# Input-register blocks read per poll (start address, register count)
HYBRID_BLOCKS = [(33029, 67), (33116, 64)]
HYBRID_METER_BLOCK = (33251, 32)   # absent on some firmware: optional
STRING_BLOCKS = [(2999, 26), (3035, 9)]
STRING_OP_BLOCK = (3071, 1)        # optional


def host_is_allowed(host):
    """Accept only LAN-ish targets: private/loopback IPs and mDNS .local names."""
    try:
        ip = ipaddress.ip_address(host)
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        return bool(re.fullmatch(r"[a-zA-Z0-9\-]+\.local\.?", host))


# ---- Modbus plumbing -------------------------------------------------------

class BridgeIssue(Exception):
    """A device problem worth reporting to the page in plain words."""


class ModbusExc(Exception):
    def __init__(self, code):
        super().__init__(f"modbus exception {code}")
        self.code = code


def crc16(data):
    crc = 0xFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0xA001 if crc & 1 else crc >> 1
    return crc


def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise BridgeIssue("connection closed mid-reply")
        buf += chunk
    return buf


class ModbusTcpLink:
    """One TCP connection, plain Modbus TCP, function 04 (input registers)."""

    def __init__(self, host, port, unit):
        self.unit = unit
        self.tid = 0
        self.sock = socket.create_connection((host, port), timeout=TCP_TIMEOUT)
        self.sock.settimeout(TCP_TIMEOUT)

    def read(self, start, count):
        self.tid = (self.tid + 1) & 0xFFFF
        pdu = struct.pack(">BHH", 0x04, start, count)
        self.sock.sendall(struct.pack(">HHHB", self.tid, 0, len(pdu) + 1, self.unit) + pdu)
        _, _, length, _ = struct.unpack(">HHHB", recv_exact(self.sock, 7))
        body = recv_exact(self.sock, length - 1)
        return parse_read_pdu(body, count)

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


class SolarmanLink:
    """One TCP connection to a Solarman V5 stick; Modbus RTU rides inside."""

    def __init__(self, host, port, serial, unit):
        self.serial = serial
        self.unit = unit
        self.seq = 0
        self.sock = socket.create_connection((host, port), timeout=TCP_TIMEOUT)
        self.sock.settimeout(TCP_TIMEOUT)

    def read(self, start, count):
        rtu = struct.pack(">BBHH", self.unit, 0x04, start, count)
        rtu += struct.pack("<H", crc16(rtu))
        payload = b"\x02" + b"\x00" * 14 + rtu  # frame type, sensor type + 3 timers
        self.seq = (self.seq + 1) & 0xFFFF
        frame = struct.pack("<BHHHI", 0xA5, len(payload), 0x4510, self.seq, self.serial) + payload
        frame += bytes([sum(frame[1:]) & 0xFF, 0x15])
        self.sock.sendall(frame)

        head = recv_exact(self.sock, 11)
        if head[0] != 0xA5:
            raise BridgeIssue("not a Solarman V5 reply (wrong stick or protocol)")
        (plen,) = struct.unpack("<H", head[1:3])
        rest = recv_exact(self.sock, plen + 2)
        (control,) = struct.unpack("<H", head[3:5])
        if control != 0x1510:
            raise BridgeIssue(f"unexpected V5 control code 0x{control:04x}")
        rtu_resp = rest[14:plen]  # skip frame type, status, 3 timers
        if len(rtu_resp) < 5:
            raise BridgeIssue("V5 reply too short (is the logger serial right?)")
        if crc16(rtu_resp[:-2]) != struct.unpack("<H", rtu_resp[-2:])[0]:
            raise BridgeIssue("bad checksum inside the V5 reply")
        return parse_read_pdu(rtu_resp[1:-2], count)

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


def parse_read_pdu(body, count):
    """body = function code onward. Returns the register values."""
    if body[0] == 0x84:
        raise ModbusExc(body[1])
    if body[0] != 0x04:
        raise BridgeIssue(f"unexpected reply function 0x{body[0]:02x}")
    n = body[1]
    if n != count * 2 or len(body) < 2 + n:
        raise BridgeIssue("short register reply")
    return struct.unpack(f">{count}H", body[2:2 + n])


def read_blocks(link, blocks, optional=()):
    regs = {}
    for start, count in blocks:
        vals = link.read(start, count)
        for i, v in enumerate(vals):
            regs[start + i] = v
    for start, count in optional:
        try:
            vals = link.read(start, count)
            for i, v in enumerate(vals):
                regs[start + i] = v
        except (ModbusExc, BridgeIssue, OSError):
            pass
    return regs


# ---- register decoding ------------------------------------------------------

def u16(r, a, scale=1):
    v = r.get(a)
    return None if v is None else round(v * scale, 3)


def s16(r, a, scale=1):
    v = r.get(a)
    if v is None:
        return None
    if v > 0x7FFF:
        v -= 0x10000
    return round(v * scale, 3)


def u32(r, a, scale=1):
    hi, lo = r.get(a), r.get(a + 1)
    if hi is None or lo is None:
        return None
    return round(((hi << 16) | lo) * scale, 3)


def s32(r, a, scale=1):
    v = u32(r, a)
    if v is None:
        return None
    if v > 0x7FFFFFFF:
        v -= 0x100000000
    return round(v * scale, 3)


def normalise_hybrid(r):
    bat_w = s32(r, 33149)
    bat_dir = u16(r, 33135)  # 0 = charging, 1 = discharging
    if bat_w is not None and bat_dir is not None:
        bat_w = abs(bat_w) * (1 if bat_dir == 0 else -1)
    return {
        "kind": "hybrid",
        "total_kwh": u32(r, 33029), "month_kwh": u32(r, 33031),
        "today_kwh": u16(r, 33035, 0.1), "yesterday_kwh": u16(r, 33036, 0.1),
        "year_kwh": u32(r, 33037),
        "pv": [{"v": u16(r, 33049, 0.1), "i": u16(r, 33050, 0.1)},
               {"v": u16(r, 33051, 0.1), "i": u16(r, 33052, 0.1)}],
        "pdc_w": u32(r, 33057),
        "ac_v": u16(r, 33073, 0.1), "ac_a": u16(r, 33076, 0.1),
        "pac_w": s32(r, 33079),
        "temp_c": s16(r, 33093, 0.1), "hz": u16(r, 33094, 0.01),
        "status_code": u16(r, 33095), "op_code": u16(r, 33121),
        "faults": [u16(r, a) for a in (33116, 33117, 33118, 33119, 33120)],
        "mode_code": u16(r, 33132),
        "bat": {
            "v": u16(r, 33133, 0.1), "a": s16(r, 33134, 0.1), "w": bat_w,
            "soc": u16(r, 33139), "soh": u16(r, 33140),
            "bms_v": u16(r, 33141, 0.01), "bms_a": s16(r, 33142, 0.1),
            "today_chg": u16(r, 33163, 0.1), "today_dis": u16(r, 33167, 0.1),
            "total_chg": u32(r, 33161), "total_dis": u32(r, 33165),
        },
        "grid": {
            "w": s32(r, 33257), "v": u16(r, 33251, 0.1), "a": s16(r, 33252, 0.01),
            "pf": s16(r, 33281, 0.01), "hz": u16(r, 33282, 0.01),
            "today_imp": u16(r, 33171, 0.1), "today_exp": u16(r, 33175, 0.1),
            "total_imp": u32(r, 33169), "total_exp": u32(r, 33173),
        },
        "load": {
            "w": u16(r, 33147), "backup_w": u16(r, 33148),
            "today_kwh": u16(r, 33179, 0.1), "total_kwh": u32(r, 33177),
        },
    }


def normalise_string_inv(r):
    return {
        "kind": "string",
        "pac_w": u32(r, 3004), "pdc_w": u32(r, 3006),
        "total_kwh": u32(r, 3008), "month_kwh": u32(r, 3010),
        "today_kwh": u16(r, 3014, 0.1), "yesterday_kwh": u16(r, 3015, 0.1),
        "year_kwh": u32(r, 3016),
        "pv": [{"v": u16(r, 3021, 0.1), "i": u16(r, 3022, 0.1)},
               {"v": u16(r, 3023, 0.1), "i": u16(r, 3024, 0.1)}],
        "ac_v": u16(r, 3035, 0.1), "ac_a": u16(r, 3038, 0.1),
        "temp_c": s16(r, 3041, 0.1), "hz": u16(r, 3042, 0.01),
        "status_code": u16(r, 3043), "op_code": u16(r, 3071),
    }


# ---- one poll of one device (blocking, run in a thread) ---------------------

def open_link(dev):
    try:
        if dev["mode"] == "solarman":
            return SolarmanLink(dev["host"], dev["port"], dev["serial"], dev["unit"])
        return ModbusTcpLink(dev["host"], dev["port"], dev["unit"])
    except (OSError, socket.timeout) as err:
        raise BridgeIssue(f"no connection to {dev['host']}:{dev['port']} ({err})")


def poll_registers(dev, state):
    link = open_link(dev)
    try:
        kind = state.get("kind") or dev["kind"]
        if kind == "auto":
            try:
                link.read(33035, 1)
                kind = "hybrid"
            except ModbusExc:
                link.read(3014, 1)
                kind = "string"
            state["kind"] = kind
        if kind == "hybrid":
            regs = read_blocks(link, HYBRID_BLOCKS, optional=[HYBRID_METER_BLOCK])
            return normalise_hybrid(regs)
        regs = read_blocks(link, STRING_BLOCKS, optional=[STRING_OP_BLOCK])
        return normalise_string_inv(regs)
    except ModbusExc as err:
        state.pop("kind", None)
        raise BridgeIssue(f"the inverter refused the register read (modbus exception {err.code}); "
                          "try setting the model to hybrid or string by hand")
    except (OSError, socket.timeout, struct.error) as err:
        raise BridgeIssue(f"lost the connection mid-read ({err})")
    finally:
        link.close()


_NUM_RE = re.compile(r"-?\d+(?:\.\d+)?")
_VAR_RE = re.compile(r"var\s+(\w+)\s*=\s*\"([^\"]*)\"")


def _num(s):
    if not s:
        return None
    m = _NUM_RE.search(s.replace(",", "."))
    return float(m.group(0)) if m else None


def poll_http(dev, state):
    """Scrape the stick's own status page(s). Least data, zero setup."""
    auth = base64.b64encode(f"{dev['user']}:{dev['pass']}".encode()).decode()
    found = {}
    last_err = None
    for path in ("/status.html", "/inverter.html"):
        url = f"http://{dev['host']}:{dev['port']}{path}"
        req = urllib.request.Request(url, headers={"Authorization": "Basic " + auth})
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                found.update(_VAR_RE.findall(resp.read().decode("utf-8", "replace")))
        except urllib.error.HTTPError as err:
            if err.code == 401:
                raise BridgeIssue("the stick refused the password (default is admin / admin)")
            last_err = f"HTTP {err.code} on {path}"
        except (urllib.error.URLError, TimeoutError, OSError) as err:
            last_err = str(getattr(err, "reason", err))
    if not found:
        raise BridgeIssue(f"no status page at {dev['host']} ({last_err})")
    rated = _num(found.get("webdata_rate_p"))
    if rated is not None and rated < 100:
        rated *= 1000  # some firmware reports kW
    rssi = _num(found.get("cover_sta_rssi"))
    return {
        "kind": "logger",
        "pac_w": _num(found.get("webdata_now_p")),
        "today_kwh": _num(found.get("webdata_today_e")),
        "yesterday_kwh": _num(found.get("webdata_yesterday_e")),
        "total_kwh": _num(found.get("webdata_total_e")),
        "alarm": found.get("webdata_alarm", ""),
        "inv_sn": found.get("webdata_sn", ""),
        "rated_w": rated,
        "logger": {
            "sn": found.get("cover_mid", ""),
            "fw": found.get("cover_ver", ""),
            "ssid": found.get("cover_sta_ssid", ""),
            "rssi": rssi,
        },
    }


def poll_device(dev, state):
    if dev["mode"] == "http":
        return poll_http(dev, state)
    return poll_registers(dev, state)


# ---- device list validation --------------------------------------------------

DEFAULT_PORTS = {"solarman": 8899, "modbus": 502, "http": 80}


def clean_device(raw, idx):
    mode = str(raw.get("mode", "")).strip()
    if mode not in DEFAULT_PORTS:
        return None, "unknown mode"
    host = str(raw.get("host", "")).strip()
    if not host_is_allowed(host):
        return None, "only private network addresses are relayed"
    try:
        port = int(raw.get("port") or DEFAULT_PORTS[mode])
        unit = int(raw.get("unit") or 1)
    except (TypeError, ValueError):
        return None, "port and unit must be numbers"
    if not (0 < port < 65536 and 0 < unit < 248):
        return None, "port or unit out of range"
    dev = {
        "id": str(raw.get("id") or f"d{idx}")[:40],
        "mode": mode, "host": host, "port": port, "unit": unit,
        "kind": raw.get("kind") if raw.get("kind") in ("hybrid", "string") else "auto",
        "user": str(raw.get("user") or "admin")[:64],
        "pass": str(raw.get("pass") or "admin")[:64],
        "serial": None,
    }
    if mode == "solarman":
        serial = re.sub(r"\D", "", str(raw.get("serial", "")))
        if not serial:
            return None, "Solarman mode needs the stick's serial number"
        dev["serial"] = int(serial) & 0xFFFFFFFF
    return dev, None


# ---- websocket plumbing --------------------------------------------------------

async def poll_loop(ws, dev, idx, interval_ms):
    await asyncio.sleep(idx * 0.4)  # stagger the fleet
    state = {}
    while True:
        try:
            data = await asyncio.to_thread(poll_device, dev, state)
            await ws.send(json.dumps({"type": "data", "id": dev["id"], "data": data}))
        except BridgeIssue as err:
            await ws.send(json.dumps({"type": "error", "id": dev["id"], "msg": str(err)}))
        except Exception as err:  # keep the loop alive, whatever the stick does
            await ws.send(json.dumps({"type": "error", "id": dev["id"],
                                      "msg": f"unexpected reply from the device ({err})"}))
        await asyncio.sleep(interval_ms / 1000)


async def process_request(connection, request):
    """Plain HTTP GET returns status JSON; WebSocket upgrades are origin-checked."""
    origin = request.headers.get("Origin", "")
    if not request.headers.get("Upgrade"):
        body = json.dumps({"bridge": "sunseer-solis", "version": 1}).encode()
        headers = Headers([*_CORS, ("Content-Type", "application/json"),
                           ("Content-Length", str(len(body)))])
        return Response(200, "OK", headers, body)
    if origin and not ALLOWED_ORIGIN_RE.match(origin):
        print(f"Bridge: refused connection from origin {origin!r}")
        return Response(403, "Forbidden", Headers([("Content-Length", "0")]), b"")
    return None


async def ws_handler(ws):
    print("Bridge: page connected.")
    await ws.send(json.dumps({"type": "hello", "bridge": "sunseer-solis", "version": 1}))
    tasks = []

    def stop_all():
        for t in tasks:
            t.cancel()
        tasks.clear()

    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except ValueError:
                continue
            stop_all()
            if msg.get("cmd") != "watch":
                continue
            try:
                interval = min(MAX_INTERVAL_MS, max(MIN_INTERVAL_MS, int(msg.get("interval", 10000))))
            except (TypeError, ValueError):
                interval = 10000
            devices = msg.get("devices") or []
            for idx, raw_dev in enumerate(devices[:MAX_DEVICES]):
                dev, why = clean_device(raw_dev, idx)
                if dev is None:
                    await ws.send(json.dumps({"type": "error",
                                              "id": str(raw_dev.get("id", f"d{idx}"))[:40],
                                              "msg": why}))
                    continue
                print(f"Bridge: watching {dev['host']}:{dev['port']} ({dev['mode']}) every {interval / 1000:g}s")
                tasks.append(asyncio.create_task(poll_loop(ws, dev, idx, interval)))
    finally:
        stop_all()
        print("Bridge: page disconnected.")


async def main():
    async with serve(ws_handler, "127.0.0.1", PORT, process_request=process_request):
        print(f"SUNSEER relay listening on ws://127.0.0.1:{PORT}")
        print("Open https://rami.party/workshop/sunseer/ and add your inverters in its settings.")
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.")
