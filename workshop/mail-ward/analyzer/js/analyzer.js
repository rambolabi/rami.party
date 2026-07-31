/* ============================================================================
   analyzer.js — core logic ("the intelligence").
   Parsing, SPF/DKIM/DMARC/ARC evaluation, heuristics, MIME parsing, body
   preview, attachments, timeline, export and all UI wiring.

   Load order (see index.html):
     data-*.js  →  lookups.js  →  analyzer.js
   Data lists (brands, TLDs, IANA snapshot, example) and the external-lookup
   intelligence live in their own files and are referenced here as globals.
   ============================================================================ */

// DOM Elements
const pasteBtn = document.getElementById('pasteBtn');
const toggleTextbox = document.getElementById('toggleTextbox');
const textboxContainer = document.getElementById('textboxContainer');
const headersInput = document.getElementById('headersInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const resetBtn = document.getElementById('resetBtn');
const copyReportBtn = document.getElementById('copyReportBtn');
const results = document.getElementById('results');
const emptyState = document.getElementById('emptyState');
const securityChecks = document.getElementById('securityChecks');
const senderInfo = document.getElementById('senderInfo');
const relayTimeline = document.getElementById('relayTimeline');
const allHeaders = document.getElementById('allHeaders');
const themeSelect = document.getElementById('themeSelect');
const toastEl = document.getElementById('toast');

// New investigation / preview / export elements
const dropZone = document.getElementById('dropZone');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportMdBtn = document.getElementById('exportMdBtn');
const investigationSection = document.getElementById('investigationSection');
const investigationContent = document.getElementById('investigationContent');
const attachmentsSection = document.getElementById('attachmentsSection');
const attachmentsList = document.getElementById('attachmentsList');
const previewSection = document.getElementById('previewSection');
const previewContainer = document.getElementById('previewContainer');
const previewTextBtn = document.getElementById('previewTextBtn');
const previewSafeBtn = document.getElementById('previewSafeBtn');
const previewRawBtn = document.getElementById('previewRawBtn');

// Keep the latest analysis around for the "Copy summary" / export actions
let lastChecks = [];
let lastAnalysis = null;   // { headers, checks, relays, transit, body }
let lastBody = null;       // { html, text } extracted from a full email

const VALID_THEMES = ['light', 'dark', 'midnight', 'nord', 'solarized', 'matrix'];

// Theme Management
function applyTheme(theme) {
    const safeTheme = VALID_THEMES.includes(theme) ? theme : 'light';
    document.documentElement.setAttribute('data-theme', safeTheme);
    if (themeSelect) themeSelect.value = safeTheme;
    try {
        localStorage.setItem('theme', safeTheme);
    } catch (err) {
        /* localStorage may be unavailable (private mode) — ignore */
    }
}

function initTheme() {
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme') || 'light';
    } catch (err) {
        /* ignore */
    }
    // Migrate old boolean-style value
    if (savedTheme === 'true') savedTheme = 'dark';
    applyTheme(savedTheme);
}

if (themeSelect) {
    themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
}

// Initialize theme on page load
initTheme();

// Toast helper
let toastTimer = null;
function showToast(message, type = '') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.className = 'toast' + (type ? ' ' + type : '');
    }, 3000);
}

// Read from clipboard with graceful fallback
async function readClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('unsupported');
    }
    return navigator.clipboard.readText();
}

function openTextbox() {
    textboxContainer.classList.remove('hidden');
    textboxContainer.classList.add('visible');
    toggleTextbox.classList.add('active');
    toggleTextbox.setAttribute('aria-expanded', 'true');
}

// Toggle textbox visibility
toggleTextbox.addEventListener('click', () => {
    const isHidden = textboxContainer.classList.contains('hidden');
    textboxContainer.classList.toggle('hidden');
    textboxContainer.classList.toggle('visible');
    toggleTextbox.classList.toggle('active');
    toggleTextbox.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) headersInput.focus();
});

// Paste from clipboard when button clicked
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await readClipboard();
        if (!text || !text.trim()) {
            showToast('Clipboard is empty. Paste headers manually instead.', 'error');
            openTextbox();
            return;
        }
        analyzeHeaders(text);
    } catch (err) {
        showToast('Clipboard access blocked. Paste headers manually below.', 'error');
        openTextbox();
        headersInput.focus();
    }
});

// Analyze button click
analyzeBtn.addEventListener('click', () => {
    const text = headersInput.value;
    if (text.trim()) {
        analyzeHeaders(text);
    } else {
        showToast('Nothing to analyze — paste some headers first.', 'error');
    }
});

// Clear the manual input
clearBtn.addEventListener('click', () => {
    headersInput.value = '';
    headersInput.focus();
});

// Clear the rendered results
function resetResults() {
    results.classList.add('hidden');
    emptyState.classList.remove('hidden');
    securityChecks.innerHTML = '';
    senderInfo.innerHTML = '';
    relayTimeline.innerHTML = '';
    allHeaders.innerHTML = '';
    if (investigationContent) investigationContent.innerHTML = '';
    if (investigationSection) investigationSection.classList.add('hidden');
    if (attachmentsList) attachmentsList.innerHTML = '';
    if (attachmentsSection) attachmentsSection.classList.add('hidden');
    if (previewContainer) previewContainer.innerHTML = '';
    if (previewSection) previewSection.classList.add('hidden');
    lastChecks = [];
    lastAnalysis = null;
    lastBody = null;
}

if (resetBtn) resetBtn.addEventListener('click', resetResults);

// Copy the security summary to the clipboard
if (copyReportBtn) {
    copyReportBtn.addEventListener('click', async () => {
        if (!lastChecks.length) {
            showToast('Nothing to copy yet.', 'error');
            return;
        }
        const report = lastChecks.map(c => `${c.label}: ${c.value}`).join('\n');
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                throw new Error('unsupported');
            }
            await navigator.clipboard.writeText(report);
            showToast('Summary copied to clipboard.', 'success');
        } catch (err) {
            showToast('Could not copy — clipboard blocked.', 'error');
        }
    });
}

// Load an example message (EXAMPLE_EMAIL is defined in js/data-example.js)
if (loadExampleBtn) {
    loadExampleBtn.addEventListener('click', () => {
        openTextbox();
        headersInput.value = EXAMPLE_EMAIL;
        analyzeHeaders(EXAMPLE_EMAIL);
        showToast('Loaded a phishing-style example.', 'success');
    });
}

