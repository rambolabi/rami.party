/* ============================================================================
   LORE GALLERY — IMAGE MANIFEST
   ----------------------------------------------------------------------------
   ✨ HOW TO ADD IMAGES ✨

   1. Drop your image into the matching folder inside  ./img/  and name it
      with the folder name + the NEXT number in brackets (no gaps):
          Magical Lore      →  ./img/lore/lore (166).jpg
          Muggle Humor      →  ./img/muggle/muggle (60).jpg
          Magical Cuteness  →  ./img/cute/cute (21).jpg

   2. Bump that category's `count` below by one. That's it. 🪄

   Images are .jpg by default. For a different extension, add the number to
   that category's `exts` map, e.g.  exts: { 166: 'png' }  means image 166
   is  lore (166).png  instead of  lore (166).jpg.

   Why a manifest? Listing the images here means the page renders instantly,
   with zero "guessing" network requests and zero 404 noise in the console.
   ========================================================================== */

const GALLERY_CONFIG = [
    {
        folder: 'lore',
        category: 'lore',
        title: 'Magical Lore',
        count: 165,
        exts: {},
        keywords: 'ancient mystical magic spell enchantment wizard witch sorcery artifact relic prophecy'
    },
    {
        folder: 'muggle',
        category: 'muggle',
        title: 'Muggle Humor',
        count: 59,
        exts: {},
        keywords: 'funny hilarious comedy laugh joke smile amusing entertaining'
    },
    {
        folder: 'cute',
        category: 'magic',
        title: 'Magical Cuteness',
        count: 20,
        exts: {},
        keywords: 'cute adorable sweet lovely precious wholesome heartwarming cheerful'
    }
];

const GALLERY_DEFAULT_EXT = 'jpg';

/* Build the URL for image N of a category config. */
function gallerySrc(cfg, index) {
    const ext = (cfg.exts && cfg.exts[index]) || GALLERY_DEFAULT_EXT;
    return `./img/${cfg.folder}/${cfg.folder} (${index}).${ext}`;
}
