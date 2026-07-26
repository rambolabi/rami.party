/* ============================================================================
   data-tlds-risky.js — TLDs disproportionately abused for phishing / malware.
   These ARE valid IANA TLDs, but statistically over-represented in abuse
   reports, so a sender using one is flagged as a low-confidence warning.
   ============================================================================ */

const RISKY_TLDS = [
    // Confusable with file extensions
    'zip', 'mov',
    // Cheap / frequently abused new gTLDs
    'xyz', 'top', 'click', 'link', 'live', 'icu', 'cyou', 'sbs', 'rest', 'quest',
    'monster', 'buzz', 'fit', 'loan', 'loans', 'work', 'date', 'review', 'racing',
    'stream', 'download', 'science', 'party', 'gdn', 'bar', 'beauty', 'makeup',
    'hair', 'skin', 'autos', 'boats', 'motorcycles', 'christmas', 'country', 'kim',
    'men', 'win', 'bid', 'trade', 'accountant', 'accountants', 'cricket', 'faith',
    'cfd', 'wtf', 'lol', 'ooo', 'rodeo', 'mom', 'lat', 'pics', 'sexy', 'porn', 'adult',
    // Free ccTLDs long associated with abuse (Freenom family)
    'tk', 'ml', 'ga', 'cf', 'gq'
];