// Export handlers
if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
        if (!lastAnalysis) { showToast('Nothing to export yet.', 'error'); return; }
        downloadFile('email-header-report.json', JSON.stringify(buildReportObject(), null, 2), 'application/json');
    });
}
if (exportMdBtn) {
    exportMdBtn.addEventListener('click', () => {
        if (!lastAnalysis) { showToast('Nothing to export yet.', 'error'); return; }
        downloadFile('email-header-report.md', buildMarkdownReport(), 'text/markdown');
    });
}

// Drag & drop a .eml / .txt file anywhere on the page
['dragenter', 'dragover'].forEach(evt => {
    document.addEventListener(evt, (e) => {
        if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            if (dropZone) dropZone.classList.add('drag-over');
        }
    });
});
['dragleave', 'drop'].forEach(evt => {
    document.addEventListener(evt, (e) => {
        if (evt === 'dragleave' && e.relatedTarget) return;
        if (dropZone) dropZone.classList.remove('drag-over');
    });
});
document.addEventListener('drop', (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file.size > 5 * 1024 * 1024) {
        showToast('File too large (max 5 MB).', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        openTextbox();
        headersInput.value = String(reader.result);
        analyzeHeaders(String(reader.result));
        showToast(`Analyzed "${file.name}".`, 'success');
    };
    reader.onerror = () => showToast('Could not read that file.', 'error');
    reader.readAsText(file);
});

// Preview mode buttons
if (previewTextBtn) previewTextBtn.addEventListener('click', () => renderPreview('text'));
if (previewSafeBtn) previewSafeBtn.addEventListener('click', () => renderPreview('safe'));
if (previewRawBtn) previewRawBtn.addEventListener('click', () => {
    const ok = confirm('Raw preview allows scripts and remote content (tracking pixels, beacons, external images). This can notify the sender that you opened the email and may run active content.\n\nContinue?');
    if (ok) renderPreview('raw');
});

