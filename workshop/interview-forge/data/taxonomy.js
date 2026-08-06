/* ==========================================================================
   Interview Forge — taxonomy
   Categories (subjects), roles (skill areas) and positions (job profiles).
   A position simply pre-selects a set of roles; roles select questions.
   Everything is trilingual: en / nl / fr.
   ========================================================================== */

window.IF_CATEGORIES = [
    { id: 'networking', glyph: '🌐', name: { en: 'Networking', nl: 'Netwerken', fr: 'Réseaux' } },
    { id: 'security', glyph: '🛡️', name: { en: 'Security', nl: 'Security', fr: 'Sécurité' } },
    { id: 'firewall', glyph: '🧱', name: { en: 'Firewalls', nl: 'Firewalls', fr: 'Pare-feu' } },
    { id: 'cloud', glyph: '☁️', name: { en: 'Cloud', nl: 'Cloud', fr: 'Cloud' } },
    { id: 'microsoft365', glyph: '🅾️', name: { en: 'Microsoft 365', nl: 'Microsoft 365', fr: 'Microsoft 365' } },
    { id: 'windows', glyph: '🪟', name: { en: 'Windows & AD', nl: 'Windows & AD', fr: 'Windows & AD' } },
    { id: 'linux', glyph: '🐧', name: { en: 'Linux', nl: 'Linux', fr: 'Linux' } },
    { id: 'virtualization', glyph: '🧊', name: { en: 'Virtualisation', nl: 'Virtualisatie', fr: 'Virtualisation' } },
    { id: 'dev', glyph: '⌨️', name: { en: 'Development', nl: 'Development', fr: 'Développement' } },
    { id: 'database', glyph: '🗄️', name: { en: 'Databases', nl: 'Databanken', fr: 'Bases de données' } },
    { id: 'devops', glyph: '♾️', name: { en: 'DevOps', nl: 'DevOps', fr: 'DevOps' } },
    { id: 'servicedesk', glyph: '🎧', name: { en: 'Service desk', nl: 'Servicedesk', fr: 'Service desk' } },
    { id: 'troubleshooting', glyph: '🔎', name: { en: 'Troubleshooting', nl: 'Troubleshooting', fr: 'Dépannage' } },
    { id: 'itil', glyph: '📘', name: { en: 'ITIL & process', nl: 'ITIL & proces', fr: 'ITIL & processus' } },
    { id: 'data', glyph: '📊', name: { en: 'Data & reporting', nl: 'Data & rapportering', fr: 'Données & reporting' } },
    { id: 'ai', glyph: '🤖', name: { en: 'AI', nl: 'AI', fr: 'IA' } },
    { id: 'behaviour', glyph: '🧭', name: { en: 'Behaviour', nl: 'Gedrag', fr: 'Comportement' } },
    { id: 'teamwork', glyph: '🤝', name: { en: 'Teamwork', nl: 'Teamwork', fr: 'Travail d’équipe' } },
    { id: 'leadership', glyph: '⭐', name: { en: 'Leadership', nl: 'Leiderschap', fr: 'Leadership' } },
    { id: 'communication', glyph: '💬', name: { en: 'Communication', nl: 'Communicatie', fr: 'Communication' } },
    { id: 'motivation', glyph: '🔥', name: { en: 'Motivation', nl: 'Motivatie', fr: 'Motivation' } },
    { id: 'culture', glyph: '🏛️', name: { en: 'Culture fit', nl: 'Cultuur', fr: 'Culture' } },
    { id: 'conflict', glyph: '⚡', name: { en: 'Conflict', nl: 'Conflict', fr: 'Conflit' } },
    { id: 'timemanagement', glyph: '⏳', name: { en: 'Time management', nl: 'Timemanagement', fr: 'Gestion du temps' } },
    { id: 'learning', glyph: '📚', name: { en: 'Learning', nl: 'Leergierigheid', fr: 'Apprentissage' } },
    { id: 'disc', glyph: '🎨', name: { en: 'DISC profile', nl: 'DISC-profiel', fr: 'Profil DISC' } },
    { id: 'marketing', glyph: '📣', name: { en: 'Marketing', nl: 'Marketing', fr: 'Marketing' } },
    { id: 'hr', glyph: '👥', name: { en: 'HR & recruitment', nl: 'HR & rekrutering', fr: 'RH & recrutement' } },
    { id: 'projectmanagement', glyph: '📐', name: { en: 'Project management', nl: 'Projectmanagement', fr: 'Gestion de projet' } },
    { id: 'customersuccess', glyph: '💚', name: { en: 'Customer success', nl: 'Customer success', fr: 'Customer success' } },
    { id: 'sales', glyph: '💼', name: { en: 'Sales', nl: 'Sales', fr: 'Vente' } },
    { id: 'consulting', glyph: '🧑‍🏫', name: { en: 'Consulting', nl: 'Consultancy', fr: 'Conseil' } },
    { id: 'office', glyph: '📄', name: { en: 'Office & workplace', nl: 'Office & workplace', fr: 'Office & workplace' } },
    { id: 'compliance', glyph: '⚖️', name: { en: 'Compliance', nl: 'Compliance', fr: 'Conformité' } }
];

