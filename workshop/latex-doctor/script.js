/* LaTeX Doctor — a small, self-contained LaTeX linter.
   Everything runs client-side: nothing the user pastes ever leaves the browser. */

(function () {
    'use strict';

    var texInput = document.getElementById('texInput');
    var checkBtn = document.getElementById('checkBtn');
    var clearBtn = document.getElementById('clearBtn');
    var sampleBtn = document.getElementById('sampleBtn');
    var copyBtn = document.getElementById('copyBtn');
    var results = document.getElementById('results');
    var statusChip = document.getElementById('statusChip');

    var STORAGE_KEY = 'latex-doctor-draft';
    var PLACEHOLDER = '<p class="placeholder">Paste some LaTeX on the left — the Doctor checks it as you type.</p>';

    var BROKEN_SAMPLE = '\\documentclass{article}\n' +
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
        '\\includegraphics{diagram.png}\n' +
        '\n' +
        '\\end{document}\n';

    var HEALTHY_SAMPLE = '\\documentclass[11pt]{article}\n' +
        '\\usepackage{amsmath}\n' +
        '\\usepackage{graphicx}\n' +
        '\n' +
        '\\newcommand{\\greet}[1]{Hello, #1!}\n' +
        '\n' +
        '\\begin{document}\n' +
        '\n' +
        '\\section{A healthy document}\n' +
        '\\greet{world} Inline math such as $a^2 + b^2 = c^2$ is fine, and so is\n' +
        'display math:\n' +
        '\n' +
        '\\begin{equation}\\label{eq:sum}\n' +
        '    S_n = \\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}\n' +
        '\\end{equation}\n' +
        '\n' +
        'Equation~\\eqref{eq:sum} holds for every $n \\geq 1$, and 50\\% of the\n' +
        'table below uses \\& an ampersand as ordinary text.\n' +
        '\n' +
        '\\begin{tabular}{ll}\n' +
        '    Left & Right \\\\\n' +
        '    A    & B     \\\\\n' +
        '\\end{tabular}\n' +
        '\n' +
        '\\includegraphics[width=0.5\\textwidth]{my_diagram.png}\n' +
        '\n' +
        '\\end{document}\n';

    /* Misspellings of real LaTeX commands, mapped to the real thing. Only
       commands that genuinely exist are ever suggested. */
    var COMMAND_TYPOS = {
        '\\beign': '\\begin',
        '\\begign': '\\begin',
        '\\bein': '\\begin',
        '\\endd': '\\end',
        '\\usepakage': '\\usepackage',
        '\\usepackge': '\\usepackage',
        '\\usepacakge': '\\usepackage',
        '\\documentclas': '\\documentclass',
        '\\includegraphic': '\\includegraphics',
        '\\centring': '\\centering',
        '\\centerin': '\\centering',
        '\\textbd': '\\textbf',
        '\\textcolour': '\\textcolor',
        '\\sectoin': '\\section',
        '\\subsecton': '\\subsection',
        '\\labl': '\\label',
        '\\itme': '\\item',
        '\\captoin': '\\caption',
        '\\fract': '\\frac'
    };

    /* Frequently misspelled environment names (used only inside \begin/\end). */
    var ENVIRONMENT_TYPOS = {
        'itemise': 'itemize',
        'itmize': 'itemize',
        'enumarate': 'enumerate',
        'enumrate': 'enumerate',
        'equasion': 'equation',
        'eqution': 'equation',
        'tabluar': 'tabular',
        'figuer': 'figure',
        'centre': 'center'
    };

    /* A command and the package(s) that provide it. Any one of `packages`
       being loaded is enough — several commands come from more than one. */
    var PACKAGE_REQUIREMENTS = [
        { pattern: /\\includegraphics\b/, command: '\\includegraphics', packages: ['graphicx', 'graphics'] },
        { pattern: /\\textcolor\b/, command: '\\textcolor', packages: ['xcolor', 'color'] },
        { pattern: /\\colorbox\b/, command: '\\colorbox', packages: ['xcolor', 'color'] },
        { pattern: /\\href\b/, command: '\\href', packages: ['hyperref'] },
        { pattern: /\\url\b/, command: '\\url', packages: ['hyperref', 'url'] },
        { pattern: /\\SI\{|\\si\{|\\qty\{|\\num\{/, command: '\\SI / \\si / \\qty / \\num', packages: ['siunitx'] },
        { pattern: /\\toprule|\\midrule|\\bottomrule/, command: '\\toprule / \\midrule / \\bottomrule', packages: ['booktabs'] },
        { pattern: /\\multirow\b/, command: '\\multirow', packages: ['multirow'] },
        { pattern: /\\checkmark\b/, command: '\\checkmark', packages: ['amssymb', 'dingbat', 'bbding'] },
        { pattern: /\\lstinline|\\begin\{lstlisting\}/, command: '\\lstinline / lstlisting', packages: ['listings'] },
        { pattern: /\\begin\{align\}|\\begin\{align\*\}|\\begin\{gather\}|\\begin\{multline\}|\\text\{/, command: 'amsmath features (align, gather, \\text)', packages: ['amsmath'] }
    ];

    /* Environments whose body is typeset in math mode: inside them _, ^ and &
       are ordinary maths syntax rather than mistakes. */
    var MATH_ENVS = ['equation', 'displaymath', 'math', 'align', 'alignat', 'flalign',
        'gather', 'multline', 'eqnarray', 'split', 'aligned', 'alignedat', 'gathered',
        'cases', 'dcases', 'array', 'matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix',
        'Vmatrix', 'smallmatrix', 'subequations', 'IEEEeqnarray'];

    /* Environments where a bare & separates columns. */
    var ALIGN_ENVS = ['tabular', 'tabularx', 'tabulary', 'longtable', 'supertabular',
        'tabu', 'array', 'align', 'alignat', 'flalign', 'eqnarray', 'aligned', 'alignedat',
        'matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix', 'smallmatrix',
        'cases', 'dcases', 'IEEEeqnarray'];

    /* Environments reproduced verbatim: nothing inside them is LaTeX syntax,
       so the Doctor must not look at their contents at all. */
    var VERBATIM_ENVS = ['verbatim', 'Verbatim', 'BVerbatim', 'LVerbatim', 'lstlisting',
        'minted', 'alltt', 'comment', 'filecontents'];

    /* Commands that define macros: # is a parameter marker in their body. */
    var DEFINITION_COMMANDS = ['newcommand', 'renewcommand', 'providecommand',
        'DeclareRobustCommand', 'newenvironment', 'renewenvironment', 'def',
        'newcolumntype', 'DeclarePairedDelimiter'];

    /* Commands whose braced argument is a literal string (paths, labels, URLs),
       where _ and # are perfectly normal characters. */
    var LITERAL_ARG_COMMANDS = ['label', 'ref', 'pageref', 'eqref', 'autoref', 'cref',
        'Cref', 'cite', 'citep', 'citet', 'citeauthor', 'citeyear', 'nocite',
        'includegraphics', 'url', 'input', 'include', 'bibliography', 'bibliographystyle',
        'texttt', 'path', 'lstinputlisting', 'graphicspath', 'usepackage', 'documentclass',
        'RequirePackage'];

    function toSet(list) {
        var set = {};
        list.forEach(function (item) { set[item] = true; });
        return set;
    }

    function withStarVariants(names) {
        var all = [];
        names.forEach(function (name) {
            all.push(name);
            all.push(name + '*');
        });
        return all;
    }

    var MATH_ENV_SET = toSet(withStarVariants(MATH_ENVS));
    var ALIGN_ENV_SET = toSet(withStarVariants(ALIGN_ENVS));
    var VERBATIM_ENV_SET = toSet(withStarVariants(VERBATIM_ENVS));

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Builds a sorted array of character offsets where each line begins, so a
     * character index can be mapped to a line number in O(log n) instead of
     * rescanning the whole text for every issue found.
     */
    function computeLineStarts(text) {
        var starts = [0];
        for (var i = 0; i < text.length; i++) {
            if (text[i] === '\n') starts.push(i + 1);
        }
        return starts;
    }

    function lineIndexAt(lineStarts, index) {
        var lo = 0, hi = lineStarts.length - 1;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1;
        }
        return lo;
    }

    /** Sorts and merges ranges so membership can be tested by binary search. */
    function mergeRanges(ranges) {
        if (ranges.length < 2) return ranges.slice();
        var sorted = ranges.slice().sort(function (a, b) { return a[0] - b[0]; });
        var merged = [sorted[0].slice()];
        for (var i = 1; i < sorted.length; i++) {
            var last = merged[merged.length - 1];
            if (sorted[i][0] <= last[1]) {
                if (sorted[i][1] > last[1]) last[1] = sorted[i][1];
            } else {
                merged.push(sorted[i].slice());
            }
        }
        return merged;
    }

    /** Membership test over merged ranges — O(log n) per lookup. */
    function isInsideRange(merged, index) {
        var lo = 0, hi = merged.length - 1;
        while (lo <= hi) {
            var mid = (lo + hi) >> 1;
            if (index < merged[mid][0]) hi = mid - 1;
            else if (index >= merged[mid][1]) lo = mid + 1;
            else return true;
        }
        return false;
    }

    function blank(chars, start, end) {
        for (var i = Math.max(0, start); i < end && i < chars.length; i++) {
            if (chars[i] !== '\n') chars[i] = ' ';
        }
    }

    /**
     * Produces a copy of the source in which everything LaTeX does not read as
     * syntax — comment text and verbatim bodies — is replaced by spaces.
     * Newlines are kept, so every character index (and therefore every reported
     * line and column) still matches the original source exactly.
     */
    function maskNonCode(text) {
        var chars = text.split('');
        var i;

        // 1. Verbatim environments: blank the body, keep \begin / \end.
        var envRegex = /\\begin\s*\{([^{}]*)\}/g;
        var m;
        while ((m = envRegex.exec(text)) !== null) {
            var name = m[1].trim();
            if (!VERBATIM_ENV_SET[name]) continue;
            var closing = '\\end{' + name + '}';
            var bodyStart = m.index + m[0].length;
            var closeIdx = text.indexOf(closing, bodyStart);
            var bodyEnd = closeIdx === -1 ? text.length : closeIdx;
            blank(chars, bodyStart, bodyEnd);
            envRegex.lastIndex = bodyEnd;
        }

        // 2. \verb<delim>...<delim> and \lstinline<delim>...<delim>.
        var verbRegex = /\\(?:verb|lstinline)\*?(?:\[[^\]]*\])?([^A-Za-z0-9\s])/g;
        var v;
        while ((v = verbRegex.exec(text)) !== null) {
            var start = v.index + v[0].length;
            var end = text.indexOf(v[1], start);
            if (end === -1) end = text.indexOf('\n', start);
            if (end === -1) end = text.length;
            blank(chars, v.index, end + 1);
            verbRegex.lastIndex = end + 1;
        }

        // 3. Comments: from an unescaped % to the end of the line.
        var inComment = false;
        for (i = 0; i < chars.length; i++) {
            if (chars[i] === '\n') { inComment = false; continue; }
            if (inComment) { chars[i] = ' '; continue; }
            if (chars[i] === '\\') { i++; continue; }
            if (chars[i] === '%') { inComment = true; chars[i] = ' '; }
        }

        return chars.join('');
    }

    /** Returns the index just past the group that starts with `{` at `open`. */
    function skipGroup(code, open) {
        var depth = 0;
        var i = open;
        while (i < code.length) {
            if (code[i] === '\\') { i += 2; continue; }
            if (code[i] === '{') depth++;
            else if (code[i] === '}') {
                depth--;
                if (depth === 0) return i + 1;
            }
            i++;
        }
        return code.length;
    }

    /**
     * Finds the index ranges of macro definitions, where # introduces a
     * parameter and must not be flagged as an unescaped special character.
     */
    function findDefinitionRanges(code) {
        var ranges = [];
        var regex = new RegExp('\\\\(?:' + DEFINITION_COMMANDS.join('|') + ')\\b\\*?', 'g');
        var m;
        while ((m = regex.exec(code)) !== null) {
            var pos = m.index + m[0].length;
            // \def\foo#1#2{...} — step over the macro name and parameter text.
            while (pos < code.length && code[pos] !== '{' && code[pos] !== '[' && /[\\A-Za-z0-9#\s]/.test(code[pos])) pos++;
            var groups = 0;
            while (pos < code.length && groups < 4) {
                var ch = code[pos];
                if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { pos++; continue; }
                if (ch === '[') {
                    var closeBracket = code.indexOf(']', pos);
                    if (closeBracket === -1) break;
                    pos = closeBracket + 1;
                    continue;
                }
                if (ch === '{') {
                    pos = skipGroup(code, pos);
                    groups++;
                    continue;
                }
                break;
            }
            ranges.push([m.index, pos]);
            regex.lastIndex = Math.max(pos, regex.lastIndex);
        }
        return ranges;
    }

    /**
     * Finds index ranges of braced arguments where a literal underscore or hash
     * is normal (file paths, labels, references, URLs) rather than a mistake.
     */
    function findLiteralArgumentRanges(code) {
        var ranges = [];
        var cmdRegex = new RegExp('\\\\(?:' + LITERAL_ARG_COMMANDS.join('|') + ')\\*?(?:\\[[^\\]]*\\])?\\{', 'g');
        var m;
        while ((m = cmdRegex.exec(code)) !== null) {
            var openIdx = m.index + m[0].length - 1;
            var end = skipGroup(code, openIdx);
            ranges.push([openIdx + 1, end - 1]);
            cmdRegex.lastIndex = end;
        }
        // \href{url}{text}: both arguments are typed by hand and often hold _.
        var hrefRegex = /\\href(?:\[[^\]]*\])?\{/g;
        var h;
        while ((h = hrefRegex.exec(code)) !== null) {
            var firstOpen = h.index + h[0].length - 1;
            var firstEnd = skipGroup(code, firstOpen);
            ranges.push([firstOpen + 1, firstEnd - 1]);
            var next = firstEnd;
            while (next < code.length && /\s/.test(code[next])) next++;
            if (code[next] === '{') {
                var secondEnd = skipGroup(code, next);
                ranges.push([next + 1, secondEnd - 1]);
                next = secondEnd;
            }
            hrefRegex.lastIndex = Math.max(next, hrefRegex.lastIndex);
        }
        return ranges;
    }

    /**
     * Walks the source and returns a list of issues, each with a line, a
     * column, the character index it was found at and a plain-English message.
     */
    function analyze(text) {
        var issues = [];
        var lineStarts = computeLineStarts(text);
        var code = maskNonCode(text);

        function addIssue(index, severity, message) {
            var safeIndex = Math.max(0, Math.min(index, text.length));
            var lineIdx = lineIndexAt(lineStarts, safeIndex);
            issues.push({
                index: safeIndex,
                line: lineIdx + 1,
                column: safeIndex - lineStarts[lineIdx] + 1,
                severity: severity,
                message: message
            });
        }

        // --- Pass 1: character scan for braces and math delimiters ---
        var braceStack = [];
        var mathStack = [];  // entries: { type: '$' | '$$' | '\\[' | '\\(', index }
        var mathRanges = []; // index ranges of *closed* math spans
        var i = 0;
        var len = code.length;

        while (i < len) {
            var ch = code[i];
            var pair = code.substr(i, 2);

            // \[, \], \( and \) are structural math delimiters, so they must be
            // handled before the generic backslash-escape branch below —
            // otherwise that branch would swallow them.
            if (pair === '\\[' || pair === '\\(') {
                mathStack.push({ type: pair, index: i });
                i += 2;
                continue;
            }

            if (pair === '\\]' || pair === '\\)') {
                var wanted = pair === '\\]' ? '\\[' : '\\(';
                var openTop = mathStack[mathStack.length - 1];
                if (openTop && openTop.type === wanted) {
                    mathStack.pop();
                    mathRanges.push([openTop.index, i + 2]);
                } else {
                    addIssue(i, 'error', 'Found <code>' + escapeHtml(pair) + '</code> with no matching <code>' +
                        escapeHtml(wanted) + '</code> before it.');
                }
                i += 2;
                continue;
            }

            if (ch === '\\') {
                // An escaped character (\%, \&, \#, \_, \$, \{, \}) or the start
                // of a command name — either way the next character is not
                // structural syntax.
                i += 2;
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
                var top = mathStack[mathStack.length - 1];
                if (top && (top.type === '$' || top.type === '$$')) {
                    // A run of $ closes whatever is currently open: in "$a$$b$"
                    // the second $ ends the first inline formula.
                    mathStack.pop();
                    mathRanges.push([top.index, i + top.type.length]);
                    i += top.type.length;
                } else {
                    var token = code[i + 1] === '$' ? '$$' : '$';
                    mathStack.push({ type: token, index: i });
                    i += token.length;
                }
                continue;
            }

            i++;
        }

        braceStack.forEach(function (idx) {
            addIssue(idx, 'error', 'Unmatched opening brace <code>{</code> — it is never closed with a <code>}</code>.');
        });

        mathStack.forEach(function (entry) {
            addIssue(entry.index, 'error', 'Math mode opened with <code>' + escapeHtml(entry.type) +
                '</code> is never closed — LaTeX will report “Missing $ inserted”.');
        });

        // --- Pass 2: \begin{}/\end{} environment matching ---
        var envStack = [];
        var alignRanges = [];   // ranges where a bare & is expected syntax
        var mathEnvRanges = []; // ranges where _ ^ and & are maths, not mistakes
        var abandoned = {};     // environments closed out of order
        var envRegex = /\\(begin|end)\s*\{([^{}]*)\}/g;
        var match;

        function recordEnvRange(name, start, end) {
            if (ALIGN_ENV_SET[name]) alignRanges.push([start, end]);
            if (MATH_ENV_SET[name]) mathEnvRanges.push([start, end]);
        }

        while ((match = envRegex.exec(code)) !== null) {
            var kind = match[1];
            var name = match[2].trim();

            if (kind === 'begin') {
                envStack.push({ name: name, index: match.index });
                continue;
            }

            if (envStack.length === 0) {
                if (abandoned[name]) {
                    addIssue(match.index, 'error', '<code>\\end{' + escapeHtml(name) +
                        '}</code> comes too late — that environment was already forced shut by an <code>\\end{...}</code> above.');
                } else {
                    addIssue(match.index, 'error', '<code>\\end{' + escapeHtml(name) +
                        '}</code> has no matching <code>\\begin{' + escapeHtml(name) + '}</code> before it.');
                }
                continue;
            }

            var last = envStack[envStack.length - 1];
            if (last.name === name) {
                envStack.pop();
                recordEnvRange(name, last.index, match.index + match[0].length);
                continue;
            }

            var foundIdx = -1;
            for (var k = envStack.length - 1; k >= 0; k--) {
                if (envStack[k].name === name) { foundIdx = k; break; }
            }
            if (foundIdx >= 0) {
                addIssue(match.index, 'error', '<code>\\end{' + escapeHtml(name) + '}</code> found, but <code>\\begin{' +
                    escapeHtml(last.name) + '}</code> is still open. Close inner environments before this one.');
                for (var d = envStack.length - 1; d > foundIdx; d--) {
                    abandoned[envStack[d].name] = true;
                    recordEnvRange(envStack[d].name, envStack[d].index, match.index);
                }
                recordEnvRange(name, envStack[foundIdx].index, match.index + match[0].length);
                envStack.length = foundIdx;
            } else {
                addIssue(match.index, 'error', '<code>\\begin{' + escapeHtml(last.name) + '}</code> is closed with <code>\\end{' +
                    escapeHtml(name) + '}</code> — the two names must match.');
                recordEnvRange(last.name, last.index, match.index + match[0].length);
                envStack.pop();
            }
        }

        envStack.forEach(function (entry) {
            addIssue(entry.index, 'error', '<code>\\begin{' + escapeHtml(entry.name) +
                '}</code> is never closed with <code>\\end{' + escapeHtml(entry.name) + '}</code>.');
            // Treat it as running to the end of the source, so its contents do
            // not trigger a second wave of misleading warnings.
            recordEnvRange(entry.name, entry.index, code.length);
        });

        // --- Pass 3: document scaffolding ---
        // A missing \end{document} is already reported by the environment
        // matching above — "document" is just another environment.
        var documentClassIdx = code.search(/\\documentclass\s*(\[[^\]]*\])?\s*\{[^{}]*\}/);
        var beginDocumentIdx = code.search(/\\begin\s*\{document\}/);

        if (beginDocumentIdx !== -1 && documentClassIdx === -1) {
            addIssue(beginDocumentIdx, 'error',
                'No <code>\\documentclass{...}</code> found — every complete document must start with one.');
        }
        if (documentClassIdx !== -1 && beginDocumentIdx === -1) {
            addIssue(documentClassIdx, 'error',
                'There is a <code>\\documentclass</code> but no <code>\\begin{document}</code>, so nothing would be typeset.');
        }

        // --- Pass 4: unescaped special characters ---
        var literalRanges = mergeRanges(findLiteralArgumentRanges(code));
        var definitionRanges = mergeRanges(findDefinitionRanges(code));
        var closedMathRanges = mergeRanges(mathRanges);
        var mergedMathEnvRanges = mergeRanges(mathEnvRanges);
        var mergedAlignRanges = mergeRanges(alignRanges);
        var specialCharRegex = /[&_#]/g;
        var s;

        while ((s = specialCharRegex.exec(code)) !== null) {
            var idx = s.index;
            var symbol = s[0];

            // Count the backslashes in front: an odd number means it is escaped.
            var slashes = 0;
            var back = idx - 1;
            while (back >= 0 && code[back] === '\\') { slashes++; back--; }
            if (slashes % 2 === 1) continue;

            if (isInsideRange(closedMathRanges, idx)) continue;
            if (isInsideRange(mergedMathEnvRanges, idx)) continue;
            if (symbol === '&' && isInsideRange(mergedAlignRanges, idx)) continue;
            if (symbol !== '&' && isInsideRange(literalRanges, idx)) continue;
            if (symbol === '#' && isInsideRange(definitionRanges, idx)) continue;

            var advice = symbol === '&'
                ? 'A bare <code>&amp;</code> is only meaningful inside an alignment environment such as <code>tabular</code> or <code>align</code>. Write <code>\\&amp;</code> for a literal ampersand.'
                : symbol === '_'
                    ? 'A bare <code>_</code> outside math mode causes “Missing $ inserted”. Write <code>\\_</code> for a literal underscore, or put the expression in <code>$...$</code>.'
                    : 'A bare <code>#</code> is only a parameter marker inside a macro definition. Write <code>\\#</code> for a literal hash.';
            addIssue(idx, 'warning', advice);
        }

        // --- Pass 5: typo detection ---
        Object.keys(COMMAND_TYPOS).forEach(function (typo) {
            var typoRegex = new RegExp(escapeRegExp(typo) + '(?![a-zA-Z])', 'g');
            var t;
            while ((t = typoRegex.exec(code)) !== null) {
                addIssue(t.index, 'warning', 'Possible typo: <code>' + escapeHtml(typo) + '</code> — did you mean <code>' +
                    escapeHtml(COMMAND_TYPOS[typo]) + '</code>?');
            }
        });

        var envNameRegex = /\\(?:begin|end)\s*\{([^{}]*)\}/g;
        var e;
        while ((e = envNameRegex.exec(code)) !== null) {
            var envName = e[1].trim();
            var base = envName.replace(/\*$/, '');
            if (ENVIRONMENT_TYPOS[base]) {
                addIssue(e.index, 'warning', 'Unknown environment <code>' + escapeHtml(envName) + '</code> — did you mean <code>' +
                    escapeHtml(ENVIRONMENT_TYPOS[base] + (envName.slice(-1) === '*' ? '*' : '')) + '</code>?');
            }
        }

        // --- Pass 6: missing package suggestions ---
        PACKAGE_REQUIREMENTS.forEach(function (req) {
            var firstUse = code.search(req.pattern);
            if (firstUse === -1) return;
            var loaded = req.packages.some(function (pkg) {
                var usePkgRegex = new RegExp('\\\\(?:usepackage|RequirePackage)\\s*(?:\\[[^\\]]*\\])?\\s*\\{[^{}]*\\b' +
                    escapeRegExp(pkg) + '\\b[^{}]*\\}');
                return usePkgRegex.test(code);
            });
            if (loaded) return;
            var alternatives = req.packages.length > 1
                ? ' (or <code>' + req.packages.slice(1).map(escapeHtml).join('</code> / <code>') + '</code>)'
                : '';
            addIssue(firstUse, 'warning', 'Uses <code>' + escapeHtml(req.command) + '</code> but no <code>\\usepackage{' +
                escapeHtml(req.packages[0]) + '}</code>' + alternatives + ' was found.');
        });

        // Sort by position (errors first within a position) and drop duplicates.
        issues.sort(function (a, b) {
            if (a.index !== b.index) return a.index - b.index;
            if (a.severity === b.severity) return 0;
            return a.severity === 'error' ? -1 : 1;
        });
        var seen = {};
        return issues.filter(function (issue) {
            var key = issue.index + '|' + issue.message;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    /* ---------------------------------------------------------------- UI --- */

    var lastIssues = [];
    var escapePressed = false;
    var debounceTimer = null;

    function setStatus(label, kind) {
        statusChip.textContent = label;
        statusChip.className = 'status-chip status-' + kind;
    }

    function sourceLine(text, lineNumber) {
        var lines = text.split('\n');
        return lines[lineNumber - 1] === undefined ? '' : lines[lineNumber - 1];
    }

    function focusLine(issue) {
        var lines = texInput.value.split('\n');
        var start = 0;
        for (var i = 0; i < issue.line - 1 && i < lines.length; i++) start += lines[i].length + 1;
        var lineText = lines[issue.line - 1] || '';
        texInput.focus();
        texInput.setSelectionRange(start, start + lineText.length);
        var lineHeight = parseFloat(window.getComputedStyle(texInput).lineHeight) || 20;
        texInput.scrollTop = Math.max(0, (issue.line - 3) * lineHeight);
    }

    function renderResults(issues, text) {
        lastIssues = issues;
        results.innerHTML = '';
        copyBtn.disabled = issues.length === 0;

        if (issues.length === 0) {
            setStatus('Looks healthy', 'ok');
            var banner = document.createElement('div');
            banner.className = 'success-banner';
            banner.innerHTML = '<span aria-hidden="true">✅</span> <span>No syntax errors or common mistakes found. ' +
                'The Doctor only reads your source — it cannot tell whether the packages you use are installed, ' +
                'so a real compile is still the final word.</span>';
            results.appendChild(banner);
            return;
        }

        var errorCount = issues.filter(function (x) { return x.severity === 'error'; }).length;
        var warnCount = issues.length - errorCount;
        var parts = [];
        if (errorCount) parts.push(errorCount + ' error' + (errorCount === 1 ? '' : 's'));
        if (warnCount) parts.push(warnCount + ' warning' + (warnCount === 1 ? '' : 's'));
        setStatus(parts.join(', '), errorCount > 0 ? 'error' : 'warn');

        var list = document.createElement('ul');
        list.className = 'issue-list';

        issues.forEach(function (issue) {
            var li = document.createElement('li');
            li.className = 'issue issue-' + issue.severity;

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'issue-jump';
            button.title = 'Jump to line ' + issue.line + ' in the editor';

            var lineLabel = document.createElement('span');
            lineLabel.className = 'issue-line';
            lineLabel.textContent = (issue.severity === 'error' ? '✗ Error' : '⚠ Warning') +
                ' · line ' + issue.line + ', column ' + issue.column;

            var message = document.createElement('span');
            message.className = 'issue-message';
            message.innerHTML = issue.message;

            button.appendChild(lineLabel);
            button.appendChild(message);

            var snippetText = sourceLine(text, issue.line).replace(/\t/g, '    ');
            if (snippetText.trim()) {
                var snippet = document.createElement('code');
                snippet.className = 'issue-snippet';
                snippet.textContent = snippetText.length > 160 ? snippetText.slice(0, 157) + '…' : snippetText;
                button.appendChild(snippet);
            }

            button.addEventListener('click', function () { focusLine(issue); });
            li.appendChild(button);
            list.appendChild(li);
        });

        results.appendChild(list);
    }

    function showEmptyState() {
        lastIssues = [];
        copyBtn.disabled = true;
        setStatus('Waiting for input', 'idle');
        results.innerHTML = PLACEHOLDER;
    }

    function saveDraft(text) {
        try {
            if (text) window.localStorage.setItem(STORAGE_KEY, text);
            else window.localStorage.removeItem(STORAGE_KEY);
        } catch (err) { /* private mode or storage full — not fatal */ }
    }

    function loadDraft() {
        try { return window.localStorage.getItem(STORAGE_KEY) || ''; } catch (err) { return ''; }
    }

    function runDiagnosis() {
        var text = texInput.value;
        saveDraft(text);
        if (!text.trim()) {
            showEmptyState();
            return;
        }
        renderResults(analyze(text), text);
    }

    function reportAsText() {
        if (!lastIssues.length) return '';
        return lastIssues.map(function (issue) {
            var plain = issue.message
                .replace(/<[^>]+>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');
            return (issue.severity === 'error' ? 'Error' : 'Warning') + ' · line ' + issue.line +
                ', column ' + issue.column + ': ' + plain;
        }).join('\n');
    }

    function updateSampleButton() {
        sampleBtn.textContent = texInput.value === BROKEN_SAMPLE ? 'Load healthy sample' : 'Load broken sample';
    }

    if (texInput) {
        texInput.addEventListener('input', function () {
            window.clearTimeout(debounceTimer);
            setStatus('Checking…', 'idle');
            // Wait a little longer on very large documents so typing stays smooth.
            var delay = texInput.value.length > 200000 ? 700 : 250;
            debounceTimer = window.setTimeout(runDiagnosis, delay);
        });

        texInput.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                escapePressed = true;
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                window.clearTimeout(debounceTimer);
                runDiagnosis();
                return;
            }

            // Tab indents instead of leaving the editor. Press Esc first if you
            // want Tab to move focus onwards (keyboard-accessible escape hatch).
            if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey && !escapePressed) {
                event.preventDefault();
                var start = texInput.selectionStart;
                var end = texInput.selectionEnd;
                texInput.value = texInput.value.slice(0, start) + '\t' + texInput.value.slice(end);
                texInput.setSelectionRange(start + 1, start + 1);
                window.clearTimeout(debounceTimer);
                runDiagnosis();
                return;
            }

            if (event.key !== 'Tab') escapePressed = false;
        });

        texInput.addEventListener('blur', function () { escapePressed = false; });
    }

    checkBtn.addEventListener('click', function () {
        window.clearTimeout(debounceTimer);
        runDiagnosis();
        texInput.focus();
    });

    clearBtn.addEventListener('click', function () {
        texInput.value = '';
        saveDraft('');
        updateSampleButton();
        showEmptyState();
        texInput.focus();
    });

    sampleBtn.addEventListener('click', function () {
        texInput.value = texInput.value === BROKEN_SAMPLE ? HEALTHY_SAMPLE : BROKEN_SAMPLE;
        updateSampleButton();
        window.clearTimeout(debounceTimer);
        runDiagnosis();
        texInput.focus();
        texInput.setSelectionRange(0, 0);
        texInput.scrollTop = 0;
    });

    copyBtn.addEventListener('click', function () {
        var report = reportAsText();
        if (!report) return;

        var original = copyBtn.getAttribute('data-label') || copyBtn.textContent;
        copyBtn.setAttribute('data-label', original);

        function done() {
            copyBtn.textContent = 'Copied ✓';
            window.setTimeout(function () { copyBtn.textContent = original; }, 1500);
        }

        function fallbackCopy() {
            var helper = document.createElement('textarea');
            helper.value = report;
            helper.setAttribute('readonly', '');
            helper.style.position = 'fixed';
            helper.style.left = '-9999px';
            document.body.appendChild(helper);
            helper.select();
            try {
                document.execCommand('copy');
                done();
            } catch (err) {
                copyBtn.textContent = 'Copy failed';
                window.setTimeout(function () { copyBtn.textContent = original; }, 1500);
            }
            document.body.removeChild(helper);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(report).then(done, fallbackCopy);
        } else {
            fallbackCopy();
        }
    });

    // Restore whatever the visitor was working on last time.
    var draft = loadDraft();
    if (draft) {
        texInput.value = draft;
        runDiagnosis();
    } else {
        showEmptyState();
    }
    updateSampleButton();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { analyze: analyze };
    }
})();