// Global Ctrl+V listener
document.addEventListener('keydown', async (e) => {
    const isPasteKey = (e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'v';
    const typingInField = document.activeElement === headersInput ||
        (document.activeElement && document.activeElement.tagName === 'SELECT');
    if (isPasteKey && !typingInField) {
        e.preventDefault();
        try {
            const text = await readClipboard();
            if (text && text.trim()) {
                analyzeHeaders(text);
            }
        } catch (err) {
            showToast('Clipboard access blocked. Paste headers manually below.', 'error');
            openTextbox();
        }
    }
});

// Parse email headers
function parseHeaders(headerText) {
    const headers = {};
    const lines = headerText.split('\n');
    let currentHeader = '';
    let currentValue = '';

    for (let line of lines) {
        // Check if line starts a new header (has a colon and doesn't start with whitespace)
        if (line.match(/^[\w-]+:/) && !line.startsWith(' ') && !line.startsWith('\t')) {
            // Save previous header
            if (currentHeader) {
                if (!headers[currentHeader]) {
                    headers[currentHeader] = [];
                }
                headers[currentHeader].push(currentValue.trim());
            }
            
            // Start new header
            const colonIndex = line.indexOf(':');
            currentHeader = line.substring(0, colonIndex).trim();
            currentValue = line.substring(colonIndex + 1).trim();
        } else {
            // Continuation of previous header
            currentValue += ' ' + line.trim();
        }
    }
    
    // Save last header
    if (currentHeader) {
        if (!headers[currentHeader]) {
            headers[currentHeader] = [];
        }
        headers[currentHeader].push(currentValue.trim());
    }

    return headers;
}

// Extract domain from email address
function extractDomain(email) {
    const match = email.match(/@([^\s>]+)/);
    return match ? match[1].toLowerCase() : '';
}

// Analyze headers
function analyzeHeaders(rawText) {
    if (!rawText.trim()) return;

    // A full email has headers, then a blank line, then the body.
    const { headerText, body } = splitEmail(rawText);
    const headers = parseHeaders(headerText);

    // Hide empty state, show results
    emptyState.classList.add('hidden');
    results.classList.remove('hidden');

    // Analyze security
    const checks = displaySecurityChecks(headers);

    // Display sender info
    displaySenderInfo(headers);

    // External lookup shortcuts (opt-in)
    displayInvestigation(headers);

    // Display relay timeline (returns parsed relays + transit info)
    const timeline = displayRelayTimeline(headers);

    // Parse MIME body: attachments + preview
    const mime = parseMime(headers, body);
    displayAttachments(mime.attachments);
    displayPreview(mime);

    // Display all headers
    displayAllHeaders(headers);

    lastAnalysis = { headers, checks, timeline, hasBody: !!body };
}

// Display security checks
function displaySecurityChecks(headers) {
    securityChecks.innerHTML = '';

    const checks = [];
    // Merge ALL Authentication-Results headers (there can be several, one per hop)
    const authResults = getAllHeaderValues(headers, 'Authentication-Results').join(' ; ');
    const from = getHeader(headers, 'From');
    const fromDomain = from ? extractDomain(from) : '';

    // Parse Authentication-Results
    const authData = parseAuthenticationResults(authResults);

    // SPF Authentication Check
    let spfAuthStatus = 'neutral';
    let spfAuthValue = 'Not found';
    if (authData.spf.result) {
        if (authData.spf.result === 'pass') {
            spfAuthStatus = 'pass';
            spfAuthValue = 'Pass ✓';
        } else if (authData.spf.result === 'fail') {
            spfAuthStatus = 'fail';
            spfAuthValue = 'Failed ✗';
        } else if (authData.spf.result === 'softfail') {
            spfAuthStatus = 'warning';
            spfAuthValue = 'Soft Fail ~';
        } else {
            spfAuthStatus = 'warning';
            spfAuthValue = authData.spf.result;
        }
    }
    checks.push({ label: 'SPF Authentication', value: spfAuthValue, status: spfAuthStatus });

    // SPF Alignment Check
    let spfAlignStatus = 'neutral';
    let spfAlignValue = 'Unknown';
    
    // Get Return-Path and check SPF alignment
    const returnPath = getHeader(headers, 'Return-Path');
    const returnDomain = returnPath ? extractDomain(returnPath) : null;
    const spfAuthDomain = authData.spf.domain || returnDomain;
    
    if (spfAuthDomain && fromDomain) {
        // Compare domains - SPF alignment requires the authenticated domain to match From domain
        const spfDomainLower = spfAuthDomain.toLowerCase();
        const fromDomainLower = fromDomain.toLowerCase();
        
        // Check exact match or organizational domain match
        if (spfDomainLower === fromDomainLower) {
            spfAlignStatus = 'pass';
            spfAlignValue = 'Aligned ✓';
        } else if (spfDomainLower.endsWith('.' + fromDomainLower) || fromDomainLower.endsWith('.' + spfDomainLower)) {
            // Subdomain alignment (relaxed mode)
            spfAlignStatus = 'warning';
            spfAlignValue = `Relaxed Alignment ⚠ (${spfAuthDomain})`;
        } else {
            spfAlignStatus = 'fail';
            spfAlignValue = `Domain Mismatch ✗ (auth: ${spfAuthDomain}, from: ${fromDomain})`;
        }
    } else if (authData.spf.result === 'pass' && !spfAuthDomain) {
        spfAlignStatus = 'warning';
        spfAlignValue = 'Cannot determine domain';
    } else if (!fromDomain) {
        spfAlignStatus = 'neutral';
        spfAlignValue = 'No From domain';
    }
    
    checks.push({ label: 'SPF Alignment', value: spfAlignValue, status: spfAlignStatus });

    // DKIM Authentication Check - check for aligned signature
    let dkimAuthStatus = 'neutral';
    let dkimAuthValue = 'Not found';
    let alignedDkimSignature = null;
    
    // Check for composite authentication failures early
    const compauthFailedEarly = authData.compauth && authData.compauth.result === 'fail';
    const dmarcFailedEarly = authData.dmarc && (authData.dmarc.result === 'fail' || authData.dmarc.result === 'none');
    
    if (authData.dkim.signatures.length > 0) {
        // Find signature that matches From domain
        alignedDkimSignature = authData.dkim.signatures.find(sig => 
            sig.domain.toLowerCase() === fromDomain.toLowerCase() ||
            fromDomain.toLowerCase().endsWith('.' + sig.domain.toLowerCase()) ||
            sig.domain.toLowerCase().endsWith('.' + fromDomain.toLowerCase())
        );
        
        authData.dkim.alignedSignature = alignedDkimSignature;
        
        if (alignedDkimSignature) {
            // Found aligned signature - check its result and composite auth
            if (alignedDkimSignature.result === 'pass') {
                // Check if composite authentication failed
                if (compauthFailedEarly || dmarcFailedEarly) {
                    dkimAuthStatus = 'fail';
                    let reasons = [];
                    if (compauthFailedEarly && authData.compauth.reason) {
                        reasons.push(`compauth fail (${authData.compauth.reason})`);
                    } else if (compauthFailedEarly) {
                        reasons.push('compauth fail');
                    }
                    if (dmarcFailedEarly) {
                        reasons.push(`dmarc ${authData.dmarc.result}`);
                    }
                    dkimAuthValue = `Failed ✗ (${alignedDkimSignature.domain}: ${reasons.join(', ')})`;
                } else {
                    dkimAuthStatus = 'pass';
                    dkimAuthValue = `Pass ✓ (${alignedDkimSignature.domain})`;
                }
            } else if (alignedDkimSignature.result === 'fail') {
                dkimAuthStatus = 'fail';
                dkimAuthValue = `Failed ✗ (no key for ${alignedDkimSignature.domain})`;
            } else {
                dkimAuthStatus = 'fail';
                dkimAuthValue = `${alignedDkimSignature.result} (${alignedDkimSignature.domain})`;
            }
        } else {
            // No aligned signature found
            const passedSignatures = authData.dkim.signatures.filter(sig => sig.result === 'pass');
            if (passedSignatures.length > 0) {
                // Even unaligned signatures fail if compauth fails
                if (compauthFailedEarly || dmarcFailedEarly) {
                    dkimAuthStatus = 'fail';
                    let reasons = [];
                    if (compauthFailedEarly) reasons.push('compauth fail');
                    if (dmarcFailedEarly) reasons.push(`dmarc ${authData.dmarc.result}`);
                    dkimAuthValue = `Failed ✗ (${passedSignatures.map(s => s.domain).join(', ')}: ${reasons.join(', ')})`;
                } else {
                    dkimAuthStatus = 'warning';
                    dkimAuthValue = `Pass but no aligned signature (${passedSignatures.map(s => s.domain).join(', ')})`;
                }
            } else {
                dkimAuthStatus = 'fail';
                dkimAuthValue = 'No valid signatures';
            }
        }
    }
    checks.push({ label: 'DKIM Authentication', value: dkimAuthValue, status: dkimAuthStatus });

    // DKIM Alignment Check
    let dkimAlignStatus = 'neutral';
    let dkimAlignValue = 'Unknown';
    
    // Check for composite authentication failures (Microsoft)
    const compauthFailed = authData.compauth && authData.compauth.result === 'fail';
    const arcFailed = authData.arc && authData.arc.result === 'fail';
    const dmarcFailed = authData.dmarc && (authData.dmarc.result === 'fail' || authData.dmarc.result === 'none');
    
    if (authData.dkim.signatures.length > 0 && fromDomain) {
        if (alignedDkimSignature) {
            // We have an aligned signature - but check composite auth results
            if (alignedDkimSignature.result === 'pass') {
                // Even if signature passes, check composite authentication
                if (compauthFailed || dmarcFailed) {
                    dkimAlignStatus = 'fail';
                    let reasons = [];
                    if (compauthFailed && authData.compauth.reason) {
                        reasons.push(`compauth fail (${authData.compauth.reason})`);
                    } else if (compauthFailed) {
                        reasons.push('compauth fail');
                    }
                    if (dmarcFailed) {
                        reasons.push(`dmarc ${authData.dmarc.result}`);
                    }
                    if (arcFailed) {
                        reasons.push('arc fail');
                    }
                    dkimAlignValue = `Failed ✗ (${reasons.join(', ')})`;
                } else {
                    dkimAlignStatus = 'pass';
                    dkimAlignValue = 'Aligned ✓';
                }
            } else {
                dkimAlignStatus = 'fail';
                // Check for specific failure reasons
                const failureReason = alignedDkimSignature.reason || 'signature invalid';
                dkimAlignValue = `Aligned but ${failureReason} ✗`;
            }
        } else {
            // No aligned signature - show what domains we have
            const signatureDomains = authData.dkim.signatures.map(s => s.domain).join(', ');
            dkimAlignStatus = 'fail';
            dkimAlignValue = `No aligned signature ✗ (have: ${signatureDomains})`;
        }
    } else if (authData.dkim.signatures.length === 0) {
        dkimAlignStatus = 'fail';
        dkimAlignValue = 'No DKIM signatures found ✗';
    } else if (!fromDomain) {
        dkimAlignStatus = 'neutral';
        dkimAlignValue = 'No From domain';
    }
    
    checks.push({ label: 'DKIM Alignment', value: dkimAlignValue, status: dkimAlignStatus });
    
    // DKIM Body Hash Check - check for body hash verification failures
    let bodyHashCheckAdded = false;
    if (authData.dkim.signatures.length > 0) {
        authData.dkim.signatures.forEach((sig, index) => {
            if (sig.reason && sig.reason.toLowerCase().includes('body')) {
                const bodyHashStatus = 'fail';
                const bodyHashValue = `Body Hash Not Verified ✗ - Message body was modified after signing (domain: ${sig.domain})`;
                checks.push({ label: 'DKIM Body Hash Verification', value: bodyHashValue, status: bodyHashStatus });
                bodyHashCheckAdded = true;
            }
        });
    }
    
    // Also check DKIM-Signature headers directly for body hash tag
    const dkimSignatures = headers['DKIM-Signature'] || headers['dkim-signature'] || [];
    if (!bodyHashCheckAdded && dkimSignatures.length > 0) {
        // Check if any DKIM signature failed in authentication results
        const failedDkimSigs = authData.dkim.signatures.filter(sig => 
            sig.result === 'fail' || sig.result === 'hardfail' || sig.result === 'temperror' || sig.result === 'permerror'
        );
        
        if (failedDkimSigs.length > 0) {
            // Parse DKIM-Signature to extract domain
            dkimSignatures.forEach(sigHeader => {
                const domainMatch = sigHeader.match(/d=([^;\s]+)/);
                const bhMatch = sigHeader.match(/bh=([^;\s]+)/);
                
                if (domainMatch && bhMatch) {
                    const sigDomain = domainMatch[1].toLowerCase();
                    const failedSig = failedDkimSigs.find(s => s.domain === sigDomain);
                    
                    if (failedSig && (!failedSig.reason || failedSig.reason.toLowerCase().includes('body'))) {
                        const bodyHashStatus = 'fail';
                        const bodyHashValue = `Body Hash Not Verified ✗ - Computed hash doesn't match bh= tag (domain: ${sigDomain})`;
                        checks.push({ label: 'DKIM Body Hash Verification', value: bodyHashValue, status: bodyHashStatus });
                        bodyHashCheckAdded = true;
                    }
                }
            });
        }
    }

    // DMARC Check
    let dmarcStatus = 'neutral';
    let dmarcValue = 'Not found';
    if (authData.dmarc.result) {
        if (authData.dmarc.result === 'pass') {
            dmarcStatus = 'pass';
            dmarcValue = 'Pass ✓';
        } else if (authData.dmarc.result === 'fail') {
            dmarcStatus = 'fail';
            dmarcValue = 'Failed ✗';
        } else if (authData.dmarc.result === 'none') {
            dmarcStatus = 'fail';
            dmarcValue = 'None ✗';
        } else {
            dmarcStatus = 'warning';
            dmarcValue = authData.dmarc.result;
        }
    }
    checks.push({ label: 'DMARC', value: dmarcValue, status: dmarcStatus });

    // Domain Check (returnPath already retrieved in SPF alignment check above)
    let domainStatus = 'neutral';
    let domainValue = 'Unknown';
    
    if (from) {
        domainValue = fromDomain;
        
        if (returnPath) {
            const returnDomainCheck = extractDomain(returnPath);
            if (fromDomain !== returnDomainCheck && returnDomainCheck) {
                domainStatus = 'warning';
                domainValue = `${fromDomain} (Return: ${returnDomainCheck})`;
            } else {
                domainStatus = 'pass';
            }
        }
    }
    checks.push({ label: 'Domain', value: domainValue, status: domainStatus });

    // --- ARC (Authenticated Received Chain) ---
    if (authData.arc.result) {
        let arcStatus = 'neutral';
        let arcValue = authData.arc.result;
        if (authData.arc.result === 'pass') { arcStatus = 'pass'; arcValue = 'Pass ✓'; }
        else if (authData.arc.result === 'fail') { arcStatus = 'fail'; arcValue = 'Failed ✗'; }
        else if (authData.arc.result === 'none') { arcStatus = 'neutral'; arcValue = 'None'; }
        checks.push({ label: 'ARC Chain', value: arcValue, status: arcStatus });
    }

    // --- Received-SPF reconciliation ---
    const receivedSpf = getHeader(headers, 'Received-SPF');
    if (receivedSpf) {
        const rSpfResult = (receivedSpf.match(/^\s*(\w+)/) || [])[1];
        if (rSpfResult) {
            const r = rSpfResult.toLowerCase();
            let status = 'neutral';
            if (r === 'pass') status = 'pass';
            else if (r === 'fail' || r === 'softfail') status = r === 'fail' ? 'fail' : 'warning';
            let value = rSpfResult;
            // Reconcile with Authentication-Results SPF
            if (authData.spf.result && authData.spf.result !== r) {
                status = 'warning';
                value = `${rSpfResult} (differs from Auth-Results: ${authData.spf.result})`;
            }
            checks.push({ label: 'Received-SPF', value, status });
        }
    }

    // --- Display-name spoofing ---
    if (from) {
        const displayName = extractDisplayName(from);
        const spoof = detectDisplayNameSpoof(displayName, fromDomain);
        if (spoof) {
            checks.push({ label: 'Display-Name Spoofing', value: spoof, status: 'fail' });
        }
    }

    // --- Reply-To mismatch ---
    const replyTo = getHeader(headers, 'Reply-To');
    if (replyTo && fromDomain) {
        const replyDomain = extractDomain(replyTo);
        if (replyDomain && !domainsRelated(replyDomain, fromDomain)) {
            checks.push({
                label: 'Reply-To Mismatch',
                value: `Replies go to ${replyDomain}, not ${fromDomain} ⚠`,
                status: 'warning'
            });
        }
    }

    // --- Return-Path mismatch ---
    if (returnPath && fromDomain) {
        const rpDomain = extractDomain(returnPath);
        if (rpDomain && !domainsRelated(rpDomain, fromDomain)) {
            checks.push({
                label: 'Return-Path Mismatch',
                value: `Bounces go to ${rpDomain}, not ${fromDomain} ⚠`,
                status: 'warning'
            });
        }
    }

    // --- Offline domain / DNS heuristics ---
    domainHeuristics(headers, fromDomain).forEach(h => checks.push(h));

    // Render checks
    lastChecks = checks;
    checks.forEach(check => {
        const checkDiv = document.createElement('div');
        checkDiv.className = `security-check ${check.status}`;
        checkDiv.innerHTML = `
            <div class="check-label">${escapeHtml(check.label)}</div>
            <div class="check-value">${escapeHtml(check.value)}</div>
        `;
        securityChecks.appendChild(checkDiv);
    });

    return checks;
}

// Display sender information
function displaySenderInfo(headers) {
    senderInfo.innerHTML = '';

    const importantHeaders = [
        { key: 'From', label: 'From', important: true },
        { key: 'To', label: 'To', important: true },
        { key: 'Return-Path', label: 'Return Path', important: true },
        { key: 'Reply-To', label: 'Reply To', important: false },
        { key: 'Sender', label: 'Sender', important: false },
        { key: 'Subject', label: 'Subject', important: true },
        { key: 'Date', label: 'Date', important: false },
        { key: 'Message-ID', label: 'Message ID', important: false },
    ];

    const from = getHeader(headers, 'From');
    const returnPath = getHeader(headers, 'Return-Path');
    const fromDomain = from ? extractDomain(from) : '';
    const returnDomain = returnPath ? extractDomain(returnPath) : '';

    importantHeaders.forEach(({ key, label, important }) => {
        const value = getHeader(headers, key);
        if (value) {
            const itemDiv = document.createElement('div');
            
            // Check for suspicious behavior
            let isSuspicious = false;
            if (key === 'Return-Path' && fromDomain && returnDomain && fromDomain !== returnDomain) {
                isSuspicious = true;
            }
            if (key === 'Reply-To') {
                const replyDomain = extractDomain(value);
                if (fromDomain && replyDomain && fromDomain !== replyDomain) {
                    isSuspicious = true;
                }
            }

            itemDiv.className = `info-item ${important ? 'important' : ''} ${isSuspicious ? 'suspicious' : ''}`;
            itemDiv.innerHTML = `
                <div class="info-label">${label}</div>
                <div class="info-value ${important ? 'bold' : ''}">${escapeHtml(value)}</div>
            `;
            senderInfo.appendChild(itemDiv);
        }
    });
}

// Display relay timeline
function displayRelayTimeline(headers) {
    relayTimeline.innerHTML = '';

    // Get all Received headers (they are in reverse chronological order - newest first)
    const receivedHeaders = headers['Received'] || headers['received'] || [];
    
    if (receivedHeaders.length === 0) {
        relayTimeline.innerHTML = '<p class="timeline-empty">No relay information found</p>';
        return;
    }

    // Parse each Received header
    const relays = receivedHeaders.map((header, index) => {
        const relay = {
            index: receivedHeaders.length - index, // Reverse numbering (oldest = 1)
            rawHeader: header,
            from: null,
            by: null,
            with: null,
            id: null,
            for: null,
            date: null,
            timestamp: null
        };

        // Parse FROM
        const fromMatch = header.match(/from\s+([^\s(]+)/i);
        if (fromMatch) relay.from = fromMatch[1];

        // Parse BY
        const byMatch = header.match(/by\s+([^\s(]+)/i);
        if (byMatch) relay.by = byMatch[1];

        // Parse WITH
        const withMatch = header.match(/with\s+([^\s;]+)/i);
        if (withMatch) relay.with = withMatch[1];

        // Parse ID
        const idMatch = header.match(/id\s+([^\s;]+)/i);
        if (idMatch) relay.id = idMatch[1];

        // Parse FOR
        const forMatch = header.match(/for\s+<([^>]+)>/i);
        if (forMatch) relay.for = forMatch[1];

        // Parse date — it is always the last ';'-separated segment.
        // Strip parenthetical timezone comments like "(PDT)" that break Date parsing.
        const semi = header.lastIndexOf(';');
        if (semi !== -1) {
            let dateStr = header.substring(semi + 1).trim();
            relay.date = dateStr;
            const cleaned = dateStr.replace(/\([^)]*\)/g, '').trim();
            const parsed = new Date(cleaned);
            relay.timestamp = isNaN(parsed.getTime()) ? null : parsed;
        }

        return relay;
    });

    // Reverse to show oldest first (chronological order)
    relays.reverse();

    // Total transit time between first and last timestamped hop
    const stamped = relays.filter(r => r.timestamp);
    let transit = null;
    if (stamped.length >= 2) {
        const first = stamped[0].timestamp.getTime();
        const last = stamped[stamped.length - 1].timestamp.getTime();
        const deltaMs = last - first;
        transit = { ms: deltaMs, text: formatDuration(deltaMs) };
        const summary = document.createElement('div');
        summary.className = 'timeline-summary';
        summary.innerHTML = `<strong>${escapeHtml(String(relays.length))}</strong> hop(s) · total transit time <strong>${escapeHtml(transit.text)}</strong>`;
        relayTimeline.appendChild(summary);
    }

    // Display timeline
    relays.forEach((relay, index) => {
        const timelineItem = document.createElement('div');
        const isFirst = index === 0;
        timelineItem.className = `timeline-item ${isFirst ? 'first-hop' : ''}`;

        // Format date
        let dateDisplay = relay.date || 'Unknown';
        if (relay.timestamp && !isNaN(relay.timestamp.getTime())) {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };
            dateDisplay = relay.timestamp.toLocaleString('en-US', options);
        }

        // Build timeline content
        let detailsHTML = '';
        
        if (relay.from) {
            detailsHTML += `
                <div class="timeline-detail-row">
                    <div class="timeline-detail-label">From:</div>
                    <div class="timeline-detail-value">${escapeHtml(relay.from)}</div>
                </div>
            `;
        }
        
        if (relay.by) {
            detailsHTML += `
                <div class="timeline-detail-row">
                    <div class="timeline-detail-label">By:</div>
                    <div class="timeline-detail-value">${escapeHtml(relay.by)}</div>
                </div>
            `;
        }
        
        if (relay.with) {
            detailsHTML += `
                <div class="timeline-detail-row">
                    <div class="timeline-detail-label">Protocol:</div>
                    <div class="timeline-detail-value">${escapeHtml(relay.with)}</div>
                </div>
            `;
        }
        
        if (relay.id) {
            detailsHTML += `
                <div class="timeline-detail-row">
                    <div class="timeline-detail-label">ID:</div>
                    <div class="timeline-detail-value">${escapeHtml(relay.id)}</div>
                </div>
            `;
        }
        
        if (relay.for) {
            detailsHTML += `
                <div class="timeline-detail-row">
                    <div class="timeline-detail-label">For:</div>
                    <div class="timeline-detail-value">${escapeHtml(relay.for)}</div>
                </div>
            `;
        }

        const hopLabel = isFirst ? 'Original Sender' : `Hop ${relay.index}`;
        const serverName = relay.from || relay.by || 'Unknown Server';

        timelineItem.innerHTML = `
            <div class="timeline-number">${hopLabel}</div>
            <div class="timeline-header">
                <div class="timeline-server">${escapeHtml(serverName)}</div>
                <div class="timeline-time">${escapeHtml(dateDisplay)}</div>
            </div>
            <div class="timeline-details">
                ${detailsHTML}
            </div>
        `;

        relayTimeline.appendChild(timelineItem);
    });

    return { relays, transit };
}

// Display all headers
function displayAllHeaders(headers) {
    allHeaders.innerHTML = '';

    const importantHeaderNames = [
        'from', 'to', 'cc', 'bcc', 'subject', 'date',
        'return-path', 'reply-to', 'sender',
        'received-spf', 'authentication-results', 'dkim-signature',
        'received', 'x-originating-ip', 'x-mailer'
    ];

    const suspiciousPatterns = [
        /X-Spam/i,
        /X-Virus/i,
        /X-Malware/i,
        /X-Phishing/i
    ];

    for (const [name, values] of Object.entries(headers)) {
        const isImportant = importantHeaderNames.includes(name.toLowerCase());
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(name));

        values.forEach(value => {
            const headerDiv = document.createElement('div');
            headerDiv.className = `header-item ${isImportant ? 'important' : ''} ${isSuspicious ? 'suspicious' : ''}`;
            headerDiv.innerHTML = `
                <span class="header-name">${escapeHtml(name)}:</span>
                <span class="header-value">${escapeHtml(value)}</span>
            `;
            allHeaders.appendChild(headerDiv);
        });
    }
}

