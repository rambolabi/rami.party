/* LaTeX Doctor — a small, self-contained LaTeX linter.
   Everything runs client-side: nothing the user pastes ever leaves the browser. */

(function () {
    'use strict';

    var texInput = document.getElementById('texInput');
    var checkBtn = document.getElementById('checkBtn');
    var clearBtn = document.getElementById('clearBtn');
    var sampleBtn = document.getElementById('sampleBtn');
    var results = document.getElementById('results');
    var statusChip = document.getElementById('statusChip');

    var SAMPLE = '\\documentclass{article}\n' +
        '\\usepackage{amsmath}\n' +
        '\n' +
        '\\begin{document}\n' +
        '\n' +
        'Hello world, here is some inline math $x^2 + y^2 = z^2.\n' +
        '\n' +
        '\\begin{itemize}\n' +
        '    \\item First point\n' +
        '    \\item Second point (unclosed brace \\textbf{oops)\n' +
        '\\end{enumerate}\n' +
        '\n' +
        'A stray underscore looks like this: file_name.txt\n' +
        '\n' +
        '\\begign{align}\n' +
        '    a &= b + c\n' +
        '\\end{align}\n' +
        '\n' +
        '\\includegraphics{diagram.png}\n';

    var COMMAND_TYPOS = {
        '\\beign': '\\begin',
        '\\begign': '\\begin',
        '\\endd': '\\end',
        '\\usepakage': '\\usepackage',
        '\\usepackge': '\\usepackage',
        '\\documentclas': '\\documentclass',
        '\\includegraphic': '\\includegraphics',
        '\\frac{}': '\\frac{}{}',
        '\\eqution': '\\equation',
        '\\itmize': '\\itemize',
        '\\centring': '\\centering',
        '\\textbd': '\\textbf'
    };

    var PACKAGE_REQUIREMENTS = [
        { pattern: /\\includegraphics\b/, command: '\\includegraphics', package: 'graphicx' },
        { pattern: /\\textcolor\b/, command: '\\textcolor', package: 'xcolor' },
        { pattern: /\\colorbox\b/, command: '\\colorbox', package: 'xcolor' },
        { pattern: /\\href\b/, command: '\\href', package: 'hyperref' },
        { pattern: /\\url\b/, command: '\\url', package: 'hyperref (or url)' },
        { pattern: /\\SI\{|\\si\{/, command: '\\SI / \\si', package: 'siunitx' },
        { pattern: /\\toprule|\\midrule|\\bottomrule/, command: '\\toprule/\\midrule/\\bottomrule', package: 'booktabs' },
        { pattern: /\\multirow\b/, command: '\\multirow', package: 'multirow' },
        { pattern: /\\checkmark\b/, command: '\\checkmark', package: 'amssymb' }
    ];

    /**
     * Builds a sorted array of character offsets where each line begins, so
     * that a character index can be mapped to a line number in O(log n)
     * instead of rescanning the whole text for every issue found.
     */
    function computeLineStarts(text) {
        var starts = [0];
        for (var i = 0; i < text.length; i++) {
            if (text[i] === '\n') starts.push(i + 1);
        }
        return starts;
    }

    function lineAt(lineStarts, index) {
        var lo = 0, hi = lineStarts.length - 1;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1;
        }
        return lo + 1;
    }

    /**
     * Walks the source once, tracking comments, escaping, brace nesting and
     * math-mode delimiters, and returns a list of issues.
     */
    function analyze(text) {
        var issues = [];
        var lineStarts = computeLineStarts(text);

        function addIssue(index, severity, message) {
            issues.push({ line: lineAt(lineStarts, index), severity: severity, message: message });
        }

        // --- Pass 1: character-level scan (comments, escaping, braces, math) ---
        var braceStack = [];
        var mathStack = []; // entries: { type: '$' | '$$' | '\\[' | '\\(', index }
        var mathRanges = []; // [start, end] index ranges of *closed* math spans
        var inComment = false;
        var i = 0;
        var len = text.length;

        while (i < len) {
            var ch = text[i];

            if (ch === '\n') {
                inComment = false;
                i++;
                continue;
            }

            if (inComment) {
                i++;
                continue;
            }

            // \[, \], \( and \) are structural math-mode delimiters, so they
            // must be checked *before* the generic backslash-escape handling
            // below (otherwise that branch would swallow them as if they were
            // an escaped character and this code would never run).
            if (text.substr(i, 2) === '\\[') {
                mathStack.push({ type: '\\[', index: i });
                i += 2;
                continue;
            }

            if (text.substr(i, 2) === '\\]') {
                var topDisplay = mathStack[mathStack.length - 1];
                if (topDisplay && topDisplay.type === '\\[') {
                    mathStack.pop();
                    mathRanges.push([topDisplay.index, i + 2]);
                } else {
                    addIssue(i, 'error', 'Found <code>\\]</code> with no matching <code>\\[</code> before it.');
                }
                i += 2;
                continue;
            }

            if (text.substr(i, 2) === '\\(') {
                mathStack.push({ type: '\\(', index: i });
                i += 2;
                continue;
            }

            if (text.substr(i, 2) === '\\)') {
                var topInline = mathStack[mathStack.length - 1];
                if (topInline && topInline.type === '\\(') {
                    mathStack.pop();
                    mathRanges.push([topInline.index, i + 2]);
                } else {
                    addIssue(i, 'error', 'Found <code>\\)</code> with no matching <code>\\(</code> before it.');
                }
                i += 2;
                continue;
            }

            if (ch === '\\') {
                // Escaped character (\%, \&, \#, \_, \$, \{, \}) or a command name.
                // Either way, skip the next character so it isn't misread as
                // structural syntax.
                i += 2;
                continue;
            }

            if (ch === '%') {
                inComment = true;
                i++;
                continue;
            }

            if (ch === '{') {
                braceStack.push(i);
                i++;
                continue;
            }

            if (ch === '}') {
                if (braceStack.length === 0) {
                    addIssue(i, 'error', 'Unmatched closing brace <code>}</code> — there is no <code>{</code> for it to close.');
                } else {
                    braceStack.pop();
                }
                i++;
                continue;
            }

            if (ch === '$') {
                var isDisplay = text[i + 1] === '$';
                var token = isDisplay ? '$$' : '$';
                var top = mathStack[mathStack.length - 1];
                if (top && top.type === token) {
                    mathStack.pop();
                    mathRanges.push([top.index, i + token.length]);
                } else {
                    mathStack.push({ type: token, index: i });
                }
                i += token.length;
                continue;
            }

            i++;
        }

        braceStack.forEach(function (idx) {
            addIssue(idx, 'error', 'Unmatched opening brace <code>{</code> — it is never closed with a <code>}</code>.');
        });

        mathStack.forEach(function (entry) {
            addIssue(entry.index, 'error', 'Math mode started with <code>' + escapeHtml(entry.type) + '</code> is never closed.');
        });

        // --- Pass 2: \begin{}/\end{} environment matching ---
        var envStack = [];
        var tabularRanges = []; // [start, end] index ranges where & is expected syntax
        var TABULAR_ENVS = ['tabular', 'tabular*', 'tabularx', 'array', 'align', 'align*',
            'alignat', 'alignat*', 'eqnarray', 'eqnarray*', 'matrix', 'pmatrix', 'bmatrix',
            'vmatrix', 'Vmatrix', 'smallmatrix', 'cases', 'longtable', 'aligned'];
        var envRegex = /\\(begin|end)\{([^{}]*)\}/g;
        var match;
        while ((match = envRegex.exec(text)) !== null) {
            // Skip matches that fall inside a % comment on their line.
            var lineStart = text.lastIndexOf('\n', match.index) + 1;
            var lineFragment = text.slice(lineStart, match.index);
            if (/(^|[^\\])%/.test(lineFragment)) continue;

            var kind = match[1];
            var name = match[2].trim();

            if (kind === 'begin') {
                envStack.push({ name: name, index: match.index });
            } else {
                if (envStack.length === 0) {
                    addIssue(match.index, 'error', '<code>\\end{' + escapeHtml(name) + '}</code> has no matching <code>\\begin{' + escapeHtml(name) + '}</code>.');
                } else {
                    var last = envStack[envStack.length - 1];
                    if (last.name === name) {
                        envStack.pop();
                        if (TABULAR_ENVS.indexOf(name) !== -1) {
                            tabularRanges.push([last.index, match.index + match[0].length]);
                        }
                    } else {
                        // Try to find a deeper match to give a friendlier message.
                        var foundIdx = -1;
                        for (var k = envStack.length - 1; k >= 0; k--) {
                            if (envStack[k].name === name) { foundIdx = k; break; }
                        }
                        if (foundIdx >= 0) {
                            addIssue(match.index, 'error', '<code>\\end{' + escapeHtml(name) + '}</code> found, but <code>\\begin{' + escapeHtml(last.name) + '}</code> was still open. Close inner environments before this one.');
                            envStack.length = foundIdx;
                        } else {
                            addIssue(match.index, 'error', '<code>\\begin{' + escapeHtml(last.name) + '}</code> is closed with <code>\\end{' + escapeHtml(name) + '}</code> — environment names must match.');
                            envStack.pop();
                        }
                    }
                }
            }
        }

        envStack.forEach(function (entry) {
            addIssue(entry.index, 'error', '<code>\\begin{' + escapeHtml(entry.name) + '}</code> is never closed with <code>\\end{' + escapeHtml(entry.name) + '}</code>.');
        });

        // --- Pass 3: document scaffolding ---
        // Missing/mismatched \begin{document}/\end{document} pairs are already
        // reported by the generic environment matching above (Pass 2), since
        // "document" is itself just an environment. Only the documentclass
        // check is specific to this pass.
        var hasDocumentClass = /\\documentclass(\[[^\]]*\])?\{[^{}]*\}/.test(text);
        var hasBeginDocument = /\\begin\{document\}/.test(text);

        if (hasBeginDocument && !hasDocumentClass) {
            addIssue(text.indexOf('\\begin{document}'), 'warning', 'No <code>\\documentclass{...}</code> found before <code>\\begin{document}</code>. Every compilable document needs one.');
        }

        // --- Pass 3b: locate "safe" argument ranges where _ and # are normal
        // text (file paths, labels, references, URLs) rather than mistakes. ---
        var safeArgRanges = findSafeArgumentRanges(text);

        function isInsideRange(ranges, index) {
            for (var r = 0; r < ranges.length; r++) {
                if (index >= ranges[r][0] && index < ranges[r][1]) return true;
            }
            return false;
        }

        // --- Pass 4: unescaped special characters ---
        var lines = text.split('\n');
        lines.forEach(function (rawLine, lineIdx) {
            var commentSplit = splitAtUnescapedComment(rawLine);
            var code = commentSplit.code;
            var lineOffset = lineStarts[lineIdx];

            var specialCharRegex = /(^|[^\\])([&_#])/g;
            var m;
            while ((m = specialCharRegex.exec(code)) !== null) {
                var globalIndex = lineOffset + m.index + m[1].length;
                var symbol = m[2];

                if (isInsideRange(mathRanges, globalIndex)) continue;
                if (symbol === '&' && isInsideRange(tabularRanges, globalIndex)) continue;
                if ((symbol === '_' || symbol === '#') && isInsideRange(safeArgRanges, globalIndex)) continue;

                var advice = symbol === '&'
                    ? 'A lone <code>&amp;</code> is only valid inside alignment environments like <code>tabular</code> or <code>align</code>. Escape it as <code>\\&amp;</code> otherwise.'
                    : symbol === '_'
                        ? 'A lone <code>_</code> outside math mode will raise "Missing $ inserted". Escape it as <code>\\_</code> or wrap in <code>$...$</code>.'
                        : 'A lone <code>#</code> outside a macro definition must be escaped as <code>\\#</code>.';
                addIssue(globalIndex, 'warning', advice);
            }
        });

        // --- Pass 5: typo detection ---
        Object.keys(COMMAND_TYPOS).forEach(function (typo) {
            var escaped = typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var typoRegex = new RegExp(escaped + '(?![a-zA-Z])', 'g');
            var t;
            while ((t = typoRegex.exec(text)) !== null) {
                addIssue(t.index, 'warning', 'Possible typo: <code>' + escapeHtml(typo) + '</code> — did you mean <code>' + escapeHtml(COMMAND_TYPOS[typo]) + '</code>?');
            }
        });

        // --- Pass 6: missing package suggestions ---
        PACKAGE_REQUIREMENTS.forEach(function (req) {
            if (req.pattern.test(text)) {
                var pkgName = req.package.split(' ')[0];
                var usePkgRegex = new RegExp('\\\\usepackage(\\[[^\\]]*\\])?\\{[^{}]*\\b' + pkgName + '\\b[^{}]*\\}');
                if (!usePkgRegex.test(text)) {
                    var firstUse = text.search(req.pattern);
                    addIssue(firstUse, 'warning', 'Uses <code>' + escapeHtml(req.command) + '</code> but no <code>\\usepackage{' + escapeHtml(req.package) + '}</code> was found.');
                }
            }
        });

        // Sort by line number for a readable report.
        issues.sort(function (a, b) { return a.line - b.line; });
        return issues;
    }

    /**
     * Finds index ranges of brace-delimited arguments to commands where a
     * literal underscore or hash is normal (file paths, labels, references,
     * URLs) rather than a likely mistake, so Pass 4 can skip warning there.
     */
    function findSafeArgumentRanges(text) {
        var SAFE_COMMANDS = ['label', 'ref', 'pageref', 'eqref', 'cite', 'citep', 'citet',
            'nocite', 'includegraphics', 'url', 'href', 'input', 'include',
            'bibliography', 'texttt', 'path', 'verb', 'lstinline', 'footnote', 'caption'];
        var ranges = [];
        var cmdRegex = new RegExp('\\\\(' + SAFE_COMMANDS.join('|') + ')\\*?(\\[[^\\]]*\\])?\\{', 'g');
        var m;
        while ((m = cmdRegex.exec(text)) !== null) {
            var openIdx = m.index + m[0].length - 1; // index of the opening '{'
            var depth = 1;
            var j = openIdx + 1;
            while (j < text.length && depth > 0) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === '{') depth++;
                else if (text[j] === '}') depth--;
                j++;
            }
            ranges.push([openIdx + 1, j - 1]);
            cmdRegex.lastIndex = j;
        }
        return ranges;
    }

    function splitAtUnescapedComment(line) {
        for (var i = 0; i < line.length; i++) {
            if (line[i] === '\\') { i++; continue; }
            if (line[i] === '%') return { code: line.slice(0, i), comment: line.slice(i + 1) };
        }
        return { code: line, comment: null };
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function renderResults(issues) {
        results.innerHTML = '';

        if (issues.length === 0) {
            statusChip.textContent = 'Looks healthy';
            statusChip.className = 'status-chip status-ok';
            var banner = document.createElement('div');
            banner.className = 'success-banner';
            banner.innerHTML = '<span aria-hidden="true">✅</span> No syntax errors or common mistakes found. Ship it!';
            results.appendChild(banner);
            return;
        }

        var errorCount = issues.filter(function (x) { return x.severity === 'error'; }).length;
        var warnCount = issues.length - errorCount;

        statusChip.textContent = errorCount > 0
            ? errorCount + ' error' + (errorCount === 1 ? '' : 's') + (warnCount ? ', ' + warnCount + ' warning' + (warnCount === 1 ? '' : 's') : '')
            : warnCount + ' warning' + (warnCount === 1 ? '' : 's');
        statusChip.className = 'status-chip ' + (errorCount > 0 ? 'status-error' : 'status-warn');

        var list = document.createElement('ul');
        list.className = 'issue-list';

        issues.forEach(function (issue) {
            var li = document.createElement('li');
            li.className = 'issue issue-' + issue.severity;
            var lineLabel = document.createElement('span');
            lineLabel.className = 'issue-line';
            lineLabel.textContent = (issue.severity === 'error' ? '✗ Error' : '⚠ Warning') + ' · line ' + issue.line;
            var message = document.createElement('span');
            message.className = 'issue-message';
            message.innerHTML = issue.message;
            li.appendChild(lineLabel);
            li.appendChild(message);
            list.appendChild(li);
        });

        results.appendChild(list);
    }

    function runDiagnosis() {
        var text = texInput.value;
        if (!text.trim()) {
            statusChip.textContent = 'Waiting for input';
            statusChip.className = 'status-chip status-idle';
            results.innerHTML = '<p class="placeholder">Paste some LaTeX and hit <strong>Diagnose</strong> to see what\'s wrong with it (if anything).</p>';
            return;
        }
        var issues = analyze(text);
        renderResults(issues);
    }

    checkBtn.addEventListener('click', runDiagnosis);

    clearBtn.addEventListener('click', function () {
        texInput.value = '';
        texInput.focus();
        statusChip.textContent = 'Waiting for input';
        statusChip.className = 'status-chip status-idle';
        results.innerHTML = '<p class="placeholder">Paste some LaTeX and hit <strong>Diagnose</strong> to see what\'s wrong with it (if anything).</p>';
    });

    sampleBtn.addEventListener('click', function () {
        texInput.value = SAMPLE;
        runDiagnosis();
    });

    texInput.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            runDiagnosis();
        }
    });
})();