window.IF_ROLES = [
    { id: 'it-support', name: { en: 'IT support', nl: 'IT-support', fr: 'Support informatique' } },
    { id: 'troubleshooting', name: { en: 'Troubleshooting', nl: 'Probleemoplossing', fr: 'Dépannage' } },
    { id: 'windows-admin', name: { en: 'Windows administration', nl: 'Windows-beheer', fr: 'Administration Windows' } },
    { id: 'linux-admin', name: { en: 'Linux administration', nl: 'Linux-beheer', fr: 'Administration Linux' } },
    { id: 'networking', name: { en: 'Networking', nl: 'Netwerken', fr: 'Réseaux' } },
    { id: 'switching', name: { en: 'Switching & VLANs', nl: 'Switching & VLAN’s', fr: 'Commutation & VLAN' } },
    { id: 'routing', name: { en: 'Routing', nl: 'Routing', fr: 'Routage' } },
    { id: 'firewall', name: { en: 'Firewalls', nl: 'Firewalls', fr: 'Pare-feu' } },
    { id: 'vpn', name: { en: 'VPN', nl: 'VPN', fr: 'VPN' } },
    { id: 'dns', name: { en: 'DNS & DHCP', nl: 'DNS & DHCP', fr: 'DNS & DHCP' } },
    { id: 'email-security', name: { en: 'Mail & SPF/DKIM/DMARC', nl: 'Mail & SPF/DKIM/DMARC', fr: 'Messagerie & SPF/DKIM/DMARC' } },
    { id: 'wifi', name: { en: 'Wi-Fi', nl: 'Wifi', fr: 'Wi-Fi' } },
    { id: 'virtualization', name: { en: 'Virtualisation', nl: 'Virtualisatie', fr: 'Virtualisation' } },
    { id: 'azure', name: { en: 'Microsoft Azure', nl: 'Microsoft Azure', fr: 'Microsoft Azure' } },
    { id: 'm365', name: { en: 'Microsoft 365', nl: 'Microsoft 365', fr: 'Microsoft 365' } },
    { id: 'intune', name: { en: 'Intune & endpoints', nl: 'Intune & endpoints', fr: 'Intune & postes' } },
    { id: 'entra-id', name: { en: 'Entra ID', nl: 'Entra ID', fr: 'Entra ID' } },
    { id: 'backup', name: { en: 'Backup & recovery', nl: 'Backup & recovery', fr: 'Sauvegarde & restauration' } },
    { id: 'monitoring', name: { en: 'Monitoring', nl: 'Monitoring', fr: 'Supervision' } },
    { id: 'scripting', name: { en: 'Scripting', nl: 'Scripting', fr: 'Scripting' } },
    { id: 'powershell', name: { en: 'PowerShell', nl: 'PowerShell', fr: 'PowerShell' } },
    { id: 'security-ops', name: { en: 'Security operations', nl: 'Security operations', fr: 'Sécurité opérationnelle' } },
    { id: 'pentest', name: { en: 'Pentesting', nl: 'Pentesting', fr: 'Tests d’intrusion' } },
    { id: 'incident-response', name: { en: 'Incident response', nl: 'Incident response', fr: 'Réponse à incident' } },
    { id: 'grc', name: { en: 'Governance & compliance', nl: 'Governance & compliance', fr: 'Gouvernance & conformité' } },
    { id: 'dev-frontend', name: { en: 'Front-end development', nl: 'Front-end development', fr: 'Développement front-end' } },
    { id: 'dev-backend', name: { en: 'Back-end development', nl: 'Back-end development', fr: 'Développement back-end' } },
    { id: 'dev-fullstack', name: { en: 'Full-stack development', nl: 'Full-stack development', fr: 'Développement full-stack' } },
    { id: 'databases', name: { en: 'Databases & SQL', nl: 'Databanken & SQL', fr: 'Bases de données & SQL' } },
    { id: 'devops', name: { en: 'DevOps & CI/CD', nl: 'DevOps & CI/CD', fr: 'DevOps & CI/CD' } },
    { id: 'cloud-architecture', name: { en: 'Cloud architecture', nl: 'Cloudarchitectuur', fr: 'Architecture cloud' } },
    { id: 'data-analytics', name: { en: 'Data & analytics', nl: 'Data & analytics', fr: 'Données & analytique' } },
    { id: 'ai-ml', name: { en: 'AI & machine learning', nl: 'AI & machine learning', fr: 'IA & apprentissage automatique' } },
    { id: 'itil', name: { en: 'ITIL', nl: 'ITIL', fr: 'ITIL' } },
    { id: 'servicedesk-process', name: { en: 'Service desk process', nl: 'Servicedeskproces', fr: 'Processus service desk' } },
    { id: 'project-management', name: { en: 'Project management', nl: 'Projectmanagement', fr: 'Gestion de projet' } },
    { id: 'agile', name: { en: 'Agile & Scrum', nl: 'Agile & Scrum', fr: 'Agile & Scrum' } },
    { id: 'planning', name: { en: 'Planning', nl: 'Planning', fr: 'Planification' } },
    { id: 'marketing', name: { en: 'Marketing', nl: 'Marketing', fr: 'Marketing' } },
    { id: 'seo', name: { en: 'SEO', nl: 'SEO', fr: 'SEO' } },
    { id: 'content', name: { en: 'Content & copy', nl: 'Content & copy', fr: 'Contenu & rédaction' } },
    { id: 'hr', name: { en: 'HR', nl: 'HR', fr: 'RH' } },
    { id: 'recruitment', name: { en: 'Recruitment', nl: 'Rekrutering', fr: 'Recrutement' } },
    { id: 'sales', name: { en: 'Sales', nl: 'Sales', fr: 'Vente' } },
    { id: 'account-management', name: { en: 'Account management', nl: 'Accountmanagement', fr: 'Gestion de comptes' } },
    { id: 'customer-success', name: { en: 'Customer success', nl: 'Customer success', fr: 'Customer success' } },
    { id: 'consulting', name: { en: 'Consulting', nl: 'Consultancy', fr: 'Conseil' } },
    { id: 'digital-workplace', name: { en: 'Digital workplace', nl: 'Digital workplace', fr: 'Digital workplace' } },
    { id: 'office-suite', name: { en: 'Microsoft Office', nl: 'Microsoft Office', fr: 'Microsoft Office' } },
    { id: 'documentation', name: { en: 'Documentation', nl: 'Documentatie', fr: 'Documentation' } },
    { id: 'teamwork', name: { en: 'Teamwork', nl: 'Teamwork', fr: 'Travail d’équipe' } },
    { id: 'leadership', name: { en: 'Leadership', nl: 'Leiderschap', fr: 'Leadership' } },
    { id: 'communication', name: { en: 'Communication', nl: 'Communicatie', fr: 'Communication' } },
    { id: 'problem-solving', name: { en: 'Problem solving', nl: 'Probleemoplossend denken', fr: 'Résolution de problèmes' } },
    { id: 'adaptability', name: { en: 'Adaptability', nl: 'Flexibiliteit', fr: 'Adaptabilité' } },
    { id: 'motivation', name: { en: 'Motivation', nl: 'Motivatie', fr: 'Motivation' } },
    { id: 'culture-fit', name: { en: 'Culture fit', nl: 'Cultuurfit', fr: 'Adéquation culturelle' } },
    { id: 'integrity', name: { en: 'Integrity', nl: 'Integriteit', fr: 'Intégrité' } },
    { id: 'stress', name: { en: 'Stress resistance', nl: 'Stressbestendigheid', fr: 'Résistance au stress' } },
    { id: 'disc', name: { en: 'DISC profile', nl: 'DISC-profiel', fr: 'Profil DISC' } }
];

