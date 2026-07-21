/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — Unified CMS Engine (cms.js)
   Handles storage, Firestore sync, and dynamic content
═══════════════════════════════════════════════════ */

(function (window) {
  const STORAGE_KEYS = {
    ARTISTS: 'elite_cms_artists_v3',
    EVENTS: 'elite_cms_events_v3',
    CATEGORIES: 'elite_cms_categories_v3',
    CONTENT: 'elite_cms_content_v3'
  };

  const DEFAULT_ARTISTS = [
    {
      id: 'artist_1',
      name: 'The Royal Velvet Band',
      category: 'bands',
      genre: 'Soul / Funk / High Energy Party Band',
      image: 'images/party-band.jpg',
      bio: 'Australia\'s premier 6 to 8-piece luxury party band, performing top-chart hits and timeless soul classics for elite galas.',
      rate: '$3,500+',
      featured: true,
      tags: ['Bands', 'Live', 'Luxury', 'Weddings', 'Party Band']
    },
    {
      id: 'artist_2',
      name: 'Symphony Trio Band',
      category: 'trios',
      genre: 'Pop / Modern Cover Trio',
      image: 'images/trio.jpg',
      bio: 'High-energy 3-piece acoustic and electric trio bringing dynamic vocals and polished beats for weddings and events.',
      rate: '$2,400+',
      featured: true,
      tags: ['Trios', 'Bands', 'Live', 'Weddings']
    },
    {
      id: 'artist_3',
      name: 'Evelyn & Marcus Duo',
      category: 'duos',
      genre: 'Acoustic Pop & Rock Duo',
      image: 'images/duo.jpg',
      bio: 'Enchanting dual vocal harmonies paired with virtuoso electric and acoustic guitar. Perfect for cocktail hours and receptions.',
      rate: '$1,500+',
      featured: true,
      tags: ['Duos', 'Acoustic', 'Weddings']
    },
    {
      id: 'artist_4',
      name: 'Aria Solo Vocalist',
      category: 'solos',
      genre: 'Pop / Soul / Acoustic Solo',
      image: 'images/solo.jpg',
      bio: 'Breathtaking solo vocalist and performer creating unforgettable ceremony moments and intimate luxury soundscapes.',
      rate: '$950+',
      featured: true,
      tags: ['Solo', 'Vocalist', 'Ceremony']
    },
    {
      id: 'artist_5',
      name: 'DJ Aurelius',
      category: 'djs',
      genre: 'Open-Format / Deep House / Commercial',
      image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80',
      bio: 'Internationally acclaimed VIP resident DJ with high-energy mixes for exclusive yacht parties and rooftop galas.',
      rate: '$1,800+',
      featured: true,
      tags: ['DJs', 'VIP', 'Nightlife']
    },
    {
      id: 'artist_6',
      name: 'Queen Tribute Spectacular',
      category: 'tributes',
      genre: 'Rock / Tribute Show',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      bio: 'An epic stadium-style tribute honoring Queen\'s greatest anthems with authentic costumes and blistering live vocals.',
      rate: '$4,000+',
      featured: false,
      tags: ['Tribute', 'Rock', 'Shows']
    },
    {
      id: 'artist_7',
      name: 'Elite Glamour Dancers',
      category: 'models-dancers',
      genre: 'High-Fashion Choreography / VIP Hosting',
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
      bio: 'World-class dancers, event models, and podium performers bringing theatrical flair to product launches and galas.',
      rate: '$1,500+',
      featured: false,
      tags: ['Models', 'Dancers', 'VIP']
    }
  ];

  const DEFAULT_EVENTS = [
    {
      id: 'event_1',
      title: 'Summer VIP Yacht Gala',
      category: 'Luxury Yacht',
      date: 'Dec 31, 2026',
      image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80',
      description: 'An exclusive multi-deck harbour gala featuring DJ Aurelius, live saxophone, and champagne service.',
      status: 'Booking Open'
    },
    {
      id: 'event_2',
      title: 'Grand Wedding Showcase 2026',
      category: 'Weddings',
      date: 'Nov 15, 2026',
      image: 'images/party-band.jpg',
      description: 'Live performance showcases by The Royal Velvet Band & Evelyn & Marcus Duo with venue styling consultations.',
      status: 'Featured Showcase'
    },
    {
      id: 'event_3',
      title: 'Supercar & Sound Experience',
      category: 'Luxury Car Hire',
      date: 'Available Daily',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      description: 'Chauffeur-driven luxury fleet combined with customized acoustic audio for high-profile red carpet entries.',
      status: 'Active Package'
    }
  ];

  const DEFAULT_CATEGORIES = [
    { id: 'bands', name: 'Party Bands & Orchestras', count: '14+ Acts', image: 'images/party-band.jpg' },
    { id: 'trios', name: 'Trios & Cover Bands', count: '10+ Acts', image: 'images/trio.jpg' },
    { id: 'duos', name: 'Solo & Duo Acts', count: '16+ Acts', image: 'images/duo.jpg' },
    { id: 'solos', name: 'Solo Vocalists & Instrumentalists', count: '18+ Acts', image: 'images/solo.jpg' },
    { id: 'djs', name: 'VIP & Event DJs', count: '20+ DJs', image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80' },
    { id: 'jazz', name: 'Jazz Ensembles & Bands', count: '8+ Ensembles', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80' },
    { id: 'tributes', name: 'Tribute Shows & Concept Acts', count: '10+ Shows', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80' },
    { id: 'models-dancers', name: 'Models & Dancers', count: '25+ Performers', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80' }
  ];

  const DEFAULT_CONTENT = {
    heroTitle: 'ELITE ENTERTAINMENT',
    heroSubtitle: 'UNRIVALLED ENTERTAINMENT FOR EXTRAORDINARY EVENTS',
    heroBackdrop: 'hero_banner.png',
    companyLegalName: 'ELITE ENTERTAINMENT & EVENTS PTY LTD',
    abn: '17 698 991 481',
    acn: '698 991 481',
    asicDate: '12/06/2026',
    contactPhone: '+61 417 221 111',
    contactEmail: 'info@eliteentertainment.com.au',
    contactAddress: 'Sydney | Melbourne | Brisbane | Gold Coast'
  };

  class EliteCMSEngine {
    constructor() {
      this.init();
    }

    init() {
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(DEFAULT_ARTISTS));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
      this.syncFirestore();
    }

    syncFirestore() {
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = firebase.firestore();
          db.collection('site_content').doc('main').get().then(doc => {
            if (doc.exists) {
              const data = doc.data();
              if (data.artists) localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(data.artists));
              if (data.events) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
              if (data.content) localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(data.content));
            }
          }).catch(err => console.log('Firestore sync notice:', err.message));
        } catch (e) {
          console.warn('Firestore offline fallback active.');
        }
      }
    }

    pushToFirestore() {
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = firebase.firestore();
          db.collection('site_content').doc('main').set({
            artists: this.getArtists(),
            events: this.getEvents(),
            categories: this.getCategories(),
            content: this.getContent(),
            updatedAt: new Date().toISOString()
          }).catch(err => console.warn('Firestore update warning:', err));
        } catch (e) {}
      }
    }

    /* ─── ARTIST CMS METHODS ─── */
    getArtists(categoryFilter = null) {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTISTS) || '[]');
      if (!categoryFilter) return data;
      return data.filter(a => a.category === categoryFilter || (a.tags && a.tags.map(t=>t.toLowerCase()).includes(categoryFilter.toLowerCase())));
    }

    saveArtist(artist) {
      const artists = this.getArtists();
      if (!artist.id) {
        artist.id = 'artist_' + Date.now();
      }
      const existingIdx = artists.findIndex(a => a.id === artist.id);
      if (existingIdx >= 0) {
        artists[existingIdx] = artist;
      } else {
        artists.unshift(artist);
      }
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
      this.pushToFirestore();
      return artist;
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
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(DEFAULT_ARTISTS));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
      this.pushToFirestore();
    }
  }

  window.EliteCMS = new EliteCMSEngine();
})(window);
