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

    /* Extra gallery stills (modern event / performance photography) */
    var GALLERY = {
        concert: [
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'
        ],
        party: [
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80'
        ],
        dance: [
            'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=900&q=80'
        ],
        dj: [
            'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80'
        ],
        classical: [
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80'
        ],
        country: [
            'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'
        ],
        comedy: [
            'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=900&q=80'
        ],
        kids: [
            'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80'
        ],
        models: [
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'
        ],
        multicultural: [
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80'
        ],
        roving: [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80'
        ]
    };

    /* Exact name → live video id (and optional extra gallery images) */
    var BY_NAME = {
        'guy sebastian': { yt: LIVE.guySebastian, pool: 'concert' },
        'jessica mauboy': { yt: LIVE.jessicaMauboy, pool: 'concert' },
        'anthony callea': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'casey donovan': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'mark vincent': { yt: LIVE.markVincent, pool: 'classical' },
        'justice crew': { yt: LIVE.justiceCrew, pool: 'dance' },
        'justice crew official booking': { yt: LIVE.justiceCrew, pool: 'dance' },
        'juse crew dancers official booking': { yt: LIVE.justiceCrew, pool: 'dance' },
        'ricki lee coulter': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'ricki lee': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'delta goodrem': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'dami im': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'john farnham tribute experience': { yt: LIVE.tribute, pool: 'concert' },
        'the veronicas showcase': { yt: LIVE.duoTrio, pool: 'concert' },
        'keith urban acoustic set': { yt: LIVE.country, pool: 'country' },
        'adam brand': { yt: LIVE.adamBrand, pool: 'country' },
        'kasey chambers': { yt: LIVE.country, pool: 'country' },
        'beccy cole': { yt: LIVE.country, pool: 'country' },
        'gina jeffreys': { yt: LIVE.country, pool: 'country' },
        'melinda schneider': { yt: LIVE.country, pool: 'country' },
        'jason owen': { yt: LIVE.country, pool: 'country' },
        'amber lawrence': { yt: LIVE.country, pool: 'country' },
        'the wiggles': { yt: LIVE.wiggles, pool: 'kids' },
        'wiggles': { yt: LIVE.wiggles, pool: 'kids' },
        'fabba': { yt: LIVE.tribute, pool: 'party' },
        'queen the show': { yt: LIVE.tribute, pool: 'concert' },
        'kick the inxs show': { yt: LIVE.tribute, pool: 'concert' },
        'the beatnix show': { yt: LIVE.tribute, pool: 'concert' },
        'the pink show': { yt: LIVE.tribute, pool: 'party' },
        'twist and shout by the williams brothers': { yt: LIVE.tribute, pool: 'party' },
        'the australian beach boys show': { yt: LIVE.tribute, pool: 'party' },
        'emmanuel rodriguez the rookies': { yt: LIVE.danceHipHop, pool: 'dance' },
        'rookies dance crew': { yt: LIVE.danceHipHop, pool: 'dance' },
        'phly crew': { yt: LIVE.danceHipHop, pool: 'dance' },
        'alive dancers': { yt: LIVE.danceHipHop, pool: 'dance' },
        'sydney showgirls': { yt: LIVE.showgirls, pool: 'dance' },
        'cabaret de paris': { yt: LIVE.showgirls, pool: 'dance' },
        'moulin rouge show': { yt: LIVE.showgirls, pool: 'dance' },
        'bollywood spice': { yt: LIVE.latinDance, pool: 'multicultural' },
        'bollywood dancers': { yt: LIVE.latinDance, pool: 'multicultural' },
        'latinoz brazil': { yt: LIVE.latinDance, pool: 'multicultural' },
        'capoeira martial artists': { yt: LIVE.capoeira, pool: 'dance' },
        'world salsa champions': { yt: LIVE.latinDance, pool: 'dance' },
        'latin motion shows': { yt: LIVE.latinDance, pool: 'dance' },
        'doudoumba': { yt: LIVE.multicultural, pool: 'multicultural' },
        'vince sorrenti': { yt: LIVE.comedy, pool: 'comedy' },
        'joe avati': { yt: LIVE.comedy, pool: 'comedy' },
        'anh do': { yt: LIVE.comedy, pool: 'comedy' },
        'george kapiniaris': { yt: LIVE.comedy, pool: 'comedy' },
        'tahir': { yt: LIVE.comedy, pool: 'comedy' },
        'dave hughes style night': { yt: LIVE.comedy, pool: 'comedy' },
        'shane edwards': { yt: LIVE.soloAcoustic, pool: 'concert' },
        'amanda easton': { yt: LIVE.soloAcoustic, pool: 'concert' },
        'csaba szirmai celebrity dancer': { yt: LIVE.danceHipHop, pool: 'dance' },
        'siboney promotional model': { yt: LIVE.models, pool: 'models' },
        'accredited makeup artist nat pallandre': { yt: LIVE.models, pool: 'models' }
    };

    var FOLDER_MEDIA = {
        'celebrity-bands-and-artists': { yt: LIVE.celebrityVocal, pool: 'concert' },
        'solo-acts': { yt: LIVE.soloAcoustic, pool: 'concert' },
        'duos': { yt: LIVE.duoTrio, pool: 'concert' },
        'trios': { yt: LIVE.duoTrio, pool: 'party' },
        'party-bands': { yt: LIVE.partyBand, pool: 'party' },
        'tribute-acts': { yt: LIVE.tribute, pool: 'concert' },
        'production-shows': { yt: LIVE.tribute, pool: 'concert' },
        'stage-shows': { yt: LIVE.tribute, pool: 'concert' },
        'dance-troupes-mcs': { yt: LIVE.danceHipHop, pool: 'dance' },
        'mcs': { yt: LIVE.comedy, pool: 'comedy' },
        'djs-karaoke': { yt: LIVE.dj, pool: 'dj' },
        'instrumentals': { yt: LIVE.instrumental, pool: 'classical' },
        'multicultural-entertainment': { yt: LIVE.multicultural, pool: 'multicultural' },
        'country': { yt: LIVE.country, pool: 'country' },
        'comedians': { yt: LIVE.comedy, pool: 'comedy' },
        'childrens-entertainment': { yt: LIVE.kids, pool: 'kids' },
        'classical-entertainment': { yt: LIVE.classical, pool: 'classical' },
        'seasonal-specialty-entertainment': { yt: LIVE.christmas, pool: 'party' },
        'roving-entertainment': { yt: LIVE.roving, pool: 'roving' }
    };

    var CMS_CAT_MEDIA = {
        celebrity: { yt: LIVE.celebrityVocal, pool: 'concert' },
        bands: { yt: LIVE.partyBand, pool: 'party' },
        djs: { yt: LIVE.dj, pool: 'dj' },
        solos: { yt: LIVE.soloAcoustic, pool: 'concert' },
        duos: { yt: LIVE.duoTrio, pool: 'concert' },
        trios: { yt: LIVE.duoTrio, pool: 'party' },
        jazz: { yt: LIVE.instrumental, pool: 'classical' },
        tributes: { yt: LIVE.tribute, pool: 'concert' },
        multicultural: { yt: LIVE.multicultural, pool: 'multicultural' },
        country: { yt: LIVE.country, pool: 'country' },
        comedians: { yt: LIVE.comedy, pool: 'comedy' },
        children: { yt: LIVE.kids, pool: 'kids' },
        classical: { yt: LIVE.classical, pool: 'classical' },
        specialty: { yt: LIVE.christmas, pool: 'party' },
        roving: { yt: LIVE.roving, pool: 'roving' },
        'models-dancers': { yt: LIVE.danceHipHop, pool: 'dance' },
        corporate: { yt: LIVE.partyBand, pool: 'party' },
        weddings: { yt: LIVE.soloAcoustic, pool: 'concert' }
    };

    function styleMatch(text) {
        var s = String(text || '').toLowerCase();
        if (/dj|club|turntabl/.test(s)) return { yt: LIVE.dj, pool: 'dj' };
        if (/karaoke/.test(s)) return { yt: LIVE.karaoke, pool: 'party' };
        if (/comed|mc|host|compere/.test(s)) return { yt: LIVE.comedy, pool: 'comedy' };
        if (/country|outback/.test(s)) return { yt: LIVE.country, pool: 'country' };
        if (/classic|opera|string|quartet|violin|piano|tenor|orchestr/.test(s)) return { yt: LIVE.classical, pool: 'classical' };
        if (/kids|children|wiggle|smurf|princess|superhero|magic to the max|crazy science/.test(s)) return { yt: LIVE.kids, pool: 'kids' };
        if (/tribute|abba|inxs|queen|beatle|beach boys|rocky horror|gatsby|pink show|fabba/.test(s)) return { yt: LIVE.tribute, pool: 'concert' };
        if (/showgirl|cabaret|moulin|burlesque/.test(s)) return { yt: LIVE.showgirls, pool: 'dance' };
        if (/belly|arabian|snake danc/.test(s)) return { yt: LIVE.belly, pool: 'multicultural' };
        if (/bollywood/.test(s)) return { yt: LIVE.bollywood, pool: 'multicultural' };
        if (/latin|salsa|samba|brazil|batucada|cuban/.test(s)) return { yt: LIVE.latinDance, pool: 'multicultural' };
        if (/capoeira|acro|stunt|break|hip hop|hip-hop|street|crew|dancer|dance/.test(s)) return { yt: LIVE.danceHipHop, pool: 'dance' };
        if (/model|makeup|promotional/.test(s)) return { yt: LIVE.models, pool: 'models' };
        if (/magician|juggler|stilt|roving|statue|bubble|change face/.test(s)) return { yt: LIVE.roving, pool: 'roving' };
        if (/chinese|lion|greek|lebanese|filipino|thai|italian|multicultural|hula|naidoc|oktober/.test(s)) return { yt: LIVE.multicultural, pool: 'multicultural' };
        if (/christmas|santa|easter|nye|halloween|cup fashion/.test(s)) return { yt: LIVE.christmas, pool: 'party' };
        if (/band|funk|soul|disco|party|groove|cover/.test(s)) return { yt: LIVE.partyBand, pool: 'party' };
        if (/duo|trio|vocal/.test(s)) return { yt: LIVE.duoTrio, pool: 'concert' };
        if (/solo|singer|songwriter|acoustic|guitar/.test(s)) return { yt: LIVE.soloAcoustic, pool: 'concert' };
        if (/instrument|accordion|violin/.test(s)) return { yt: LIVE.instrumental, pool: 'classical' };
        return { yt: LIVE.defaultLive, pool: 'concert' };
    }

    function buildGallery(primary, poolName) {
        var pool = GALLERY[poolName] || GALLERY.concert;
        var out = [];
        var seen = {};
        function push(u) {
            if (!u || seen[u]) return;
            seen[u] = true;
            out.push(u);
        }
        push(primary);
        for (var i = 0; i < pool.length && out.length < 4; i++) push(pool[i]);
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
        if (!act.gallery || !act.gallery.length) {
            act.gallery = buildGallery(act.image, resolved.pool || 'concert');
        } else if (act.image && act.gallery.indexOf(act.image) === -1) {
            act.gallery = [act.image].concat(act.gallery).slice(0, 4);
        }
        return act;
    }

    function enrichTalent(t) {
        if (!t || typeof t !== 'object') return t;
        var hay = [t.name, t.style, t.category, (t.styles || []).join(' '), (t.tags || []).join(' ')].join(' ');
        var resolved = BY_NAME[norm(t.name)] || styleMatch(hay);
        t.youtubeUrl = pickYoutube(t.youtubeUrl, resolved);
        if (!t.gallery || !t.gallery.length) {
            t.gallery = buildGallery(t.image, resolved.pool || 'dance');
        }
        return t;
    }

    function enrichCmsArtist(a) {
        if (!a || typeof a !== 'object') return a;
        var resolved = BY_NAME[norm(a.name)] || CMS_CAT_MEDIA[a.category] || styleMatch((a.genre || '') + ' ' + (a.name || '') + ' ' + (a.category || ''));
        a.youtubeUrl = pickYoutube(a.youtubeUrl, resolved);
        if (!a.gallery || !a.gallery.length) {
            a.gallery = buildGallery(a.image, resolved.pool || 'concert');
        }
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