// Parse Authentication-Results header
function parseAuthenticationResults(authResults) {
    const result = {
        spf: { result: null, domain: null },
        dkim: { signatures: [], alignedSignature: null }, // Changed to support multiple DKIM
        dmarc: { result: null },
        compauth: { result: null, reason: null },
        arc: { result: null }
    };

    if (!authResults) return result;

    // Parse SPF
    const spfMatch = authResults.match(/spf=(\w+)/i);
    if (spfMatch) {
        result.spf.result = spfMatch[1].toLowerCase();
    }
    const spfDomainMatch = authResults.match(/smtp\.mailfrom=([^\s;]+)/i) || 
                           authResults.match(/smtp\.mail=([^\s;]+)/i) ||
                           authResults.match(/envelope-from=([^\s;]+)/i);
    if (spfDomainMatch) {
        result.spf.domain = extractDomain(spfDomainMatch[1]);
    }

    // Parse ALL DKIM signatures (there can be multiple)
    const dkimRegex = /dkim=(\w+)\s*(?:\(([^)]*)\)\s*)?header\.d=([^\s;]+)/gi;
    let dkimMatch;
    while ((dkimMatch = dkimRegex.exec(authResults)) !== null) {
        const dkimResult = dkimMatch[1].toLowerCase();
        const dkimReason = dkimMatch[2] || null;
        const dkimDomain = dkimMatch[3].toLowerCase();
        
        // Parse the reason if it exists to detect specific failures
        let failureReason = null;
        if (dkimReason) {
            if (dkimReason.toLowerCase().includes('body hash')) {
                failureReason = 'body hash not verified';
            } else if (dkimReason.toLowerCase().includes('signature')) {
                failureReason = 'signature verification failed';
            } else {
                failureReason = dkimReason.toLowerCase();
            }
        }
        
        result.dkim.signatures.push({
            result: dkimResult,
            domain: dkimDomain,
            reason: failureReason
        });
    }

    // Parse DMARC
    const dmarcMatch = authResults.match(/dmarc=(\w+)/i);
    if (dmarcMatch) {
        result.dmarc.result = dmarcMatch[1].toLowerCase();
    }

    // Parse compauth (Microsoft composite authentication)
    const compauthMatch = authResults.match(/compauth=(\w+)(?:\s+reason=(\d+))?/i);
    if (compauthMatch) {
        result.compauth.result = compauthMatch[1].toLowerCase();
        result.compauth.reason = compauthMatch[2] || null;
    }

    // Parse arc (Authenticated Received Chain).
    // Guard against matching the "arc=" inside "dmarc=".
    const arcMatch = authResults.match(/(?:^|[\s;(])arc=(\w+)/i);
    if (arcMatch) {
        result.arc.result = arcMatch[1].toLowerCase();
    }

    return result;
}

