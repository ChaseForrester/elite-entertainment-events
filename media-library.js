/* Elite Entertainment — Verified media only
   Videos: ONLY when we have a real YouTube clip of THAT named act (embeddable video ID).
   No genre/style fallbacks. No “close enough” dance/party clips. If unknown → leave blank.
   Images/galleries: ONLY real roster photos of that act (no Unsplash/stock fillers). */
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

    /**
     * VERIFIED same-artist live (or live TV) clips only.
     * Keys = norm(act name). Values = YouTube video IDs researched for that performer.
     * Do not add an entry unless you are confident the video is of that act.
     */
    var VERIFIED_YT = {
        // Celebrity / headline
        'guy sebastian': 'GgmIiyQJU-g',                 // The Keys — Nova Red Room live 2025
        'jessica mauboy': 'MnzXUwlXDW4',                // While I Got Time — live at Sunrise
        'anthony callea': 'aYwH5nInX7U',                // Circle of Life — Sydney Opera House live
        'casey donovan': 'SEjDxv5f-U4',                 // Live Sydney Opera House NYE (ABC)
        'mark vincent': '_h6MnSAlEZw',                  // This Is Not the End (Live)
        'justice crew': 'Pw_kKlzrMCk',                  // Que Sera live
        'justice crew official booking': 'Pw_kKlzrMCk',
        'juse crew dancers official booking': 'Pw_kKlzrMCk',
        'dami im': '2EG_Jtw4OyU',                       // Sound of Silence — Eurovision 2016 LIVE
        'delta goodrem': 'Yps5OMNiC4o',                 // The Show Must Go On — Global Citizen Live SOH
        // Country
        'adam brand': 'NJoFs2JCXNU',                    // Get On Down The Road (Live)
        'kasey chambers': 'S70xek3x4ro',                // Lose Yourself live — Civic Theatre Newcastle
        'beccy cole': '3s4E1Hf5TvE',                    // Wine Time live — ABC studios
        'amber lawrence': '1uxszxRIkCA',                // Hell to Hallelujah — live performance (official)
        'melinda schneider': 'pkQkdIhVIfw',             // Shanghai live — The Basement Sydney
        'gina jeffreys': 'kv-w1arUyOk',                 // Dancin' With Elvis (concert clip)
        // Comedy
        'joe avati': 'Pjjqvz9lOwU',                     // Shopping with Nonna — live standup
        'anh do': 'wgJS-L9sa0s',                        // The Happiest Refugee LIVE
        'vince sorrenti': 'GhB1XzZKw2c',                // Stand-up — Hey Hey It's Saturday
        // Kids / dance crews with public performance clips
        'the wiggles': 'LPH5KR0ntPA',                   // Live in concert Sydney
        'wiggles': 'LPH5KR0ntPA',
        'phly crew': 'xV9BZMFVG8A',                     // Australia's Got Talent audition (this act)
        'instant bun': 'ccSFVeLvA98',                   // Australia's Got Talent 2011 audition
        // Tribute / stage shows with identifiable clips of that show
        'fabba': 'iHP9EiPi5iE',                         // Fabba — Australian ABBA Show (Sydney)
        // Solo / independent with own live upload
        'amanda easton': 'wlma9Qh6Q5g'                  // Running Up That Hill LIVE Solo (her channel)
    };

    /**
     * REAL extra photos only — verified local roster files for the same act.
     * Never use Unsplash / stock fillers.
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

    /** Stock / generic placeholders must never appear as act photos or galleries. */
    function isStockImage(url) {
        if (!url) return true;
        var u = String(url);
        if (/unsplash\.com|picsum\.photos|placehold|loremflickr|via\.placeholder|dummyimage/i.test(u)) return true;
        if (/^images\/(solo|duo|trio|party-band)\.jpe?g$/i.test(u)) return true;
        if (/^images\/categories\//i.test(u)) return true;
        return false;
    }

    function isRealImage(url) {
        return !!(url && !isStockImage(url));
    }

    /**
     * Gallery = only real photos of THIS act.
     * Never pads with stock or other acts' photos.
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

    /**
     * Strict video pick:
     * 1) Admin/data URL only if it is a real embeddable video ID (not a channel page)
     * 2) Else verified map for this exact name
     * 3) Else empty — never invent a genre stand-in
     */
    function pickYoutube(name, existing) {
        var id = youtubeId(existing);
        if (id && !isChannelUrl(existing)) {
            return existing.indexOf('http') === 0 ? existing : watchUrl(id);
        }
        // Channel-only links cannot embed and are not a performance clip
        var verified = VERIFIED_YT[norm(name)];
        if (verified) return watchUrl(verified);
        return '';
    }

    function cleanPrimaryImage(image) {
        return isRealImage(image) ? image : '';
    }

    function enrichAct(act, folder) {
        if (!act || typeof act !== 'object') return act;
        act.youtubeUrl = pickYoutube(act.name, act.youtubeUrl);
        act.image = cleanPrimaryImage(act.image) || act.image;
        // If primary is stock, clear it so UI does not present a fake person as the act
        if (isStockImage(act.image)) act.image = '';
        act.gallery = buildGallery(act.name, act.image, act.gallery);
        return act;
    }

    function enrichTalent(t) {
        if (!t || typeof t !== 'object') return t;
        t.youtubeUrl = pickYoutube(t.name, t.youtubeUrl);
        if (isStockImage(t.image)) t.image = '';
        t.gallery = buildGallery(t.name, t.image, t.gallery);
        return t;
    }

    function enrichCmsArtist(a) {
        if (!a || typeof a !== 'object') return a;
        a.youtubeUrl = pickYoutube(a.name, a.youtubeUrl);
        if (isStockImage(a.image)) a.image = '';
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
        pickYoutube: pickYoutube,
        watchUrl: watchUrl,
        VERIFIED_YT: VERIFIED_YT
    };

    function boot() {
        enrichAll();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    setTimeout(enrichAll, 0);
    setTimeout(enrichAll, 250);
})(window);