/* A position = a job profile. Selecting it ticks its roles.
   `group` is only used to organise the (long) picker list. */
window.IF_POSITIONS = [
    /* ---- Support & workplace ------------------------------------------- */
    {
        id: 'it-servicedesk', group: 'support', glyph: '🎧',
        name: { en: 'IT service desk agent', nl: 'IT-servicedesk medewerker', fr: 'Agent service desk IT' },
        roles: ['it-support', 'troubleshooting', 'windows-admin', 'm365', 'servicedesk-process', 'communication', 'teamwork', 'stress']
    },
    {
        id: 'it-support-l2', group: 'support', glyph: '🛠️',
        name: { en: 'IT support engineer (2nd line)', nl: 'IT-support engineer (2de lijn)', fr: 'Technicien support IT (2e ligne)' },
        roles: ['it-support', 'troubleshooting', 'windows-admin', 'networking', 'intune', 'm365', 'itil', 'problem-solving']
    },
    {
        id: 'field-technician', group: 'support', glyph: '🚐',
        name: { en: 'Field / on-site technician', nl: 'Field- / on-site technicus', fr: 'Technicien terrain' },
        roles: ['it-support', 'troubleshooting', 'windows-admin', 'networking', 'wifi', 'communication', 'planning']
    },
    {
        id: 'digital-workplace', group: 'support', glyph: '🖥️',
        name: { en: 'Digital workplace consultant', nl: 'Digital workplace consultant', fr: 'Consultant digital workplace' },
        roles: ['digital-workplace', 'm365', 'intune', 'office-suite', 'consulting', 'communication', 'documentation']
    },
    {
        id: 'office-support', group: 'support', glyph: '📄',
        name: { en: 'Microsoft Office / application support', nl: 'Microsoft Office / applicatiesupport', fr: 'Support Microsoft Office / applicatif' },
        roles: ['office-suite', 'm365', 'it-support', 'documentation', 'communication']
    },
    {
        id: 'servicedesk-lead', group: 'support', glyph: '🎚️',
        name: { en: 'Service desk team lead', nl: 'Servicedesk teamlead', fr: 'Team lead service desk' },
        roles: ['servicedesk-process', 'itil', 'leadership', 'communication', 'planning', 'it-support']
    },

    /* ---- Infrastructure & network -------------------------------------- */
    {
        id: 'network-engineer', group: 'infra', glyph: '🌐',
        name: { en: 'Network & firewall engineer', nl: 'Netwerk- & firewall engineer', fr: 'Ingénieur réseau & pare-feu' },
        roles: ['networking', 'switching', 'routing', 'firewall', 'vpn', 'dns', 'wifi', 'monitoring', 'troubleshooting']
    },
    {
        id: 'network-junior', group: 'infra', glyph: '🔌',
        name: { en: 'Networking & switching (junior)', nl: 'Netwerken & switching (junior)', fr: 'Réseaux & commutation (junior)' },
        roles: ['networking', 'switching', 'dns', 'troubleshooting', 'it-support']
    },
    {
        id: 'firewall-expert', group: 'infra', glyph: '🧱',
        name: { en: 'Firewall expert', nl: 'Firewall-expert', fr: 'Expert pare-feu' },
        roles: ['firewall', 'vpn', 'networking', 'routing', 'security-ops', 'monitoring', 'documentation']
    },
    {
        id: 'system-engineer', group: 'infra', glyph: '🖧',
        name: { en: 'System engineer (Windows)', nl: 'Systeembeheerder (Windows)', fr: 'Ingénieur système (Windows)' },
        roles: ['windows-admin', 'virtualization', 'backup', 'powershell', 'entra-id', 'monitoring', 'troubleshooting']
    },
    {
        id: 'linux-engineer', group: 'infra', glyph: '🐧',
        name: { en: 'Linux system engineer', nl: 'Linux systeembeheerder', fr: 'Ingénieur système Linux' },
        roles: ['linux-admin', 'scripting', 'monitoring', 'backup', 'networking', 'devops']
    },
    {
        id: 'virtualization-engineer', group: 'infra', glyph: '🧊',
        name: { en: 'Virtualisation engineer', nl: 'Virtualisatie-engineer', fr: 'Ingénieur virtualisation' },
        roles: ['virtualization', 'windows-admin', 'backup', 'monitoring', 'networking']
    },
    {
        id: 'azure-engineer', group: 'infra', glyph: '☁️',
        name: { en: 'Microsoft Azure engineer', nl: 'Microsoft Azure engineer', fr: 'Ingénieur Microsoft Azure' },
        roles: ['azure', 'entra-id', 'cloud-architecture', 'powershell', 'networking', 'backup', 'monitoring']
    },
    {
        id: 'm365-engineer', group: 'infra', glyph: '🅾️',
        name: { en: 'Microsoft 365 engineer', nl: 'Microsoft 365 engineer', fr: 'Ingénieur Microsoft 365' },
        roles: ['m365', 'entra-id', 'intune', 'email-security', 'powershell', 'digital-workplace']
    },
    {
        id: 'cloud-architect', group: 'infra', glyph: '🏗️',
        name: { en: 'Cloud architect', nl: 'Cloudarchitect', fr: 'Architecte cloud' },
        roles: ['cloud-architecture', 'azure', 'networking', 'security-ops', 'devops', 'documentation', 'consulting']
    },
    {
        id: 'basic-troubleshooting', group: 'infra', glyph: '🔎',
        name: { en: 'Basic IT troubleshooting', nl: 'Basis IT-troubleshooting', fr: 'Dépannage informatique de base' },
        roles: ['troubleshooting', 'it-support', 'windows-admin', 'networking']
    },

    /* ---- Security ------------------------------------------------------- */
    {
        id: 'security-engineer', group: 'security', glyph: '🛡️',
        name: { en: 'Security engineer', nl: 'Security engineer', fr: 'Ingénieur sécurité' },
        roles: ['security-ops', 'incident-response', 'firewall', 'entra-id', 'networking', 'monitoring', 'grc']
    },
    {
        id: 'soc-analyst', group: 'security', glyph: '📡',
        name: { en: 'SOC analyst', nl: 'SOC-analist', fr: 'Analyste SOC' },
        roles: ['security-ops', 'incident-response', 'monitoring', 'networking', 'stress', 'documentation']
    },
    {
        id: 'pentester', group: 'security', glyph: '🕵️',
        name: { en: 'Pentester / ethical hacker', nl: 'Pentester / ethical hacker', fr: 'Pentesteur / hacker éthique' },
        roles: ['pentest', 'security-ops', 'networking', 'dev-backend', 'documentation', 'integrity']
    },
    {
        id: 'grc-officer', group: 'security', glyph: '⚖️',
        name: { en: 'GRC / compliance officer', nl: 'GRC- / compliance officer', fr: 'Responsable GRC / conformité' },
        roles: ['grc', 'documentation', 'communication', 'integrity', 'project-management']
    },

    /* ---- Development & data --------------------------------------------- */
    {
        id: 'developer', group: 'dev', glyph: '⌨️',
        name: { en: 'Software developer', nl: 'Softwareontwikkelaar', fr: 'Développeur logiciel' },
        roles: ['dev-fullstack', 'dev-backend', 'dev-frontend', 'databases', 'devops', 'problem-solving']
    },
    {
        id: 'frontend-dev', group: 'dev', glyph: '🎨',
        name: { en: 'Front-end developer', nl: 'Front-end developer', fr: 'Développeur front-end' },
        roles: ['dev-frontend', 'dev-fullstack', 'documentation', 'problem-solving']
    },
    {
        id: 'backend-dev', group: 'dev', glyph: '🧩',
        name: { en: 'Back-end developer', nl: 'Back-end developer', fr: 'Développeur back-end' },
        roles: ['dev-backend', 'databases', 'devops', 'problem-solving']
    },
    {
        id: 'devops-engineer', group: 'dev', glyph: '♾️',
        name: { en: 'DevOps engineer', nl: 'DevOps engineer', fr: 'Ingénieur DevOps' },
        roles: ['devops', 'linux-admin', 'scripting', 'cloud-architecture', 'monitoring', 'azure']
    },
    {
        id: 'data-analyst', group: 'dev', glyph: '📊',
        name: { en: 'Data analyst', nl: 'Data-analist', fr: 'Analyste de données' },
        roles: ['data-analytics', 'databases', 'office-suite', 'communication', 'documentation']
    },
    {
        id: 'ai-engineer', group: 'dev', glyph: '🤖',
        name: { en: 'AI / ML engineer', nl: 'AI- / ML-engineer', fr: 'Ingénieur IA / ML' },
        roles: ['ai-ml', 'dev-backend', 'data-analytics', 'devops']
    },
    {
        id: 'dba', group: 'dev', glyph: '🗄️',
        name: { en: 'Database administrator', nl: 'Databasebeheerder', fr: 'Administrateur de bases de données' },
        roles: ['databases', 'backup', 'monitoring', 'windows-admin']
    },

    /* ---- Business & delivery -------------------------------------------- */
    {
        id: 'project-manager', group: 'business', glyph: '📐',
        name: { en: 'Project / delivery manager', nl: 'Project- / delivery manager', fr: 'Chef de projet / delivery manager' },
        roles: ['project-management', 'planning', 'agile', 'communication', 'leadership', 'documentation']
    },
    {
        id: 'scrum-master', group: 'business', glyph: '🔄',
        name: { en: 'Scrum master / agile coach', nl: 'Scrum master / agile coach', fr: 'Scrum master / coach agile' },
        roles: ['agile', 'project-management', 'communication', 'leadership', 'teamwork']
    },
    {
        id: 'customer-success', group: 'business', glyph: '💚',
        name: { en: 'Customer success manager', nl: 'Customer success manager', fr: 'Customer success manager' },
        roles: ['customer-success', 'account-management', 'communication', 'planning', 'sales']
    },
    {
        id: 'account-manager', group: 'business', glyph: '💼',
        name: { en: 'Account manager / sales', nl: 'Accountmanager / sales', fr: 'Account manager / vente' },
        roles: ['sales', 'account-management', 'communication', 'motivation', 'planning']
    },
    {
        id: 'marketing-assistant', group: 'business', glyph: '📣',
        name: { en: 'Marketing assistant', nl: 'Marketing assistent', fr: 'Assistant marketing' },
        roles: ['marketing', 'content', 'seo', 'office-suite', 'communication', 'planning']
    },
    {
        id: 'marketing-manager', group: 'business', glyph: '📈',
        name: { en: 'Marketing manager', nl: 'Marketingmanager', fr: 'Responsable marketing' },
        roles: ['marketing', 'seo', 'content', 'data-analytics', 'leadership', 'planning']
    },
    {
        id: 'hr-officer', group: 'business', glyph: '👥',
        name: { en: 'HR officer', nl: 'HR-medewerker', fr: 'Chargé RH' },
        roles: ['hr', 'recruitment', 'communication', 'integrity', 'grc']
    },
    {
        id: 'recruiter', group: 'business', glyph: '🧲',
        name: { en: 'Recruiter', nl: 'Recruiter', fr: 'Recruteur' },
        roles: ['recruitment', 'hr', 'communication', 'sales', 'motivation']
    },
    {
        id: 'it-consultant', group: 'business', glyph: '🧑‍🏫',
        name: { en: 'IT consultant', nl: 'IT-consultant', fr: 'Consultant IT' },
        roles: ['consulting', 'communication', 'documentation', 'project-management', 'problem-solving']
    },
    {
        id: 'team-lead', group: 'business', glyph: '⭐',
        name: { en: 'Team lead / manager', nl: 'Teamlead / manager', fr: 'Team lead / manager' },
        roles: ['leadership', 'communication', 'planning', 'teamwork', 'project-management']
    },
    {
        id: 'office-manager', group: 'business', glyph: '🗂️',
        name: { en: 'Office manager / administration', nl: 'Officemanager / administratie', fr: 'Office manager / administration' },
        roles: ['office-suite', 'planning', 'communication', 'documentation', 'integrity']
    },
    {
        id: 'internship', group: 'business', glyph: '🌱',
        name: { en: 'Intern / school leaver', nl: 'Stagiair / schoolverlater', fr: 'Stagiaire / jeune diplômé' },
        roles: ['motivation', 'teamwork', 'communication', 'adaptability', 'troubleshooting']
    }
];

