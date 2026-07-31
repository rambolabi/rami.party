/* ============================================================================
   data-brands.js — widely impersonated global brands (phishing lures).
   Each entry is a lowercase token matched as a substring against an email's
   display name. If the name claims a brand that the actual sender domain does
   NOT belong to, the analyzer flags display-name / brand impersonation.

   Curated from commonly-abused brands across tech, finance, payments,
   shipping, telecom, retail, travel, crypto, government and email providers.
   Overly generic single words are deliberately avoided to limit false hits.
   ============================================================================ */

const IMPERSONATED_BRANDS = [
    // --- Big tech / platforms ---
    'microsoft', 'office365', 'office 365', 'outlook', 'onedrive', 'sharepoint', 'teams', 'windows', 'xbox', 'skype',
    'azure', 'apple', 'icloud', 'itunes', 'appstore', 'google', 'gmail', 'youtube', 'chrome', 'android', 'googleplay',
    'amazon', 'aws', 'kindle', 'prime', 'alexa', 'meta', 'facebook', 'instagram', 'whatsapp', 'messenger', 'threads',
    'linkedin', 'twitter', 'tiktok', 'snapchat', 'pinterest', 'reddit', 'discord', 'telegram', 'signal', 'zoom',
    'slack', 'dropbox', 'box', 'adobe', 'acrobat', 'docusign', 'salesforce', 'oracle', 'sap', 'ibm', 'intuit',
    'quickbooks', 'turbotax', 'mailchimp', 'atlassian', 'jira', 'confluence', 'github', 'gitlab', 'bitbucket',
    'wordpress', 'godaddy', 'namecheap', 'cloudflare', 'squarespace', 'wix', 'shopify', 'stripe', 'twilio', 'okta',
    'lastpass', '1password', 'norton', 'mcafee', 'avast', 'malwarebytes', 'kaspersky', 'bitdefender', 'nvidia',
    'intel', 'samsung', 'huawei', 'xiaomi', 'sony', 'lg', 'dell', 'hp', 'lenovo', 'cisco', 'vmware', 'yahoo', 'aol',
    'proton', 'protonmail', 'tutanota', 'zoho', 'notion', 'canva', 'grammarly', 'spotify', 'netflix', 'disney',
    'hulu', 'hbo', 'paramount', 'peacock', 'twitch', 'steam', 'epicgames', 'playstation', 'nintendo', 'roblox',

    // --- Banks & financial institutions ---
    'paypal', 'venmo', 'zelle', 'cashapp', 'wise', 'revolut', 'monzo', 'starling', 'n26', 'chime', 'sofi',
    'visa', 'mastercard', 'americanexpress', 'american express', 'amex', 'discover', 'dinersclub',
    'chase', 'jpmorgan', 'bankofamerica', 'bank of america', 'wellsfargo', 'wells fargo', 'citibank', 'citigroup',
    'capitalone', 'capital one', 'usbank', 'pnc', 'truist', 'tdbank', 'usaa', 'navyfederal', 'ally', 'fidelity',
    'schwab', 'vanguard', 'etrade', 'robinhood', 'morganstanley', 'goldmansachs', 'blackrock', 'barclays',
    'hsbc', 'lloyds', 'natwest', 'halifax', 'santander', 'nationwide', 'monese', 'deutschebank', 'commerzbank',
    'bnpparibas', 'creditagricole', 'societegenerale', 'unicredit', 'intesa', 'ing', 'rabobank', 'abnamro',
    'ubs', 'creditsuisse', 'nordea', 'danske', 'seb', 'swedbank', 'scotiabank', 'rbc', 'bmo', 'cibc', 'td',
    'commbank', 'commonwealthbank', 'westpac', 'nab', 'anz', 'dbs', 'ocbc', 'uob', 'maybank', 'icici', 'hdfc',
    'sbi', 'axisbank', 'kotak', 'standardchartered', 'emirates nbd', 'qnb', 'sberbank', 'itau', 'bradesco',
    'stripe', 'square', 'klarna', 'afterpay', 'affirm', 'westernunion', 'western union', 'moneygram', 'payoneer',

    // --- Crypto / exchanges / wallets ---
    'coinbase', 'binance', 'kraken', 'crypto.com', 'gemini', 'bitfinex', 'kucoin', 'bybit', 'okx', 'bitstamp',
    'blockchain', 'metamask', 'trezor', 'ledger', 'trustwallet', 'exodus', 'phantom', 'uniswap', 'opensea',
    'tether', 'circle', 'usdc', 'ethereum', 'bitcoin',

    // --- Shipping / logistics / postal ---
    'dhl', 'fedex', 'ups', 'usps', 'dpd', 'gls', 'tnt', 'hermes', 'evri', 'royalmail', 'royal mail', 'parcelforce',
    'canadapost', 'canada post', 'auspost', 'australia post', 'poste', 'postnl', 'chronopost', 'colissimo',
    'aramex', 'maersk', 'ontrac', 'lasership', 'purolator', 'correos', 'deutschepost', 'deutsche post', 'sfexpress',

    // --- Telecom / ISPs ---
    'att', 'at&t', 'verizon', 'tmobile', 't-mobile', 'sprint', 'comcast', 'xfinity', 'spectrum', 'coxcable',
    'centurylink', 'vodafone', 'orange', 'telefonica', 'movistar', 'o2', 'ee', 'three', 'bt', 'skybroadband',
    'virginmedia', 'virgin media', 'telstra', 'optus', 'rogers', 'bell', 'telus', 'jio', 'airtel', 'idea',
    'deutschetelekom', 'telekom', 'swisscom', 'kpn', 'proximus', 'telenor', 'telia', 'ntt', 'docomo', 'softbank',

    // --- Retail / e-commerce / marketplaces ---
    'ebay', 'etsy', 'walmart', 'target', 'costco', 'bestbuy', 'best buy', 'homedepot', 'home depot', 'lowes',
    'macys', 'nordstrom', 'kohls', 'nike', 'adidas', 'zara', 'hm', 'uniqlo', 'gap', 'sephora', 'ulta', 'ikea',
    'wayfair', 'chewy', 'wish', 'aliexpress', 'alibaba', 'temu', 'shein', 'flipkart', 'mercadolibre', 'rakuten',
    'newegg', 'overstock', 'argos', 'currys', 'johnlewis', 'john lewis', 'tesco', 'sainsburys', 'asda', 'aldi',
    'lidl', 'carrefour', 'instacart', 'doordash', 'ubereats', 'grubhub', 'deliveroo', 'justeat', 'just eat',

    // --- Travel / airlines / hospitality ---
    'booking', 'booking.com', 'expedia', 'airbnb', 'tripadvisor', 'agoda', 'hotels.com', 'kayak', 'trivago',
    'marriott', 'hilton', 'hyatt', 'ihg', 'accor', 'americanairlines', 'american airlines', 'delta', 'united',
    'southwest', 'jetblue', 'alaskaair', 'britishairways', 'british airways', 'lufthansa', 'airfrance', 'klm',
    'ryanair', 'easyjet', 'emirates', 'qatarairways', 'qatar airways', 'etihad', 'turkishairlines', 'singaporeair',
    'qantas', 'aircanada', 'air canada', 'uber', 'lyft', 'bolt', 'grab',

    // --- Government / tax / identity ---
    'irs', 'hmrc', 'gov.uk', 'ssa', 'socialsecurity', 'usps', 'dmv', 'medicare', 'medicaid', 'ftc', 'fbi',
    'uscis', 'homeoffice', 'servicecanada', 'ato', 'centrelink', 'mygov', 'nhs', 'europa', 'europol', 'interpol',

    // --- Streaming / subscriptions / misc high-value ---
    'audible', 'grubhub', 'onlyfans', 'patreon', 'wetransfer', 'we transfer', 'evernote', 'trello', 'asana',
    'coursera', 'udemy', 'linktree', 'calendly', 'surveymonkey', 'constantcontact', 'sendgrid', 'hubspot',
    'zendesk', 'freshworks', 'servicenow', 'workday', 'adp', 'gusto', 'paychex', 'concur',

    // --- Antivirus / security renewals (classic scam) ---
    'geeksquad', 'geek squad', 'webroot', 'avg', 'eset', 'trendmicro', 'sophos'
];
