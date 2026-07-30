# todo-writer.md — bringing real flashing into The Scribe

`/workshop/frostcaller/writer/` is a Web Serial page that already talks to a board:
it opens the port, identifies the chip over the ESP ROM protocol, streams the log,
pulls infrared captures out of it and writes text back.

What it deliberately does **not** do yet is write firmware. This file is the plan for
that — what it takes, in what order, and what can go wrong.

---

## Why it is not done already

Reading from a board is harmless. Writing to one is not: a partial or misaligned
write leaves a device that will not boot, and recovering it means a serial adapter
and a bootloader you can no longer reach the easy way. Flashing code that has never
been run against real silicon has no business being shipped to beginners — and the
whole point of Frostcaller is that a beginner can follow it without losing an
evening or a board.

So the page does the honest half: it proves the cable, the driver, the port and the
chip all work, and hands you to an installer that has been tested by thousands of
people. **Identify the board** succeeding is the same handshake a flasher does
first, so if it works, flashing will work.

---

## What already exists to build on

In `writer/app.js` and `writer/flipper.js`:

| Piece | Status |
|---|---|
| `connect()` / `disconnect()` / `readLoop()` | Done — port lifecycle, reconnect on unplug |
| `rawMode` byte capture | Done — flips the reader between text and raw bytes |
| `slipEncode()` / `takeFrame()` | Done — SLIP framing both ways |
| `romCommand()` / `romRequest()` | Done — command packets and response matching |
| `enterBootloader()` / `hardReset()` | Done — the DTR/RTS dance |
| `identify()` | Done — SYNC then `READ_REG` of the chip magic |
| `CHIP_MAGIC` table | Done — ESP8266 through ESP32-H2 |
| Flipper Zero CLI | Done — detect, `ir rx`, `ir rx raw`, `ir tx`, Ctrl-C, `device_info` |
| `.ir` file parse and generate | Done — round-trip verified |
| Capture store, diffing, five export formats | Done |
| Protocol quiz | Done |

That is roughly 40% of a flasher, plus a complete capture workstation. The missing
60% is the part that can brick things.

---

## Step 1 — Decide the shape

Two honest options.

### Option A — vendor `esptool-js` (recommended)

The official JavaScript port of esptool, maintained by Espressif, and what ESPHome
Web and the Tasmota installer both use underneath.

- **Pros:** correct, maintained, handles every chip, stub loader, compression,
  baud-rate switching, and the hundred edge cases you have not thought of.
- **Cons:** it is a dependency, and this site has none. It is an ES module of a few
  hundred kilobytes. It would need vendoring into `writer/vendor/` with its licence
  and version recorded, because linking a CDN is not acceptable here.

### Option B — finish the hand-rolled implementation

Keep going with what is already in `app.js`.

- **Pros:** no dependency, small, and the existing code is already half of it.
- **Cons:** you own every bug, on every chip variant, forever. Espressif changes
  bootloader details between revisions and you will find out from a stranger's
  bricked board.

**Recommendation:** Option A. Write Option B only as a learning exercise, and never
ship it as the default.

---

## Step 2 — Get a binary to write

This is the part people forget. A flasher needs compiled firmware, and **ESPHome
compiles on a server, not in a browser.** There is no way to turn the YAML this
guide generates into a `.bin` client-side. So the page can only ever offer:

1. **A file the user supplies.** They compiled it in ESPHome, downloaded the
   binary, and now want it written. This is the honest case and the one to build.
2. **A manifest of prebuilt binaries.** How ESP Web Tools works: a small JSON file
   listing builds per chip family, each with parts and offsets.

   ```json
   {
     "name": "Frostcaller IR blaster",
     "version": "1.0",
     "builds": [
       {
         "chipFamily": "ESP32",
         "parts": [{ "path": "firmware-esp32.bin", "offset": 0 }]
       }
     ]
   }
   ```

   Producing those builds means a CI job running `esphome compile` for each board in
   `BOARDS`, which is a real piece of infrastructure — and the firmware would carry
   *no* Wi-Fi credentials, so it would need Improv provisioning on top.
3. **Someone else's manifest** — Tasmota's, for instance. Legitimate, but then you
   are shipping their firmware from your page, and you own the support burden when a
   build changes.

Start with (1). It is small, useful, and involves no infrastructure.

---

## Step 3 — The flash sequence, if hand-rolling