/* Starter templates — a curated, deliberately small selection so a first-time
   user is not drowned in hundreds of questions. The roles decide which
   questions are pulled in, capped by `max`. */
window.IF_TEMPLATES = [
    {
        id: 'tpl-quick-screen', glyph: '⚡',
        name: { en: 'Quick screening (20 min)', nl: 'Snelle screening (20 min)', fr: 'Présélection rapide (20 min)' },
        note: { en: 'A short first call: motivation, teamwork and communication.', nl: 'Kort eerste gesprek: motivatie, teamwork en communicatie.', fr: 'Premier entretien court : motivation, travail d’équipe et communication.' },
        roles: ['motivation', 'communication', 'teamwork'], max: 10
    },
    {
        id: 'tpl-servicedesk', glyph: '🎧',
        name: { en: 'IT service desk', nl: 'IT-servicedesk', fr: 'Service desk IT' },
        note: { en: 'Troubleshooting basics, Windows, M365 and customer attitude.', nl: 'Basis troubleshooting, Windows, M365 en klantgerichtheid.', fr: 'Bases du dépannage, Windows, M365 et sens du service.' },
        roles: ['it-support', 'troubleshooting', 'windows-admin', 'servicedesk-process', 'communication'], max: 24
    },
    {
        id: 'tpl-network', glyph: '🌐',
        name: { en: 'Network & firewall', nl: 'Netwerk & firewall', fr: 'Réseau & pare-feu' },
        note: { en: 'TCP/IP, routing, VLANs, firewalls and VPN.', nl: 'TCP/IP, routing, VLAN’s, firewalls en VPN.', fr: 'TCP/IP, routage, VLAN, pare-feu et VPN.' },
        roles: ['networking', 'switching', 'routing', 'firewall', 'vpn', 'dns'], max: 28
    },
    {
        id: 'tpl-cloud', glyph: '☁️',
        name: { en: 'Azure & Microsoft 365', nl: 'Azure & Microsoft 365', fr: 'Azure & Microsoft 365' },
        note: { en: 'Identity, tenant management, Intune and cloud basics.', nl: 'Identity, tenantbeheer, Intune en cloudbasis.', fr: 'Identité, gestion du tenant, Intune et bases du cloud.' },
        roles: ['azure', 'entra-id', 'm365', 'intune'], max: 26
    },
    {
        id: 'tpl-security', glyph: '🛡️',
        name: { en: 'Security & incident response', nl: 'Security & incident response', fr: 'Sécurité & réponse à incident' },
        note: { en: 'Detection, response, hardening and a pentest angle.', nl: 'Detectie, response, hardening en een pentest-invalshoek.', fr: 'Détection, réponse, durcissement et volet pentest.' },
        roles: ['security-ops', 'incident-response', 'pentest', 'email-security'], max: 26
    },
    {
        id: 'tpl-dev', glyph: '⌨️',
        name: { en: 'Developer', nl: 'Developer', fr: 'Développeur' },
        note: { en: 'Code, APIs, databases and how they work in a team.', nl: 'Code, API’s, databanken en samenwerken in een team.', fr: 'Code, API, bases de données et travail en équipe.' },
        roles: ['dev-fullstack', 'dev-backend', 'dev-frontend', 'databases', 'devops', 'teamwork'], max: 26
    },
    {
        id: 'tpl-business', glyph: '📐',
        name: { en: 'Project & delivery', nl: 'Project & delivery', fr: 'Projet & delivery' },
        note: { en: 'Stakeholders, planning, risk and leadership.', nl: 'Stakeholders, planning, risico en leiderschap.', fr: 'Parties prenantes, planification, risques et leadership.' },
        roles: ['project-management', 'planning', 'agile', 'leadership', 'communication'], max: 24
    },
    {
        id: 'tpl-disc', glyph: '🎨',
        name: { en: 'DISC personality scan', nl: 'DISC-persoonlijkheidsscan', fr: 'Scan de personnalité DISC' },
        note: { en: 'The full DISC list — estimate the candidate’s colours.', nl: 'De volledige DISC-lijst — schat de kleuren van de kandidaat in.', fr: 'La liste DISC complète — estimez les couleurs du candidat.' },
        roles: ['disc'], max: 40
    },
    {
        id: 'tpl-behaviour', glyph: '🧭',
        name: { en: 'Behaviour & culture', nl: 'Gedrag & cultuur', fr: 'Comportement & culture' },
        note: { en: 'Teamwork, conflict, stress, integrity and motivation.', nl: 'Teamwork, conflict, stress, integriteit en motivatie.', fr: 'Travail d’équipe, conflit, stress, intégrité et motivation.' },
        roles: ['teamwork', 'communication', 'stress', 'integrity', 'motivation', 'adaptability'], max: 24
    }
];

