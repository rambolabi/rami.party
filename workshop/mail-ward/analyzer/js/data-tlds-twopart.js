/* ============================================================================
   data-tlds-twopart.js — second-level "public suffix" style TLDs.
   Used to work out the organizational domain (e.g. bbc.co.uk -> bbc.co.uk,
   not co.uk) when checking SPF/DKIM alignment and Reply-To/Return-Path match.
   This is a pragmatic, hand-maintained subset — not the full Public Suffix List.
   ============================================================================ */

const TWO_PART_TLDS = new Set([
    // United Kingdom
    'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk', 'nhs.uk',
    // Australia / NZ
    'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au', 'asn.au', 'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz',
    // Japan / Korea
    'co.jp', 'ne.jp', 'or.jp', 'go.jp', 'ac.jp', 'ad.jp', 'ed.jp', 'gr.jp', 'lg.jp', 'co.kr', 'or.kr', 're.kr', 'go.kr', 'ac.kr',
    // Rest of Asia
    'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'com.hk', 'org.hk', 'edu.hk', 'gov.hk', 'com.tw', 'org.tw', 'gov.tw',
    'com.sg', 'edu.sg', 'gov.sg', 'com.my', 'org.my', 'gov.my', 'com.ph', 'gov.ph', 'com.vn', 'com.id', 'co.id', 'or.id',
    'co.th', 'in.th', 'co.il', 'org.il', 'gov.il', 'co.in', 'net.in', 'org.in', 'gov.in', 'ac.in', 'edu.in',
    // Europe
    'com.tr', 'gov.tr', 'edu.tr', 'com.ua', 'com.pl', 'org.pl', 'gov.pl', 'com.ru', 'com.gr', 'com.pt', 'com.es', 'com.de',
    // Americas
    'com.br', 'net.br', 'org.br', 'gov.br', 'com.mx', 'gob.mx', 'com.ar', 'gov.ar', 'com.co', 'gov.co', 'com.pe', 'com.ve',
    // Africa / Middle East
    'co.za', 'org.za', 'gov.za', 'ac.za', 'co.ke', 'or.ke', 'com.ng', 'gov.ng', 'com.eg', 'com.sa', 'gov.sa', 'com.ma'
]);
