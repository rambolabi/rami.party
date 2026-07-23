/* ==========================================================================
   Unlocked Computer Assistant — curated, data-driven prank list.
   Every entry is verified to actually work on current Windows 10/11 and is
   labelled with the console to run it in, plus a matching undo.
   Renders into #prankGrid and #comboList on the Prank Screens page.
   ========================================================================== */
(function () {
    'use strict';

    // shell: 'ps' = PowerShell · 'cmd' = Command Prompt · 'key' = keyboard only
    var PRANKS = [
        {
            icon: '🔄', title: 'Upside-Down World', level: 'easy', shell: 'key',
            desc: 'Flip the whole screen 180° for an instant headache.',
            code: 'Ctrl + Alt + ↓',
            undo: 'Ctrl + Alt + ↑',
            tip: 'Works on Intel graphics with hotkeys enabled. Otherwise: Settings → System → Display → Display orientation.'
        },
        {
            icon: '🖱️', title: 'Left-Handed Mouse', level: 'easy', shell: 'ps',
            desc: 'Swap the primary and secondary mouse buttons.',
            code: "Set-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name SwapMouseButtons -Value 1",
            undo: "Set-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name SwapMouseButtons -Value 0",
            tip: 'Applies at the next sign-in — or flip “Primary mouse button” in Settings → Bluetooth &amp; devices → Mouse for an instant swap.'
        },
        {
            icon: '🐌', title: 'Snail (or Hyper) Mouse', level: 'easy', shell: 'ps',
            desc: 'Crank pointer speed to a crawl — or to warp speed.',
            code: "# 1 = snail, 20 = hyperspeed\nSet-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseSensitivity -Value 1",
            undo: "Set-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseSensitivity -Value 10",
            tip: 'The default speed is 10.'
        },
        {
            icon: '⌨️', title: 'Keyboard Layout Swap', level: 'medium', shell: 'ps',
            desc: 'Sneak in a QWERTZ/AZERTY layout so letters land in the wrong place.',
            code: "$l = Get-WinUserLanguageList\n$l.Add('de-DE')\nSet-WinUserLanguageList $l -Force",
            undo: "Set-WinUserLanguageList (Get-WinUserLanguageList | Where-Object LanguageTag -ne 'de-DE') -Force",
            tip: 'They can cycle layouts with <code>Win + Space</code> — which is also how they’ll discover the prank.'
        },
        {
            icon: '🔍', title: 'Extreme Zoom', level: 'easy', shell: 'key',
            desc: 'Fire up Magnifier for some uncomfortably close pixels.',
            code: 'Win + +   (plus key)',
            undo: 'Win + Esc',
            tip: 'Or run <code>Start-Process magnify.exe</code> in PowerShell.'
        },
        {
            icon: '🔊', title: 'Chatty Computer', level: 'epic', shell: 'key',
            desc: 'Turn on Narrator so the PC reads everything out loud.',
            code: 'Ctrl + Win + Enter',
            undo: 'Ctrl + Win + Enter   (same keys toggle it off)',
            tip: 'Give it a few seconds — it starts narrating every click.'
        },
        {
            icon: '🗣️', title: 'Talking Computer', level: 'medium', shell: 'ps',
            desc: 'Make Windows say a message out loud, once.',
            code: "Add-Type -AssemblyName System.Speech\n(New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('You forgot to lock your PC')",
            undo: null,
            tip: 'No undo needed — it just speaks once. Change the text to anything you like.'
        },
        {
            icon: '🌗', title: 'Colour-Filter Flip', level: 'easy', shell: 'key',
            desc: 'Invert or greyscale the whole display in a keystroke.',
            code: 'Ctrl + Win + C',
            undo: 'Ctrl + Win + C',
            tip: 'Enable the shortcut once via Settings → Accessibility → Colour filters, then it toggles instantly.'
        },
        {
            icon: '🦄', title: 'Browser Surprise', level: 'medium', shell: 'ps',
            desc: 'Open a couple of delightfully useless websites.',
            code: "Start-Process 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'\nStart-Process 'https://pointerpointer.com/'",
            undo: null,
            tip: 'Completely harmless — just close the tabs with <code>Ctrl + W</code>.'
        },
        {
            icon: '🎯', title: 'Hide Desktop Icons', level: 'medium', shell: 'ps',
            desc: 'Make every desktop icon vanish. Where did it all go?',
            code: "Set-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name HideIcons -Value 1\nStop-Process -Name explorer -Force",
            undo: "Set-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name HideIcons -Value 0\nStop-Process -Name explorer -Force",
            tip: 'Or just right-click the desktop → View → Show desktop icons.'
        },
        {
            icon: '📸', title: 'Fake Frozen Desktop', level: 'epic', shell: 'ps',
            desc: 'Screenshot the desktop, set it as wallpaper, hide the real icons — nothing is clickable.',
            code: [
                'Add-Type -AssemblyName System.Windows.Forms, System.Drawing',
                '$b = [Windows.Forms.Screen]::PrimaryScreen.Bounds',
                '$bmp = New-Object Drawing.Bitmap $b.Width, $b.Height',
                '[Drawing.Graphics]::FromImage($bmp).CopyFromScreen(0, 0, 0, 0, $b.Size)',
                '$p = "$env:USERPROFILE\\Pictures\\prank.png"; $bmp.Save($p)',
                "Set-ItemProperty 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper -Value $p",
                "Set-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name HideIcons -Value 1",
                'rundll32.exe user32.dll,UpdatePerUserSystemParameters',
                'Stop-Process -Name explorer -Force'
            ].join('\n'),
            undo: [
                "Set-ItemProperty 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper -Value ''",
                "Set-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name HideIcons -Value 0",
                'rundll32.exe user32.dll,UpdatePerUserSystemParameters',
                'Stop-Process -Name explorer -Force'
            ].join('\n'),
            tip: 'The all-time classic — they’ll click a frozen picture of their own desktop.'
        },
        {
            icon: '👻', title: 'Vanishing Taskbar', level: 'medium', shell: 'ps',
            desc: 'Switch the taskbar to auto-hide so it disappears until touched.',
            code: [
                "$p = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3'",
                '$v = (Get-ItemProperty $p).Settings; $v[8] = 3',
                'Set-ItemProperty $p -Name Settings -Value $v',
                'Stop-Process -Name explorer -Force'
            ].join('\n'),
            undo: [
                "$p = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3'",
                '$v = (Get-ItemProperty $p).Settings; $v[8] = 2',
                'Set-ItemProperty $p -Name Settings -Value $v',
                'Stop-Process -Name explorer -Force'
            ].join('\n'),
            tip: 'The taskbar hides until the cursor hits the screen edge.'
        },
        {
            icon: '🔑', title: 'Sticky Keys', level: 'medium', shell: 'ps',
            desc: 'Arm Sticky Keys so a stray Shift triggers the pop-up.',
            code: "Set-ItemProperty 'HKCU:\\Control Panel\\Accessibility\\StickyKeys' -Name Flags -Value 510",
            undo: "Set-ItemProperty 'HKCU:\\Control Panel\\Accessibility\\StickyKeys' -Name Flags -Value 506",
            tip: 'Or just press <code>Shift</code> five times in a row to pop the dialog.'
        },
        {
            icon: '🐢', title: 'Laggy Keyboard', level: 'medium', shell: 'ps',
            desc: 'Max out the key-repeat delay for genuinely painful typing.',
            code: "Set-ItemProperty 'HKCU:\\Control Panel\\Keyboard' -Name KeyboardDelay -Value 3\nSet-ItemProperty 'HKCU:\\Control Panel\\Keyboard' -Name KeyboardSpeed -Value 0",
            undo: "Set-ItemProperty 'HKCU:\\Control Panel\\Keyboard' -Name KeyboardDelay -Value 1\nSet-ItemProperty 'HKCU:\\Control Panel\\Keyboard' -Name KeyboardSpeed -Value 31",
            tip: 'Sign out and back in to feel the full effect (and to apply the undo).'
        },
        {
            icon: '🌠', title: 'Retro Mouse Trails', level: 'easy', shell: 'ps',
            desc: 'Bring back glorious Windows-95 pointer trails.',
            code: "Set-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseTrails -Value 7",
            undo: "Set-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseTrails -Value 0",
            tip: 'Sign out/in (or reboot) to apply and to undo.'
        },
        {
            icon: '📝', title: 'Reminder in Notepad', level: 'easy', shell: 'ps',
            desc: 'Pop open a friendly “lock your PC” note in Notepad.',
            code: '@"\n🔓 You forgot to lock your PC!\nRemember: Win + L next time 😊\n"@ | Out-File "$env:TEMP\\reminder.txt"\nStart-Process notepad.exe "$env:TEMP\\reminder.txt"',
            undo: null,
            tip: 'Harmless — they just close Notepad.'
        },
        {
            icon: '🅰️', title: 'Caps Lock Forever', level: 'easy', shell: 'key',
            desc: 'The simplest prank in the book.',
            code: 'Press Caps Lock. Walk away.',
            undo: 'Press Caps Lock again.',
            tip: 'No scripts, no cleanup — pure chaos.'
        },
        {
            icon: '⏰', title: 'Delayed Shutdown', level: 'extreme', shell: 'cmd',
            desc: 'Schedule a shutdown in one hour with a friendly message.',
            code: 'shutdown /s /t 3600 /c "Friendly reminder: lock your PC! (Win + L)"',
            undo: 'shutdown /a',
            tip: '⚠️ Always tell them the cancel command — and cancel it yourself if they step away. Be kind!'
        }
    ];

    var COMBOS = [
        { name: 'The Classic', text: 'Flip the screen + swap the mouse buttons.' },
        { name: 'The Subtle', text: 'Snail mouse + an extra keyboard layout — slow <em>and</em> gibberish.' },
        { name: 'The Sensory Overload', text: 'Magnifier + Narrator + colour-filter flip.' },
        { name: 'The Legendary', text: 'Fake frozen desktop — screenshot wallpaper with the real icons hidden.' },
        { name: 'Pro tip', text: 'Always know the undo, cancel any shutdown, and help them fix it after a good laugh 😊' }
    ];

    var SHELL_LABEL = { ps: 'PowerShell', cmd: 'Command Prompt', key: 'Keyboard' };
    var LEVEL_LABEL = { easy: 'Easy', medium: 'Medium', epic: 'Epic', extreme: 'Extreme' };

    function esc(s) {
        return String(s).replace(/&(?![a-z#]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function codeBlock(label, code, isUndo) {
        return '<div class="code-group"><span class="code-label">' + label + '</span>' +
            '<div class="code-block' + (isUndo ? ' is-undo' : '') + '">' +
            '<button class="copy-button" type="button">Copy</button>' +
            '<pre>' + esc(code) + '</pre></div></div>';
    }

    function cardHTML(p) {
        var doLabel = p.shell === 'key' ? 'Shortcut' : 'Run it';
        var html = '<article class="prank-card">' +
            '<header class="prank-head">' +
            '<span class="prank-icon" aria-hidden="true">' + p.icon + '</span>' +
            '<div class="prank-heading"><h3 class="prank-title">' + p.title + '</h3>' +
            '<div class="prank-badges">' +
            '<span class="prank-level level-' + p.level + '">' + LEVEL_LABEL[p.level] + '</span>' +
            '<span class="shell-badge shell-' + p.shell + '">' + SHELL_LABEL[p.shell] + '</span>' +
            '</div></div></header>' +
            '<p class="prank-description">' + p.desc + '</p>';
        if (p.code) html += codeBlock(doLabel, p.code, false);
        if (p.undo) html += codeBlock('Undo', p.undo, true);
        if (p.tip) html += '<div class="instructions">' + p.tip + '</div>';
        html += '</article>';
        return html;
    }

    function onCopy(e) {
        var btn = e.target.closest('.copy-button');
        if (!btn) return;
        var pre = btn.parentElement.querySelector('pre');
        if (!pre) return;
        navigator.clipboard.writeText(pre.textContent).then(function () {
            var prev = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () { btn.textContent = prev; btn.classList.remove('copied'); }, 1600);
        }).catch(function () { btn.textContent = 'Copy failed'; });
    }

    function render() {
        var grid = document.getElementById('prankGrid');
        if (grid) {
            grid.innerHTML = PRANKS.map(cardHTML).join('');
            grid.addEventListener('click', onCopy);
        }
        var combo = document.getElementById('comboList');
        if (combo) {
            combo.innerHTML = COMBOS.map(function (c) {
                return '<div class="tip"><strong>' + c.name + ':</strong> ' + c.text + '</div>';
            }).join('');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