// Helper function to get header value
function getHeader(headers, name) {
    const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
    return key && headers[key] ? headers[key][0] : null;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =========================================================================
   Investigation, MIME, preview, heuristics and export helpers
   ========================================================================= */

// Return every value for a header name (headers can repeat, e.g. Received)
function getAllHeaderValues(headers, name) {
    const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
    return key && headers[key] ? headers[key].slice() : [];
}

// Split a full email into header block + body at the first blank line
function splitEmail(rawText) {
    const normalized = rawText.replace(/\r\n/g, '\n');
    const m = normalized.match(/\n[ \t]*\n/);
    if (m && m.index !== undefined) {
        return {
            headerText: normalized.slice(0, m.index),
            body: normalized.slice(m.index + m[0].length)
        };
    }
    return { headerText: normalized, body: '' };
}

// --- Domain helpers -------------------------------------------------------
// TWO_PART_TLDS, IMPERSONATED_BRANDS, RISKY_TLDS, NON_PUBLIC_TLDS and the
// bundled IANA_TLDS snapshot are defined in the js/data-*.js files that are
// loaded before this script.

function organizationalDomain(domain) {
    if (!domain) return '';
    const parts = domain.toLowerCase().split('.');
    if (parts.length <= 2) return domain.toLowerCase();
    const lastTwo = parts.slice(-2).join('.');
    if (TWO_PART_TLDS.has(lastTwo)) return parts.slice(-3).join('.');
    return lastTwo;
}

function domainsRelated(a, b) {
    if (!a || !b) return false;
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a === b) return true;
    if (a.endsWith('.' + b) || b.endsWith('.' + a)) return true;
    return organizationalDomain(a) === organizationalDomain(b);
}

