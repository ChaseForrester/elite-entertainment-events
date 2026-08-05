/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — Unified CMS Engine (cms.js)
   Full Catalog with 70+ Performers & Categories
═══════════════════════════════════════════════════ */

(function (window) {
  const STORAGE_KEYS = {
    ARTISTS: 'elite_cms_artists_v4',
    EVENTS: 'elite_cms_events_v4',
    CATEGORIES: 'elite_cms_categories_v4',
    CONTENT: 'elite_cms_content_v4'
  };

  const DEFAULT_ARTISTS = [
    {
      "id": "guy-sebastian",
      "name": "Guy Sebastian",
      "category": "celebrity",
      "genre": "Pop / R&B Celebrity",
      "image": "images/artists/guy-sebastian.jpg",
      "rate": "$15,000+",
      "bio": "Multi-ARIA award winner and Australian pop royalty available for headline corporate galas and grand weddings.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Pop",
        "R&B"
      ]
    },
    {
      "id": "jessica-mauboy",
      "name": "Jessica Mauboy",
      "category": "celebrity",
      "genre": "Pop / Soul Celebrity",
      "image": "images/artists/jessica-mauboy.jpg",
      "rate": "$15,000+",
      "bio": "Superstar vocalist delivering show-stopping pop and soul anthems for high-profile gala events.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Pop",
        "Soul"
      ]
    },
    {
      "id": "anthony-callea",
      "name": "Anthony Callea",
      "category": "celebrity",
      "genre": "Pop / Classical Crossover",
      "image": "images/party-band.jpg",
      "rate": "$10,000+",
      "bio": "Powerhouse vocal virtuoso renowned for thrilling stadium vocals and elegant corporate performances.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Vocalist"
      ]
    },
    {
      "id": "dami-im",
      "name": "Dami Im",
      "category": "celebrity",
      "genre": "Pop / Eurovision Star",
      "image": "images/solo.jpg",
      "rate": "$12,000+",
      "bio": "Eurovision runner-up and multi-platinum recording artist with breathtaking vocal range.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Pop"
      ]
    },
    {
      "id": "mark-vincent",
      "name": "Mark Vincent",
      "category": "celebrity",
      "genre": "Solo Performer · Classical / Opera Tenor",
      "image": "images/acts/celebrity-bands-and-artists/mark-vincent.jpg",
      "rate": "$8,500+",
      "bio": "Australian operatic tenor and solo performer — powerful, emotive vocals for formal dinners, ceremonies, galas and premium private events.",
      "featured": false,
      "tags": [
        "Solo",
        "Opera",
        "Tenor"
      ]
    },
    {
      "id": "casey-donovan",
      "name": "Casey Donovan",
      "category": "celebrity",
      "genre": "Soul / Blues Star",
      "image": "images/solo.jpg",
      "rate": "$9,000+",
      "bio": "Powerhouse soul and blues vocalist and musical theatre star bringing unforgettable passion.",
      "featured": false,
      "tags": [
        "Celebrity",
        "Soul"
      ]
    },
    {
      "id": "justice-crew",
      "name": "Justice Crew",
      "category": "celebrity",
      "genre": "Pop / Hip-Hop Dance Group",
      "image": "images/trio.jpg",
      "rate": "$10,000+",
      "bio": "Record-breaking ARIA #1 pop and dance crew delivering electrifying stage performances.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Dance"
      ]
    },
    {
      "id": "ricki-lee",
      "name": "Ricki-Lee Coulter",
      "category": "celebrity",
      "genre": "Pop / Dance Diva",
      "image": "images/artists/ricki-lee.jpg",
      "rate": "$12,000+",
      "bio": "High-octane pop icon and TV personality performing dance anthems for major galas.",
      "featured": true,
      "tags": [
        "Celebrity",
        "Pop"
      ]
    },
    {
      "id": "jelly-bean-jam",
      "name": "Jelly Bean Jam",
      "category": "bands",
      "genre": "Classic Party Show Band",
      "image": "images/party-band.jpg",
      "rate": "$3,800+",
      "bio": "Australia's favourite retro party showband playing non-stop dance hits from the 70s, 80s, 90s, and today.",
      "featured": true,
      "tags": [
        "Bands",
        "Party Band",
        "Showband"
      ]
    },
    {
      "id": "brown-sugar",
      "name": "Brown Sugar",
      "category": "bands",
      "genre": "Soul, R&B & Funk",
      "image": "images/party-band.jpg",
      "rate": "$3,500+",
      "bio": "Sydney's premier soul & R&B band featuring Australia's finest groove musicians.",
      "featured": true,
      "tags": [
        "Bands",
        "Soul",
        "R&B"
      ]
    },
    {
      "id": "high-rollers",
      "name": "High Rollers",
      "category": "bands",
      "genre": "High-Energy Party Band",
      "rate": "$3,200+",
      "image": "images/party-band.jpg",
      "bio": "Dynamic 5 to 7-piece party band equipped with brass section and twin vocalists.",
      "featured": true,
      "tags": [
        "Bands",
        "Party Band"
      ]
    },
    {
      "id": "mesa-groove",
      "name": "Mesa Groove",
      "category": "bands",
      "genre": "Funk, Disco & Retro",
      "image": "images/party-band.jpg",
      "rate": "$3,000+",
      "bio": "Tight 6-piece cover band bringing retro disco, funk classics, and modern pop to life.",
      "featured": false,
      "tags": [
        "Bands",
        "Funk"
      ]
    },
    {
      "id": "lets-groove",
      "name": "Let's Groove",
      "category": "bands",
      "genre": "Party & Rock Cover Band",
      "image": "images/party-band.jpg",
      "rate": "$2,800+",
      "bio": "High-octane party band delivering dance floor bangers for corporate galas and weddings.",
      "featured": false,
      "tags": [
        "Bands",
        "Cover Band"
      ]
    },
    {
      "id": "zoltan",
      "name": "Zoltan",
      "category": "solos",
      "genre": "Saxophone & Vocals",
      "image": "images/solo.jpg",
      "rate": "$1,100+",
      "bio": "Slick saxophonist and vocalist bringing smooth jazz atmosphere and club sax energy.",
      "featured": true,
      "tags": [
        "Solo",
        "Saxophone"
      ]
    },
    {
      "id": "marco-soloist",
      "name": "Marco - Soloist",
      "category": "solos",
      "genre": "Latin & Acoustic Pop",
      "image": "images/solo.jpg",
      "rate": "$950+",
      "bio": "Charismatic vocalist and guitarist playing Latin, pop, and acoustic favorites.",
      "featured": false,
      "tags": [
        "Solo",
        "Latin"
      ]
    },
    {
      "id": "jo-elms",
      "name": "Jo Elms",
      "category": "solos",
      "genre": "Acoustic Soul & Jazz",
      "image": "images/solo.jpg",
      "rate": "$1,000+",
      "bio": "Award-winning singer-songwriter delivering soul-stirring acoustic performances.",
      "featured": false,
      "tags": [
        "Solo",
        "Vocalist"
      ]
    },
    {
      "id": "am-2-pm-duo",
      "name": "AM 2 PM Duo",
      "category": "duos",
      "genre": "Electric & Acoustic Duo",
      "image": "images/duo.jpg",
      "rate": "$1,600+",
      "bio": "High-energy duo with guitar and vocals performing classic rock and dance covers.",
      "featured": true,
      "tags": [
        "Duo",
        "Acoustic"
      ]
    },
    {
      "id": "flava-duo",
      "name": "Flava Duo",
      "category": "duos",
      "genre": "Soul & Jazz Duo",
      "image": "images/duo.jpg",
      "rate": "$1,500+",
      "bio": "Sensational vocal and keyboard duo bringing sophisticated lounge sounds.",
      "featured": false,
      "tags": [
        "Duo",
        "Jazz"
      ]
    },
    {
      "id": "hype-boys-trio",
      "name": "The Hype Boys Trio",
      "category": "trios",
      "genre": "Modern Pop & Rock Trio",
      "image": "images/trio.jpg",
      "rate": "$2,400+",
      "bio": "Dynamic 3-piece acoustic and electric trio packing full-band energy into a compact setup.",
      "featured": true,
      "tags": [
        "Trio",
        "Party"
      ]
    },
    {
      "id": "geoff-zhang-duo",
      "name": "Geoff Zhang Duo",
      "category": "duos",
      "genre": "Violin & Piano Duo",
      "image": "images/duo.jpg",
      "rate": "$1,400+",
      "bio": "Virtuoso classical and pop crossover duo for ceremonies and high-end receptions.",
      "featured": false,
      "tags": [
        "Duo",
        "Classical"
      ]
    },
    {
      "id": "pink-show",
      "name": "The Pink Show",
      "category": "tributes",
      "genre": "P!nk Tribute Show",
      "image": "images/trio.jpg",
      "rate": "$4,500+",
      "bio": "Australia's #1 tribute to P!nk featuring live 5-piece band and energetic dancers.",
      "featured": true,
      "tags": [
        "Tribute",
        "Rock"
      ]
    },
    {
      "id": "kick-inxs",
      "name": "Kick – The INXS Show",
      "category": "tributes",
      "genre": "INXS Tribute Show",
      "image": "images/party-band.jpg",
      "rate": "$4,200+",
      "bio": "Authentic reproduction of INXS's iconic concert sound and charismatic stage presence.",
      "featured": true,
      "tags": [
        "Tribute",
        "Rock"
      ]
    },
    {
      "id": "fabba",
      "name": "FABBA",
      "category": "tributes",
      "genre": "ABBA Tribute Show",
      "image": "images/acts/stage-shows/fabba.jpg",
      "rate": "POA",
      "bio": "Australia's memorable ABBA show (est. 1996) — hits, costumes and Mamma Mia–style theatrics. fabba.com.au",
      "featured": true,
      "tags": [
        "Tribute",
        "ABBA",
        "Disco"
      ]
    },
    {
      "id": "beatnix-show",
      "name": "The BEATnix Show",
      "category": "tributes",
      "genre": "Beatles Tribute Show",
      "image": "images/party-band.jpg",
      "rate": "$3,800+",
      "bio": "The world-famous Beatles tribute show performing all the hits with period instruments.",
      "featured": false,
      "tags": [
        "Tribute",
        "Classics"
      ]
    },
    {
      "id": "audio-vixen",
      "name": "Audio Vixen",
      "category": "tributes",
      "genre": "Harmony Vocal Show",
      "image": "images/trio.jpg",
      "rate": "$3,500+",
      "bio": "X-Factor finalists renowned for spellbinding 3-part vocal harmonies.",
      "featured": false,
      "tags": [
        "Show",
        "Vocal"
      ]
    },
    {
      "id": "sing-little-sister",
      "name": "Sing Little Sister",
      "category": "tributes",
      "genre": "70s & 80s Female Duo",
      "image": "images/duo.jpg",
      "rate": "$2,800+",
      "bio": "High-energy tribute celebrating female icons of rock and pop.",
      "featured": false,
      "tags": [
        "Tribute",
        "Pop"
      ]
    },
    {
      "id": "chinese-dance",
      "name": "Chinese Dance Spectacular",
      "category": "multicultural",
      "genre": "Traditional Cultural Dance",
      "image": "images/party-band.jpg",
      "rate": "$2,500+",
      "bio": "Breathtaking traditional Chinese fan, ribbon, and folk dancers.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Chinese"
      ]
    },
    {
      "id": "mandarin-band",
      "name": "The Mandarin Band",
      "category": "multicultural",
      "genre": "Mandopop & Canto Party Band",
      "image": "images/party-band.jpg",
      "rate": "$3,200+",
      "bio": "Bilingual party band performing popular Mandarin, Cantonese, and English pop hits.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Band"
      ]
    },
    {
      "id": "italian-affair",
      "name": "An Italian Affair",
      "category": "multicultural",
      "genre": "Traditional & Pop Italian",
      "image": "images/duo.jpg",
      "rate": "$2,200+",
      "bio": "Italian vocalists and accordion playing romantic tarantella and modern Italian hits.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Italian"
      ]
    },
    {
      "id": "salza-kings",
      "name": "Salza Kings",
      "category": "multicultural",
      "genre": "Salsa & Latin Showband",
      "image": "images/party-band.jpg",
      "rate": "$3,500+",
      "bio": "Fiery 8-piece Latin orchestra playing salsa, merengue, and bachata.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Latin"
      ]
    },
    {
      "id": "paradise-greek",
      "name": "Paradise Greek Band",
      "category": "multicultural",
      "genre": "Bouzouki & Greek Music",
      "image": "images/party-band.jpg",
      "rate": "$2,800+",
      "bio": "Authentic Greek band with live bouzouki playing traditional and modern Greek party songs.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Greek"
      ]
    },
    {
      "id": "m7-filipino",
      "name": "M7 Filipino Band",
      "category": "multicultural",
      "genre": "Filipino OPM & Top 40",
      "image": "images/party-band.jpg",
      "rate": "$2,600+",
      "bio": "Versatile 6-piece band performing OPM favorites and English pop hits.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Filipino"
      ]
    },
    {
      "id": "ulah-lebanese",
      "name": "Ulah Lebanese Belly Dancers",
      "category": "multicultural",
      "genre": "Belly Dance & Tabla",
      "image": "images/solo.jpg",
      "rate": "$1,500+",
      "bio": "Mesmerizing Arabic belly dancers accompanied by live Middle Eastern percussion.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Dance"
      ]
    },
    {
      "id": "oriental-show",
      "name": "The Oriental Show ft. Lily Cheng",
      "category": "multicultural",
      "genre": "Asian Fusion & Stage",
      "image": "images/solo.jpg",
      "rate": "$2,800+",
      "bio": "Glamorous stage production showcasing traditional instruments and vocal fusion.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Fusion"
      ]
    },
    {
      "id": "lion-dancers",
      "name": "Chinese Lion Dancers",
      "category": "multicultural",
      "genre": "Traditional Lion & Drumming",
      "image": "images/party-band.jpg",
      "rate": "$1,800+",
      "bio": "High-energy Chinese lion dance troupe bringing blessing, luck, and spectacle.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Lion Dance"
      ]
    },
    {
      "id": "maggie-chung",
      "name": "Maggie Chung",
      "category": "multicultural",
      "genre": "Guzheng Soloist",
      "image": "images/solo.jpg",
      "rate": "$1,000+",
      "bio": "Master Guzheng player delivering elegant traditional Chinese zither music.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Instrumental"
      ]
    },
    {
      "id": "thailand-dancers",
      "name": "Thailand Dancers",
      "category": "multicultural",
      "genre": "Thai Classical Dance",
      "image": "images/solo.jpg",
      "rate": "$1,800+",
      "bio": "Exquisite Thai traditional dancers with golden headpieces and costumes.",
      "featured": false,
      "tags": [
        "Multicultural",
        "Thai"
      ]
    },
    {
      "id": "zeffe-drummers",
      "name": "Zeffe Lebanese Drummers",
      "category": "multicultural",
      "genre": "Middle Eastern Zaffe",
      "image": "images/party-band.jpg",
      "rate": "$2,200+",
      "bio": "High-energy Lebanese Zaffe drummers for grand wedding entrances.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Zaffe"
      ]
    },
    {
      "id": "gonzalo-porta",
      "name": "Gonzalo Porta Latin Spectacular",
      "category": "multicultural",
      "genre": "Salsa & Reggaeton Star",
      "image": "images/party-band.jpg",
      "rate": "$3,800+",
      "bio": "International Latin music star performing high-octane salsa, bachata, and Latin pop.",
      "featured": true,
      "tags": [
        "Multicultural",
        "Latin"
      ]
    },
    {
      "id": "melinda-schneider",
      "name": "Melinda Schneider",
      "category": "country",
      "genre": "Country & Folk",
      "image": "images/solo.jpg",
      "rate": "$5,000+",
      "bio": "Multi-Golden Guitar winner and celebrated country vocalist.",
      "featured": true,
      "tags": [
        "Country",
        "Vocalist"
      ]
    },
    {
      "id": "adam-brand",
      "name": "Adam Brand",
      "category": "country",
      "genre": "Country Rock",
      "image": "images/solo.jpg",
      "rate": "$6,500+",
      "bio": "Iconic Australian country rocker with 12 Golden Guitar awards.",
      "featured": true,
      "tags": [
        "Country",
        "Rock"
      ]
    },
    {
      "id": "beccy-cole",
      "name": "Beccy Cole",
      "category": "country",
      "genre": "Country & Roots",
      "image": "images/solo.jpg",
      "rate": "$5,500+",
      "bio": "Beloved country star delivering high-energy Australian country storytelling.",
      "featured": false,
      "tags": [
        "Country"
      ]
    },
    {
      "id": "jason-owen",
      "name": "Jason Owen",
      "category": "country",
      "genre": "Country Pop",
      "image": "images/artists/jason-owen.jpg",
      "rate": "$4,000+",
      "bio": "X-Factor finalist and country pop sensation.",
      "featured": true,
      "tags": [
        "Country",
        "Pop"
      ]
    },
    {
      "id": "vince-sorrenti",
      "name": "Vince Sorrenti",
      "category": "comedians",
      "genre": "Stand-Up Comedy / Host",
      "image": "images/solo.jpg",
      "rate": "$5,000+",
      "bio": "Five-time MO Award winner and Australia's most sought-after corporate MC & comedian.",
      "featured": true,
      "tags": [
        "Comedian",
        "MC"
      ]
    },
    {
      "id": "joe-avati",
      "name": "Joe Avati",
      "category": "comedians",
      "genre": "Stand-Up Comedy",
      "image": "images/solo.jpg",
      "rate": "$5,500+",
      "bio": "Internationally touring Italian-Australian comedy star.",
      "featured": true,
      "tags": [
        "Comedian"
      ]
    },
    {
      "id": "anh-do",
      "name": "Anh Do",
      "category": "comedians",
      "genre": "Keynote & Comedy",
      "image": "images/artists/anh-do.jpg",
      "rate": "$8,000+",
      "bio": "Best-selling author, artist, and beloved Australian comedian for keynote galas.",
      "featured": true,
      "tags": [
        "Comedian",
        "Keynote"
      ]
    },
    {
      "id": "george-kapiniaris",
      "name": "George Kapiniaris",
      "category": "comedians",
      "genre": "Comedy & Stage",
      "image": "images/artists/george-kapiniaris.jpg",
      "rate": "$4,500+",
      "bio": "Stage legend and Wogs Out of Work star bringing energetic comedy.",
      "featured": false,
      "tags": [
        "Comedian"
      ]
    },
    {
      "id": "smurfs-show",
      "name": "The Smurfs Show",
      "category": "children",
      "genre": "Character Stage Show",
      "image": "images/party-band.jpg",
      "rate": "$2,500+",
      "bio": "Official licensed costume character show for family events and corporate family days.",
      "featured": true,
      "tags": [
        "Children",
        "Show"
      ]
    },
    {
      "id": "wiggles",
      "name": "The Wiggles",
      "category": "children",
      "genre": "Children's Music & Show",
      "image": "images/artists/wiggles.jpg",
      "rate": "$20,000+",
      "bio": "The world's #1 children's entertainment group.",
      "featured": true,
      "tags": [
        "Children",
        "Celebrity"
      ]
    },
    {
      "id": "magic-max",
      "name": "Magic to the Max Childrens Show",
      "category": "children",
      "genre": "Magic & Illusion",
      "image": "images/solo.jpg",
      "rate": "$1,200+",
      "bio": "Interactive children's magic show with live illusions and comedy.",
      "featured": false,
      "tags": [
        "Children",
        "Magic"
      ]
    },
    {
      "id": "crazy-science",
      "name": "The Magical World of Crazy Science",
      "category": "children",
      "genre": "Science & Comedy Show",
      "image": "images/party-band.jpg",
      "rate": "$1,800+",
      "bio": "Mind-blowing science demonstrations with giant bubbles, smoke rings, and comedy.",
      "featured": true,
      "tags": [
        "Children",
        "Science"
      ]
    },
    {
      "id": "mimosa-duo",
      "name": "Mimosa Duo",
      "category": "classical",
      "genre": "Violin & Guitar Duo",
      "image": "images/duo.jpg",
      "rate": "$1,500+",
      "bio": "Virtuoso French gypsy jazz and classical violin duo.",
      "featured": true,
      "tags": [
        "Classical",
        "Duo"
      ]
    },
    {
      "id": "gaetano-bonfante",
      "name": "Gaetano Bonfante",
      "category": "classical",
      "genre": "Operatic Tenor",
      "image": "images/solo.jpg",
      "rate": "$2,500+",
      "bio": "International opera tenor performing classic Italian arias and Neapolitan songs.",
      "featured": false,
      "tags": [
        "Classical",
        "Opera"
      ]
    },
    {
      "id": "bocelli-brightman",
      "name": "Bocelli & Brightman",
      "category": "classical",
      "genre": "Operatic Duo Show",
      "image": "images/duo.jpg",
      "rate": "$3,800+",
      "bio": "Stunning tribute to Andrea Bocelli and Sarah Brightman.",
      "featured": true,
      "tags": [
        "Classical",
        "Opera"
      ]
    },
    {
      "id": "night-proms",
      "name": "A Night at the Proms",
      "category": "classical",
      "genre": "Orchestral Show",
      "image": "images/party-band.jpg",
      "rate": "$6,000+",
      "bio": "Grand orchestral concert featuring brass, strings, and classical vocalists.",
      "featured": true,
      "tags": [
        "Classical",
        "Orchestra"
      ]
    },
    {
      "id": "string-sirens",
      "name": "String Sirens",
      "category": "classical",
      "genre": "Electric String Quartet",
      "image": "images/party-band.jpg",
      "rate": "$3,200+",
      "bio": "Glamorous female electric string quartet playing classical crossover hits.",
      "featured": true,
      "tags": [
        "Classical",
        "Strings"
      ]
    },
    {
      "id": "apollo-strings",
      "name": "Apollo Strings",
      "category": "classical",
      "genre": "Acoustic String Quartet",
      "image": "images/party-band.jpg",
      "rate": "$2,800+",
      "bio": "Elegant string quartet for wedding ceremonies and VIP cocktail receptions.",
      "featured": false,
      "tags": [
        "Classical",
        "Quartet"
      ]
    },
    {
      "id": "vixen-strings",
      "name": "Vixen Strings",
      "category": "classical",
      "genre": "Roving Strings",
      "image": "images/party-band.jpg",
      "rate": "$3,000+",
      "bio": "Roving string ensemble performing modern pop and classical hits.",
      "featured": false,
      "tags": [
        "Classical",
        "Roving"
      ]
    },
    {
      "id": "jingle-bellies",
      "name": "Jingle Bellies Christmas",
      "category": "specialty",
      "genre": "Christmas Belly Dance Show",
      "image": "images/duo.jpg",
      "rate": "$1,800+",
      "bio": "Festive Christmas themed belly dance performance with holiday music.",
      "featured": false,
      "tags": [
        "Specialty",
        "Christmas"
      ]
    },
    {
      "id": "mrs-claus",
      "name": "Mrs Claus Christmas",
      "category": "specialty",
      "genre": "Festive Storytelling & Songs",
      "image": "images/solo.jpg",
      "rate": "$950+",
      "bio": "Enchanting Mrs. Claus performer for Christmas events.",
      "featured": false,
      "tags": [
        "Specialty",
        "Christmas"
      ]
    },
    {
      "id": "santa-claus",
      "name": "Santa Claus Christmas",
      "category": "specialty",
      "genre": "Professional Santa",
      "image": "images/solo.jpg",
      "rate": "$1,100+",
      "bio": "Real-bearded professional Santa Claus for corporate functions and photo setups.",
      "featured": true,
      "tags": [
        "Specialty",
        "Christmas"
      ]
    },
    {
      "id": "ian-cooper-stpat",
      "name": "Ian Cooper St. Patrick's Day",
      "category": "specialty",
      "genre": "Irish Fiddle & Jig",
      "image": "images/solo.jpg",
      "rate": "$1,800+",
      "bio": "Golden Fiddler winner Ian Cooper playing fiery Irish jigs and reels.",
      "featured": true,
      "tags": [
        "Specialty",
        "Irish"
      ]
    },
    {
      "id": "easter-bunny",
      "name": "Easter Bunny Easter",
      "category": "specialty",
      "genre": "Costume Character",
      "image": "images/solo.jpg",
      "rate": "$850+",
      "bio": "Delightful Easter Bunny character for community and corporate egg hunts.",
      "featured": false,
      "tags": [
        "Specialty",
        "Easter"
      ]
    },
    {
      "id": "naidoc",
      "name": "Australia Day & NAIDOC",
      "category": "specialty",
      "genre": "Indigenous Didgeridoo & Dance",
      "image": "images/trio.jpg",
      "rate": "$2,200+",
      "bio": "Authentic First Nations didgeridoo players and cultural dancers.",
      "featured": true,
      "tags": [
        "Specialty",
        "Indigenous"
      ]
    },
    {
      "id": "bavarians-oktoberfest",
      "name": "The Bavarians Oom Pa Pa Band",
      "category": "specialty",
      "genre": "Oktoberfest Oompah Band",
      "image": "images/party-band.jpg",
      "rate": "$2,800+",
      "bio": "Authentic German Oktoberfest brass band with accordions and sing-alongs.",
      "featured": true,
      "tags": [
        "Specialty",
        "Oktoberfest"
      ]
    },
    {
      "id": "julie-accordion",
      "name": "Julie Accordion",
      "category": "roving",
      "genre": "Roving Accordionist",
      "image": "images/solo.jpg",
      "rate": "$950+",
      "bio": "Charming roving accordionist performing French, Italian, and pop songs.",
      "featured": false,
      "tags": [
        "Roving",
        "Accordion"
      ]
    },
    {
      "id": "ian-cooper-irish",
      "name": "Ian Cooper Irish Jig Music",
      "category": "roving",
      "genre": "Roving Fiddler",
      "image": "images/solo.jpg",
      "rate": "$1,800+",
      "bio": "Virtuoso roving fiddler interacting with guests.",
      "featured": true,
      "tags": [
        "Roving",
        "Violin"
      ]
    },
    {
      "id": "brendan-magician",
      "name": "Brendan the Roving Magician",
      "category": "roving",
      "genre": "Close-Up Magic",
      "image": "images/solo.jpg",
      "rate": "$1,200+",
      "bio": "Mind-bending close-up sleight of hand magic performed right in guests' hands.",
      "featured": true,
      "tags": [
        "Roving",
        "Magic"
      ]
    },
    {
      "id": "julie-tony-italian",
      "name": "Julie & Tony Italian",
      "category": "roving",
      "genre": "Roving Italian Duo",
      "image": "images/duo.jpg",
      "rate": "$1,800+",
      "bio": "Roving Italian acoustic duo singing classic love songs table-to-table.",
      "featured": false,
      "tags": [
        "Roving",
        "Italian"
      ]
    },
    {
      "id": "asian-grace-stilt",
      "name": "Asian Grace Stilt Walking",
      "category": "roving",
      "genre": "Stilt Walkers",
      "image": "images/solo.jpg",
      "rate": "$1,500+",
      "bio": "Towering silk stilt walkers bringing color and elegance to festivals.",
      "featured": true,
      "tags": [
        "Roving",
        "Stilts"
      ]
    },
    {
      "id": "kenny-juggler",
      "name": "Kenny Chinese Juggler",
      "category": "roving",
      "genre": "Juggling & Circus",
      "image": "images/solo.jpg",
      "rate": "$1,100+",
      "bio": "World-class Chinese circus juggler performing plate spinning and diabolo.",
      "featured": false,
      "tags": [
        "Roving",
        "Circus"
      ]
    },
    {
      "id": "neo-chinese-face",
      "name": "Neo Chinese Change Face Artist",
      "category": "roving",
      "genre": "Bian Lian Mask Changing",
      "image": "images/solo.jpg",
      "rate": "$2,000+",
      "bio": "Ancient secret Chinese Bian Lian mask-changing theatrical art form.",
      "featured": true,
      "tags": [
        "Roving",
        "Cultural"
      ]
    },
    {
      "id": "thai-roving-dancers",
      "name": "Thai Roving Dancers",
      "category": "roving",
      "genre": "Roving Dance Troupe",
      "image": "images/party-band.jpg",
      "rate": "$1,800+",
      "bio": "Roving Thai dancers in authentic traditional costumes greeting VIP guests.",
      "featured": false,
      "tags": [
        "Roving",
        "Thai"
      ]
    },
    {
      "id": "dean-karaoke",
      "name": "Dean the Karaoke Man",
      "category": "djs",
      "genre": "Karaoke Host & DJ",
      "image": "images/solo.jpg",
      "rate": "$1,200+",
      "bio": "High-energy karaoke host with over 50,000 tracks and pro sound setup.",
      "featured": true,
      "tags": [
        "DJs",
        "Karaoke"
      ]
    },
    {
      "id": "dj-chad",
      "name": "DJ Chad",
      "category": "djs",
      "genre": "Club & Event DJ",
      "image": "images/solo.jpg",
      "rate": "$1,500+",
      "bio": "Vibrant club and corporate DJ playing house, urban, and dance floor anthems.",
      "featured": true,
      "tags": [
        "DJs",
        "Club"
      ]
    },
    {
      "id": "dj-james-mack",
      "name": "DJ James Mack",
      "category": "djs",
      "genre": "VIP Wedding & Gala DJ",
      "image": "images/solo.jpg",
      "rate": "$1,800+",
      "bio": "Elite wedding DJ & MC with intelligent lighting rigs and custom playlists.",
      "featured": true,
      "tags": [
        "DJs",
        "Wedding"
      ]
    },
    {
      "id": "dj-nick-field",
      "name": "DJ Nick Field",
      "category": "djs",
      "genre": "Deep House & Retro DJ",
      "image": "images/solo.jpg",
      "rate": "$1,400+",
      "bio": "Cool lounge DJ crafting sunset beats and retro vinyl sets.",
      "featured": false,
      "tags": [
        "DJs",
        "Lounge"
      ]
    },
    {
      "id": "app-based-dj",
      "name": "App Based DJ",
      "category": "djs",
      "genre": "Interactive Request DJ",
      "image": "images/solo.jpg",
      "rate": "$1,100+",
      "bio": "Digital interactive DJ setup allowing guests to request songs directly from their phones.",
      "featured": false,
      "tags": [
        "DJs",
        "Interactive"
      ]
    }
  ];
  const DEFAULT_EVENTS = [
    {
      "id": "event_1",
      "title": "Summer VIP Yacht Gala",
      "category": "Luxury Yacht",
      "date": "Dec 31, 2026",
      "image": "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80",
      "description": "An exclusive multi-deck harbour gala featuring DJ Aurelius, live saxophone, and champagne service.",
      "status": "Booking Open"
    },
    {
      "id": "event_2",
      "title": "Grand Wedding Showcase 2026",
      "category": "Weddings",
      "date": "Nov 15, 2026",
      "image": "images/party-band.jpg",
      "description": "Live performance showcases by The Royal Velvet Band & Evelyn & Marcus Duo with venue styling consultations.",
      "status": "Featured Showcase"
    },
    {
      "id": "event_3",
      "title": "Supercar & Sound Experience",
      "category": "Luxury Car Hire",
      "date": "Available Daily",
      "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "description": "Chauffeur-driven luxury fleet combined with customized acoustic audio for high-profile red carpet entries.",
      "status": "Active Package"
    }
  ];
  const DEFAULT_CATEGORIES = [
    {
      "id": "celebrity",
      "name": "Celebrity Bands & Artists",
      "count": "8 Acts",
      "image": "images/artists/jessica-mauboy.jpg"
    },
    {
      "id": "bands",
      "name": "Bands & Party Bands",
      "count": "14+ Acts",
      "image": "images/party-band.jpg"
    },
    {
      "id": "solos",
      "name": "Solo Vocalists & Performers",
      "count": "18+ Acts",
      "image": "images/solo.jpg"
    },
    {
      "id": "duos",
      "name": "Acoustic & Electric Duos",
      "count": "12+ Acts",
      "image": "images/duo.jpg"
    },
    {
      "id": "trios",
      "name": "Trios & Cover Bands",
      "count": "10+ Acts",
      "image": "images/trio.jpg"
    },
    {
      "id": "tributes",
      "name": "Stage Shows & Tribute Acts",
      "count": "10+ Shows",
      "image": "images/party-band.jpg"
    },
    {
      "id": "multicultural",
      "name": "Multicultural Entertainment",
      "count": "15+ Acts",
      "image": "images/party-band.jpg"
    },
    {
      "id": "country",
      "name": "Country Music Stars",
      "count": "6+ Acts",
      "image": "images/artists/jason-owen.jpg"
    },
    {
      "id": "comedians",
      "name": "Comedians & MCs",
      "count": "8+ Performers",
      "image": "images/artists/anh-do.jpg"
    },
    {
      "id": "children",
      "name": "Children's Entertainment",
      "count": "6+ Shows",
      "image": "images/artists/wiggles.jpg"
    },
    {
      "id": "classical",
      "name": "Classical & Opera",
      "count": "8+ Ensembles",
      "image": "images/duo.jpg"
    },
    {
      "id": "specialty",
      "name": "Seasonal & Specialty",
      "count": "10+ Acts",
      "image": "images/party-band.jpg"
    },
    {
      "id": "roving",
      "name": "Roving Entertainment",
      "count": "12+ Acts",
      "image": "images/solo.jpg"
    },
    {
      "id": "djs",
      "name": "DJs & Karaoke",
      "count": "20+ DJs",
      "image": "images/solo.jpg"
    }
  ];
  const DEFAULT_CONTENT = {
    "heroTitle": "ELITE ENTERTAINMENT",
    "heroSubtitle": "UNRIVALLED ENTERTAINMENT FOR EXTRAORDINARY EVENTS",
    "heroBackdrop": "hero_banner.png",
    "heroVideo1": "https://assets.mixkit.co/videos/4275/4275-720.mp4",
    "heroVideo2": "https://assets.mixkit.co/videos/41764/41764-720.mp4",
    "heroVideo3": "https://assets.mixkit.co/videos/4210/4210-720.mp4",
    "heroPoster": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=60",
    "introVideo": "videos/elite-intro-animation.mp4",
    "companyLegalName": "ELITE ENTERTAINMENT & EVENTS PTY LTD",
    "abn": "17 698 991 481",
    "acn": "698 991 481",
    "asicDate": "40+ years",
    "publicLiability": "Public Liability Insurance held — certificates available on request for tender and venue compliance.",
    "workersComp": "Workers compensation cover as required for contracted personnel.",
    "contactPhone": "+61 417 221 111",
    "contactEmail": "info@eeevents.com.au",
    "contactEmailBookings": "bookings@eeevents.com.au",
    "contactAddress": "Sydney | Melbourne | Brisbane | Gold Coast"
  };

  class EliteCMSEngine {
    constructor() {
      this.init();
    }

    seedIfEmpty(key, defaults) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw || raw === '[]' || raw === '{}') {
          localStorage.setItem(key, JSON.stringify(defaults));
        } else if (key === STORAGE_KEYS.CONTENT) {
          // merge new default keys without wiping admin edits
          const cur = JSON.parse(raw);
          localStorage.setItem(key, JSON.stringify(Object.assign({}, defaults, cur)));
        }
      } catch (e) {
        localStorage.setItem(key, JSON.stringify(defaults));
      }
    }

    init() {
      this.seedIfEmpty(STORAGE_KEYS.ARTISTS, DEFAULT_ARTISTS);
      this.seedIfEmpty(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
      this.seedIfEmpty(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      this.seedIfEmpty(STORAGE_KEYS.CONTENT, DEFAULT_CONTENT);
      this.syncFirestore();
      this.applyHeroVideos();
    }

    applyHeroVideos() {
      try {
        const c = this.getContent();
        const slides = document.querySelectorAll('[data-hero-slide] source, video[data-hero-slide] source');
        const videos = [c.heroVideo1, c.heroVideo2, c.heroVideo3].filter(Boolean);
        const nodes = document.querySelectorAll('video[data-hero-slide]');
        nodes.forEach(function (vid, i) {
          if (!videos[i]) return;
          var src = vid.querySelector('source');
          if (src && src.getAttribute('src') !== videos[i]) {
            src.setAttribute('src', videos[i]);
            try { vid.load(); } catch (e) { }
          }
          if (c.heroPoster) vid.setAttribute('poster', c.heroPoster);
        });
      } catch (e) { }
    }

    syncFirestore() {
      var self = this;
      function pull(db) {
        db.collection('site_content').doc('main').get().then(function (doc) {
          if (doc.exists) {
            var data = doc.data() || {};
            if (data.artists) localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(data.artists));
            if (data.events) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
            if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
            if (data.content) {
              var merged = Object.assign({}, DEFAULT_CONTENT, data.content);
              localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(merged));
            }
            self.applyHeroVideos();
            window.dispatchEvent(new CustomEvent('elite-cms-synced'));
          }
        }).catch(function (err) { console.log('Firestore sync notice:', err.message); });
      }
      try {
        if (window.EliteFirebase && window.EliteFirebase.db) {
          pull(window.EliteFirebase.db);
        } else if (window.firebase && window.firebase.firestore) {
          pull(firebase.firestore());
        }
      } catch (e) {
        console.warn('Firestore offline fallback active.');
      }
    }

    pushToFirestore() {
      try {
        var payload = {
          artists: this.getArtists(),
          events: this.getEvents(),
          categories: this.getCategories(),
          content: this.getContent(),
          updatedAt: new Date().toISOString()
        };
        if (window.EliteFirebase && window.EliteFirebase.db) {
          window.EliteFirebase.db.collection('site_content').doc('main').set(payload, { merge: true })
            .catch(function (err) { console.warn('Firestore update warning:', err); });
        } else if (window.firebase && window.firebase.firestore) {
          firebase.firestore().collection('site_content').doc('main').set(payload, { merge: true })
            .catch(function (err) { console.warn('Firestore update warning:', err); });
        }
        // also mirror multi-enquiries & clients collections handled elsewhere
      } catch (e) { }
    }

    /* ─── ARTIST CMS METHODS ─── */
    getArtists(categoryFilter = null) {
      let data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTISTS) || '[]');
      if (window.EliteMedia && typeof window.EliteMedia.enrichCmsArtist === 'function') {
        data = data.map(function (a) {
          return window.EliteMedia.enrichCmsArtist(Object.assign({}, a));
        });
      }
      if (!categoryFilter) return data;
      const catLower = categoryFilter.toLowerCase();
      return data.filter(a =>
        a.category.toLowerCase() === catLower ||
        (a.tags && a.tags.map(t => t.toLowerCase()).includes(catLower))
      );
    }

    saveArtist(artist) {
      const artists = this.getArtists();
      if (!artist.id) {
        artist.id = 'artist_' + Date.now();
      }
      const existingIdx = artists.findIndex(a => a.id === artist.id);
      // Merge so we never wipe fields not present in the editor
      const merged = existingIdx >= 0
        ? Object.assign({}, artists[existingIdx], artist, { id: artist.id })
        : artist;
      // Keep rate optional for legacy data but never require it
      if (merged.rate == null) merged.rate = '';
      if (existingIdx >= 0) {
        artists[existingIdx] = merged;
      } else {
        artists.unshift(merged);
      }
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
      this.pushToFirestore();
      return merged;
    }

    deleteArtist(id) {
      let artists = this.getArtists();
      artists = artists.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
      this.pushToFirestore();
    }

    /* ─── EVENT CMS METHODS ─── */
    getEvents() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    }

    saveEvent(event) {
      const events = this.getEvents();
      if (!event.id) {
        event.id = 'event_' + Date.now();
      }
      const idx = events.findIndex(e => e.id === event.id);
      if (idx >= 0) {
        events[idx] = event;
      } else {
        events.unshift(event);
      }
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.pushToFirestore();
      return event;
    }

    deleteEvent(id) {
      let events = this.getEvents();
      events = events.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.pushToFirestore();
    }

    /* ─── CATEGORIES CMS METHODS ─── */
    getCategories() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    }

    saveCategory(category) {
      const categories = this.getCategories();
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        categories[idx] = category;
      } else {
        categories.push(category);
      }
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.pushToFirestore();
    }

    /* ─── SITE CONTENT CMS METHODS ─── */
    getContent() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '{}');
    }

    saveContent(content) {
      const current = this.getContent();
      const updated = Object.assign({}, current, content);
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updated));
      this.pushToFirestore();
      return updated;
    }

    resetToDefaults() {
      // Intentionally kept for emergency recovery only — not exposed in Super Admin UI
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(DEFAULT_ARTISTS));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
      this.pushToFirestore();
    }

    /* ─── CRM / LEAD PIPELINE (Kanban) ─── */
    static get KANBAN_COLUMNS() {
      return [
        { id: 'new', label: 'New Enquiry', color: '#c9a84c' },
        { id: 'contacted', label: 'Contacted', color: '#6db3f2' },
        { id: 'quoted', label: 'Quoted', color: '#b48cf2' },
        { id: 'negotiating', label: 'Negotiating', color: '#f0c060' },
        { id: 'booked', label: 'Booked / Won', color: '#55c555' },
        { id: 'lost', label: 'Lost / Closed', color: '#ff6b6b' }
      ];
    }

    _readJson(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
      } catch (e) {
        return fallback;
      }
    }

    _writeJson(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    _normalizeLeadStatus(raw) {
      const s = String(raw || 'Pending').toLowerCase();
      if (s.includes('book') || s === 'won' || s === 'confirmed') return 'booked';
      if (s.includes('lost') || s.includes('reject') || s.includes('closed') || s === 'spam') return 'lost';
      if (s.includes('negot')) return 'negotiating';
      if (s.includes('quote') || s.includes('proposal')) return 'quoted';
      if (s.includes('contact') || s === 'lead' || s === 'in progress') return 'contacted';
      if (s === 'new' || s.includes('pend')) return 'new';
      // map unknown custom statuses into closest column
      return 'new';
    }

    _statusLabel(columnId) {
      const col = EliteCMSEngine.KANBAN_COLUMNS.find(c => c.id === columnId);
      return col ? col.label : columnId;
    }

    _normalizeLead(raw, sourceHint) {
      if (!raw || typeof raw !== 'object') return null;
      const column = raw.kanbanColumn || this._normalizeLeadStatus(raw.status);
      const attachments = Array.isArray(raw.attachments)
        ? raw.attachments
        : (Array.isArray(raw.attachmentNames)
          ? raw.attachmentNames.map(function (n) {
            return typeof n === 'string' ? { name: n, type: 'ref' } : n;
          })
          : []);
      return {
        id: raw.id || ('LEAD-' + Date.now().toString(36)),
        name: raw.name || 'Unknown',
        email: raw.email || '',
        phone: raw.phone || '',
        date: raw.date || raw.eventDate || '',
        endDate: raw.endDate || '',
        service: raw.service || raw.category || '',
        message: raw.message || '',
        budget: raw.budget || '',
        venue: raw.venue || '',
        guests: raw.guests || '',
        company: raw.company || '',
        status: this._statusLabel(column),
        kanbanColumn: column,
        notes: Array.isArray(raw.notes) ? raw.notes : [],
        attachments: attachments,
        source: raw.source || sourceHint || 'enquiry',
        page: raw.page || raw.category || '',
        timestamp: raw.timestamp || raw.at || new Date().toLocaleString(),
        updatedAt: raw.updatedAt || raw.timestamp || '',
        order: typeof raw.order === 'number' ? raw.order : Date.now()
      };
    }

    getInquiries() {
      return this._readJson('elite_inquiries', []);
    }

    getClients() {
      return this._readJson('elite_clients', []);
    }

    getPartners() {
      return this._readJson('elite_partners', []);
    }

    getAllLeads() {
      const inquiries = this.getInquiries().map((r) => this._normalizeLead(r, r.source || 'enquiry'));
      const clients = this.getClients().map((r) => this._normalizeLead(Object.assign({}, r, {
        service: r.service || 'Consultation',
        source: r.source || 'consultation'
      }), 'consultation'));
      // Merge by id (inquiry wins)
      const map = {};
      clients.forEach((l) => { if (l) map[l.id] = l; });
      inquiries.forEach((l) => { if (l) map[l.id] = l; });
      return Object.keys(map).map((k) => map[k]).sort((a, b) => {
        if (a.kanbanColumn === b.kanbanColumn) return (b.order || 0) - (a.order || 0);
        return 0;
      });
    }

    getLeadsByColumn() {
      const cols = {};
      EliteCMSEngine.KANBAN_COLUMNS.forEach((c) => { cols[c.id] = []; });
      this.getAllLeads().forEach((lead) => {
        const col = cols[lead.kanbanColumn] ? lead.kanbanColumn : 'new';
        cols[col].push(lead);
      });
      Object.keys(cols).forEach((k) => {
        cols[k].sort((a, b) => (b.order || 0) - (a.order || 0));
      });
      return cols;
    }

    _persistLead(lead) {
      // Prefer elite_inquiries; if originated as client CRM entry, update there too
      const inquiries = this.getInquiries();
      const clients = this.getClients();
      const iqIdx = inquiries.findIndex((r) => r.id === lead.id);
      const clIdx = clients.findIndex((r) => r.id === lead.id);
      const payload = Object.assign({}, lead, {
        status: lead.status || this._statusLabel(lead.kanbanColumn),
        updatedAt: new Date().toLocaleString()
      });

      if (iqIdx >= 0) {
        inquiries[iqIdx] = Object.assign({}, inquiries[iqIdx], payload);
        this._writeJson('elite_inquiries', inquiries);
      } else if (clIdx >= 0) {
        clients[clIdx] = Object.assign({}, clients[clIdx], payload);
        this._writeJson('elite_clients', clients);
      } else {
        inquiries.unshift(payload);
        this._writeJson('elite_inquiries', inquiries);
      }

      // Mirror lightweight CRM doc for ops console / multi-device if Firebase available
      try {
        if (window.EliteFirebase && EliteFirebase.db) {
          EliteFirebase.db.collection('inquiries').doc(String(lead.id)).set(payload, { merge: true }).catch(function () { });
        }
      } catch (e) { }

      return payload;
    }

    saveLead(partial) {
      if (!partial || !partial.id) {
        partial = Object.assign({ id: 'CRM-' + Date.now().toString(36) }, partial || {});
      }
      const existing = this.getAllLeads().find((l) => l.id === partial.id) || {};
      const merged = this._normalizeLead(Object.assign({}, existing, partial), partial.source || existing.source);
      merged.order = typeof partial.order === 'number' ? partial.order : (existing.order || Date.now());
      return this._persistLead(merged);
    }

    updateLeadStatus(id, nextStatus, source) {
      const lead = this.getAllLeads().find((l) => l.id === id);
      if (!lead) return null;
      const column = this._normalizeLeadStatus(nextStatus);
      return this.saveLead(Object.assign({}, lead, {
        id: id,
        source: source || lead.source,
        kanbanColumn: column,
        status: this._statusLabel(column)
      }));
    }

    moveLeadToColumn(id, columnId, order) {
      const allowed = EliteCMSEngine.KANBAN_COLUMNS.some((c) => c.id === columnId);
      if (!allowed) return null;
      const lead = this.getAllLeads().find((l) => l.id === id);
      if (!lead) return null;
      return this.saveLead(Object.assign({}, lead, {
        kanbanColumn: columnId,
        status: this._statusLabel(columnId),
        order: typeof order === 'number' ? order : Date.now()
      }));
    }

    addLeadNote(id, text, author) {
      const lead = this.getAllLeads().find((l) => l.id === id);
      if (!lead) return null;
      const notes = (lead.notes || []).slice();
      notes.unshift({
        id: 'N-' + Date.now().toString(36),
        text: String(text || '').trim(),
        author: author || 'Super Admin',
        at: new Date().toLocaleString()
      });
      return this.saveLead(Object.assign({}, lead, { notes: notes }));
    }

    addLeadAttachment(id, attachment) {
      const lead = this.getAllLeads().find((l) => l.id === id);
      if (!lead || !attachment) return null;
      const attachments = (lead.attachments || []).slice();
      attachments.push({
        id: 'A-' + Date.now().toString(36),
        name: attachment.name || 'file',
        type: attachment.type || 'file',
        size: attachment.size || 0,
        dataUrl: attachment.dataUrl || '',
        url: attachment.url || '',
        at: new Date().toLocaleString()
      });
      return this.saveLead(Object.assign({}, lead, { attachments: attachments }));
    }

    removeLeadAttachment(id, attachmentId) {
      const lead = this.getAllLeads().find((l) => l.id === id);
      if (!lead) return null;
      const attachments = (lead.attachments || []).filter((a) => a.id !== attachmentId && a.name !== attachmentId);
      return this.saveLead(Object.assign({}, lead, { attachments: attachments }));
    }

    deleteLead(id) {
      this._writeJson('elite_inquiries', this.getInquiries().filter((r) => r.id !== id));
      this._writeJson('elite_clients', this.getClients().filter((r) => r.id !== id));
      try {
        if (window.EliteFirebase && EliteFirebase.db) {
          EliteFirebase.db.collection('inquiries').doc(String(id)).delete().catch(function () { });
        }
      } catch (e) { }
    }

    clearInquiries() {
      this._writeJson('elite_inquiries', []);
    }

    clearPartners() {
      this._writeJson('elite_partners', []);
    }

    updatePartnerStatus(id, status) {
      const partners = this.getPartners();
      const idx = partners.findIndex((p) => p.id === id);
      if (idx < 0) return null;
      partners[idx].status = status;
      this._writeJson('elite_partners', partners);
      return partners[idx];
    }

    estimatePipeline() {
      // No public rate card — pipeline count is enquiry volume only
      return this.getAllLeads().filter((l) => l.kanbanColumn !== 'lost').length;
    }
  }

  window.EliteCMS = new EliteCMSEngine();
  window.EliteCMS.KANBAN_COLUMNS = EliteCMSEngine.KANBAN_COLUMNS;
  // Re-bridge CRM methods if elite-crm.js already loaded
  try {
    if (typeof window.__eliteBridgeCms === 'function') window.__eliteBridgeCms();
  } catch (e) { }
})(window);
