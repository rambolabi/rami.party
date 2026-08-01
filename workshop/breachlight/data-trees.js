/* ==========================================================================
   Breachlight — data-trees.js
   --------------------------------------------------------------------------
   Interactive triage. These exist for the reader who is frightened, does not
   know what has happened, and cannot afford to browse a menu.

   Schema
     id, aud, title, glyph, lede, keys, start
     nodes{}  each node is EITHER a question or a result
       question: { q, hint?, options: [{ a, to, note? }] }
       result:   { result, tag, steps[], link?, note? }

   Rules
     • Every option must point at a node that exists.
     • Every path must terminate in a result. No loops.
     • Results are short. They say what to do in the next sixty seconds and
       then hand off to a playbook — a tree is a router, never a replacement.
     • Run BL.audit() in the console; it enforces all of the above.
   ========================================================================== */

window.BL_TREES = [

    /* ==================================================================== */
    /* =========================== END USER =============================== */
    /* ==================================================================== */

    {
        id: 'start',
        aud: 'user',
        title: 'Something has happened and I don’t know what to do',
        glyph: '🧭',
        lede: 'Start here. Five questions at most, then a specific answer. If you are not sure of a question, pick the one that is closest — you can go back.',
        keys: 'start here dont know what happened help me i think i was hacked something happened what do i do now panic scared confused first steps',
        start: 'q-money',
        nodes: {
            'q-money': {
                q: 'Is money moving, or has money already gone?',
                hint: 'Answer for right now. Money is the only thing here with a deadline measured in minutes.',
                options: [
                    { a: 'Yes — money has left, or a payment is pending', to: 'q-money-how' },
                    { a: 'No money involved, or not yet', to: 'q-what' },
                ],
            },
            'q-money-how': {
                q: 'How did the money leave?',
                options: [
                    { a: 'Charges on my card I didn’t make', to: 'r-card' },
                    { a: 'I transferred it myself after being told to', to: 'r-transfer' },
                    { a: 'I paid a shop and got nothing', to: 'r-shop' },
                    { a: 'I paid an invoice and it went to the wrong account', to: 'r-invoice' },
                    { a: 'I sent it as part of an investment or a relationship', to: 'r-invest' },
                ],
            },
            'q-what': {
                q: 'Which of these is closest to what happened?',
                options: [
                    { a: 'I clicked, tapped or scanned something', to: 'q-interact' },
                    { a: 'Someone contacted me — call, message, email', to: 'q-contact' },
                    { a: 'One of my accounts is behaving strangely', to: 'q-account' },
                    { a: 'My phone or computer is behaving strangely', to: 'q-device' },
                    { a: 'Someone is threatening me', to: 'r-threat' },
                    { a: 'I got a letter or notice about a data breach', to: 'r-breach' },
                    { a: 'Nothing specific — I’m just worried', to: 'r-sweep' },
                ],
            },
            'q-interact': {
                q: 'After you clicked, what did you actually do?',
                hint: 'This is the question that decides how serious it is. Be honest with yourself — nobody is watching.',
                options: [
                    { a: 'Typed a username and password', to: 'r-password' },
                    { a: 'Typed or read out a one-time code', to: 'r-code' },
                    { a: 'Entered card or bank details', to: 'r-card' },
                    { a: 'Downloaded or opened a file', to: 'r-file' },
                    { a: 'Copied and pasted something into my computer', to: 'r-paste' },
                    { a: 'Approved a login prompt on my phone', to: 'r-mfa' },
                    { a: 'It was a QR code I scanned', to: 'r-qr' },
                    { a: 'Nothing — the page just opened and I closed it', to: 'r-clickonly' },
                ],
            },
            'q-contact': {
                q: 'What did they want?',
                options: [
                    { a: 'To connect to my computer remotely', to: 'r-remote' },
                    { a: 'A code, a password or my card details', to: 'q-contact-gave' },
                    { a: 'Money — they claimed to be family or a friend', to: 'r-deepfake' },
                    { a: 'Money — they claimed to be my bank, the police or a government body', to: 'q-contact-paid' },
                    { a: 'Nothing yet — I want to know if it’s genuine', to: 'r-verify' },
                ],
            },
            'q-contact-gave': {
                q: 'Did you give it to them?',
                options: [
                    { a: 'Yes, a one-time code', to: 'r-code' },
                    { a: 'Yes, a password', to: 'r-password' },
                    { a: 'Yes, card or bank details', to: 'r-card' },
                    { a: 'No — I stopped in time', to: 'r-stopped' },
                ],
            },
            'q-contact-paid': {
                q: 'Did you send any money or hand anything over?',
                options: [
                    { a: 'Yes, I transferred money', to: 'r-transfer' },
                    { a: 'Yes, I gave a code or card details', to: 'r-code' },
                    { a: 'No — nothing left my hands', to: 'r-stopped' },
                ],
            },
            'q-account': {
                q: 'What is the account doing?',
                options: [
                    { a: 'My email is being read, or mail is disappearing', to: 'r-mailbox' },
                    { a: 'I can’t log in at all', to: 'r-lockout' },
                    { a: 'It’s posting or messaging without me', to: 'r-social' },
                    { a: 'My phone has no signal at all, suddenly', to: 'r-sim' },
                    { a: 'I got a login alert from somewhere I’ve never been', to: 'r-password' },
                ],
            },
            'q-device': {
                q: 'What is the device doing?',
                options: [
                    { a: 'My files are encrypted and there’s a ransom note', to: 'r-ransom' },
                    { a: 'Someone else was controlling it', to: 'r-remote' },
                    { a: 'It’s lost or stolen', to: 'r-lost' },
                    { a: 'Pop-ups, unknown apps, or it’s suddenly very slow', to: 'r-malware' },
                    { a: 'I installed something I now regret', to: 'r-malware' },
                ],
            },

            'r-card': {
                result: 'Freeze the card, then phone the bank',
                tag: 'critical',
                steps: [
                    'Freeze the card in your banking app now — it takes two taps.',
                    'Phone the bank on the number **printed on the back of the card**. Never a number from a message.',
                    'Say: "I did not authorise these transactions, I am reporting fraud."',
                    'Ask them to check for new payees, new devices and changed contact details as well.',
                ],
                link: '#/play/card-fraud',
            },
            'r-transfer': {
                result: 'Phone your bank this minute and ask for a recall',
                tag: 'critical',
                steps: [
                    'Phone the number on your card and say: "I am the victim of an authorised push payment scam, please attempt a recall."',
                    'Give the exact amount, the time and the account it went to.',
                    'Ask them to contact the receiving bank to freeze the funds — that is the step that can still save it.',
                    'Keep every message and screenshot. Do not delete the conversation.',
                ],
                note: 'The window is hours, sometimes minutes. Make the call before you do anything else on this site.',
                link: '#/play/money-transfer',
            },
            'r-shop': {
                result: 'Dispute the payment and protect the card',
                tag: 'high',
                steps: [
                    'Paid by card: open a chargeback for goods not received.',
                    'Paid by bank transfer: phone the bank now and ask for a recall.',
                    'Either way, treat the card details as compromised — freeze or replace the card.',
                    'Screenshot the site, the order and every message before it disappears.',
                ],
                link: '#/play/fake-shop-purchase',
            },
            'r-invoice': {
                result: 'Recall the payment, then find whose mailbox was open',
                tag: 'critical',
                steps: [
                    'Phone your bank and request an immediate recall with the exact amount and beneficiary.',
                    'Phone the real supplier on a number you already had — not one from the email.',
                    'Stop every other pending payment to them until verified by voice.',
                    'Keep the emails with full headers. Do not delete anything.',
                ],
                link: '#/play/invoice-changed',
            },
            'r-invest': {
                result: 'Send nothing more, then preserve everything',
                tag: 'critical',
                steps: [
                    'Send no further payment. No fee ever releases the funds — there is always another one.',
                    'Screenshot everything before you block anyone: chats, profiles, balances, wallet addresses.',
                    'Phone your bank, report it, and ask them to attempt recall on recent transfers.',
                    'Expect a "recovery agency" to contact you within weeks. That is the second scam, always.',
                ],
                link: '#/play/romance-invest',
            },
            'r-password': {
                result: 'Change it, then sign out everywhere',
                tag: 'critical',
                steps: [
                    'Go to the real site by typing the address yourself. Change the password.',
                    '**Sign out of all sessions** — this is the step people skip, and it is the one that evicts them.',
                    'Check for new phone numbers, new authenticator apps and new recovery emails. Remove anything you don’t recognise.',
                    'If it was email, check forwarding rules immediately.',
                ],
                link: '#/play/entered-password',
            },
            'r-code': {
                result: 'That code authorised something — find out what',
                tag: 'critical',
                steps: [
                    'Reread the message that carried the code. The words above the digits say what it approved.',
                    'If it was a bank: phone the number on your card right now.',
                    'If it was an account: change the password, sign out of all sessions, remove unknown devices.',
                    'Nobody legitimate ever asks for that code. Not once, not ever.',
                ],
                link: '#/play/gave-code',
            },
            'r-mfa': {
                result: 'Someone has your password — change it now',
                tag: 'critical',
                steps: [
                    'A prompt you did not start means your correct password was typed by somebody else.',
                    'Change that password immediately, whether or not you approved anything.',
                    'Sign out of all sessions and check registered authentication methods.',
                    'If someone phoned asking you to accept the prompt, that caller was the attacker.',
                ],
                link: '#/play/approved-mfa',
            },
            'r-file': {
                result: 'Disconnect the device, then work from a clean one',
                tag: 'critical',
                steps: [
                    'Turn off Wi-Fi and unplug the network cable. Do not power it off.',
                    'If it is a work device, phone IT now.',
                    'Change important passwords from a **different** device, never the affected one.',
                    'If something genuinely installed, plan to reinstall the operating system.',
                ],
                link: '#/play/opened-attachment',
            },
            'r-paste': {
                result: 'Treat it as a confirmed theft of everything saved in that browser',
                tag: 'critical',
                steps: [
                    'Disconnect the device from the network.',
                    'Use a **different, clean device** for every password change. Do not touch the affected one.',
                    'Change email first, then password manager, then bank — and sign out of all sessions each time.',
                    'Plan to reinstall the operating system. A clean antivirus scan proves nothing here.',
                ],
                note: 'No legitimate website has ever asked you to paste a command. Not one, ever.',
                link: '#/play/pasted-command',
            },
            'r-qr': {
                result: 'It was just a link — what matters is what came next',
                tag: 'high',
                steps: [
                    'Nothing entered? You are almost certainly fine.',
                    'Logged in? Treat it as a phished password — change it and sign out of all sessions.',
                    'Paid? Phone your bank and dispute it.',
                    'Installed an app or a profile? Remove it and check your device settings.',
                ],
                link: '#/play/qr-scanned',
            },
            'r-clickonly': {
                result: 'You are probably fine — here is how to be sure',
                tag: 'ok',
                steps: [
                    'Loading a page on an updated device very rarely does anything by itself.',
                    'Check Downloads for anything that arrived; delete it unopened.',
                    'Run a scan with the security software you already have, and restart.',
                    'Report it if it was a work message — that protects everyone else who got it.',
                ],
                link: '#/play/clicked-link',
            },
            'r-remote': {
                result: 'Disconnect now, then phone the bank',
                tag: 'critical',
                steps: [
                    'Turn off Wi-Fi and unplug the cable — this ends their session immediately.',
                    'Phone your bank on the number on your card. Tell them a fraudster had remote access.',
                    'Use a different, clean device to change your email and banking passwords.',
                    'Assume everything on that screen was seen. Plan to reinstall the operating system.',
                ],
                link: '#/play/remote-access',
            },
            'r-deepfake': {
                result: 'Hang up and call the number you already have',
                tag: 'high',
                steps: [
                    'A voice is no longer proof of anything — a few seconds of audio is enough to clone one.',
                    'Call back on the number saved in your phone, not the one that just called.',
                    'Ask something only they would know that is not on social media.',
                    'If you already sent money, phone your bank immediately for a recall.',
                ],
                link: '#/play/deepfake-call',
            },
            'r-verify': {
                result: 'Verify on a channel you choose, not the one they chose',
                tag: 'ok',
                steps: [
                    'Hang up or close the message. This is always allowed and never rude.',
                    'Find the number yourself — the back of your card, the official app, a statement.',
                    'Three things no real organisation ever does: ask for a code, ask you to move money to a "safe account", ask to install remote software.',
                    'If any of those came up, you already have your answer.',
                ],
                link: '#/defend/verify-a-human',
            },
            'r-stopped': {
                result: 'Nothing was lost — spend ten minutes making it stick',
                tag: 'ok',
                steps: [
                    'You did the hard part. Nothing further is urgent.',
                    'Block the number or address, and report it if it was work-related.',
                    'Expect them to try again — being nearly-caught marks you as reachable and responsive.',
                    'Put a passkey on your email today. It is the single best use of the next ten minutes.',
                ],
                link: '#/defend/mfa-upgrade',
            },
            'r-mailbox': {
                result: 'Your mailbox is the master key — treat this as top priority',
                tag: 'critical',
                steps: [
                    'Change the password, then **sign out of all sessions**.',
                    'Delete forwarding rules and filters you did not create — screenshot them first.',
                    'Check recovery email, recovery phone and registered authenticators.',
                    'Revoke connected apps: an app grant keeps working after a password change.',
                ],
                link: '#/play/mailbox-compromise',
            },
            'r-lockout': {
                result: 'Start the provider’s own recovery process',
                tag: 'critical',
                steps: [
                    'Use the official recovery flow, reached by typing the address yourself.',
                    'Use a device and network you have used with that account before — it counts for a lot.',
                    'Secure your email account first if it is still yours.',
                    'Never pay an "account recovery service". Every one of them is a scam.',
                ],
                link: '#/play/account-takeover',
            },
            'r-social': {
                result: 'Warn your friends first, then take it back',
                tag: 'high',
                steps: [
                    'Post or message that the account is compromised — your friends are being scammed in your name right now.',
                    'Change the password and sign out of all sessions.',
                    'Remove unknown devices, connected apps and — for pages — unknown administrators.',
                    'Screenshot the fraudulent posts before deleting them.',
                ],
                link: '#/play/social-hijack',
            },
            'r-sim': {
                result: 'Phone your mobile provider from another phone, now',
                tag: 'critical',
                steps: [
                    'Say: "I think my number has been ported without my consent." Ask them to reverse it and lock the account.',
                    'From another device on Wi-Fi, change your email password and sign out of all sessions.',
                    'Then your bank. Then your password manager.',
                    'Ask the bank to block SMS-based approvals until it is resolved.',
                ],
                link: '#/play/sim-lost-signal',
            },
            'r-ransom': {
                result: 'Disconnect everything before anything else',
                tag: 'critical',
                steps: [
                    'Unplug the network and any external drives immediately — the spread is the emergency, not the damage already done.',
                    'Do not power it off if you may want it investigated.',
                    'Photograph the ransom note and one encrypted filename.',
                    'Check other devices in the house or office; ransomware travels along shares.',
                ],
                link: '#/play/ransomware-home',
            },
            'r-lost': {
                result: 'Change the account password before you mark it lost',
                tag: 'critical',
                steps: [
                    'From another device, change your Apple, Google or Microsoft account password **first** — if the thief saw your passcode you are racing them for it.',
                    'Then mark the device lost and wipe it remotely.',
                    'Phone your mobile provider to block the SIM and protect against porting.',
                    'Sign out of all sessions on email, bank and password manager.',
                ],
                link: '#/play/lost-device',
            },
            'r-malware': {
                result: 'Assume saved passwords are gone and work from a clean device',
                tag: 'critical',
                steps: [
                    'Disconnect the device from the network.',
                    'Change email, bank and password-manager credentials from a **different** device.',
                    'Sign out of all sessions — stolen cookies ignore password changes.',
                    'Plan a full reinstall. Self-deleting malware makes a clean scan meaningless.',
                ],
                link: '#/play/infostealer-home',
            },
            'r-threat': {
                result: 'Stop replying, preserve everything, do not pay',
                tag: 'high',
                steps: [
                    'Do not reply and do not pay. Payment has never ended one of these; it marks you as someone who pays.',
                    'Screenshot everything before blocking: profiles, usernames, messages, payment addresses.',
                    'Set your social accounts to private and restrict who can see your contacts.',
                    'Tell one person, and report it to the police. This is a crime committed against you.',
                ],
                link: '#/play/sextortion-threat',
            },
            'r-breach': {
                result: 'What was taken decides what you do',
                tag: 'ok',
                steps: [
                    'Password taken → change it there and everywhere you reused it. This is the urgent case.',
                    'Card details → tell the bank and watch the statement.',
                    'ID documents → place a credit freeze or fraud notice.',
                    'Email address only → low urgency, but expect better-aimed phishing quoting real details.',
                ],
                link: '#/play/breach-notice',
            },
            'r-sweep': {
                result: 'Do the fifteen-minute sweep',
                tag: 'ok',
                steps: [
                    'Email: forwarding rules, filters, recovery address, connected apps, recent sign-ins.',
                    'Bank: last month of small charges, and the payee list.',
                    'Phone: apps and profiles you did not install.',
                    'Accounts: registered devices and authentication methods.',
                ],
                link: '#/play/not-sure',
            },
        },
    },

    {
        id: 'verify',
        aud: 'user',
        title: 'Is this message, site or offer real?',
        glyph: '🔎',
        lede: 'Nothing has happened yet. Good — this is the cheapest moment there will ever be. Four questions and you will know what to do.',
        keys: 'is this real is this a scam is this email genuine is this website legit should i trust this check before clicking suspicious message',
        start: 'q-kind',
        nodes: {
            'q-kind': {
                q: 'What are you looking at?',
                options: [
                    { a: 'An email or a text message', to: 'q-msg-want' },
                    { a: 'A phone call, happening now', to: 'r-call' },
                    { a: 'A website or a shop', to: 'q-site' },
                    { a: 'A QR code', to: 'r-qr' },
                    { a: 'A job, an investment or an opportunity', to: 'q-offer' },
                ],
            },
            'q-msg-want': {
                q: 'What does it want you to do?',
                options: [
                    { a: 'Log in, or "verify my account"', to: 'r-login' },
                    { a: 'Pay something — a fee, a fine, a customs charge', to: 'r-pay' },
                    { a: 'Open an attachment', to: 'r-attach' },
                    { a: 'Phone a number about a charge I don’t recognise', to: 'r-callback' },
                    { a: 'Change bank details for a payment', to: 'r-bankchange' },
                    { a: 'Just click a link to read something', to: 'r-read' },
                ],
            },
            'q-site': {
                q: 'Have you checked the domain — the part just before the first single slash?',
                hint: 'In login.bank.secure-verify.io/eu the site is secure-verify.io, not bank. That is the whole test.',
                options: [
                    { a: 'It is exactly the domain I already knew', to: 'r-domain-ok' },
                    { a: 'It is similar but not identical', to: 'r-domain-bad' },
                    { a: 'I have never seen this shop before', to: 'r-newshop' },
                    { a: 'I don’t know how to tell', to: 'r-howto' },
                ],
            },
            'q-offer': {
                q: 'Which is it?',
                options: [
                    { a: 'An investment or trading platform someone introduced me to', to: 'r-invest' },
                    { a: 'A job offered by unsolicited message', to: 'r-job' },
                    { a: 'A prize, refund or inheritance that needs a fee first', to: 'r-fee' },
                    { a: 'Someone I met online who now discusses money', to: 'r-romance' },
                ],
            },

            'r-login': {
                result: 'Do not use the link. Go there yourself',
                tag: 'high',
                steps: [
                    'Close the message. Open the app from your home screen, or type the address you know.',
                    'If the alert is genuine, it will be waiting for you inside. Every real bank shows it there.',
                    'If nothing is waiting for you, the message was false — and you never had to judge the link.',
                    'Report it if it came to a work address.',
                ],
                link: '#/defend/never-click',
            },
            'r-pay': {
                result: 'Small fees are how card numbers get collected',
                tag: 'high',
                steps: [
                    'A €1–€3 "customs fee" or "redelivery charge" exists to harvest a card number, not to earn €3.',
                    'Check directly with the courier or authority using their own app or a number you already had.',
                    'Real customs charges are raised by the carrier through their official channel, not by a link in a text.',
                    'If you already paid, freeze the card and dispute it.',
                ],
                link: '#/play/card-fraud',
            },
            'r-attach': {
                result: 'Verify by voice before opening anything',
                tag: 'high',
                steps: [
                    'Were you expecting this file, from this person, today? If not, do not open it.',
                    'Phone the sender on a number you already had and ask.',
                    'Be especially wary of `.zip`, `.iso`, `.lnk`, `.hta` and anything asking you to "enable content".',
                    'A password on a ZIP with the password in the email is not security — it is there to blind the scanner.',
                ],
                link: '#/play/opened-attachment',
            },
            'r-callback': {
                result: 'This is callback phishing — do not ring the number',
                tag: 'high',
                steps: [
                    'An invoice for something you never bought, with a phone number and no link, is a known and very effective attack.',
                    'The number is theirs. They will ask to install remote software to "process the refund".',
                    'Check your actual card statement and subscriptions instead. There is no charge.',
                    'Delete it. Do not ring to complain.',
                ],
                link: '#/play/remote-access',
            },
            'r-bankchange': {
                result: 'Verify by voice, on a number held before this request',
                tag: 'critical',
                steps: [
                    'A change of bank details is **never** actioned from an email. Ever. There is no exception for urgency or seniority.',
                    'Phone the supplier on a number from your own records, from before this message arrived.',
                    'If the number in the email is the only one you have, that is itself the warning.',
                    'Tell your finance team and your IT team, even if you have not paid yet.',
                ],
                link: '#/defend/org-payments',
            },
            'r-read': {
                result: 'Low risk — the rule is narrower than people think',
                tag: 'ok',
                steps: [
                    'Reading an article or a newsletter through a link is ordinary and fine.',
                    'The rule only bites when a link asks you to prove who you are or move money.',
                    'If the page unexpectedly asks you to log in, stop and go there yourself instead.',
                    'And if it asks you to paste a command anywhere — close it immediately.',
                ],
                link: '#/defend/never-click',
            },
            'r-call': {
                result: 'Hang up. Call back on a number you find yourself',
                tag: 'high',
                steps: [
                    'Caller ID is free to forge. It shows nothing, even when it shows your bank’s real number.',
                    'Hang up and call the number on the back of your card or in the official app.',
                    'On a landline, use a different phone or wait a minute — old lines can stay open.',
                    'Asked for a code, told to move money to a "safe account", or asked to install software? All three are conclusive.',
                ],
                link: '#/defend/verify-a-human',
            },
            'r-qr': {
                result: 'Read the address your camera shows before you tap',
                tag: 'ok',
                steps: [
                    'Your phone previews the address every time. Read the domain, not the words around it.',
                    'Feel the edges — a sticker over a printed code lifts. Parking meters and chargers are the usual targets.',
                    'Never scan a QR code inside an email or a PDF. There is no honest reason to put one there.',
                    'Refuse any code leading to a login or payment page. Use the merchant’s own app instead.',
                ],
                link: '#/defend/qr-discipline',
            },
            'r-domain-ok': {
                result: 'Good — that is the check that matters',
                tag: 'ok',
                steps: [
                    'Exact domain match is the strongest single signal available to you.',
                    'The padlock only means the connection is encrypted. Phishing sites have padlocks too.',
                    'If your password manager is not offering to fill, look again — it matches on domain and it is rarely wrong.',
                    'Bookmark it now so you never have to make this judgement again.',
                ],
                link: '#/defend/check-a-site',
            },
            'r-domain-bad': {
                result: 'Similar is not the same. Leave',
                tag: 'critical',
                steps: [
                    'A hyphen, an extra word, `.co` instead of `.com`, a doubled letter — all of these are deliberate.',
                    'Enter nothing. Close the tab.',
                    'If you already entered a password, change it now and sign out of all sessions.',
                    'If you see `xn--` in the address, that is a non-Latin lookalike. Leave immediately.',
                ],
                link: '#/play/entered-password',
            },
            'r-newshop': {
                result: 'Check it in two minutes, then pay with a card you can throw away',
                tag: 'high',
                steps: [
                    'Look for a company name, address and registration number. Search that name plus "scam".',
                    'Check the domain age with a WHOIS lookup. A "20-year-old brand" on a six-week-old domain is answered.',
                    'Bank transfer, crypto or "friends and family" as the only real option means walk away.',
                    'Use a **virtual card number** with a spending cap. If the shop is fake, the number is worthless.',
                ],
                link: '#/defend/virtual-cards',
            },
            'r-howto': {
                result: 'Here is the whole method, in one line',
                tag: 'ok',
                steps: [
                    'Find the first single `/` after `https://`. Look immediately to its left.',
                    'Take the **last two labels** before it. That is the site. Everything else is decoration.',
                    '`secure.paypal.com.verify-eu.net/login` → the site is `verify-eu.net`.',
                    'Anything before an `@` is ignored by the browser entirely.',
                ],
                link: '#/defend/check-a-site',
            },
            'r-invest': {
                result: 'Assume it is a scam until an independent source says otherwise',
                tag: 'critical',
                steps: [
                    'Check the firm against your national financial regulator’s register — and check the register yourself, not a link they sent.',
                    'An app installed from a link rather than an official store is conclusive.',
                    'Small withdrawals working is the hook, not proof. The test is a large one.',
                    'Any "tax", "fee" or "liquidity" payment required before withdrawal means the money is already gone.',
                ],
                link: '#/play/romance-invest',
            },
            'r-job': {
                result: 'Unsolicited job by message is a task scam',
                tag: 'high',
                steps: [
                    'Real employers do not recruit by unsolicited WhatsApp or Telegram message.',
                    'If you ever have to deposit your own money to "unlock" earnings, it is a scam without exception.',
                    'If you are asked to receive money and pass it on, that is money muling — a criminal offence you would be committing.',
                    'Never send identity documents to a recruiter who contacted you first.',
                ],
                link: '#/play/not-sure',
            },
            'r-fee': {
                result: 'Paying to receive money is always the fraud',
                tag: 'high',
                steps: [
                    'Real windfalls deduct costs. They never invoice you first.',
                    'There is never only one fee. There is always another one after it.',
                    'Compensation and recovery offers are aimed at people already on a victim list.',
                    'Send nothing, and report it.',
                ],
                link: '#/play/romance-invest',
            },
            'r-romance': {
                result: 'The money conversation is the point of the relationship',
                tag: 'critical',
                steps: [
                    'Reverse-image-search their photographs. Ask for a live video call at a time you choose.',
                    'Never send money, cryptocurrency or documents to someone you have not met in person.',
                    'A refusal to meet, combined with an investment opportunity, is the whole pattern.',
                    'If you have already sent money, stop now and preserve everything before saying anything.',
                ],
                link: '#/play/romance-invest',
            },
        },
    },

    /* ==================================================================== */
    /* ============================ RESPONDER ============================= */
    /* ==================================================================== */

    {
        id: 'pro-start',
        aud: 'pro',
        title: 'Alert triage — what am I actually looking at?',
        glyph: '📟',
        lede: 'A router for the first ten minutes. It asks the questions that change the response, in the order they change it.',
        keys: 'alert triage soc analyst incident triage where do i start first ten minutes what kind of incident',
        start: 'q-domain',
        nodes: {
            'q-domain': {
                q: 'Where did the signal originate?',
                options: [
                    { a: 'Identity — sign-in, MFA, consent, role change', to: 'q-identity' },
                    { a: 'Active Directory or Entra ID itself — the directory', to: 'r-directory' },
                    { a: 'Email — a report, a campaign, a mailbox change', to: 'q-email' },
                    { a: 'Endpoint — EDR detection, suspicious process', to: 'q-endpoint' },
                    { a: 'Finance — a payment that went somewhere wrong', to: 'r-payment' },
                    { a: 'External — threat intel, a researcher, a customer, an extortion note', to: 'q-external' },
                ],
            },
            'q-identity': {
                q: 'Which identity signal?',
                options: [
                    { a: 'Successful sign-in with no MFA interaction and no failures', to: 'r-token' },
                    { a: 'Impossible travel or an atypical location', to: 'r-travel' },
                    { a: 'A burst of MFA prompts, or a new MFA method registered', to: 'r-mfa' },
                    { a: 'An OAuth consent grant to an unfamiliar application', to: 'r-oauth' },
                    { a: 'A user says they entered credentials on a phishing page', to: 'r-creds' },
                ],
            },
            'q-email': {
                q: 'Which email signal?',
                options: [
                    { a: 'One user reported one message', to: 'r-report' },
                    { a: 'The same lure reached many mailboxes', to: 'r-campaign' },
                    { a: 'A new inbox rule, forwarding or delegation appeared', to: 'r-rules' },
                    { a: 'A counterparty says our mail is asking them to change bank details', to: 'r-payment' },
                ],
            },
            'q-endpoint': {
                q: 'Which endpoint signal?',
                options: [
                    { a: 'Credential store access, or a known stealer family', to: 'r-stealer' },
                    { a: 'Shadow copy deletion, backup tampering, security tools disabled', to: 'r-ransom' },
                    { a: 'Files being renamed en masse, ransom notes appearing', to: 'r-ransom' },
                    { a: 'A remote-access tool nobody deployed', to: 'r-rat' },
                    { a: 'A user pasted a command from a website', to: 'r-stealer' },
                ],
            },
            'q-external': {
                q: 'What was the external input?',
                options: [
                    { a: 'Our credentials appeared in a stealer log or a dump', to: 'r-stealer' },
                    { a: 'A secret or key was found in a public place', to: 'r-secret' },
                    { a: 'An extortion or leak-site notification', to: 'r-ransom' },
                    { a: 'A lost or stolen corporate device', to: 'r-device' },
                ],
            },

            'r-token': {
                result: 'Treat as session token theft',
                tag: 'critical',
                steps: [
                    'Revoke refresh tokens **before** resetting the password — otherwise the token resets it back.',
                    'Audit MFA methods, consent grants, mailbox rules and device registrations for persistence.',
                    'Verify revocation actually took effect; recheck activity fifteen minutes later.',
                    'Pivot on the source ASN across all identities. Token theft is rarely singular.',
                ],
                link: '#/play/pro-token-theft',
            },
            'r-directory': {
                result: 'Switch to the directory triage guide',
                tag: 'critical',
                steps: [
                    'Directory incidents have their own containment ordering, and getting it wrong is worse than being slow.',
                    'On-prem: preserve evidence and protect backups **before** any password reset. Uncoordinated resets warn the adversary and destroy the timeline.',
                    'Cloud: revoke tokens **before** resetting, then hunt persistence — app credentials, federation and role eligibility all ignore password changes.',
                    'If the environment is hybrid, assume the other directory is reachable and work both on one timeline.',
                ],
                link: '#/t/pro-dir',
            },
            'r-travel': {
                result: 'Corroborate before you contain',
                tag: 'high',
                steps: [
                    'Rule out VPN egress, roaming, inspection proxies and automation under a user identity.',
                    'Contact the user out of band — phone or chat, never email.',
                    'Decide on the supporting signals, not the geography: new device, unfamiliar agent, absent MFA interaction.',
                    '"MFA satisfied by claim in the token" alongside impossible travel is the token-theft signature.',
                ],
                link: '#/play/pro-impossible-travel',
            },
            'r-mfa': {
                result: 'The password is already known',
                tag: 'critical',
                steps: [
                    'Reset the password regardless of whether any prompt was approved.',
                    'Revoke sessions, then audit registered authentication methods and remove anything recent.',
                    'Check whether the helpdesk performed an assisted reset — that route is actively targeted.',
                    'Check whether the user was phoned by "IT". That indicates a more determined adversary.',
                ],
                link: '#/play/pro-mfa-anomaly',
            },
            'r-oauth': {
                result: 'Revoke the grant — nothing else removes it',
                tag: 'critical',
                steps: [
                    'The grant survives password resets, MFA re-enrolment and session revocation. It must be revoked as its own object.',
                    'Delete the service principal and revoke refresh tokens for every consenting user.',
                    'Find all consenting users, not only the reported one.',
                    'Restrict end-user consent afterwards — it removes the whole attack class.',
                ],
                link: '#/play/pro-oauth-grant',
            },
            'r-creds': {
                result: 'Revoke sessions first, reset second',
                tag: 'critical',
                steps: [
                    'Assume the second factor did not help — modern kits relay it live.',
                    'Revoke all sessions and refresh tokens before the password reset.',
                    'Audit MFA methods, consent grants, mailbox rules and delegation for persistence.',
                    'Thank the reporter, visibly. Report rate is what shortens the next one.',
                ],
                link: '#/play/pro-user-clicked',
            },
            'r-report': {
                result: 'Ask the one question that changes everything',
                tag: 'high',
                steps: [
                    '"Did you click, enter anything, or open the attachment?" Everything else waits on that answer.',
                    'Pull full headers; record sender, reply-to, envelope sender, auth results, URLs, hashes.',
                    'Scope the campaign — the reporter is rarely the only recipient.',
                    'Check proxy and DNS logs too; a QR lure never appears in mail-click telemetry.',
                ],
                link: '#/play/pro-reported-phish',
            },
            'r-campaign': {
                result: 'Purge and block first, analyse second',
                tag: 'high',
                steps: [
                    'Work from the recipient list, not from the reports. The reports are a sample.',
                    'Purge tenant-wide, block infrastructure at mail, proxy and DNS.',
                    'Cross-reference recipients against click telemetry and anomalous sign-ins.',
                    'One clear message naming the actual lure, plus "you are not in trouble, phone this number".',
                ],
                link: '#/play/pro-mass-campaign',
            },
            'r-rules': {
                result: 'High-fidelity signal — assume BEC in progress',
                tag: 'critical',
                steps: [
                    'Export or screenshot the rules **before** deleting them. They are evidence.',
                    'Rules exist to hide replies. Read the target folder to find the conversation the user never saw.',
                    'Search sent items for financial threads and warn counterparties by phone.',
                    'Check for a registered lookalike domain to continue the thread after eviction.',
                ],
                link: '#/play/pro-inbox-rules',
            },
            'r-payment': {
                result: 'Two tracks, two people, starting now',
                tag: 'critical',
                steps: [
                    'Money track: bank recall request with exact amount, time and beneficiary. Ask them to freeze at the receiving bank.',
                    'Investigation track: determine whose mailbox was open — yours, theirs, or a lookalike domain.',
                    'Notify the insurer; crime and cyber policies have short windows.',
                    'Preserve the full thread with headers before anyone tidies their mailbox.',
                ],
                link: '#/play/pro-payment-fraud',
            },
            'r-stealer': {
                result: 'Scope by credential, not by device',
                tag: 'critical',
                steps: [
                    'Isolate via EDR — do not power off; you lose memory and live session state.',
                    'Treat every secret that touched that browser profile as disclosed, including forgotten ones.',
                    'Revoke sessions and rotate keys, certificates and VPN profiles from a different device.',
                    'Rebuild the host. Cleaning does not remediate credential theft that already completed.',
                ],
                link: '#/play/pro-infostealer',
            },
            'r-ransom': {
                result: 'Protect the backups before anything else',
                tag: 'critical',
                steps: [
                    'Declare formally; move to the out-of-band channel. Assume email and chat are read.',
                    'Isolate, do not shut down. Then disconnect and make backups immutable.',
                    'Disable the identities and remote-access paths in use, including service accounts.',
                    'Engage insurer, legal and external DFIR before technical decisions narrow the options.',
                ],
                link: '#/play/pro-ransomware',
            },
            'r-rat': {
                result: 'Unexpected remote-access tooling is a staging signal',
                tag: 'critical',
                steps: [
                    'Isolate the host and preserve memory.',
                    'Establish whether it was user-installed after a support scam, or attacker-deployed for persistence.',
                    'Hunt the same tool across the estate — it is rarely on one host.',
                    'If it is on servers, treat it as pre-ransomware staging and escalate accordingly.',
                ],
                link: '#/play/pro-ransomware',
            },
            'r-secret': {
                result: 'Rotate first, investigate second',
                tag: 'critical',
                steps: [
                    'Revoke and rotate immediately — public cloud keys are found by scrapers in minutes.',
                    'Deleting the commit achieves nothing. Assume capture; scope by exposure window.',
                    'Review usage logs and hunt for resources or identities created with it.',
                    'Scan the whole organisation and all Git history, not just the current tree.',
                ],
                link: '#/play/pro-exposed-secret',
            },
            'r-device': {
                result: 'Verify encryption, then treat the identity as the exposure',
                tag: 'high',
                steps: [
                    'Confirm from records that encryption was enabled and the key escrowed. Do not assume.',
                    'Remote wipe, revoke sessions, reset credentials, remove device trust.',
                    'Determine what was stored **locally**, not merely synced.',
                    'Record encryption status, wipe status and timeline — that record is the defensible artefact.',
                ],
                link: '#/play/pro-lost-device',
            },
        },
    },

    {
        id: 'pro-scope',
        aud: 'pro',
        title: 'How far does this go? — scoping a compromised identity',
        glyph: '🧮',
        lede: 'Containment is easy to do narrowly and wrong. Six questions that decide whether this is one user or the whole tenant.',
        keys: 'scope blast radius how far did they get one user or many privilege escalation lateral movement scoping identity compromise',
        start: 'q-priv',
        nodes: {
            'q-priv': {
                q: 'Did the identity hold privileged or standing access?',
                hint: 'Include eligible-but-unactivated roles, delegated mailbox rights and long-lived API keys.',
                options: [
                    { a: 'Yes — admin roles, or standing access to sensitive systems', to: 'r-priv' },
                    { a: 'No, but it had delegated mailbox or shared-drive access', to: 'q-persist' },
                    { a: 'No — an ordinary user with ordinary access', to: 'q-persist' },
                ],
            },
            'q-persist': {
                q: 'Is there evidence of persistence beyond the session?',
                hint: 'New MFA method, OAuth grant, inbox rule, delegation, device registration, added app credential.',
                options: [
                    { a: 'Yes — at least one of those exists', to: 'r-persist' },
                    { a: 'No, and I have checked all of them', to: 'q-data' },
                    { a: 'I have not checked yet', to: 'r-checkfirst' },
                ],
            },
            'q-data': {
                q: 'Was data actually accessed, or only reachable?',
                options: [
                    { a: 'Access is evidenced in logs', to: 'r-data' },
                    { a: 'Reachable, but no evidence of access', to: 'q-retention' },
                    { a: 'Nothing sensitive was reachable', to: 'r-narrow' },
                ],
            },
            'q-retention': {
                q: 'Does your log retention cover the whole suspected window?',
                options: [
                    { a: 'Yes — I can see the entire period', to: 'r-narrow' },
                    { a: 'No — the window predates my retention', to: 'r-assume' },
                ],
            },

            'r-priv': {
                result: 'Escalate. This is a tenant-level incident',
                tag: 'critical',
                steps: [
                    'Treat every credential and secret the identity could reach as burned, whether or not you can prove use.',
                    'Review all privileged role assignments and eligibility for changes made during the window.',
                    'Check for newly created accounts, added app credentials and modified conditional-access policies.',
                    'Engage leadership now. Scope, cost and authority decisions belong to them, not to you.',
                ],
                link: '#/play/pro-user-clicked',
            },
            'r-persist': {
                result: 'Persistence found — eviction is not complete',
                tag: 'critical',
                steps: [
                    'Enumerate every persistence primitive before removing any of them, then remove all in one pass.',
                    'Preserve evidence first: rule names, grant IDs, method registration timestamps.',
                    'Re-check twenty-four hours later. Reinfection is nearly always a missed foothold, not a new intrusion.',
                    'The existence of persistence means access was hands-on, so widen the timeline.',
                ],
                link: '#/play/pro-inbox-rules',
            },
            'r-checkfirst': {
                result: 'Check those six things before scoping further',
                tag: 'high',
                steps: [
                    'Registered authentication methods · OAuth grants · inbox rules and forwarding · delegation and "send as" · device registrations · app credentials.',
                    'These are the standard persistence set. Any one of them survives a password reset.',
                    'Screenshot before you remove.',
                    'Then come back to this question.',
                ],
                link: '#/play/pro-user-clicked',
            },
            'r-data': {
                result: 'Confirmed access — start the notification assessment',
                tag: 'critical',
                steps: [
                    'Record the awareness timestamp in writing. Regulatory clocks run from it.',
                    'Enumerate what was accessed and whose personal data it contained.',
                    'Engage legal counsel and the data protection officer now, in parallel with the technical work.',
                    'Do not say "no evidence of exfiltration" if you mean "we have not looked yet".',
                ],
                link: '#/play/pro-comms',
            },
            'r-narrow': {
                result: 'Scope holds at the single identity',
                tag: 'ok',
                steps: [
                    'Complete containment, document the persistence checks you performed, and close.',
                    'Keep the identity under enhanced monitoring for a fortnight.',
                    'Move the user to phishing-resistant authentication — you now have the internal case for it.',
                    'Record the technique, not just the indicators. Infrastructure rotates; the pattern does not.',
                ],
                link: '#/play/pro-user-clicked',
            },
            'r-assume': {
                result: 'Scope conservatively — you cannot prove the earlier period',
                tag: 'high',
                steps: [
                    'Where retention ends, assumption begins. Say so explicitly in the report.',
                    'Extend containment to everything the identity could have reached during the unlogged window.',
                    'Note the retention gap as a finding. It will be the most valuable output of the whole incident.',
                    'Increase retention now, while there is organisational appetite to pay for it.',
                ],
                link: '#/play/pro-comms',
            },
        },
    },
];