function extractDisplayName(from) {
    if (!from) return '';
    const idx = from.indexOf('<');
    let name = idx > -1 ? from.substring(0, idx) : '';
    return name.trim().replace(/^"(.*)"$/, '$1').trim();
}

function detectDisplayNameSpoof(displayName, fromDomain) {
    if (!displayName || !fromDomain) return null;
    const dn = displayName.toLowerCase();

    // An email address embedded in the display name that differs from the sender
    const emailInName = dn.match(/[\w.+-]+@([\w.-]+\.[a-z]{2,})/i);
    if (emailInName && !domainsRelated(emailInName[1], fromDomain)) {
        return `Name shows ${emailInName[1]} but sender is ${fromDomain} ✗`;
    }
    // A bare domain in the display name that differs from the sender
    const domainInName = dn.match(/\b([a-z0-9-]+\.[a-z]{2,})\b/);
    if (domainInName && !domainsRelated(domainInName[1], fromDomain)) {
        return `Name mentions ${domainInName[1]} but sender is ${fromDomain} ✗`;
    }
    // Brand impersonation
    const org = organizationalDomain(fromDomain);
    const brands = typeof IMPERSONATED_BRANDS !== 'undefined' ? IMPERSONATED_BRANDS : [];
    for (const brand of brands) {
        if (dn.includes(brand) && !org.includes(brand)) {
            return `Claims to be "${brand}" but sender domain is ${fromDomain} ✗`;
        }
    }
    return null;
}

