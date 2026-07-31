/* ============================================================================
   data-tlds-nonpublic.js — pseudo/private TLDs that never exist on the public
   internet. Hostnames ending in these are internal infrastructure names, so
   they are excluded from the "External Lookups" panel (nothing to look up).
   ============================================================================ */

const NON_PUBLIC_TLDS = new Set([
    'internal', 'intranet', 'local', 'localhost', 'localdomain', 'lan', 'home',
    'corp', 'private', 'test', 'example', 'invalid', 'onion', 'arpa'
]);