/* DISC colour legend. */
window.IF_DISC = [
    { id: 'D', colour: '#e5484d', name: { en: 'Dominance (red)', nl: 'Dominantie (rood)', fr: 'Dominance (rouge)' }, desc: { en: 'Direct, decisive, results-driven, takes control, impatient with detail.', nl: 'Direct, beslissend, resultaatgericht, neemt de leiding, ongeduldig met details.', fr: 'Direct, décidé, orienté résultats, prend les commandes, impatient avec les détails.' } },
    { id: 'I', colour: '#f5b83d', name: { en: 'Influence (yellow)', nl: 'Invloed (geel)', fr: 'Influence (jaune)' }, desc: { en: 'Enthusiastic, social, persuasive, optimistic, less strong on follow-through.', nl: 'Enthousiast, sociaal, overtuigend, optimistisch, minder sterk in opvolging.', fr: 'Enthousiaste, sociable, persuasif, optimiste, moins fort dans le suivi.' } },
    { id: 'S', colour: '#3fa66a', name: { en: 'Steadiness (green)', nl: 'Stabiliteit (groen)', fr: 'Stabilité (vert)' }, desc: { en: 'Patient, loyal, supportive, dependable, dislikes sudden change or conflict.', nl: 'Geduldig, loyaal, ondersteunend, betrouwbaar, houdt niet van plotse verandering of conflict.', fr: 'Patient, loyal, soutenant, fiable, n’aime ni le changement brusque ni le conflit.' } },
    { id: 'C', colour: '#3b82f6', name: { en: 'Conscientiousness (blue)', nl: 'Consciëntieusheid (blauw)', fr: 'Conformité (bleu)' }, desc: { en: 'Accurate, analytical, quality- and rule-driven, wants data before deciding.', nl: 'Nauwkeurig, analytisch, kwaliteits- en regelgericht, wil data vóór een beslissing.', fr: 'Précis, analytique, orienté qualité et règles, veut des données avant de décider.' } }
];
