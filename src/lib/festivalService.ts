/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote, PanchangData, EventItem } from './db';

export interface DetectedFestival {
  id: string;              // e.g. 'janmashtami', 'ram-navami', 'hanuman-jayanti', 'shivratri', 'ekadashi', 'general'
  name: string;            // e.g. 'Janmashtami'
  hindiName: string;       // e.g. 'श्रीकृष्ण जन्माष्टमी'
  deity: string;           // e.g. 'Lord Krishna', 'Lord Rama', 'Lord Shiva', 'Hanuman Ji'
  category: string;        // e.g. 'Krishna Bhakti', 'Ram Bhakti', 'Shiva Bhakti', 'Bhakti'
  topics: string[];        // e.g. ['Krishna', 'Janmashtami', 'Gita', 'Bhagavad Gita', 'Gokul']
  tagline: string;         // e.g. '✨ जन्माष्टमी महापर्व विशेष'
  isFestivalToday: boolean;
  dateKey: string;         // 'YYYY-MM-DD' in Asia/Kolkata
  description?: string;
}

/**
 * Returns current Date object and formatted date string in Asia/Kolkata (IST) timezone
 */
export function getISTDate(): { dateString: string; month: number; day: number; year: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '8', 10);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '16', 10);
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { dateString, month, day, year };
  } catch (e) {
    const d = new Date();
    const dateString = d.toISOString().split('T')[0];
    return { dateString, month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() };
  }
}

/**
 * Known Major Hindu Festivals with solar/lunar approximate calendar windows
 * (Also cross-checked against Panchang specialEvent & Firestore events)
 */
interface FestivalRule {
  id: string;
  name: string;
  hindiName: string;
  deity: string;
  category: string;
  topics: string[];
  tagline: string;
  // Specific known Gregorian dates for recent years (2025 - 2027)
  dates?: string[];
  // Match keywords in Panchang tithi or specialEvent (case-insensitive)
  panchangKeywords?: string[];
}