// Offline DNS/domain heuristics (no network required).
// TLD lists (RISKY_TLDS, IANA_TLDS) come from the js/data-*.js files.
function domainHeuristics(headers, fromDomain) {
    const out = [];
    const allText = Object.values(headers).flat().join(' ');

    if (/xn--/i.test(fromDomain) || /@[^\s@]*xn--/i.test(allText)) {
        out.push({
            label: 'IDN / Punycode Domain',
            value: 'Contains "xn--" — possible homograph / look-alike domain ✗',
            status: 'fail'
        });
    }
    if (fromDomain) {
        const tld = fromDomain.split('.').pop();
        if (typeof RISKY_TLDS !== 'undefined' && RISKY_TLDS.includes(tld)) {
            out.push({
                label: 'Risky TLD',
                value: `Sender uses .${tld} — frequently abused for phishing ⚠`,
                status: 'warning'
            });
        }
        // Unknown TLD: absent from the bundled IANA/ICANN snapshot.
        if (typeof IANA_TLDS !== 'undefined' && tld && !IANA_TLDS.has(tld) && !tld.startsWith('xn--')) {
            const ver = typeof IANA_TLDS_VERSION !== 'undefined' ? IANA_TLDS_VERSION : '?';
            out.push({
                label: 'Unknown TLD',
                value: `".${tld}" is not in the bundled ICANN list (snapshot ${ver}) — possible typo or brand-new TLD. Verify with the ICANN check in External Lookups.`,
                status: 'warning'
            });
        }
    }
    const from = getHeader(headers, 'From') || '';
    if (/@\[?\d{1,3}(\.\d{1,3}){3}\]?/.test(from)) {
        out.push({
            label: 'IP-Literal Sender',
            value: 'From address uses a raw IP instead of a domain ⚠',
            status: 'warning'
        });
    }
    return out;
}

// --- MIME parsing ---------------------------------------------------------

function parseContentType(raw) {
    const out = { type: 'text/plain', boundary: '', charset: '', name: '' };
    if (!raw) return out;
    const typeMatch = raw.match(/^\s*([^;]+)/);
    if (typeMatch) out.type = typeMatch[1].trim().toLowerCase();
    const b = raw.match(/boundary=("?)([^";]+)\1/i);
    if (b) out.boundary = b[2].trim();
    const cs = raw.match(/charset=("?)([^";]+)\1/i);
    if (cs) out.charset = cs[2].trim().toLowerCase();
    const nm = raw.match(/name=("?)([^";]+)\1/i);
    if (nm) out.name = nm[2].trim();
    return out;
}

function filenameFromDisposition(disp) {
    if (!disp) return '';
    const m = disp.match(/filename\*?=("?)([^";]+)\1/i);
    return m ? m[2].trim().replace(/^UTF-8''/i, '') : '';
}

function splitMultipart(body, boundary) {
    const delimiter = '--' + boundary;
    const segments = body.split(delimiter);
    const parts = [];
    for (let i = 1; i < segments.length; i++) {
        let seg = segments[i];
        if (seg.startsWith('--')) break; // closing boundary
        seg = seg.replace(/^\r?\n/, '');
        parts.push(seg);
    }
    return parts;
}