For the record, and so the existing half is not mysterious:

1. **Enter the bootloader** — `enterBootloader()`. Already done.
2. **SYNC** — command `0x08`, up to seven attempts. Already done.
3. **Detect the chip** — `READ_REG` at `0x40001000`. Already done.
4. **Upload the stub loader.** Optional but effectively required: the ROM loader is
   painfully slow and cannot do compressed writes. The stub is a small binary
   uploaded to RAM with `MEM_BEGIN` (`0x05`), `MEM_DATA` (`0x07`) and `MEM_END`
   (`0x06`), then run. Each chip family has its own stub, base64-encoded in esptool.
5. **Raise the baud rate** — `CHANGE_BAUDRATE` (`0x0F`), then reopen the port at the
   new speed. Web Serial cannot change speed on an open port, so this means
   `close()` then `open()` and re-acquiring the reader. Fiddly, and a common source
   of hangs.
6. **Erase and write.** `FLASH_BEGIN` (`0x02`) with size, block count, block size
   and offset; then `FLASH_DATA` (`0x03`) per block, each carrying its own
   checksum; then `FLASH_END` (`0x04`). With the stub, use the deflate variants
   (`FLASH_DEFL_BEGIN` `0x10`, `FLASH_DEFL_DATA` `0x11`, `FLASH_DEFL_END` `0x12`)
   and compress with something like `CompressionStream('deflate')`.
7. **Verify** — `SPI_FLASH_MD5` (`0x13`) over the written range and compare with the
   MD5 of what you sent. Non-negotiable. A flasher without verification is a
   coin toss.
8. **Reset** — `hardReset()`. Already done.

### Details that will bite

- **Checksums** apply to `MEM_DATA` and `FLASH_DATA` only, and are an XOR of the
  payload bytes seeded with `0xEF` — not the whole packet.
- **Timeouts scale with block size.** An erase of a large region can take tens of
  seconds and looks exactly like a hang.
- **The ESP8266 has no `SPI_SET_PARAMS`,** and several commands differ. Do not
  assume ESP32 behaviour.
- **The C3 and S3 have native USB.** `setSignals()` may do nothing at all, and the
  board must be put into download mode by holding BOOT. Detect and say so, rather
  than retrying silently.
- **Flash size and mode bytes** live in the first 4 bytes of the image at offset 0.
  Write them wrong and the board boots to a garbage loop.
- **Offsets differ by chip.** ESP32 bootloader at `0x1000`, ESP32-C3/S3 at `0x0`.
  Getting this wrong is the single most common way to brick a board.

---

## Step 4 — The interface, whichever route

The mechanics matter less than not letting someone hurt themselves.

- [ ] A dropzone plus file picker for the `.bin`, with the offset shown and
      editable, defaulted per detected chip.
- [ ] **Refuse to start** until `identify()` has succeeded in this session. If the
      chip is unknown, do not guess an offset.
- [ ] Show what is about to happen in words before the button becomes live:
      *"Write 1.2 MB to an ESP32 at offset 0x10000. This erases what is there now."*
- [ ] A progress bar with bytes and percentage, and a running log.
- [ ] Disable every other control during the write. A user pressing *Disconnect*
      mid-flash is the brick you will hear about.
- [ ] `beforeunload` warning while writing.
- [ ] After verification, offer *Restart the board* and switch straight to the
      console so they see it boot. That moment is the whole payoff.
- [ ] On failure, say plainly that the board is probably still in the bootloader and
      can simply be flashed again — most "bricks" are just a frightened user.

---

## Step 5 — Testing, before this ships to anyone

No amount of code review substitutes for this list.

- [ ] Flash and verify on: ESP32 DevKit, ESP32-C3 SuperMini, Wemos D1 mini,
      M5Stack Atom Lite. Those are the four boards the guide actually recommends.
- [ ] Flash a **known-bad** file and confirm verification catches it.
- [ ] Pull the cable mid-write. Confirm the page recovers, says something useful,
      and that the board can be re-flashed afterwards.
- [ ] Try it with the wrong offset on purpose, on a board you are willing to lose.
- [ ] Windows, macOS and Linux — driver behaviour differs more than the code does.
- [ ] A USB hub, and a long cheap cable. Both cause failures nothing else does.
- [ ] Confirm the Tasmota and ESPHome Web installers still work after this page has
      held the port (release it properly on disconnect).