const KNOWN_FESTIVALS: FestivalRule[] = [
  {
    id: 'janmashtami',
    name: 'Janmashtami',
    hindiName: 'श्रीकृष्ण जन्माष्टमी',
    deity: 'Lord Krishna',
    category: 'Krishna Bhakti',
    topics: ['Krishna', 'Janmashtami', 'Gita', 'Bhagavad Gita', 'Gokulashtami', 'Radha Krishna'],
    tagline: '✨ श्रीकृष्ण जन्माष्टमी महापर्व विशेष',
    dates: [
      '2025-08-16', '2025-08-17', 
      '2026-08-16', '2026-08-28', '2026-09-04',
      '2027-08-25', '2027-08-26'
    ],
    panchangKeywords: ['janmashtami', 'gokulashtami', 'krishna ashtami', 'श्रीकृष्ण जन्माष्टमी', 'जन्माष्टमी']
  },
  {
    id: 'radha-ashtami',
    name: 'Radha Ashtami',
    hindiName: 'श्री राधा अष्टमी',
    deity: 'Radha Rani',
    category: 'Krishna Bhakti',
    topics: ['Radha', 'Radharani', 'Barsana', 'Krishna Bhakti', 'Prem Bhakti'],
    tagline: '🌸 श्रीराधा अष्टमी महोत्सव विशेष',
    dates: ['2025-08-31', '2026-09-18', '2027-09-08'],
    panchangKeywords: ['radha ashtami', 'radhashtami', 'राधा अष्टमी', 'राधाष्टमी']
  },
  {
    id: 'ram-navami',
    name: 'Ram Navami',
    hindiName: 'श्री राम नवमी',
    deity: 'Lord Rama',
    category: 'Ram Bhakti',
    topics: ['Shri Ram', 'Ram Navami', 'Ramcharitmanas', 'Sita Ram', 'Ayodhya'],
    tagline: '🚩 श्री सीताराम नवमी महापर्व विशेष',
    dates: ['2025-04-06', '2026-03-27', '2027-04-15'],
    panchangKeywords: ['ram navami', 'rama navami', 'shri ram navami', 'राम नवमी', 'रामनवमी']
  },
  {
    id: 'hanuman-jayanti',
    name: 'Hanuman Jayanti',
    hindiName: 'श्री हनुमान जयन्ती',
    deity: 'Hanuman Ji',
    category: 'Hanuman Bhakti',
    topics: ['Hanuman Ji', 'Hanuman Jayanti', 'Bajrangbali', 'Hanuman Chalisa', 'Sankat Mochan'],
    tagline: '🚩 श्री हनुमान जयन्ती पावन पर्व विशेष',
    dates: ['2025-04-12', '2026-04-02', '2027-04-21'],
    panchangKeywords: ['hanuman jayanti', 'hanuman janmotsav', 'हनुमान जयंती', 'हनुमान जन्मोत्सव']
  },
  {
    id: 'shivratri',
    name: 'Maha Shivratri',
    hindiName: 'महाशिवरात्रि',
    deity: 'Lord Shiva',
    category: 'Shiva Bhakti',
    topics: ['Lord Shiva', 'Shivratri', 'Mahadev', 'Bholenath', 'Shiva Tandava', 'Har Har Mahadev'],
    tagline: '🔱 महाशिवरात्रि पावन पर्व विशेष',
    dates: ['2025-02-26', '2026-02-15', '2027-03-06'],
    panchangKeywords: ['shivratri', 'maha shivratri', 'mahashivratri', 'शिवरात्रि', 'महाशिवरात्रि']
  },
  {
    id: 'diwali',
    name: 'Deepawali',
    hindiName: 'दीपावली (दिवाली)',
    deity: 'Lord Rama',
    category: 'Ram Bhakti',
    topics: ['Diwali', 'Deepotsav', 'Lakshmi', 'Shri Ram', 'Ayodhya Deepotsav'],
    tagline: '🪔 शुभ दीपावली एवं दीपोत्सव विशेष',
    dates: ['2025-10-20', '2026-11-08', '2027-10-29'],
    panchangKeywords: ['diwali', 'deepawali', 'deepotsav', 'दिवाली', 'दीपावली', 'दीपोत्सव']
  },
  {
    id: 'navratri',
    name: 'Navratri',
    hindiName: 'शारदीय / चैत्र नवरात्रि',
    deity: 'Maa Durga',
    category: 'Devi Bhakti',
    topics: ['Navratri', 'Durga', 'Maa Shakti', 'Bhavani', 'Durga Saptashati'],
    tagline: '🌺 पावन नवरात्रि महापर्व विशेष',
    dates: ['2025-09-22', '2025-09-23', '2025-09-24', '2026-10-11', '2026-10-12'],
    panchangKeywords: ['navratri', 'navaratri', 'durga puja', 'नवरात्रि', 'दुर्गा पूजा']
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    hindiName: 'गणेश चतुर्थी',
    deity: 'Lord Ganesha',
    category: 'Ganesh Bhakti',
    topics: ['Ganesh', 'Ganpati', 'Vinayaka', 'Ganesh Chaturthi', 'Vighnaharta'],
    tagline: '🐘 श्री गणेश चतुर्थी महोत्सव विशेष',
    dates: ['2025-08-27', '2026-09-14', '2027-09-04'],
    panchangKeywords: ['ganesh chaturthi', 'vinayaka chaturthi', 'गणेश चतुर्थी', 'विनायक चतुर्थी']
  },
  {
    id: 'gita-jayanti',
    name: 'Gita Jayanti',
    hindiName: 'श्रीमद्भगवद्गीता जयन्ती',
    deity: 'Lord Krishna',
    category: 'Krishna Bhakti',
    topics: ['Gita Jayanti', 'Bhagavad Gita', 'Krishna', 'Kurukshetra', 'Gita Shlokas'],
    tagline: '📖 पावन श्रीमद्भगवद्गीता जयन्ती विशेष',
    dates: ['2025-12-01', '2026-12-20', '2027-12-09'],
    panchangKeywords: ['gita jayanti', 'geeta jayanti', 'गीता जयंती', 'गीता जयन्ती']
  },
  {
    id: 'ekadashi',
    name: 'Ekadashi Vrat',
    hindiName: 'पावन एकादशी व्रत',
    deity: 'Lord Vishnu / Shri Hari',
    category: 'Hari Bhakti',
    topics: ['Ekadashi', 'Vrat', 'Vishnu', 'Shri Hari', 'Hari Bhakti', 'Pavitra Ekadashi'],
    tagline: '🪔 पावन श्रीहरि एकादशी व्रत विशेष',
    dates: [
      '2026-08-09', '2026-08-24', '2026-09-07', '2026-09-22',
      '2026-10-07', '2026-10-22', '2026-11-05', '2026-11-20'
    ],
    panchangKeywords: ['ekadashi', 'vrat', 'एकादशी', 'पवित्रा एकादशी', 'देवशयनी', 'देवउठनी', 'मोक्षदा']
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima',
    hindiName: 'गुरु पूर्णिमा',
    deity: 'Guru Dev & Ved Vyas',
    category: 'Guru Bhakti',
    topics: ['Guru', 'Guru Purnima', 'Ved Vyasa', 'Guru Kripa', 'Sanatana Dharma'],
    tagline: '🙏 पावन गुरु पूर्णिमा विशेष',
    dates: ['2025-07-10', '2026-07-29', '2027-07-18'],
    panchangKeywords: ['guru purnima', 'गुरु पूर्णिमा', 'व्यास पूर्णिमा']
  },
  {
    id: 'holi',
    name: 'Holi Mahotsav',
    hindiName: 'होली एवं रंगोत्सव',
    deity: 'Lord Krishna / Bhakta Prahlad',
    category: 'Krishna Bhakti',
    topics: ['Holi', 'Rangotsav', 'Braj Holi', 'Prahlad', 'Krishna'],
    tagline: '🎨 पावन रंगोत्सव एवं होली विशेष',
    dates: ['2025-03-14', '2026-03-03', '2027-03-22'],
    panchangKeywords: ['holi', 'holika dahan', 'होली', 'होलिका दहन', 'रंगोत्सव']
  }
];

