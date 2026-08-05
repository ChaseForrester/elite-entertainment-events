/* Elite Entertainment — Live performance videos + gallery images
   Enriches artist acts (ELITE_FOLDERS) and talent (ELITE_TALENT) at runtime.
   Prefer named artist live clips; fall back to modern style-matched live previews. */
(function (window) {
    'use strict';

    function norm(s) {
        return String(s == null ? '' : s)
            .toLowerCase()
            .replace(/['’]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /** Extract 11-char YouTube video id (watch, embed, shorts, youtu.be). */
    function youtubeId(url) {
        if (!url) return '';
        var s = String(url).trim();
        var m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (m) return m[1];
        if (/^[\w-]{11}$/.test(s)) return s;
        return '';
    }

    function isChannelUrl(url) {
        if (!url) return false;
        if (youtubeId(url)) return false;
        return /youtube\.com\/(@|channel\/|c\/|user\/)/i.test(String(url)) ||
            /youtube\.com\/[A-Za-z0-9_-]+\/?$/i.test(String(url).replace(/\?.*$/, ''));
    }

    function watchUrl(id) {
        return id ? ('https://www.youtube.com/watch?v=' + id) : '';
    }

    /* ── Modern live performance clips (embeddable video IDs) ── */
    var LIVE = {
        // Named Australian / roster artists (live or live TV where possible)
        guySebastian: 'GgmIiyQJU-g',          // The Keys — Nova Red Room live 2025
        jessicaMauboy: 'MnzXUwlXDW4',         // While I Got Time — live at Sunrise
        justiceCrew: 'Pw_kKlzrMCk',           // Que Sera live
        markVincent: '_h6MnSAlEZw',           // This Is Not the End (Live)
        adamBrand: 'NJoFs2JCXNU',             // Get On Down The Road (Live)
        wiggles: 'LPH5KR0ntPA',               // Live in concert Sydney 2023
        // Genre / style modern live previews for local & specialty acts
        celebrityVocal: 'ED0v9YuVpiE',        // Live vocal stage energy (The Voice)
        partyBand: 'mUOJHBc3w9U',             // Wedding / party band LIVE showcase
        soloAcoustic: 'dFvUm6G4Gik',          // Live vocal / session energy
        duoTrio: 'mUOJHBc3w9U',               // Multi-piece live party band energy
        dj: 'plJIMtJX4DM',                     // Live from the DJ booth (club set)
        karaoke: 'mUOJHBc3w9U',               // Live party / vocal crowd energy
        danceHipHop: 'HjBXLCjvE0Q',           // Pro hip-hop crew live stage
        showgirls: 'SBTYRrsUWgA',             // High-production dance live stage
        latinDance: 'A4-lV6r0lyg',            // High-energy dance stage compilation
        bollywood: 'HjBXLCjvE0Q',
        belly: 'A4-lV6r0lyg',
        capoeira: 'SBTYRrsUWgA',
        comedy: 'FACPypHzbIs',                // Australian stand-up live stage
        country: 'NJoFs2JCXNU',
        classical: '_h6MnSAlEZw',
        kids: 'LPH5KR0ntPA',
        magician: 'mUOJHBc3w9U',              // Live event entertainment energy
        multicultural: 'A4-lV6r0lyg',
        tribute: 'mUOJHBc3w9U',
        roving: 'SBTYRrsUWgA',
        instrumental: 'dFvUm6G4Gik',
        christmas: 'mUOJHBc3w9U',
        models: 'SBTYRrsUWgA',
        defaultLive: 'GgmIiyQJU-g'
    };

    /**
     * REAL extra photos only — verified local roster files for the same act.
     * Never use Unsplash / stock fillers. If we only have one real photo, gallery stays single-image
     * (UI hides gallery strip when fewer than 2 real shots).
     */
    var REAL_GALLERY = {
        'jessica mauboy': [
            'images/acts/celebrity-bands-and-artists/jessica-mauboy.webp',
            'images/artists/jessica-mauboy.jpg'
        ],
        'mark vincent': [
            'images/acts/celebrity-bands-and-artists/mark-vincent.jpg',
            'images/acts/celebrity-bands-and-artists/mark-vincent.png'
        ],
        'ricki lee coulter': [
            'images/acts/celebrity-bands-and-artists/ricki-lee-coulter.webp',
            'images/artists/ricki-lee.jpg'
        ],
        'ricki lee': [
            'images/acts/celebrity-bands-and-artists/ricki-lee-coulter.webp',
            'images/artists/ricki-lee.jpg'
        ],
        'justice crew': [
            'images/acts/celebrity-bands-and-artists/justice-crew.jpg'
        ],
        'justice crew official booking': [
            'images/acts/celebrity-bands-and-artists/justice-crew.jpg'
        ],
        'juse crew dancers official booking': [
            'images/acts/celebrity-bands-and-artists/justice-crew.jpg'
        ],
        'anh do': [
            'images/acts/comedians/anh-do.jpg',
            'images/artists/anh-do.jpg'
        ],
        'george kapiniaris': [
            'images/acts/comedians/george-kapiniaris.jpg',
            'images/artists/george-kapiniaris.jpg'
        ],
        'jason owen': [
            'images/acts/country/jason-owen.jpg',
            'images/artists/jason-owen.jpg'
        ],
        'kasey chambers': [
            'images/acts/country/kasey-chambers.jpg',
            'images/acts/country/kasey-chambers.jpeg'
        ],
        'brown sugar': [
            'images/acts/bands/brown-sugar.jpg',
            'images/acts/bands/brown-sugar.webp'
        ],
        'james liotta': [
            'images/acts/mcs/james-liotta.jpg',
            'images/acts/mcs/james-liotta.webp'
        ],
        'shane edwards': [
            'images/acts/soloists-duos-trios/shane-edwards.jpg',
            'images/acts/mcs/shane-edwards.jpg'
        ],
        'vince sorrenti': [
            'images/acts/comedians/vince-sorrenti.jpg',
            'images/acts/mcs/vince-sorrenti.jpg'
        ],
        'julie accordion': [
            'images/acts/instrumentals/julie-accordion.jpg',
            'images/acts/roving-entertainment/julie-accordion.jpg'
        ],
        'ian cooper': [
            'images/acts/instrumentals/ian-cooper-violinist.jpg',
            'images/acts/roving-entertainment/ian-cooper-irish-jig-music.jpg',
            'images/acts/seasonal-specialty-entertainment/ian-cooper-st-patricks-day.jpg'
        ],
        'ian cooper irish jig music': [
            'images/acts/roving-entertainment/ian-cooper-irish-jig-music.jpg',
            'images/acts/instrumentals/ian-cooper-violinist.jpg',
            'images/acts/seasonal-specialty-entertainment/ian-cooper-st-patricks-day.jpg'
        ],
        'ian cooper st patrick s day': [
            'images/acts/seasonal-specialty-entertainment/ian-cooper-st-patricks-day.jpg',
            'images/acts/instrumentals/ian-cooper-violinist.jpg',
            'images/acts/roving-entertainment/ian-cooper-irish-jig-music.jpg'
        ],
        'the wiggles': [
            'images/acts/childrens-entertainment/the-wiggles.jpg',
            'images/artists/wiggles.jpg'
        ],
        'wiggles': [
            'images/acts/childrens-entertainment/the-wiggles.jpg',
            'images/artists/wiggles.jpg'
        ],
        'viva italia': [
            'images/acts/multicultural-entertainment/viva-italia.png',
            'images/acts/multicultural-entertainment/viva-italia-show.png'
        ],
        'mesa music trio': [
            'images/acts/soloists-duos-trios/mesa-music-trio.jpg',
            'images/acts/soloists-duos-trios/mesa-music-trio.png'
        ],
        'mesa groove trio': [
            'images/acts/soloists-duos-trios/mesa-music-trio.jpg',
            'images/acts/soloists-duos-trios/mesa-music-trio.png'
        ]
    };

    /* Exact name → live video id only (no stock gallery pools) */
    var BY_NAME = {
        'guy sebastian': { yt: LIVE.guySebastian },
        'jessica mauboy': { yt: LIVE.jessicaMauboy },
        'anthony callea': { yt: LIVE.celebrityVocal },
        'casey donovan': { yt: LIVE.celebrityVocal },
        'mark vincent': { yt: LIVE.markVincent },
        'justice crew': { yt: LIVE.justiceCrew },
        'justice crew official booking': { yt: LIVE.justiceCrew },
        'juse crew dancers official booking': { yt: LIVE.justiceCrew },
        'ricki lee coulter': { yt: LIVE.celebrityVocal },
        'ricki lee': { yt: LIVE.celebrityVocal },
        'delta goodrem': { yt: LIVE.celebrityVocal },
        'dami im': { yt: LIVE.celebrityVocal },
        'john farnham tribute experience': { yt: LIVE.tribute },
        'the veronicas showcase': { yt: LIVE.duoTrio },
        'keith urban acoustic set': { yt: LIVE.country },
        'adam brand': { yt: LIVE.adamBrand },
        'kasey chambers': { yt: LIVE.country },
        'beccy cole': { yt: LIVE.country },
        'gina jeffreys': { yt: LIVE.country },
        'melinda schneider': { yt: LIVE.country },
        'jason owen': { yt: LIVE.country },
        'amber lawrence': { yt: LIVE.country },
        'the wiggles': { yt: LIVE.wiggles },
        'wiggles': { yt: LIVE.wiggles },
        'fabba': { yt: LIVE.tribute },
        'queen the show': { yt: LIVE.tribute },
        'kick the inxs show': { yt: LIVE.tribute },
        'the beatnix show': { yt: LIVE.tribute },
        'the pink show': { yt: LIVE.tribute },
        'twist and shout by the williams brothers': { yt: LIVE.tribute },
        'the australian beach boys show': { yt: LIVE.tribute },
        'emmanuel rodriguez the rookies': { yt: LIVE.danceHipHop },
        'rookies dance crew': { yt: LIVE.danceHipHop },
        'phly crew': { yt: LIVE.danceHipHop },
        'alive dancers': { yt: LIVE.danceHipHop },
        'sydney showgirls': { yt: LIVE.showgirls },
        'cabaret de paris': { yt: LIVE.showgirls },
        'moulin rouge show': { yt: LIVE.showgirls },
        'bollywood spice': { yt: LIVE.latinDance },
        'bollywood dancers': { yt: LIVE.latinDance },
        'latinoz brazil': { yt: LIVE.latinDance },
        'capoeira martial artists': { yt: LIVE.capoeira },
        'world salsa champions': { yt: LIVE.latinDance },
        'latin motion shows': { yt: LIVE.latinDance },
        'doudoumba': { yt: LIVE.multicultural },
        'vince sorrenti': { yt: LIVE.comedy },
        'joe avati': { yt: LIVE.comedy },
        'anh do': { yt: LIVE.comedy },
        'george kapiniaris': { yt: LIVE.comedy },
        'tahir': { yt: LIVE.comedy },
        'dave hughes style night': { yt: LIVE.comedy },
        'shane edwards': { yt: LIVE.soloAcoustic },
        'amanda easton': { yt: LIVE.soloAcoustic },
        'csaba szirmai celebrity dancer': { yt: LIVE.danceHipHop },
        'siboney promotional model': { yt: LIVE.models },
        'accredited makeup artist nat pallandre': { yt: LIVE.models }
    };

    var FOLDER_MEDIA = {
        'celebrity-bands-and-artists': { yt: LIVE.celebrityVocal },
        'solo-acts': { yt: LIVE.soloAcoustic },
        'duos': { yt: LIVE.duoTrio },
        'trios': { yt: LIVE.duoTrio },
        'party-bands': { yt: LIVE.partyBand },
        'tribute-acts': { yt: LIVE.tribute },
        'production-shows': { yt: LIVE.tribute },
        'stage-shows': { yt: LIVE.tribute },
        'dance-troupes-mcs': { yt: LIVE.danceHipHop },
        'mcs': { yt: LIVE.comedy },
        'djs-karaoke': { yt: LIVE.dj },
        'instrumentals': { yt: LIVE.instrumental },
        'multicultural-entertainment': { yt: LIVE.multicultural },
        'country': { yt: LIVE.country },
        'comedians': { yt: LIVE.comedy },
        'childrens-entertainment': { yt: LIVE.kids },
        'classical-entertainment': { yt: LIVE.classical },
        'seasonal-specialty-entertainment': { yt: LIVE.christmas },
        'roving-entertainment': { yt: LIVE.roving }
    };

    var CMS_CAT_MEDIA = {
        celebrity: { yt: LIVE.celebrityVocal },
        bands: { yt: LIVE.partyBand },
        djs: { yt: LIVE.dj },
        solos: { yt: LIVE.soloAcoustic },
        duos: { yt: LIVE.duoTrio },
        trios: { yt: LIVE.duoTrio },
        jazz: { yt: LIVE.instrumental },
        tributes: { yt: LIVE.tribute },
        multicultural: { yt: LIVE.multicultural },
        country: { yt: LIVE.country },
        comedians: { yt: LIVE.comedy },
        children: { yt: LIVE.kids },
        classical: { yt: LIVE.classical },
        specialty: { yt: LIVE.christmas },
        roving: { yt: LIVE.roving },
        'models-dancers': { yt: LIVE.danceHipHop },
        corporate: { yt: LIVE.partyBand },
        weddings: { yt: LIVE.soloAcoustic }
    };

    function styleMatch(text) {
        var s = String(text || '').toLowerCase();
        if (/dj|club|turntabl/.test(s)) return { yt: LIVE.dj };
        if (/karaoke/.test(s)) return { yt: LIVE.karaoke };
        if (/comed|mc|host|compere/.test(s)) return { yt: LIVE.comedy };
        if (/country|outback/.test(s)) return { yt: LIVE.country };
        if (/classic|opera|string|quartet|violin|piano|tenor|orchestr/.test(s)) return { yt: LIVE.classical };
        if (/kids|children|wiggle|smurf|princess|superhero|magic to the max|crazy science/.test(s)) return { yt: LIVE.kids };
        if (/tribute|abba|inxs|queen|beatle|beach boys|rocky horror|gatsby|pink show|fabba/.test(s)) return { yt: LIVE.tribute };
        if (/showgirl|cabaret|moulin|burlesque/.test(s)) return { yt: LIVE.showgirls };
        if (/belly|arabian|snake danc/.test(s)) return { yt: LIVE.belly };
        if (/bollywood/.test(s)) return { yt: LIVE.bollywood };
        if (/latin|salsa|samba|brazil|batucada|cuban/.test(s)) return { yt: LIVE.latinDance };
        if (/capoeira|acro|stunt|break|hip hop|hip-hop|street|crew|dancer|dance/.test(s)) return { yt: LIVE.danceHipHop };
        if (/model|makeup|promotional/.test(s)) return { yt: LIVE.models };
        if (/magician|juggler|stilt|roving|statue|bubble|change face/.test(s)) return { yt: LIVE.roving };
        if (/chinese|lion|greek|lebanese|filipino|thai|italian|multicultural|hula|naidoc|oktober/.test(s)) return { yt: LIVE.multicultural };
        if (/christmas|santa|easter|nye|halloween|cup fashion/.test(s)) return { yt: LIVE.christmas };
        if (/band|funk|soul|disco|party|groove|cover/.test(s)) return { yt: LIVE.partyBand };
        if (/duo|trio|vocal/.test(s)) return { yt: LIVE.duoTrio };
        if (/solo|singer|songwriter|acoustic|guitar/.test(s)) return { yt: LIVE.soloAcoustic };
        if (/instrument|accordion|violin/.test(s)) return { yt: LIVE.instrumental };
        return { yt: LIVE.defaultLive };
    }

    /** Stock / generic placeholders must never appear in galleries. */
    function isStockImage(url) {
        if (!url) return true;
        var u = String(url);
        if (/unsplash\.com|picsum\.photos|placehold|loremflickr|via\.placeholder|dummyimage/i.test(u)) return true;
        // Site-wide generic fillers (not a specific act photo)
        if (/^images\/(solo|duo|trio|party-band)\.jpe?g$/i.test(u)) return true;
        if (/^images\/categories\//i.test(u)) return true;
        return false;
    }

    function isRealImage(url) {
        return !!(url && !isStockImage(url));
    }

    /**
     * Gallery = only real photos of THIS act:
     *  - their roster primary (if real)
     *  - verified multi-file extras in REAL_GALLERY
     *  - admin-curated gallery entries that are not stock
     * Never pads with Unsplash or other acts' photos.
     */
    function buildGallery(name, primary, existing) {
        var out = [];
        var seen = {};
        function push(u) {
            if (!isRealImage(u) || seen[u]) return;
            seen[u] = true;
            out.push(u);
        }
        push(primary);
        var extras = REAL_GALLERY[norm(name)] || [];
        for (var i = 0; i < extras.length; i++) push(extras[i]);
        if (Array.isArray(existing)) {
            for (var j = 0; j < existing.length; j++) push(existing[j]);
        }
        return out;
    }

    function resolveMedia(name, style, folderId, category) {
        var key = norm(name);
        var named = BY_NAME[key];
        if (named) return named;
        if (folderId && FOLDER_MEDIA[folderId]) return FOLDER_MEDIA[folderId];
        if (category && CMS_CAT_MEDIA[category]) return CMS_CAT_MEDIA[category];
        return styleMatch((style || '') + ' ' + (name || '') + ' ' + (folderId || '') + ' ' + (category || ''));
    }

    function pickYoutube(existing, resolved) {
        if (existing && youtubeId(existing)) return existing.indexOf('http') === 0 ? existing : watchUrl(youtubeId(existing));
        if (existing && !isChannelUrl(existing) && youtubeId(existing)) return existing;
        // Channel-only URLs cannot embed — replace with a concrete live clip
        if (resolved && resolved.yt) return watchUrl(resolved.yt);
        return existing || watchUrl(LIVE.defaultLive);
    }

    function enrichAct(act, folder) {
        if (!act || typeof act !== 'object') return act;
        var folderId = folder && (folder.id || folder);
        var resolved = resolveMedia(act.name, act.style, folderId, act.category);
        act.youtubeUrl = pickYoutube(act.youtubeUrl, resolved);
        // Always rebuild gallery from real photos only (strips any prior stock fillers)
        act.gallery = buildGallery(act.name, act.image, act.gallery);
        return act;
    }

    function enrichTalent(t) {
        if (!t || typeof t !== 'object') return t;
        var hay = [t.name, t.style, t.category, (t.styles || []).join(' '), (t.tags || []).join(' ')].join(' ');
        var resolved = BY_NAME[norm(t.name)] || styleMatch(hay);
        t.youtubeUrl = pickYoutube(t.youtubeUrl, resolved);
        t.gallery = buildGallery(t.name, t.image, t.gallery);
        return t;
    }

    function enrichCmsArtist(a) {
        if (!a || typeof a !== 'object') return a;
        var resolved = BY_NAME[norm(a.name)] || CMS_CAT_MEDIA[a.category] || styleMatch((a.genre || '') + ' ' + (a.name || '') + ' ' + (a.category || ''));
        a.youtubeUrl = pickYoutube(a.youtubeUrl, resolved);
        a.gallery = buildGallery(a.name, a.image, a.gallery);
        return a;
    }

    function enrichAll() {
        try {
            if (window.ELITE_FOLDERS && window.ELITE_FOLDERS.length) {
                window.ELITE_FOLDERS.forEach(function (f) {
                    (f.acts || []).forEach(function (a) { enrichAct(a, f); });
                });
            }
            if (window.ELITE_FOLDER_MAP) {
                Object.keys(window.ELITE_FOLDER_MAP).forEach(function (id) {
                    var f = window.ELITE_FOLDER_MAP[id];
                    if (f && f.acts) f.acts.forEach(function (a) { enrichAct(a, f); });
                });
            }
            if (window.ELITE_CATEGORIES && Array.isArray(window.ELITE_CATEGORIES)) {
                window.ELITE_CATEGORIES.forEach(function (cat) {
                    (cat.acts || []).forEach(function (a) { enrichAct(a, { id: cat.id || cat.name }); });
                    (cat.groups || []).forEach(function (g) {
                        (g.acts || []).forEach(function (a) { enrichAct(a, { id: cat.id || cat.name }); });
                    });
                });
            }
            if (window.ELITE_TALENT && window.ELITE_TALENT.length) {
                window.ELITE_TALENT.forEach(enrichTalent);
            }
        } catch (e) {
            if (typeof console !== 'undefined') console.warn('EliteMedia enrichAll', e);
        }
    }

    window.EliteMedia = {
        youtubeId: youtubeId,
        isChannelUrl: isChannelUrl,
        enrichAct: enrichAct,
        enrichTalent: enrichTalent,
        enrichCmsArtist: enrichCmsArtist,
        enrichAll: enrichAll,
        buildGallery: buildGallery,
        isStockImage: isStockImage,
        isRealImage: isRealImage,
        watchUrl: watchUrl
    };

    function boot() {
        enrichAll();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    // Re-enrich if data scripts load after this file
    setTimeout(enrichAll, 0);
    setTimeout(enrichAll, 250);
})(window);
