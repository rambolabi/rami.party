/* ============================================================================
   LORE GALLERY — IMAGE CONFIG
   ----------------------------------------------------------------------------
   ✨ HOW TO ADD IMAGES ✨

   1. Drop your image files into the matching folder inside  ./img/
          Magical Lore      →  ./img/lore/
          Muggle Humor      →  ./img/muggle/
          Magical Cuteness  →  ./img/cute/

   2. Name them with the folder name + a number in brackets, counting up
      from 1 with NO gaps:
          lore (1).jpg
          lore (2).jpg
          ...

   3. Bump the `count` for that category below to match the highest number.
      That's the only code change needed — refresh and they appear. 🪄

      (Listing exact counts here means the page never has to "probe" the
       server for files that don't exist, so it loads instantly and the
       console stays free of 404 errors.)

   (Advanced: to add a brand-new category, copy one block below and give it a
    folder, a matching button id in index.html, a title and some search keywords.)
   ========================================================================== */

const GALLERY_CONFIG = [
    {
        folder: 'lore',
        category: 'lore',
        title: 'Magical Lore',
        count: 165,
        ext: 'jpg',
        keywords: 'ancient mystical magic spell enchantment wizard witch sorcery artifact relic prophecy'
    },
    {
        folder: 'muggle',
        category: 'muggle',
        title: 'Muggle Humor',
        count: 59,
        ext: 'jpg',
        keywords: 'funny hilarious comedy laugh joke smile amusing entertaining'
    },
    {
        folder: 'cute',
        category: 'magic',
        title: 'Magical Cuteness',
        count: 20,
        ext: 'jpg',
        keywords: 'cute adorable sweet lovely precious wholesome heartwarming cheerful'
    }
];