/**
 * Automatically detects today's festival from IST Date, Panchang and Event sources
 */
export function detectCurrentFestival(
  panchang?: PanchangData | null,
  events?: EventItem[] | null
): DetectedFestival {
  const { dateString, month, day, year } = getISTDate();

  // Cache check for today
  const cacheKey = `hp_detected_fest_${dateString}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.dateKey === dateString) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }

  // 1. Check against Panchang Special Event & Tithi from Firestore
  const panchangText = `${panchang?.specialEvent || ''} ${panchang?.tithi || ''}`.toLowerCase();
  
  if (panchangText.trim()) {
    for (const fest of KNOWN_FESTIVALS) {
      if (fest.panchangKeywords) {
        for (const kw of fest.panchangKeywords) {
          if (panchangText.includes(kw.toLowerCase())) {
            const detected: DetectedFestival = {
              id: fest.id,
              name: fest.name,
              hindiName: fest.hindiName,
              deity: fest.deity,
              category: fest.category,
              topics: fest.topics,
              tagline: fest.tagline,
              isFestivalToday: true,
              dateKey: dateString,
              description: panchang?.specialEvent || `${fest.name} festival today`
            };
            try { localStorage.setItem(cacheKey, JSON.stringify(detected)); } catch (e) {}
            return detected;
          }
        }
      }
    }
  }

  // 2. Check against Firestore Events Collection for today's date
  if (events && events.length > 0) {
    const todayEvent = events.find(ev => {
      const evDate = (ev.date || '').toLowerCase();
      return evDate.includes(dateString) || 
        evDate.includes(`${month}/${day}`) || 
        evDate.includes(`${day} ${new Date().toLocaleString('en-US', { month: 'short' }).toLowerCase()}`);
    });

    if (todayEvent) {
      const eventTitle = (todayEvent.title || '').toLowerCase();
      const matchedRule = KNOWN_FESTIVALS.find(f => 
        eventTitle.includes(f.name.toLowerCase()) || 
        (f.panchangKeywords && f.panchangKeywords.some(kw => eventTitle.includes(kw.toLowerCase())))
      );

      if (matchedRule) {
        const detected: DetectedFestival = {
          id: matchedRule.id,
          name: matchedRule.name,
          hindiName: matchedRule.hindiName,
          deity: matchedRule.deity,
          category: matchedRule.category,
          topics: matchedRule.topics,
          tagline: matchedRule.tagline,
          isFestivalToday: true,
          dateKey: dateString,
          description: todayEvent.title
        };
        try { localStorage.setItem(cacheKey, JSON.stringify(detected)); } catch (e) {}
        return detected;
      }
    }
  }

  // 3. Check known calendar dates list
  for (const fest of KNOWN_FESTIVALS) {
    if (fest.dates && fest.dates.includes(dateString)) {
      const detected: DetectedFestival = {
        id: fest.id,
        name: fest.name,
        hindiName: fest.hindiName,
        deity: fest.deity,
        category: fest.category,
        topics: fest.topics,
        tagline: fest.tagline,
        isFestivalToday: true,
        dateKey: dateString,
        description: `Celebration of ${fest.name}`
      };
      try { localStorage.setItem(cacheKey, JSON.stringify(detected)); } catch (e) {}
      return detected;
    }
  }

  // 4. Default: General Sanatana Devotional fallback
  const defaultFestival: DetectedFestival = {
    id: 'general',
    name: 'Sanatana Dharma',
    hindiName: 'सनातन धर्म एवं दैनिक साधना',
    deity: 'Bhagavan Shri Hari & Shri Ram',
    category: 'Spiritual',
    topics: ['Bhakti', 'Gita', 'Ramcharitmanas', 'Sadhana', 'Sanatana Dharma'],
    tagline: '🪔 आज का विशेष सुविचार',
    isFestivalToday: false,
    dateKey: dateString,
    description: 'Daily Devotional Wisdom'
  };

  try { localStorage.setItem(cacheKey, JSON.stringify(defaultFestival)); } catch (e) {}
  return defaultFestival;
}

/**
 * Filter quotes based on detected festival with strict Priority Matching:
 * Priority 1: Exact festivalId match
 * Priority 2: Exact festival match
 * Priority 3: Related category
 * Priority 4: Related topic / tags
 * Priority 5: General Sanatan quote fallback
 */
export function getMatchingFestivalQuotes(quotes: Quote[], festival: DetectedFestival): {
  matchedQuotes: Quote[];
  isFestivalSpecific: boolean;
  priorityLevel: number;
} {
  if (!quotes || quotes.length === 0) {
    return { matchedQuotes: [], isFestivalSpecific: false, priorityLevel: 5 };
  }

  // Filter only published / valid quotes
  const validQuotes = quotes.filter(q => q && (q.isPublished !== false && q.published !== false));
  if (validQuotes.length === 0) {
    return { matchedQuotes: [], isFestivalSpecific: false, priorityLevel: 5 };
  }

  // If no specific festival today, return all valid quotes as pool
  if (!festival || !festival.isFestivalToday || festival.id === 'general') {
    return { matchedQuotes: validQuotes, isFestivalSpecific: false, priorityLevel: 5 };
  }

  const festId = festival.id.toLowerCase();
  const festName = festival.name.toLowerCase();
  const festCategory = festival.category.toLowerCase();
  const festTopics = (festival.topics || []).map(t => t.toLowerCase());

  // Priority 1: Exact festivalId match
  const p1Quotes = validQuotes.filter(q => 
    q.festivalId && q.festivalId.toLowerCase() === festId
  );
  if (p1Quotes.length > 0) {
    return { matchedQuotes: p1Quotes, isFestivalSpecific: true, priorityLevel: 1 };
  }

  // Priority 2: Exact festival name match
  const p2Quotes = validQuotes.filter(q => {
    if (!q.festival) return false;
    const qFest = q.festival.toLowerCase();
    return qFest === festName || qFest.includes(festName) || festName.includes(qFest);
  });
  if (p2Quotes.length > 0) {
    return { matchedQuotes: p2Quotes, isFestivalSpecific: true, priorityLevel: 2 };
  }

  // Priority 3: Related Category Match
  const p3Quotes = validQuotes.filter(q => {
    if (!q.category) return false;
    const qCat = q.category.toLowerCase();
    return qCat === festCategory || 
      (festCategory.includes('krishna') && qCat.includes('krishna')) ||
      (festCategory.includes('ram') && qCat.includes('ram')) ||
      (festCategory.includes('shiva') && qCat.includes('shiv')) ||
      (festCategory.includes('hanuman') && qCat.includes('hanuman'));
  });
  if (p3Quotes.length > 0) {
    return { matchedQuotes: p3Quotes, isFestivalSpecific: true, priorityLevel: 3 };
  }

  // Priority 4: Related Topic & Tag Match
  const p4Quotes = validQuotes.filter(q => {
    const qTopic = (q.topic || '').toLowerCase();
    const qTags = (q.tags || []).map(t => t.toLowerCase());
    const qText = `${q.quote || ''} ${q.content || ''} ${q.source || ''} ${q.author || ''}`.toLowerCase();

    return festTopics.some(topic => 
      qTopic.includes(topic) || 
      qTags.includes(topic) ||
      qText.includes(topic) ||
      (topic === 'krishna' && (qText.includes('कृष्ण') || qText.includes('माधव') || qText.includes('gita'))) ||
      (topic === 'shri ram' && (qText.includes('राम') || qText.includes('रघुनाथ') || qText.includes('manas'))) ||
      (topic === 'hanuman ji' && (qText.includes('हनुमान') || qText.includes('बजरंग'))) ||
      (topic === 'lord shiva' && (qText.includes('शिव') || qText.includes('महादेव')))
    );
  });
  if (p4Quotes.length > 0) {
    return { matchedQuotes: p4Quotes, isFestivalSpecific: true, priorityLevel: 4 };
  }

  // Priority 5: Fallback to general Sanatan quotes
  return { matchedQuotes: validQuotes, isFestivalSpecific: false, priorityLevel: 5 };
}

/**
 * Selects a random quote from the matched pool while avoiding consecutive duplicates
 */
export function selectRandomQuote(quotes: Quote[], currentQuoteId?: string): Quote | null {
  if (!quotes || quotes.length === 0) return null;
  if (quotes.length === 1) return quotes[0];

  const pool = currentQuoteId ? quotes.filter(q => q.id !== currentQuoteId) : quotes;
  const targetList = pool.length > 0 ? pool : quotes;
  const randomIndex = Math.floor(Math.random() * targetList.length);
  return targetList[randomIndex];
}
