/* ==========================================================================
   Tools: AI assistants
   Everything on the tools shelf whose home subject is ai assistants.
   Add an entry by appending one object below. Nothing else to touch.
   ========================================================================== */

OST.add('tool', [
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        subs: ['ai'],
        type: 'online', cost: 'freemium',
        gdpr: true,
        desc: 'OpenAI\'s conversational AI-powered assistant for text generation, chats, coding help, and problem solving.',
        links: [
            { t: 'Official Site', u: 'https://openai.com/', g: '🌐' },
            { t: 'Open Tool', u: 'https://chatgpt.com/', g: '🔗' },
        ],
        tags: 'openai llm chatbot gpt assistant',
    },
    {
        id: 'claude',
        name: 'Claude',
        subs: ['ai'],
        type: 'online', cost: 'freemium',
        gdpr: true,
        desc: 'Anthropic\'s AI-powered assistant with advanced reasoning, chats and coding capabilities.',
        links: [
            { t: 'Official Site', u: 'https://claude.com/', g: '🌐' },
            { t: 'Open Tool', u: 'https://claude.ai/', g: '🔗' },
        ],
        tags: 'anthropic llm chatbot assistant',
    },
    {
        id: 'grok',
        name: 'Grok',
        subs: ['ai'],
        type: 'online', cost: 'freemium',
        desc: 'xAI\'s conversational AI-powered assistant with real-time information access, chats and witty responses.',
        links: [
            { t: 'Official Site', u: 'https://x.ai/grok', g: '🌐' },
            { t: 'Open Tool', u: 'https://grok.com/', g: '🔗' },
        ],
        tags: 'xai llm chatbot assistant',
    },
]);
