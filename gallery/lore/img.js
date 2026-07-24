/* ============================================================================
   LORE GALLERY — IMAGE CONFIG
   ----------------------------------------------------------------------------
   ✨ HOW TO ADD IMAGES (no code changes needed) ✨

   1. Drop your image files into the matching folder inside  ./img/
          Magical Lore      →  ./img/lore/
          Muggle Humor      →  ./img/muggle/
          Magical Cuteness  →  ./img/cute/

   2. Name them with the folder name + a number in brackets, counting up
      from 1 with NO gaps. Any of these extensions work: .jpg .jpeg .png .webp .gif
          lore (1).jpg
          lore (2).jpg
          lore (3).png   ← extensions can be mixed, that's fine
          ...

   3. That's it. Refresh the page — new images appear automatically.
      You never have to touch the code again. 🪄

   (Advanced: to add a brand-new category, copy one block below and give it a
    folder, a matching button id in index.html, a title and some search keywords.)
   ========================================================================== */

const GALLERY_CONFIG = [
    {
        folder: 'lore',
        category: 'lore',
        title: 'Magical Lore',
        keywords: 'ancient mystical magic spell enchantment wizard witch sorcery artifact relic prophecy'
    },
    {
        folder: 'muggle',
        category: 'muggle',
        title: 'Muggle Humor',
        keywords: 'funny hilarious comedy laugh joke smile amusing entertaining'
    },
    {
        folder: 'cute',
        category: 'magic',
        title: 'Magical Cuteness',
        keywords: 'cute adorable sweet lovely precious wholesome heartwarming cheerful'
    }
];

/* File extensions to look for, in priority order. */
const GALLERY_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