---

## Step 6 — Housekeeping when it lands

- [ ] Add `writer/vendor/` to the service worker's `SHELL` list and bump `CACHE`.
- [ ] Record the vendored version and licence in this file and in `todo.md`.
- [ ] Update the honest paragraph in `writer/index.html` — it currently explains why
      flashing is absent, and would become a lie.
- [ ] Add flashing to the search index and the keyboard shortcut list.
- [ ] Mention it in `projects.js`, since it changes what the project *is*.

---

## Smaller things the writer page could do next

All safe, none can brick anything — better value per hour than flashing.

- [x] ~~Auto-name captures~~ — done, suggests from shape and length.
- [x] ~~Capture diffing~~ — done, with contiguous-block reporting.
- [x] ~~Export all captures as SmartIR JSON~~ — done, alongside `.ir`, ESPHome,
      Tasmota, Pronto and raw JSON.
- [x] ~~Save captures to `localStorage`~~ — done.
- [x] ~~A “which of these is my remote?” quiz~~ — done, twelve candidates.
- [x] ~~Run the log through the guide's explainer~~ — done: recognised lines get a
      plain-language note underneath in the console.
- [x] ~~Record and replay a session~~ — done, one JSON file carrying the log and the
      captures.
- [x] ~~A checksum guesser~~ — done, six schemes, ranked by how much evidence they
      need. Verified against synthetic messages with known checksums.
- [x] ~~Fetch from Flipper-IRDB~~ — done, opt-in and labelled as the only network
      call on the site.
- [x] ~~Generate an ESPHome `climate_ir` component skeleton~~ — done, with header and
      bit timings measured from the selected captures.

### Still open

- [x] ~~A theme picker~~ — added in v7. The page had none, which meant the
      `[data-theme="paper"]` rules in its own stylesheet could never fire. The choice
      is shared with the guide through one settings blob.
- [x] ~~A language picker~~ — added in v7. The chrome, headings, leads and buttons are
      in English, Dutch and French; the deep technical text stays English, same policy
      as the guide's long chapters.
- [ ] **Flipper RPC over protobuf** — read and write files on the device directly
      instead of asking the user to copy them onto the SD card. The definitions are
      public; this is a real project rather than an afternoon.
- [ ] **Bluetooth serial for the Flipper**, so a phone could do the capturing. Web
      Bluetooth cannot reach the Flipper's serial service today — worth re-checking.
- [ ] **Most-significant-bit-first decoding** as well as LSB, showing whichever gives
      the cleaner checksum fit. Some protocols are MSB-first and currently decode as
      noise.
- [ ] **Detect repeated frames** and offer to keep one. Many remotes send the message
      twice, and the duplicate makes every later analysis harder.
- [ ] **A bit-field mapper** — the checksum guesser finds the check byte; the next
      step is letting the user name the other bytes and generating the encoder.
- [ ] **Translate the lab's own output** — the checksum verdicts, the diff commentary
      and the console annotations are still generated in English.

## Verifying the Flipper support

Written from the CLI documentation, never run against a physical dolphin. Before
trusting it:

- [ ] Official firmware, Unleashed, RogueMaster and Momentum — confirm the banner
      still triggers detection and that `ir rx` output still parses.
- [ ] Confirm `ir rx raw` prints the header line and the samples the way the parser
      expects, and that long air-conditioner captures are not truncated.
- [ ] Confirm `ir tx RAW F:38000 DC:33 …` accepts a long timing list.
- [ ] Round-trip a real `.ir` file from Flipper-IRDB: import here, export again,
      and check the Flipper still reads it. (The format round-trips against itself —
      raw timings byte-for-byte and NEC address/command — but no Flipper has read the
      result.)

## Verifying the laboratory

The checksum guesser and the byte decoder are tested against **synthetic** messages
built here, which proves the arithmetic but not the assumptions:

- [x] Decode round-trips: encode known bytes, decode, get the same bytes back.
- [x] Finds sum-8, XOR-8, nibble-sum and sum-plus-constant correctly.
- [x] Copes with a mostly-zeros message, which is the awkward case for the
      short/long boundary detector.
- [ ] **Run it against a real air conditioner capture.** Every assumption — that the
      encoding is pulse-distance, that bits are least-significant-first, that the
      checksum is the last byte — is true of most protocols and false of some.