function decodeQuotedPrintable(str) {
    return str
        .replace(/=\r?\n/g, '')
        .replace(/=([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
}

function decodeToBytes(data, encoding) {
    if (encoding === 'base64') {
        const clean = data.replace(/[^A-Za-z0-9+/=]/g, '');
        try {
            const bin = atob(clean);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return bytes;
        } catch (e) {
            return new Uint8Array(0);
        }
    }
    const src = encoding === 'quoted-printable' ? decodeQuotedPrintable(data) : data;
    const bytes = new Uint8Array(src.length);
    for (let i = 0; i < src.length; i++) bytes[i] = src.charCodeAt(i) & 0xff;
    return bytes;
}

function decodeToText(data, encoding, charset) {
    const bytes = decodeToBytes(data, encoding);
    try {
        return new TextDecoder(charset || 'utf-8', { fatal: false }).decode(bytes);
    } catch (e) {
        let s = '';
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return s;
    }
}

function walkPart(contentTypeRaw, encoding, partBody, result, disposition, filename) {
    const ct = parseContentType(contentTypeRaw);
    if (ct.type.startsWith('multipart/') && ct.boundary) {
        splitMultipart(partBody, ct.boundary).forEach(raw => {
            const { headerText, body } = splitEmail(raw);
            const sub = parseHeaders(headerText);
            const subCt = getHeader(sub, 'Content-Type') || 'text/plain';
            const subCte = (getHeader(sub, 'Content-Transfer-Encoding') || '').toLowerCase();
            const subDisp = getHeader(sub, 'Content-Disposition') || '';
            const subName = parseContentType(subCt).name || filenameFromDisposition(subDisp);
            walkPart(subCt, subCte, body, result, subDisp, subName);
        });
        return;
    }
    const isAttachment = (disposition && /attachment/i.test(disposition)) || !!filename;
    if (isAttachment) {
        const bytes = decodeToBytes(partBody, encoding);
        result.attachments.push({
            filename: filename || ct.name || 'attachment',
            mime: ct.type,
            size: bytes.length,
            bytes
        });
        return;
    }
    const text = decodeToText(partBody, encoding, ct.charset);
    if (ct.type === 'text/html' && !result.html) result.html = text;
    else if (ct.type === 'text/plain' && !result.text) result.text = text;
}

function parseMime(headers, body) {
    const result = { html: '', text: '', attachments: [] };
    if (!body || !body.trim()) return result;
    const ct = getHeader(headers, 'Content-Type') || 'text/plain';
    const cte = (getHeader(headers, 'Content-Transfer-Encoding') || '').toLowerCase();
    walkPart(ct, cte, body, result);
    return result;
}

// --- Attachments ----------------------------------------------------------

async function sha256Hex(bytes) {
    const buf = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function displayAttachments(attachments) {
    if (!attachmentsSection || !attachmentsList) return;
    attachmentsList.innerHTML = '';
    if (!attachments || !attachments.length) {
        attachmentsSection.classList.add('hidden');
        return;
    }
    attachmentsSection.classList.remove('hidden');
    attachments.forEach((att, i) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';
        div.innerHTML = `
            <div class="attachment-name">${escapeHtml(att.filename)}</div>
            <div class="attachment-meta">${escapeHtml(att.mime)} · ${escapeHtml(formatBytes(att.size))}</div>
            <div class="attachment-hash" id="att-hash-${i}">Computing SHA-256…</div>
        `;
        attachmentsList.appendChild(div);

        const el = () => document.getElementById(`att-hash-${i}`);
        if (att.bytes && att.bytes.length && window.crypto && crypto.subtle) {
            sha256Hex(att.bytes).then(hash => {
                att.sha256 = hash;
                const node = el();
                if (node) {
                    node.innerHTML =
                        `<code>${escapeHtml(hash)}</code> ` +
                        `<a class="lookup-link vt" target="_blank" rel="noopener noreferrer" ` +
                        `href="${virusTotalFileUrl(hash)}">VirusTotal ↗</a>`;
                }
            }).catch(() => {
                const node = el();
                if (node) node.textContent = 'Hash unavailable';
            });
        } else {
            const node = el();
            if (node) node.textContent = 'Hash unavailable (empty or unsupported context)';
        }
    });
}

// --- Body preview ---------------------------------------------------------

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body ? (doc.body.textContent || '') : '';
}

function displayPreview(mime) {
    if (!previewSection || !previewContainer) return;
    lastBody = mime;
    previewContainer.innerHTML = '';
    if (!mime || (!mime.html && !mime.text)) {
        previewSection.classList.add('hidden');
        return;
    }
    previewSection.classList.remove('hidden');
    const hasHtml = !!mime.html;
    if (previewSafeBtn) previewSafeBtn.disabled = !hasHtml;
    if (previewRawBtn) previewRawBtn.disabled = !hasHtml;
    renderPreview(hasHtml ? 'safe' : 'text');
}

function renderPreview(mode) {
    if (!lastBody || !previewContainer) return;
    previewContainer.innerHTML = '';

    if (mode === 'text') {
        const pre = document.createElement('pre');
        pre.className = 'preview-text';
        pre.textContent = lastBody.text || stripHtml(lastBody.html) || '(empty message body)';
        previewContainer.appendChild(pre);
        return;
    }

    const html = lastBody.html || '';
    const iframe = document.createElement('iframe');
    iframe.className = 'preview-frame';
    iframe.title = 'Message body preview';

    if (mode === 'safe') {
        // Empty sandbox: no scripts, no forms, no navigation.
        // CSP blocks every remote request so tracking pixels never load.
        iframe.setAttribute('sandbox', '');
        const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:;">`;
        iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8">${csp}</head><body>${html}</body></html>`;
    } else {
        // Raw: scripts + remote content allowed (user already confirmed the risk).
        iframe.setAttribute('sandbox', 'allow-scripts allow-popups');
        iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"></head><body>${html}</body></html>`;
    }
    previewContainer.appendChild(iframe);
}

// --- Misc + export --------------------------------------------------------

function formatDuration(ms) {
    if (ms < 0) return 'clock skew (' + formatDuration(-ms) + ' backwards)';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), rs = s % 60;
    if (m < 60) return `${m}m ${rs}s`;
    const h = Math.floor(m / 60), rm = m % 60;
    if (h < 24) return `${h}h ${rm}m`;
    const d = Math.floor(h / 24), rh = h % 24;
    return `${d}d ${rh}h`;
}

function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${name}.`, 'success');
}

function buildReportObject() {
    const h = lastAnalysis ? lastAnalysis.headers : {};
    const tl = lastAnalysis ? lastAnalysis.timeline : null;
    return {
        generatedAt: new Date().toISOString(),
        tool: 'Email Header Analyzer (rami.party)',
        securityChecks: lastChecks,
        transit: tl && tl.transit ? tl.transit : null,
        relays: tl && tl.relays ? tl.relays.map(r => ({
            from: r.from, by: r.by, with: r.with, id: r.id, for: r.for, date: r.date
        })) : [],
        headers: h
    };
}

function mdEsc(s) {
    return String(s).replace(/\|/g, '\\|');
}

function buildMarkdownReport() {
    const obj = buildReportObject();
    let md = `# Email Header Report\n\n_Generated ${obj.generatedAt}_\n\n`;
    md += `## Security Analysis\n\n| Check | Result | Status |\n|---|---|---|\n`;
    obj.securityChecks.forEach(c => {
        md += `| ${mdEsc(c.label)} | ${mdEsc(c.value)} | ${c.status} |\n`;
    });
    if (obj.transit) md += `\n**Total transit time:** ${obj.transit.text}\n`;
    md += `\n## Relay Path\n\n`;
    obj.relays.forEach((r, i) => {
        md += `${i + 1}. ${r.from || r.by || 'unknown'}${r.date ? ' — ' + r.date : ''}\n`;
    });
    md += `\n## All Headers\n\n\`\`\`\n`;
    Object.entries(obj.headers).forEach(([k, vals]) => {
        vals.forEach(v => { md += `${k}: ${v}\n`; });
    });
    md += `\`\`\`\n`;
    return md;
}
