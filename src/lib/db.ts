/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db as firebaseDb } from './firebase';
import { normalizeUrl, normalizeObjectUrls } from './urlUtils';

export interface SeoMetadata {
  seoTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  secondaryKeywords?: string[];
  slug?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: string;
  imageAltText?: string;
  imageTitle?: string;
  imageDescription?: string;
  internalLinks?: { anchor: string; url: string }[];
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  coverImage?: string;
  rating: number;
  reviewsCount: number;
  details: string[];
  category: string;
  stock: number;
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  weight?: number; // in grams
  length?: number; // in cm
  width?: number; // in cm
  height?: number; // in cm
  seo?: SeoMetadata;
}

export interface Stuti {
  id: string;
  title: string;
  hindiTitle?: string;
  deity: string;
  sanskrit: string;
  transliteration: string;
  hindiMeaning: string;
  spiritualExplanation: string;
  benefits: string;
  pdfUrl?: string;
  audioUrl?: string;
  category: string;
  coverImage?: string;
  slug?: string;
  seo?: SeoMetadata;
}

export function normalizeStuti(raw: any): Stuti {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `stuti-${Date.now()}`,
      title: 'Devotional Stuti',
      deity: 'General',
      sanskrit: '',
      transliteration: '',
      hindiMeaning: '',
      spiritualExplanation: '',
      benefits: '',
      category: 'General'
    };
  }
  const id = String(raw.id || raw.docId || raw.slug || `stuti-${Date.now()}`);
  const title = String(raw.title || raw.name || raw.hindiTitle || 'Devotional Stuti');
  const hindiTitle = raw.hindiTitle || raw.hindiName || '';
  const deity = raw.deity || raw.god || raw.category || 'General';
  const sanskrit = raw.sanskrit || raw.lyrics || raw.content || raw.shloka || raw.verses || raw.text || '';
  const transliteration = raw.transliteration || raw.translit || raw.english || '';
  const hindiMeaning = raw.hindiMeaning || raw.meaning || raw.translation || raw.bhavarth || '';
  const spiritualExplanation = raw.spiritualExplanation || raw.explanation || raw.description || raw.about || '';
  const benefits = raw.benefits || raw.mahatmya || raw.significance || '';
  const pdfUrl = normalizeUrl(raw.pdfUrl || raw.pdf || '');
  const audioUrl = normalizeUrl(raw.audioUrl || raw.audio || '');
  const category = raw.category || raw.deity || 'Stuti';
  const coverImage = normalizeUrl(raw.coverImage || raw.imageUrl || raw.image || '');
  const slug = raw.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  return {
    id,
    title,
    hindiTitle,
    deity,
    sanskrit,
    transliteration,
    hindiMeaning,
    spiritualExplanation,
    benefits,
    pdfUrl,
    audioUrl,
    category,
    coverImage,
    slug,
    seo: raw.seo
  };
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishDate: string;
  readingTime: string;
  coverImage: string;
  imageUrl?: string;
  summary: string;
  content: string;
  scriptureReferences: string[];
  seo?: SeoMetadata;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  codCharges: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: 'Order Placed' | 'Payment Confirmed' | 'Packed' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  invoiceUrl?: string;
  trackingNumber?: string;
  courier?: string;
  awb?: string;
  createdAt: string;
  isTest: boolean;
}

export interface EcomConfig {
  activePaymentMethods: {
    COD: boolean;
    UPI: boolean;
    CARD: boolean;
    NETBANKING: boolean;
    WALLETS: boolean;
  };
  defaultShipping: number;
  defaultCodCharges: number;
  defaultProductWeight: number;
  defaultProductLength: number;
  defaultProductWidth: number;
  defaultProductHeight: number;
  shiprocketEnabled: boolean;
  razorpayLiveMode: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  imageUrl?: string;
  image?: string;
  photoUrl?: string;
  title: string;
  description?: string;
  category: string;
  isWallpaper?: boolean;
  isFestival?: boolean;
  isEvent?: boolean;
  isActive?: boolean;
  active?: boolean;
  isPublished?: boolean;
  published?: boolean;
  displayOrder?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quote {
  id: string;
  quote?: string;
  content?: string;
  text?: string;
  author: string;
  source?: string;
  category: string;
  festival?: string;
  festivalId?: string;
  topic?: string;
  imageUrl?: string | null;
  isPublished?: boolean;
  published?: boolean;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
  scheduleDate?: string | null;
  tags?: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker: string;
  posterImage: string;
  link?: string;
  category: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'order' | 'event' | 'festive';
  link?: string;
}

export interface FounderInfo {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  signatureUrl: string;
  message: string;
  updatedAt?: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  buttonText: string;
  buttonLink: string;
  buttonUrl?: string;
  active?: boolean;
  isActive?: boolean;
  order?: number;
  displayOrder?: number;
  startDate?: string | null;
  endDate?: string | null;
  updatedAt?: string;
}

export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Lu201HZNpifLJQvqdDP0sD';
export const DEFAULT_APK_DOWNLOAD_URL = 'https://www.mediafire.com/file/2eq5cxuvepytfzi/app-release.apk/file';

export interface AppSettings {
  appName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  whatsappGroupUrl?: string;
  address: string;
  apkDownloadUrl: string;
  version?: string;
  buildNumber?: string;
  releaseNotes?: string;
  forceUpdate?: boolean;
  updatedAt?: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    facebook: string;
    telegram: string;
    twitter: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  review: string;
  rating: number;
  avatarUrl: string;
  date: string;
}

export interface PanchangData {
  tithi: string;
  nakshatra: string;
  yog: string;
  karan: string;
  sunrise: string;
  sunset: string;
  rahukaal: string;
  yamagand: string;
  abhijitMuhurat: string;
  specialEvent?: string;
  updatedAt: string;
}

export interface AiGuruConfig {
  systemPrompt: string;
  temperature: number;
  model: string;
  enabled: boolean;
  maxTokens: number;
}

// User profile interfaces
export interface JoinApplication {
  id?: string;
  fullName: string;
  mobileNumber: string;
  name?: string;
  mobile?: string;
  city: string;
  state: string;
  age: number | string;
  reason: string;
  additionalMessage?: string;
  message?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'approved';
  createdAt?: any;
  source: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  mobile?: string;
  reason: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt?: any;
  source: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  fullName: string;
  mobile: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  mobile?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  accountStatus: 'active' | 'suspended';
  gender?: string;
  dateOfBirth?: string;
  addresses: Address[];
}

// Pre-seeded high-quality default data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Wooden Tulsi Japa Mala',
    hindiName: 'प्रीमियम तुलसी जप माला (वृंदावन)',
    description: 'Beautiful, hand-carved, authentic Tulsi beads from Sri Dham Vrindavan. Purified in Yamuna water, this mala is ideal for chanting the holy name and maintaining concentration during meditation.',
    price: 251,
    image: 'https://images.unsplash.com/photo-1609137144813-9118e9863a4b?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 45,
    category: 'Sadhana Accoutrements',
    stock: 15,
    details: [
      '108 + 1 Handcrafted Tulsi beads',
      'Purified with Yamuna holy water and Tulsi oil',
      'Durable pure cotton knotting between each bead',
      'Traditional red tassel symbolizing devotion',
      'Directly sourced from local artisans in Vrindavan'
    ],
    reviews: [
      { id: 'r-1', userName: 'Ramesh Sharma', rating: 5, comment: 'The quality of the Tulsi beads is excellent. The fragrance is pure and natural. Highly recommended!', date: 'July 28, 2026' },
      { id: 'r-2', userName: 'Aarti Devi', rating: 5, comment: 'Very beautiful mala, hand knotted properly. Perfect for daily Ram Naam chanting.', date: 'August 1, 2026' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Srimad Bhagavad Gita (Deluxe Hardcover)',
    hindiName: 'श्रीमद्भगवद्गीता (सटीक अनुवाद)',
    description: 'An elegant hardcover edition of the Srimad Bhagavad Gita featuring the original Sanskrit verses, clear phonetic transliteration, Hindi meanings, and detailed practical purports for modern life.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviewsCount: 128,
    category: 'Scriptures',
    stock: 24,
    details: [
      'Original Sanskrit Shlokas with full grammar breakdown',
      'Hindi translation and practical commentary',
      'Golden foil embossed cover with protective bookmark ribbon',
      'Large readable fonts with high-quality cream paper',
      'Ideal for daily study and gifting'
    ],
    reviews: [
      { id: 'r-3', userName: 'Vivek Gupta', rating: 5, comment: 'This is the most clear translation I have ever read. The explanation is beautiful.', date: 'July 15, 2026' },
      { id: 'r-4', userName: 'Saraswati Patel', rating: 5, comment: 'Perfect addition to our home temple. Reading one shloka everyday brings immense peace.', date: 'July 30, 2026' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Sri Ramcharitmanas (Gita Press Edition)',
    hindiName: 'श्रीरामचरितमानस (सचित्र)',
    description: 'The monumental devotional epic composed by Goswami Tulsidas. This large-print Gita Press edition comes with detailed illustrations and translation of every Doha, Chaupai, and Soratha.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 84,
    category: 'Scriptures',
    stock: 12,
    details: [
      'Official publication from Gita Press Gorakhpur',
      'Hindi translation of every single verse',
      'Includes beautiful colored classical paintings',
      'Strong binding meant for lifelong daily reading',
      'Includes Aarti of Sri Ramachandra and Goswami Tulsidas'
    ],
    reviews: [
      { id: 'r-5', userName: 'Anil Kumar', rating: 5, comment: 'Pristine packaging. The print is very clear, large, and easy for my parents to read.', date: 'August 2, 2026' }
    ]
  },
  {
    id: 'prod-4',
    name: 'Traditional Handcrafted Brass Diya',
    hindiName: 'पीतल पंच आरती दीया',
    description: 'Add a divine glow to your home altar with this classical handcrafted brass Diya. Made with premium quality heavy brass, it features refined traditional engravings and a comfortable handle.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1602631985686-2bb0f30101cd?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 32,
    category: 'Sadhana Utilities',
    stock: 18,
    details: [
      '100% Solid Brass construction with gold finish',
      'Specially designed heat-resistant long handle',
      'Deep oil well ensuring hours of continuous burning',
      'Sturdy heavy base to prevent accidental tipping',
      'Easily washable and retains luster over time'
    ],
    reviews: [
      { id: 'r-6', userName: 'Sunita Sharma', rating: 4, comment: 'The brass is very heavy and of high quality. Gives a beautiful shine when polished.', date: 'June 18, 2026' }
    ]
  }
];

const INITIAL_STUTIS: Stuti[] = [
  {
    id: 'stuti-1',
    slug: 'shri-ram-stuti',
    title: 'Sri Ramachandra Kripalu',
    hindiTitle: 'श्रीरामचन्द्र कृपालु भजु मन',
    deity: 'Lord Rama',
    sanskrit: `श्रीरामचन्द्र कृपालु भजु मन हरण भवभय दारुणम्।\nनवकंज लोचन कंज मुख कर कंज पद कंजारुणम्॥\n\nकंदर्प अगणित अमित छवि नवनील नीरद सुन्दरम्।\nपट पीत मानहुँ तड़ित रुचि शुचि नौमि जनक सुतावरम्॥\n\nभजु दीनबंधु दिनेश दानव दैत्य वंश निकन्दनम्।\nरघुनन्द आनंदकन्द कोशलचन्द दशरथ नन्दनम्॥\n\nसिर मुकुट कुण्डल तिलक चारु उदारु अङ्ग विभूषणम्।\nआजानुभुज शर चाप धर संग्राम जित खर दूषणम्॥\n\nइति वदति तुलसीदास शंकर शेष मुनि मन रञ्जनम्।\nमम हृदय कञ्ज निवास कुरु कामादि खल दल भञ्जनम्॥`,
    transliteration: `Śrīrāmacandra kṛpālu bhaju mana haraṇa bhavabhaya dāruṇam.\nNavakañja locana kañja mukha kara kañja pada kañjāruṇam.\n\nKandarpa agaṇita amita chavi navanīla nīrada sundaram.\nPata pīta mānahu~ taḍita ruci śuci naumi janaka sutāvaram.\n\nBhaju dīnabandhu dineśa dānava daitya vaṁśa nikandanam.\nRaghunanda ānaudakanda kośalacanda daśaratha nandanam.\n\nSira mukuṭa kuṇdLala tilaka cāru udāru aṅga vibhūṣanam.\nĀjānubhuja śara cāpa dhara saṅgrāma jita khara dūṣanam.\n\nIti vadati tulasīdāsa śaṅkara śeṣa muni mana rañjanam.\nMama hṛdaya kañja nivāsa kuru kāmādi khala dala bhañjanam.`,
    hindiMeaning: `हे मन! कृपालु श्रीरामचन्द्रजी का भजन कर, जो संसार के जन्म-मरण रूपी दारुण भय को दूर करने वाले हैं। जिनके नेत्र नए खिले हुए कमल के समान हैं, मुख कमल के समान है, और हाथ तथा पैर भी लाल कमल के समान सुंदर हैं।`,
    spiritualExplanation: `गोस्वामी तुलसीदास जी द्वारा रचित यह विनय पत्रिका का अत्यंत पवित्र अंश है। यह स्तुति भगवान राम के अपूर्व सौंदर्य, दयालुता और रक्षक रूप का गान करती है।`,
    benefits: `इस दिव्य स्तुति के नियमित पाठ से हृदय में भक्ति और ज्ञान का उदय होता है। किसी भी तरह के भय, संकट और मानसिक कष्टों से मुक्ति मिलती है।`,
    pdfUrl: '/pdfs/ram-stuti.pdf',
    audioUrl: '/audio/ram-stuti.mp3',
    category: 'Rama Stuti'
  },
  {
    id: 'stuti-2',
    slug: 'shri-madhurashtakam',
    title: 'Sri Madhurashtakam',
    hindiTitle: 'मधुराष्टकम् (अधरं मधुरं)',
    deity: 'Lord Krishna',
    sanskrit: `अधरं मधुरं वदनं मधुरं नयनं मधुरं हसितं मधुरम्।\nहृदयं मधुरं गमनं मधुरं मधुराधिपतेरखिलं मधुरम्॥\n\nवचनं मधुरं चरितं मधुरं वसनं मधुरं वलितं मधुरम्।\nचलितं मधुरं भ्रमितं मधुरं मधुराधिपतेरखिलं मधुरम्॥\n\nवेणुर्मधुरो रेणुर्मधुरः पाणिर्मधुरः पादौ मधुरौ।\nनृत्यं मधुरं सख्यं मधुरं मधुराधिपतेरखिलं मधुरम्॥\n\nगीतं मधुरं पीतं मधुरं भुक्तं मधुरं सुप्तं मधुरम्।\nरूपं मधुरं तिलकं मधुरं मधुराधिपतेरखिलं मधुरम्॥\n\nकरणं मधुरं तरणं मधुरं हरणं मधुरं रमणं मधुरम्।\nवमितं मधुरं शमितं मधुरं मधुराधिपतेरखिलं मधुरम्॥`,
    transliteration: `Adharaṁ madhuraṁ vadanaṁ madhuraṁ nayanaṁ madhuraṁ hasitaṁ madhuram.\nHṛdayaṁ madhuraṁ gamanaṁ madhuraṁ madhurādhipater akhilaṁ madhuram.`,
    hindiMeaning: `भगवान श्रीकृष्ण के होंठ मधुर हैं, उनका मुख मधुर है, उनके नेत्र मधुर हैं, उनकी मुस्कान मधुर है, उनका हृदय मधुर है, और उनकी चाल भी अत्यंत मधुर है। मधुराधिपति श्री कृष्ण का सब कुछ मधुर है।`,
    spiritualExplanation: `श्रीमद् वल्लभाचार्य जी द्वारा रचित 'मधुराष्टकम्' भक्ति मार्ग की सर्वोच्च अवस्था 'रागानुगा भक्ति' का प्रतीक है। इसमें भगवान के दिव्य स्वरूप के प्रत्येक अंग और लीला की मधुरता का वर्णन है।`,
    benefits: `नित्य मधुराष्टकम् का पाठ करने से मन की कड़वाहट और क्रोध शांत होता है और भगवान श्रीकृष्ण की अनन्य प्रीति प्राप्त होती है।`,
    pdfUrl: '/pdfs/madhurashtakam.pdf',
    audioUrl: '/audio/madhurashtakam.mp3',
    category: 'Krishna Stuti'
  },
  {
    id: 'stuti-3',
    slug: 'hanuman-chalisa',
    title: 'Sri Hanuman Chalisa',
    hindiTitle: 'श्री हनुमान चालीसा',
    deity: 'Lord Hanuman',
    sanskrit: `श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।\nबरनऊँ रघुबर बिमल जसु जो दायकु फल चारि॥\n\nबुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।\nबल बुधि बिद्या देहु मोहिं, हरहु कलेस बिकार॥\n\nजय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥\nराम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥\n\nमहाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥\nकंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥\n\nहाथ बज्र औ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥\nसंकर सुवन केसरीनंदन। तेज प्रताप महा जग बंदन॥\n\nबिद्यावान गुनी अति चातुर। राम काज करिबे को आतुर॥\nप्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥\n\nजो सत बार पाठ कर कोई। छूटहि बंदि महा सुख होई॥\nजो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥\n\nपवनतनय संकट हरन, मंगल मूरति रूप।\nराम लखन सीता सहित, हृदय बसहु सुर भूप॥`,
    transliteration: `Śrīguru carana saroja raja nija manu mukuru sudhāri.\nBaranaūm raghubara bimala jasu jo dāyaku phala cāri.\n\nBuddhihīna tanu jānike sumirauṁ pavana-kumāra.\nBala budhi bidyā dehu mohiṁ harahu kalesa bikāra.\n\nJaya hanumāna jñāna guna sāgara. Jaya kapīsa tihuṁ loka ujāgara.`,
    hindiMeaning: `श्री गुरुदेव के चरण कमलों की धूलि से अपने मन रूपी दर्पण को पवित्र करके, मैं श्री रघुनाथजी के उस निर्मल यश का वर्णन करता हूँ, जो चारों फलों (धर्म, अर्थ, काम, मोक्ष) को देने वाला है। हे पवनपुत्र! मैं आपको स्मरण करता हूँ, मुझे बल, बुद्धि और विद्या प्रदान करें एवं समस्त कष्टों का निवारण करें।`,
    spiritualExplanation: `गोस्वामी तुलसीदास जी द्वारा रचित हनुमान चालीसा केवल एक काव्यात्मक प्रार्थना नहीं है, बल्कि यह एक अभेद्य सुरक्षा कवच है जो भक्तों के आत्मबल को जाग्रत करता है।`,
    benefits: `हनुमान चालीसा का पाठ भक्तों को सभी प्रकार के अज्ञात भय, संकट, रोग, पीड़ा, और नकारात्मक ऊर्जा से बचाता है।`,
    pdfUrl: '/pdfs/hanuman-chalisa.pdf',
    audioUrl: '/audio/hanuman-chalisa.mp3',
    category: 'Hanuman Stuti'
  },
  {
    id: 'stuti-4',
    slug: 'shiv-tandav-stotram',
    title: 'Shiva Tandava Stotram',
    hindiTitle: 'शिव ताण्डव स्तोत्रम्',
    deity: 'Lord Shiva',
    sanskrit: `जटाटवीगलज्जलप्रवाहपावितस्थले\nगलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।\nडमड्डमड्डमड्डमन्निनादवड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥\n\nजटाकटाहसम्भ्रमभ्रमन्निलिम्पनिर्झरी-\nविलोलवीचिवल्लरीविराजमानमूर्धनि।\nधगद्धगद्धगज्ज्वलल्ललाटपट्टपावके\nकिशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम॥`,
    transliteration: `Jaṭāṭavīgalajjala pravāhapāvitasthale\nGale'valambya lambitāṁ bhujaṅgatuṅgamālikām.\nḌamaḍḍamaḍḍamaḍḍaman ninādavaḍḍamarvayaṁ\nCakāra caṇḍatāṇḍavaṁ tanotu naḥ śivaḥ śivam.`,
    hindiMeaning: `जिनके सघन जटारूप वन से प्रवाहित गंगा की धारा से जिनका कंठस्थल पवित्र है, जिनके गले में लटकती हुई विशाल सर्पमाला सुशोभित है, और जो डमरू के 'डम-डम' निनाद के साथ प्रचंड तांडव नृत्य करते हैं, वे भगवान शिव हमारा कल्याण करें।`,
    spiritualExplanation: `ल Lankapati रावण द्वारा रचित शिव तांडव स्तोत्र संस्कृत साहित्य का अद्वितीय छंदबद्ध स्तोत्र है। यह शिवभक्ति और छंद-विज्ञान की पराकाष्ठा है।`,
    benefits: `इसके पाठ से वाणी में ओज, आत्मविश्वास, मानसिक स्थिरता, एवं भगवान शिव की विशेष अनुकंपा प्राप्त होती है।`,
    pdfUrl: '/pdfs/shiv-tandav.pdf',
    audioUrl: '/audio/shiv-tandav.mp3',
    category: 'Shiva Stuti'
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'The Divine Power of Chanting "Ram Naam" in Kaliyuga',
    slug: 'power-of-ram-naam-kaliyuga',
    category: 'Bhakti Yoga',
    author: 'Amar Das (Ajay Swami)',
    publishDate: 'August 3, 2026',
    readingTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
    summary: 'Explore the infinite spiritual significance of "Ram Naam" and why scriptures consider the chanting of the Holy Name as the ultimate path to liberation and peace.',
    content: `<p>In the sacred scriptures of Sanatana Dharma, the current era we live in is described as Kaliyuga—the age of constant mental distraction and anxiety. Yet, chanting the Holy Name "RAM" brings instant peace.</p>`,
    scriptureReferences: [
      'Sri Ramcharitmanas, Balkand Chapter 24',
      'Srimad Bhagavatam, 12th Canto, Chapter 3, Verse 51'
    ]
  },
  {
    id: 'blog-2',
    title: 'Cleansing the Mind: How to Form a Daily Spiritual Sadhana',
    slug: 'daily-spiritual-sadhana-routine',
    category: 'Sadhana & Practice',
    author: 'Ajay Swami',
    publishDate: 'August 1, 2026',
    readingTime: '7 min read',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    summary: 'A step-by-step practical guide to structuring a transformative morning and evening routine (Sadhana) to bring peace into your busy schedule.',
    content: `<p>The secret to permanent spiritual transformation lies in Sadhana—dedicated, systematic discipline directed towards a spiritual goal.</p>`,
    scriptureReferences: [
      'Bhagavad Gita, Chapter 6 (Dhyana Yoga)',
      'Yoga Sutras of Patanjali'
    ]
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  { id: 'gal-1', url: 'https://images.unsplash.com/photo-1609137144813-9118e9863a4b?q=80&w=1000', title: 'Sri Radharaman Lal Ju', category: 'Krishna', isWallpaper: true, isFestival: false, isEvent: false, createdAt: '2026-08-01' },
  { id: 'gal-2', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000', title: 'Vrindavan Dham Mandir', category: 'Temples', isWallpaper: true, isFestival: false, isEvent: false, createdAt: '2026-08-02' },
  { id: 'gal-3', url: 'https://images.unsplash.com/photo-1602631985686-2bb0f30101cd?q=80&w=1000', title: 'Divine Deepotsav celebration', category: 'Festivals', isWallpaper: false, isFestival: true, isEvent: false, createdAt: '2026-08-03' },
  { id: 'gal-4', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000', title: 'Meditative Yogi on Ganges', category: 'Wallpapers', isWallpaper: true, isFestival: false, isEvent: false, createdAt: '2026-08-04' }
];

const INITIAL_QUOTES: Quote[] = [
  // 1. Krishna / Janmashtami / Gita Quotes
  { 
    id: 'q-janmashtami-1', 
    quote: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥', 
    author: 'भगवान श्रीकृष्ण', 
    source: 'श्रीमद्भगवद्गीता (४.७)', 
    category: 'Krishna Bhakti',
    festival: 'Janmashtami',
    festivalId: 'janmashtami',
    topic: 'Shri Krishna',
    explanation: 'जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं धर्म की रक्षा और सत्य की स्थापना के लिए स्वयं प्रकट होता हूँ।',
    isPublished: true,
    createdAt: '2026-08-01'
  },
  { 
    id: 'q-janmashtami-2', 
    quote: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥', 
    author: 'भगवान श्रीकृष्ण', 
    source: 'श्रीमद्भगवद्गीता (२.४७)', 
    category: 'Krishna Bhakti',
    festival: 'Janmashtami',
    festivalId: 'janmashtami',
    topic: 'Shri Krishna',
    explanation: 'तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए फल की आसक्ति छोड़कर निष्काम भाव से कर्म करो।',
    isPublished: true,
    createdAt: '2026-08-02'
  },
  { 
    id: 'q-janmashtami-3', 
    quote: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥', 
    author: 'भगवान श्रीकृष्ण', 
    source: 'श्रीमद्भगवद्गीता (१८.६६)', 
    category: 'Krishna Bhakti',
    festival: 'Janmashtami',
    festivalId: 'janmashtami',
    topic: 'Shri Krishna',
    explanation: 'समस्त धर्मों के आश्रय को त्यागकर केवल मेरी अनन्य शरण में आ जाओ। मैं तुम्हें समस्त पापों व बंधनों से मुक्त कर दूँगा।',
    isPublished: true,
    createdAt: '2026-08-03'
  },
  { 
    id: 'q-janmashtami-4', 
    quote: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥', 
    author: 'भगवान श्रीकृष्ण', 
    source: 'श्रीमद्भगवद्गीता (९.२२)', 
    category: 'Krishna Bhakti',
    festival: 'Janmashtami',
    festivalId: 'janmashtami',
    topic: 'Shri Krishna',
    explanation: 'जो अनन्य प्रेमी भक्त निरंतर मेरा चिंतन करते हुए मेरी उपासना करते हैं, उनके योग-क्षेम का वहन मैं स्वयं करता हूँ।',
    isPublished: true,
    createdAt: '2026-08-04'
  },

  // 2. Ram Navami / Ram Bhakti Quotes
  { 
    id: 'q-ram-1', 
    quote: 'कलियुग केवल नाम अधारा।\nसुमिरि सुमिरि नर उतरहिं पारा॥', 
    author: 'गोस्वामी तुलसीदास', 
    source: 'श्रीरामचरितमानस', 
    category: 'Ram Bhakti',
    festival: 'Ram Navami',
    festivalId: 'ram-navami',
    topic: 'Shri Ram',
    explanation: 'कलियुग में केवल प्रभु का पावन नाम ही मुक्ति का एकमात्र साधन है, जिसका निरंतर सुमिरन करने से मनुष्य भवसागर पार कर जाता है।',
    isPublished: true,
    createdAt: '2026-08-05'
  },
  { 
    id: 'q-ram-2', 
    quote: 'निर्मल मन जन सो मोहि पावा।\nमोहि कपट छल छिद्र न भावा॥', 
    author: 'भगवान श्री राम', 
    source: 'श्रीरामचरितमानस (सुंदरकांड)', 
    category: 'Ram Bhakti',
    festival: 'Ram Navami',
    festivalId: 'ram-navami',
    topic: 'Shri Ram',
    explanation: 'जिसका मन निर्मल और कपटरहित है, वही मुझे प्राप्त कर सकता है। मुझे छल, कपट और प्रपंच कभी प्रिय नहीं लगते।',
    isPublished: true,
    createdAt: '2026-08-06'
  },
  { 
    id: 'q-ram-3', 
    quote: 'राम नाम मनि दीप धरू जीह देहरीं द्वार।\nतुलसी भीतर बाहिरहुँ जौं चाहसि उजियार॥', 
    author: 'गोस्वामी तुलसीदास', 
    source: 'दोहावली', 
    category: 'Ram Bhakti',
    festival: 'Ram Navami',
    festivalId: 'ram-navami',
    topic: 'Shri Ram',
    explanation: 'यदि तुम अपने भीतर और बाहर दोनों ओर प्रकाश चाहते हो, तो जीभरूपी देहरी के द्वार पर श्री राम नाम का मणिरूपी दीपक स्थापित करो।',
    isPublished: true,
    createdAt: '2026-08-07'
  },

  // 3. Hanuman Jayanti / Hanuman Bhakti Quotes
  { 
    id: 'q-hanuman-1', 
    quote: 'नासै रोग हरै सब पीरा।\nजपत निरंतर हनुमत बीरा॥', 
    author: 'गोस्वामी तुलसीदास', 
    source: 'श्री हनुमान चालीसा', 
    category: 'Hanuman Bhakti',
    festival: 'Hanuman Jayanti',
    festivalId: 'hanuman-jayanti',
    topic: 'Hanuman Ji',
    explanation: 'वीर हनुमान जी के पवित्र नाम का निरंतर जप करने से समस्त रोग नष्ट हो जाते हैं और सब प्रकार की पीड़ाएं समाप्त हो जाती हैं।',
    isPublished: true,
    createdAt: '2026-08-08'
  },
  { 
    id: 'q-hanuman-2', 
    quote: 'संकट कटै मिटै सब पीरा।\nजो सुमिरै हनुमत बलबीरा॥', 
    author: 'गोस्वामी तुलसीदास', 
    source: 'श्री हनुमान चालीसा', 
    category: 'Hanuman Bhakti',
    festival: 'Hanuman Jayanti',
    festivalId: 'hanuman-jayanti',
    topic: 'Hanuman Ji',
    explanation: 'जो महाबली श्री हनुमान जी का स्मरण करता है, उसके समस्त संकट टल जाते हैं और सारी बाधाएं दूर हो जाती हैं।',
    isPublished: true,
    createdAt: '2026-08-09'
  },

  // 4. Maha Shivratri / Shiva Bhakti Quotes
  { 
    id: 'q-shiv-1', 
    quote: 'कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥', 
    author: 'वेदोक्त शिव स्तुति', 
    source: 'यजुर्वेद', 
    category: 'Shiva Bhakti',
    festival: 'Maha Shivratri',
    festivalId: 'shivratri',
    topic: 'Lord Shiva',
    explanation: 'कर्पूर के समान उज्ज्वल, करुणा के अवतार, संसार के सार भगवान शिव को माता भवानी सहित मैं हृदय से नमन करता हूँ।',
    isPublished: true,
    createdAt: '2026-08-10'
  },
  { 
    id: 'q-shiv-2', 
    quote: 'ॐ नमः शिवाय\nशिव ही सत्य हैं, शिव ही सुंदर हैं, शिव ही अनादि और अनंत चैतन्य हैं।', 
    author: 'वेदिक महामंत्र', 
    source: 'शिव पुराण', 
    category: 'Shiva Bhakti',
    festival: 'Maha Shivratri',
    festivalId: 'shivratri',
    topic: 'Lord Shiva',
    explanation: 'पंचाक्षर मंत्र "ॐ नमः शिवाय" का जप आत्मा को परम चेतना और अगाध शांति प्रदान करता है।',
    isPublished: true,
    createdAt: '2026-08-11'
  },

  // 5. Ekadashi Vrat / Hari Bhakti Quotes
  { 
    id: 'q-ekadashi-1', 
    quote: 'एकादशी व्रत समस्त विकारों का नाश कर अंतःकरण में भगवान श्रीहरि की अनन्य प्रेममयी भक्ति जाग्रत करता है।', 
    author: 'व्यासदेव जी', 
    source: 'पद्म पुराण', 
    category: 'Hari Bhakti',
    festival: 'Ekadashi Vrat',
    festivalId: 'ekadashi',
    topic: 'Shri Hari',
    explanation: 'पावन एकादशी व्रत से मन और इंद्रियों की शुद्धि होती है तथा परम शांति की अनुभूति होती है।',
    isPublished: true,
    createdAt: '2026-08-12'
  },
  { 
    id: 'q-ekadashi-2', 
    quote: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम राम राम हरे हरे॥', 
    author: 'महामंत्र', 
    source: 'कलिसंतरण उपनिषद्', 
    category: 'Hari Bhakti',
    festival: 'Ekadashi Vrat',
    festivalId: 'ekadashi',
    topic: 'Maha Mantra',
    explanation: 'कलियुग में यह षोडश नामात्मक महामंत्र समस्त पाप-तापों का नाश कर हृदय को शुद्ध प्रेम से भर देता है।',
    isPublished: true,
    createdAt: '2026-08-13'
  },

  // 6. General Sanatana Dharma & Bhakti Quotes
  { 
    id: 'q-general-1', 
    quote: 'ईश्वर अंश जीव अविनासी।\nचेतन अमल सहज सुख रासी॥', 
    author: 'गोस्वामी तुलसीदास', 
    source: 'श्रीरामचरितमानस (उत्तरकांड)', 
    category: 'Spiritual',
    topic: 'Sadhana',
    explanation: 'यह जीवात्मा ईश्वर का ही सनातन अंश है, जो चैतन्य, निर्मल और स्वाभाविक रूप से सुख का पुंज है।',
    isPublished: true,
    createdAt: '2026-08-14'
  },
  { 
    id: 'q-general-2', 
    quote: 'सत्य, दया, पवित्रता और तप—यही सनातन धर्म के चार पावन आधार स्तम्भ हैं।', 
    author: 'ऋषि परंपरा', 
    source: 'श्रीमद्भागवतम्', 
    category: 'Sanatan Dharma',
    topic: 'Dharma',
    explanation: 'इन चार दिव्य सद्गुणों को जीवन में धारण करने से मानव जीवन सार्थक और प्रकाशमय बनता है।',
    isPublished: true,
    createdAt: '2026-08-15'
  }
];

const INITIAL_EVENTS: EventItem[] = [
  { id: 'ev-1', title: 'Grand Sri Krishna Janmashtami Mahotsav 2026', description: 'Join us for 24-hour Akhand Kirtan, Midnight Mahabhishekam, and Pravachan.', date: 'August 28, 2026', time: '06:00 PM onwards', location: 'Hari Pathshala Main Ashram & Live Stream', speaker: 'Ajay Swami', posterImage: 'https://images.unsplash.com/photo-1609137144813-9118e9863a4b?q=80&w=800', category: 'Festival' }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif-1', title: 'Welcome to Hari Pathshala', message: 'Explore sacred scriptures, stutis, and sadhana accoutrements on Hari Pathshala.', date: 'Today', read: false, type: 'info' }
];

const DEFAULT_FOUNDER_OFFICIAL_PHOTO = 'https://i.ibb.co/C3fMqkPN/1afc23d9a35f.png';

const INITIAL_FOUNDER_INFO: FounderInfo = {
  name: 'Ajay Swami (Amar Das)',
  title: 'Founder • Hari Pathshala',
  bio: 'Dedicated to disseminating the authentic eternal wisdom of Sanatana Dharma, Srimad Bhagavad Gita, and Sri Ramcharitmanas to seekers worldwide.',
  photoUrl: DEFAULT_FOUNDER_OFFICIAL_PHOTO,
  signatureUrl: '',
  message: 'Hari Pathshala में आपका स्वागत है। हमारा उद्देश्य भगवान श्री राम, श्री हरि और सनातन धर्म की दिव्य शिक्षाओं को सरल रूप में सभी seekers तक पहुँचाना है।',
  updatedAt: new Date().toISOString()
};

const INITIAL_HOME_BANNERS: HomeBanner[] = [
  { 
    id: 'b-1', 
    title: 'Srimad Bhagavad Gita & Vedic Wisdom', 
    subtitle: 'Learn sacred Shlokas, daily Sadhana, and Sanatan Dharma wisdom for inner peace.', 
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop', 
    buttonText: 'Read Bhagavad Gita', 
    buttonLink: '/gita',
    active: true,
    order: 1
  },
  { 
    id: 'b-2', 
    title: 'Sri Ramcharitmanas & Divine Ram Naam', 
    subtitle: 'Immerse in the holy nectar of Sri Ramcharitmanas Chaupais and Stutis.', 
    imageUrl: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=1200&auto=format&fit=crop', 
    buttonText: 'Explore Ramcharitmanas', 
    buttonLink: '/ramcharitmanas',
    active: true,
    order: 2
  },
  { 
    id: 'b-3', 
    title: 'Sacred Gurukul Store & Vrindavan Tulsi Malas', 
    subtitle: 'Authentic Vrindavan Tulsi Malas, Brass Diyas & Gita Press Scriptures.', 
    imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200&auto=format&fit=crop', 
    buttonText: 'Visit Spiritual Store', 
    buttonLink: '/store',
    active: true,
    order: 3
  }
];

const INITIAL_HOME_SECTIONS: HomeSection[] = [
  { id: 'sec-1', title: 'Hero Carousel', subtitle: 'Main landing banner', enabled: true, order: 1 },
  { id: 'sec-2', title: 'Featured Stutis & Mantras', subtitle: 'Sacred chants', enabled: true, order: 2 },
  { id: 'sec-3', title: 'Spiritual Store Highlights', subtitle: 'Pooja essentials', enabled: true, order: 3 },
  { id: 'sec-4', title: 'Divine Gallery & Wallpapers', subtitle: 'Sacred darshan', enabled: true, order: 4 },
  { id: 'sec-5', title: 'Sadhana Blogs & Insights', subtitle: 'Vedic teachings', enabled: true, order: 5 }
];

const INITIAL_APP_SETTINGS: AppSettings = {
  appName: 'Hari Pathshala',
  tagline: 'Authentic Sanatana Dharma & Vedic Wisdom Platform',
  contactEmail: 'haripathshala@gmail.com',
  contactPhone: '+91 9610579423',
  whatsappNumber: '+919610579423',
  whatsappGroupUrl: DEFAULT_WHATSAPP_GROUP_URL,
  address: 'Jaipur, Rajasthan, India',
  apkDownloadUrl: DEFAULT_APK_DOWNLOAD_URL,
  version: '2.4.0',
  buildNumber: '108',
  socialLinks: {
    youtube: 'https://youtube.com/@haripathshala',
    instagram: 'https://instagram.com/haripathshala',
    facebook: 'https://facebook.com/haripathshala',
    telegram: 'https://t.me/haripathshala',
    twitter: 'https://twitter.com/haripathshala'
  }
};

const INITIAL_TESTIMONIALS: Testimonial[] = [
  { id: 't-1', name: 'Dr. R. K. Mishra', location: 'New Delhi', review: 'Hari Pathshala has transformed our morning family prayers. The translations of Stutis are exceptionally accurate and uplifting.', rating: 5, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200', date: 'August 2026' }
];

const INITIAL_PANCHANG: PanchangData = {
  tithi: 'Shukla Paksha Ekadashi',
  nakshatra: 'Rohini',
  yog: 'Ayushman',
  karan: 'Bava',
  sunrise: '05:45 AM',
  sunset: '07:12 PM',
  rahukaal: '01:30 PM - 03:00 PM',
  yamagand: '06:00 AM - 07:30 AM',
  abhijitMuhurat: '11:55 AM - 12:45 PM',
  specialEvent: 'Pavitra Ekadashi Vrat',
  updatedAt: new Date().toISOString().split('T')[0]
};

const INITIAL_AI_GURU_CONFIG: AiGuruConfig = {
  systemPrompt: 'You are Hari Pathshala AI Guru, a compassionate, polite, and deeply knowledgeable spiritual mentor well-versed in Sanatana Dharma, Srimad Bhagavad Gita, Sri Ramcharitmanas, Upanishads, and Vedic scriptures.',
  temperature: 0.7,
  model: 'gemini-2.5-flash',
  enabled: true,
  maxTokens: 1000
};

// Main Realtime Database Engine with Firestore + Local Caching
class RealtimeDatabase {
  private products: Product[] = [];
  private stutis: Stuti[] = [];
  private blogs: Blog[] = [];
  private orders: Order[] = [];
  private gallery: GalleryItem[] = [];
  private quotes: Quote[] = [];
  private events: EventItem[] = [];
  private notifications: NotificationItem[] = [];
  private founderInfo: FounderInfo = INITIAL_FOUNDER_INFO;
  private homeBanners: HomeBanner[] = INITIAL_HOME_BANNERS;
  private homeSections: HomeSection[] = INITIAL_HOME_SECTIONS;
  private appSettings: AppSettings = INITIAL_APP_SETTINGS;
  private testimonials: Testimonial[] = INITIAL_TESTIMONIALS;
  private panchang: PanchangData = INITIAL_PANCHANG;
  private aiGuruConfig: AiGuruConfig = INITIAL_AI_GURU_CONFIG;
  private dynamicImages: { [key: string]: string } = {};
  private ecomConfig: EcomConfig = {
    activePaymentMethods: { COD: true, UPI: true, CARD: true, NETBANKING: true, WALLETS: true },
    defaultShipping: 50,
    defaultCodCharges: 40,
    defaultProductWeight: 600,
    defaultProductLength: 20,
    defaultProductWidth: 15,
    defaultProductHeight: 5,
    shiprocketEnabled: false,
    razorpayLiveMode: false
  };

  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private unsubscribes: Unsubscribe[] = [];

  constructor() {
    this.loadFromCache();
    this.initFirestoreListeners();
  }

  // 1. Immediate loading from local storage cache
  private loadFromCache() {
    try {
      this.products = JSON.parse(localStorage.getItem('hp_products') || JSON.stringify(INITIAL_PRODUCTS));
      this.stutis = JSON.parse(localStorage.getItem('hp_stutis') || JSON.stringify(INITIAL_STUTIS));
      this.blogs = JSON.parse(localStorage.getItem('hp_blogs') || JSON.stringify(INITIAL_BLOGS));
      this.orders = JSON.parse(localStorage.getItem('hp_orders') || '[]');
      this.gallery = JSON.parse(localStorage.getItem('hp_gallery') || JSON.stringify(INITIAL_GALLERY));
      this.quotes = JSON.parse(localStorage.getItem('hp_quotes') || JSON.stringify(INITIAL_QUOTES));
      this.events = JSON.parse(localStorage.getItem('hp_events') || JSON.stringify(INITIAL_EVENTS));
      this.notifications = JSON.parse(localStorage.getItem('hp_notifications') || JSON.stringify(INITIAL_NOTIFICATIONS));
      this.founderInfo = JSON.parse(localStorage.getItem('hp_founder') || JSON.stringify(INITIAL_FOUNDER_INFO));
      this.homeBanners = JSON.parse(localStorage.getItem('hp_banners') || JSON.stringify(INITIAL_HOME_BANNERS));
      this.homeSections = JSON.parse(localStorage.getItem('hp_sections') || JSON.stringify(INITIAL_HOME_SECTIONS));
      this.appSettings = JSON.parse(localStorage.getItem('hp_settings') || JSON.stringify(INITIAL_APP_SETTINGS));
      this.testimonials = JSON.parse(localStorage.getItem('hp_testimonials') || JSON.stringify(INITIAL_TESTIMONIALS));
      this.panchang = JSON.parse(localStorage.getItem('hp_panchang') || JSON.stringify(INITIAL_PANCHANG));
      this.aiGuruConfig = JSON.parse(localStorage.getItem('hp_aiguru') || JSON.stringify(INITIAL_AI_GURU_CONFIG));
      this.ecomConfig = JSON.parse(localStorage.getItem('hp_ecom') || JSON.stringify(this.ecomConfig));
      
      const storedImages = localStorage.getItem('hp_dynamic_images');
      if (storedImages) {
        this.dynamicImages = JSON.parse(storedImages);
      } else {
const DEFAULT_APP_LOGO = 'https://i.ibb.co/qMG2MS27/logo.png';

        this.dynamicImages = {
          websiteLogo: DEFAULT_APP_LOGO,
          mobileAppLogo: DEFAULT_APP_LOGO,
          splashScreenLogo: DEFAULT_APP_LOGO,
          appIcon: DEFAULT_APP_LOGO,
          favicon: DEFAULT_APP_LOGO,
          loadingLogo: DEFAULT_APP_LOGO,
          homeHeroBanner: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
          homeFeaturedBanner: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=1200',
          homePromotionalBanner: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1200',
          founderPhoto: 'https://i.ibb.co/C3fMqkPN/1afc23d9a35f.png',
          gitaCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800'
        };
      }
    } catch (e) {
      console.warn('Error reading local cache, using defaults:', e);
    }
  }

  // Save to Cache & notify UI subscribers
  private updateCollectionState(key: string, data: any) {
    localStorage.setItem(`hp_${key}`, JSON.stringify(data));
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(Array.isArray(data) ? [...data] : typeof data === 'object' ? { ...data } : data));
    }
  }

  // 2. Realtime Firestore Sync Engine
  private initFirestoreListeners() {
    this.listenCollection('products', INITIAL_PRODUCTS, (data) => {
      const norm = (data || []).map(item => normalizeObjectUrls(item));
      this.products = norm;
      this.updateCollectionState('products', norm);
    });

    this.listenCollection('stutis', INITIAL_STUTIS, (data) => {
      const norm = (data || []).map(item => normalizeStuti(item));
      this.stutis = norm;
      this.updateCollectionState('stutis', norm);
    });

    this.listenCollection('blogs', INITIAL_BLOGS, (data) => {
      const norm = (data || []).map(item => normalizeObjectUrls(item));
      this.blogs = norm;
      this.updateCollectionState('blogs', norm);
    });

    this.listenCollection('orders', [], (data) => {
      this.orders = data || [];
      this.updateCollectionState('orders', this.orders);
    });

    this.listenCollection('gallery', [], (data) => {
      const norm = (data || [])
        .map((item: any) => {
          const resolvedUrl = normalizeUrl(item.imageUrl || item.url || item.image || item.photoUrl || item.src || item.link);
          const isAct = item.isActive !== undefined 
            ? Boolean(item.isActive) 
            : (item.active !== undefined 
                ? Boolean(item.active) 
                : (item.isPublished !== undefined 
                    ? Boolean(item.isPublished) 
                    : (item.published !== undefined ? Boolean(item.published) : true)));
          const order = item.displayOrder !== undefined 
            ? Number(item.displayOrder) 
            : (item.order !== undefined ? Number(item.order) : 9999);
          
          return {
            id: item.id || `gal-${Date.now()}`,
            url: resolvedUrl,
            imageUrl: resolvedUrl,
            image: resolvedUrl,
            photoUrl: resolvedUrl,
            title: item.title || item.name || item.caption || 'Divine Spiritual Wallpaper',
            description: item.description || item.desc || item.details || '',
            category: item.category || item.tag || 'Wallpapers',
            isWallpaper: Boolean(item.isWallpaper ?? true),
            isFestival: Boolean(item.isFestival ?? false),
            isEvent: Boolean(item.isEvent ?? false),
            isActive: isAct,
            active: isAct,
            isPublished: isAct,
            published: isAct,
            displayOrder: order,
            order: order,
            createdAt: item.createdAt || item.date || new Date().toISOString().split('T')[0],
            updatedAt: item.updatedAt || ''
          };
        })
        .filter((g: any) => g.isActive !== false && g.url && g.url.trim().length > 0)
        .sort((a: any, b: any) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

      this.gallery = norm;
      this.updateCollectionState('gallery', norm);
    });

    this.listenCollection('quotes', INITIAL_QUOTES, (data) => {
      const normalizedQuotes = (data || []).map((d: any) => {
        const textContent = d.quote || d.content || d.text || '';
        const img = normalizeUrl(d.imageUrl || d.image);
        return {
          ...d,
          quote: textContent,
          content: textContent,
          author: d.author || 'Hari Pathshala',
          source: d.source || '',
          category: d.category || 'Spiritual',
          festival: d.festival || '',
          festivalId: d.festivalId || '',
          topic: d.topic || '',
          explanation: d.explanation || '',
          tags: Array.isArray(d.tags) ? d.tags : [],
          isPublished: d.isPublished !== undefined ? d.isPublished : (d.published !== undefined ? d.published : true),
          imageUrl: img || null,
          createdAt: d.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: d.updatedAt || ''
        };
      }).filter((q: any) => q.isPublished !== false && q.published !== false);

      const uniqueQuotesMap = new Map();
      normalizedQuotes.forEach((q: any) => uniqueQuotesMap.set(q.id, q));
      this.quotes = Array.from(uniqueQuotesMap.values());
      this.updateCollectionState('quotes', this.quotes);
    });

    // Realtime Banners collection
    this.listenCollection('banners', [], (data) => {
      if (data && data.length > 0) {
        const formattedBanners = data.map((b: any) => {
          const desktop = normalizeUrl(b.desktopImageUrl || b.imageUrl || b.image);
          const mobile = normalizeUrl(b.mobileImageUrl || b.imageUrl || b.image || desktop);
          const btnUrl = normalizeUrl(b.buttonUrl || b.buttonLink || '/');
          const isAct = b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true);
          return {
            id: b.id || `banner-${Date.now()}`,
            title: b.title || '',
            subtitle: b.subtitle || '',
            imageUrl: desktop || mobile,
            desktopImageUrl: desktop,
            mobileImageUrl: mobile,
            buttonText: b.buttonText || 'Explore',
            buttonLink: btnUrl,
            buttonUrl: btnUrl,
            active: isAct,
            isActive: isAct,
            order: b.displayOrder !== undefined ? Number(b.displayOrder) : (b.order !== undefined ? Number(b.order) : 1),
            displayOrder: b.displayOrder !== undefined ? Number(b.displayOrder) : (b.order !== undefined ? Number(b.order) : 1),
            startDate: b.startDate || null,
            endDate: b.endDate || null,
            updatedAt: b.updatedAt || ''
          };
        });

        this.homeBanners = formattedBanners;
        this.updateCollectionState('banners', this.homeBanners);
      }
    });

    this.listenCollection('events', INITIAL_EVENTS, (data) => {
      const norm = (data || []).map(item => normalizeObjectUrls(item));
      this.events = norm;
      this.updateCollectionState('events', norm);
    });

    this.listenCollection('notifications', INITIAL_NOTIFICATIONS, (data) => {
      const norm = (data || []).map(item => normalizeObjectUrls(item));
      this.notifications = norm;
      this.updateCollectionState('notifications', norm);
    });

    this.listenCollection('testimonials', INITIAL_TESTIMONIALS, (data) => {
      const norm = (data || []).map(item => normalizeObjectUrls(item));
      this.testimonials = norm;
      this.updateCollectionState('testimonials', norm);
    });

    // Doc-level settings
    this.listenDoc('app_settings', 'home_banners', { list: INITIAL_HOME_BANNERS }, (data) => {
      if (!this.homeBanners || this.homeBanners.length === 0) {
        const rawList = Array.isArray(data) ? data : (data.list || INITIAL_HOME_BANNERS);
        const formattedBanners = (rawList || []).map((b: any) => {
          const desktop = normalizeUrl(b.desktopImageUrl || b.imageUrl || b.image);
          const mobile = normalizeUrl(b.mobileImageUrl || b.imageUrl || b.image || desktop);
          const btnUrl = normalizeUrl(b.buttonUrl || b.buttonLink || '/');
          const isAct = b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true);
          return {
            id: b.id || `banner-${Date.now()}`,
            title: b.title || '',
            subtitle: b.subtitle || '',
            imageUrl: desktop || mobile,
            desktopImageUrl: desktop,
            mobileImageUrl: mobile,
            buttonText: b.buttonText || 'Explore',
            buttonLink: btnUrl,
            buttonUrl: btnUrl,
            active: isAct,
            isActive: isAct,
            order: b.displayOrder !== undefined ? Number(b.displayOrder) : (b.order !== undefined ? Number(b.order) : 1),
            displayOrder: b.displayOrder !== undefined ? Number(b.displayOrder) : (b.order !== undefined ? Number(b.order) : 1),
            startDate: b.startDate || null,
            endDate: b.endDate || null
          };
        });
        this.homeBanners = formattedBanners;
        this.updateCollectionState('banners', this.homeBanners);
      }
    });

    this.listenDoc('app_settings', 'founder_info', INITIAL_FOUNDER_INFO, (data) => {
      if (data) {
        let photo = normalizeUrl(data.photoUrl || data.photo || data.imageUrl);
        // If empty or old unsplash image, use the official ImgBB direct link
        if (!photo || photo.includes('unsplash.com')) {
          photo = DEFAULT_FOUNDER_OFFICIAL_PHOTO;
        }
        const norm: FounderInfo = {
          name: data.name || INITIAL_FOUNDER_INFO.name,
          title: data.title || INITIAL_FOUNDER_INFO.title,
          bio: data.bio || INITIAL_FOUNDER_INFO.bio,
          message: data.message || INITIAL_FOUNDER_INFO.message,
          photoUrl: photo,
          signatureUrl: normalizeUrl(data.signatureUrl || data.signature || ''),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        this.founderInfo = norm;
        this.updateCollectionState('founder', norm);
      }
    });

    this.listenDoc('app_settings', 'ecom_config', this.ecomConfig, (data) => {
      this.ecomConfig = data;
      this.updateCollectionState('ecom', data);
    });

    this.listenDoc('app_settings', 'global_settings', INITIAL_APP_SETTINGS, (data) => {
      if (data) {
        const norm = {
          ...data,
          appName: data.appName || INITIAL_APP_SETTINGS.appName,
          tagline: data.tagline || INITIAL_APP_SETTINGS.tagline,
          contactEmail: data.contactEmail || INITIAL_APP_SETTINGS.contactEmail,
          contactPhone: data.contactPhone || INITIAL_APP_SETTINGS.contactPhone,
          whatsappNumber: data.whatsappNumber || INITIAL_APP_SETTINGS.whatsappNumber,
          address: data.address || INITIAL_APP_SETTINGS.address,
          apkDownloadUrl: normalizeUrl(data.apkDownloadUrl || data.apkUrl),
          version: data.version || '1.2.0',
          buildNumber: data.buildNumber || '12',
          releaseNotes: data.releaseNotes || '',
          forceUpdate: Boolean(data.forceUpdate),
          socialLinks: {
            youtube: normalizeUrl(data.socialLinks?.youtube),
            instagram: normalizeUrl(data.socialLinks?.instagram),
            facebook: normalizeUrl(data.socialLinks?.facebook),
            telegram: normalizeUrl(data.socialLinks?.telegram),
            twitter: normalizeUrl(data.socialLinks?.twitter),
          }
        };
        this.appSettings = norm;
        this.updateCollectionState('settings', norm);
      }
    });

    this.listenDoc('app_settings', 'apk', {}, (data) => {
      if (data && (data.apkUrl || data.apkDownloadUrl)) {
        const apkUrlNorm = normalizeUrl(data.apkUrl || data.apkDownloadUrl);
        this.appSettings = {
          ...this.appSettings,
          apkDownloadUrl: apkUrlNorm,
          version: data.version || this.appSettings.version || '1.2.0',
          buildNumber: data.buildNumber || this.appSettings.buildNumber || '12',
          releaseNotes: data.releaseNotes || this.appSettings.releaseNotes || '',
          forceUpdate: Boolean(data.forceUpdate)
        };
        this.updateCollectionState('settings', this.appSettings);
      }
    });

    this.listenDoc('app_settings', 'panchang', INITIAL_PANCHANG, (data) => {
      this.panchang = data;
      this.updateCollectionState('panchang', data);
    });

    this.listenDoc('app_settings', 'ai_guru_config', INITIAL_AI_GURU_CONFIG, (data) => {
      this.aiGuruConfig = data;
      this.updateCollectionState('aiguru', data);
    });

    this.listenDoc('app_settings', 'dynamic_images', this.dynamicImages, (data) => {
      if (data) {
        const normImages: { [key: string]: string } = {};
        for (const k in data) {
          normImages[k] = normalizeUrl(data[k]);
        }
        this.dynamicImages = { ...this.dynamicImages, ...normImages };
        this.updateCollectionState('dynamic_images', this.dynamicImages);

        if (normImages.founderPhoto && normImages.founderPhoto !== this.founderInfo.photoUrl) {
          this.founderInfo = { ...this.founderInfo, photoUrl: normImages.founderPhoto };
          this.updateCollectionState('founder', this.founderInfo);
        }
      }
    });

    this.listenDoc('app_settings', 'branding', {}, (data) => {
      if (data && Object.keys(data).length > 0) {
        const normBranding: { [key: string]: string } = {};
        for (const k in data) {
          if (typeof data[k] === 'string') {
            normBranding[k] = normalizeUrl(data[k]);
          }
        }
        this.dynamicImages = { ...this.dynamicImages, ...normBranding };
        this.updateCollectionState('dynamic_images', this.dynamicImages);
      }
    });
  }

  private listenCollection(collName: string, initialSeed: any[], onUpdate: (items: any[]) => void) {
    try {
      const collRef = collection(firebaseDb, collName);
      const unsub = onSnapshot(
        collRef,
        (snapshot) => {
          if (snapshot.empty && initialSeed && initialSeed.length > 0) {
            // Seed documents to Firestore if empty
            initialSeed.forEach((item) => {
              const docId = item.id || `item-${Date.now()}`;
              setDoc(doc(firebaseDb, collName, docId), item).catch(() => {});
            });
            onUpdate(initialSeed);
          } else {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            onUpdate(items);
          }
        },
        (error) => {
          console.warn(`[Firestore Realtime Notice] Collection '${collName}' fallback to local cache:`, error.message);
        }
      );
      this.unsubscribes.push(unsub);
    } catch (err) {
      console.warn(`[Firestore Setup Notice] Collection '${collName}' using local cache:`, err);
    }
  }

  private listenDoc(collName: string, docId: string, initialSeed: any, onUpdate: (data: any) => void) {
    try {
      const docRef = doc(firebaseDb, collName, docId);
      const unsub = onSnapshot(
        docRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setDoc(docRef, initialSeed).catch(() => {});
            onUpdate(initialSeed);
          } else {
            onUpdate(snapshot.data());
          }
        },
        (error) => {
          console.warn(`[Firestore Realtime Notice] Doc '${docId}' fallback to local cache:`, error.message);
        }
      );
      this.unsubscribes.push(unsub);
    } catch (err) {
      console.warn(`[Firestore Setup Notice] Doc '${docId}' using local cache:`, err);
    }
  }

  // Generic Subscriber
  private subscribeKey(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = (this.listeners[key] || []).filter((cb) => cb !== callback);
    };
  }

  // --- Public APIs ---

  // Products
  public getProducts(): Product[] {
    return [...this.products];
  }

  public subscribe(collectionName: 'products' | 'stutis' | 'blogs' | 'orders', callback: (data: any[]) => void): () => void {
    if (collectionName === 'products') callback([...this.products]);
    if (collectionName === 'stutis') callback([...this.stutis]);
    if (collectionName === 'blogs') callback([...this.blogs]);
    if (collectionName === 'orders') callback([...this.orders]);
    return this.subscribeKey(collectionName, callback);
  }

  public addProduct(product: Omit<Product, 'id' | 'reviews' | 'rating' | 'reviewsCount'>) {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      reviews: []
    };
    this.products.unshift(newProd);
    this.updateCollectionState('products', this.products);
    setDoc(doc(firebaseDb, 'products', newProd.id), newProd).catch(() => {});
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.updateCollectionState('products', this.products);
    updateDoc(doc(firebaseDb, 'products', id), updates).catch(() => {});
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.updateCollectionState('products', this.products);
    deleteDoc(doc(firebaseDb, 'products', id)).catch(() => {});
  }

  public addReview(productId: string, userName: string, rating: number, comment: string) {
    const newReview = {
      id: `rev-${Date.now()}`,
      userName,
      rating,
      comment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    this.products = this.products.map((p) => {
      if (p.id === productId) {
        const updatedReviews = [newReview, ...p.reviews];
        const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return {
          ...p,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: avgRating
        };
      }
      return p;
    });
    this.updateCollectionState('products', this.products);
    const target = this.products.find((p) => p.id === productId);
    if (target) {
      updateDoc(doc(firebaseDb, 'products', productId), {
        reviews: target.reviews,
        reviewsCount: target.reviewsCount,
        rating: target.rating
      }).catch(() => {});
    }
  }

  // Stutis
  public getStutis(): Stuti[] {
    return [...this.stutis];
  }

  public getStutiByIdOrSlug(idOrSlug: string): Stuti | undefined {
    if (!idOrSlug) return undefined;
    const cleanParam = decodeURIComponent(idOrSlug).trim().toLowerCase();
    
    // 1. Direct match on loaded collection
    const matchFn = (s: Stuti) => {
      const sId = (s.id || '').toLowerCase();
      const sSlug = (s.slug || '').toLowerCase();
      const sTitleSlug = (s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const sHindiTitle = (s.hindiTitle || '').replace(/\s+/g, '-').toLowerCase();
      return (
        s.id === idOrSlug ||
        sId === cleanParam ||
        sSlug === cleanParam ||
        sTitleSlug === cleanParam ||
        sHindiTitle === cleanParam ||
        cleanParam.includes(sId) ||
        (sSlug && cleanParam.includes(sSlug))
      );
    };

    const found = this.stutis.find(matchFn);
    if (found) return found;

    // 2. Fallback to INITIAL_STUTIS
    return INITIAL_STUTIS.find(matchFn);
  }

  public async fetchStuti(idOrSlug: string): Promise<Stuti | null> {
    const instant = this.getStutiByIdOrSlug(idOrSlug);
    if (instant) return instant;

    try {
      if (firebaseDb) {
        // Direct document query by ID
        const docRef = doc(firebaseDb, 'stutis', idOrSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const item = normalizeStuti({ id: snap.id, ...snap.data() });
          return item;
        }
      }
    } catch (e) {
      console.warn('[Stuti Firestore Fetch Notice]:', e);
    }

    return this.getStutiByIdOrSlug(idOrSlug) || null;
  }

  public addStuti(stuti: Omit<Stuti, 'id'>) {
    const newStuti: Stuti = { ...stuti, id: `stuti-${Date.now()}` };
    this.stutis.unshift(newStuti);
    this.updateCollectionState('stutis', this.stutis);
    setDoc(doc(firebaseDb, 'stutis', newStuti.id), newStuti).catch(() => {});
  }

  public updateStuti(id: string, updates: Partial<Stuti>) {
    this.stutis = this.stutis.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.updateCollectionState('stutis', this.stutis);
    updateDoc(doc(firebaseDb, 'stutis', id), updates).catch(() => {});
  }

  public deleteStuti(id: string) {
    this.stutis = this.stutis.filter((s) => s.id !== id);
    this.updateCollectionState('stutis', this.stutis);
    deleteDoc(doc(firebaseDb, 'stutis', id)).catch(() => {});
  }

  // Blogs
  public getBlogs(): Blog[] {
    return [...this.blogs];
  }

  public addBlog(blog: Omit<Blog, 'id' | 'slug' | 'publishDate'>) {
    const cleanSlug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newBlog: Blog = {
      ...blog,
      id: `blog-${Date.now()}`,
      slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
      publishDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    this.blogs.unshift(newBlog);
    this.updateCollectionState('blogs', this.blogs);
    setDoc(doc(firebaseDb, 'blogs', newBlog.id), newBlog).catch(() => {});
  }

  public updateBlog(id: string, updates: Partial<Blog>) {
    this.blogs = this.blogs.map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.updateCollectionState('blogs', this.blogs);
    updateDoc(doc(firebaseDb, 'blogs', id), updates).catch(() => {});
  }

  public deleteBlog(id: string) {
    this.blogs = this.blogs.filter((b) => b.id !== id);
    this.updateCollectionState('blogs', this.blogs);
    deleteDoc(doc(firebaseDb, 'blogs', id)).catch(() => {});
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    this.updateCollectionState('orders', this.orders);
    setDoc(doc(firebaseDb, 'orders', newOrder.id), newOrder).catch(() => {});
    return newOrder;
  }

  public updateOrder(id: string, updates: Partial<Order>) {
    this.orders = this.orders.map((o) => (o.id === id ? { ...o, ...updates } : o));
    this.updateCollectionState('orders', this.orders);
    updateDoc(doc(firebaseDb, 'orders', id), updates).catch(() => {});
  }

  // Gallery
  public getGallery(): GalleryItem[] {
    return [...this.gallery];
  }

  public subscribeToGallery(callback: (items: GalleryItem[]) => void): () => void {
    callback([...this.gallery]);
    return this.subscribeKey('gallery', callback);
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>) {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.gallery.unshift(newItem);
    this.updateCollectionState('gallery', this.gallery);
    setDoc(doc(firebaseDb, 'gallery', newItem.id), newItem).catch(() => {});
  }

  public deleteGalleryItem(id: string) {
    this.gallery = this.gallery.filter((g) => g.id !== id);
    this.updateCollectionState('gallery', this.gallery);
    deleteDoc(doc(firebaseDb, 'gallery', id)).catch(() => {});
  }

  // Dynamic Images
  public getDynamicImage(key: string): string {
    return this.dynamicImages[key] || 'https://i.ibb.co/qMG2MS27/logo.png';
  }

  public subscribeToDynamicImages(callback: (images: { [key: string]: string }) => void): () => void {
    callback({ ...this.dynamicImages });
    return this.subscribeKey('dynamic_images', callback);
  }

  public updateDynamicImage(key: string, url: string) {
    this.dynamicImages[key] = url;
    this.updateCollectionState('dynamic_images', this.dynamicImages);
    setDoc(doc(firebaseDb, 'app_settings', 'dynamic_images'), this.dynamicImages, { merge: true }).catch(() => {});
  }

  // Ecom Config
  public getEcomConfig(): EcomConfig {
    return { ...this.ecomConfig };
  }

  public subscribeToEcomConfig(callback: (config: EcomConfig) => void): () => void {
    callback({ ...this.ecomConfig });
    return this.subscribeKey('ecom', callback);
  }

  public updateEcomConfig(updates: Partial<EcomConfig>) {
    this.ecomConfig = { ...this.ecomConfig, ...updates };
    this.updateCollectionState('ecom', this.ecomConfig);
    setDoc(doc(firebaseDb, 'app_settings', 'ecom_config'), this.ecomConfig, { merge: true }).catch(() => {});
  }

  // Quotes
  public getQuotes(): Quote[] {
    return [...this.quotes];
  }

  public subscribeToQuotes(callback: (quotes: Quote[]) => void): () => void {
    callback([...this.quotes]);
    return this.subscribeKey('quotes', callback);
  }

  public addQuote(quote: Omit<Quote, 'id'>) {
    const newQuote: Quote = { ...quote, id: `quote-${Date.now()}` };
    this.quotes.unshift(newQuote);
    this.updateCollectionState('quotes', this.quotes);
    setDoc(doc(firebaseDb, 'quotes', newQuote.id), newQuote).catch(() => {});
  }

  // Events
  public getEvents(): EventItem[] {
    return [...this.events];
  }

  public subscribeToEvents(callback: (events: EventItem[]) => void): () => void {
    callback([...this.events]);
    return this.subscribeKey('events', callback);
  }

  public addEvent(event: Omit<EventItem, 'id'>) {
    const newEvent: EventItem = { ...event, id: `event-${Date.now()}` };
    this.events.unshift(newEvent);
    this.updateCollectionState('events', this.events);
    setDoc(doc(firebaseDb, 'events', newEvent.id), newEvent).catch(() => {});
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public subscribeToNotifications(callback: (notifications: NotificationItem[]) => void): () => void {
    callback([...this.notifications]);
    return this.subscribeKey('notifications', callback);
  }

  public addNotification(notification: Omit<NotificationItem, 'id'>) {
    const newNotif: NotificationItem = { ...notification, id: `notif-${Date.now()}` };
    this.notifications.unshift(newNotif);
    this.updateCollectionState('notifications', this.notifications);
    setDoc(doc(firebaseDb, 'notifications', newNotif.id), newNotif).catch(() => {});
  }

  // Founder Info
  public getFounderInfo(): FounderInfo {
    return { ...this.founderInfo };
  }

  public subscribeToFounderInfo(callback: (info: FounderInfo) => void): () => void {
    callback({ ...this.founderInfo });
    return this.subscribeKey('founder', callback);
  }

  public updateFounderInfo(updates: Partial<FounderInfo>) {
    const photo = updates.photoUrl ? normalizeUrl(updates.photoUrl) : this.founderInfo.photoUrl;
    const signature = updates.signatureUrl !== undefined ? normalizeUrl(updates.signatureUrl) : this.founderInfo.signatureUrl;
    
    this.founderInfo = { 
      ...this.founderInfo, 
      ...updates,
      photoUrl: photo || DEFAULT_FOUNDER_OFFICIAL_PHOTO,
      signatureUrl: signature || '',
      updatedAt: new Date().toISOString()
    };
    this.updateCollectionState('founder', this.founderInfo);
    setDoc(doc(firebaseDb, 'app_settings', 'founder_info'), this.founderInfo, { merge: true }).catch((err) => {
      console.warn('Firestore founder update warning:', err);
    });
  }

  // Home Banners & Sections
  public getHomeBanners(): HomeBanner[] {
    return [...this.homeBanners];
  }

  public subscribeToHomeBanners(callback: (banners: HomeBanner[]) => void): () => void {
    callback([...this.homeBanners]);
    return this.subscribeKey('banners', callback);
  }

  public updateHomeBanners(banners: HomeBanner[]) {
    this.homeBanners = banners;
    this.updateCollectionState('banners', this.homeBanners);
    setDoc(doc(firebaseDb, 'app_settings', 'home_banners'), { list: banners }, { merge: true }).catch(() => {});
  }

  public getHomeSections(): HomeSection[] {
    return [...this.homeSections];
  }

  public subscribeToHomeSections(callback: (sections: HomeSection[]) => void): () => void {
    callback([...this.homeSections]);
    return this.subscribeKey('sections', callback);
  }

  public updateHomeSections(sections: HomeSection[]) {
    this.homeSections = sections;
    this.updateCollectionState('sections', this.homeSections);
    setDoc(doc(firebaseDb, 'app_settings', 'home_sections'), { list: sections }, { merge: true }).catch(() => {});
  }

  // Global App Settings
  public getAppSettings(): AppSettings {
    return { ...this.appSettings };
  }

  public subscribeToAppSettings(callback: (settings: AppSettings) => void): () => void {
    callback({ ...this.appSettings });
    return this.subscribeKey('settings', callback);
  }

  public updateAppSettings(updates: Partial<AppSettings>) {
    this.appSettings = { ...this.appSettings, ...updates };
    this.updateCollectionState('settings', this.appSettings);
    setDoc(doc(firebaseDb, 'app_settings', 'global_settings'), this.appSettings, { merge: true }).catch(() => {});
  }

  // Testimonials
  public getTestimonials(): Testimonial[] {
    return [...this.testimonials];
  }

  public subscribeToTestimonials(callback: (testimonials: Testimonial[]) => void): () => void {
    callback([...this.testimonials]);
    return this.subscribeKey('testimonials', callback);
  }

  // Panchang
  public getPanchang(): PanchangData {
    return { ...this.panchang };
  }

  public subscribeToPanchang(callback: (panchang: PanchangData) => void): () => void {
    callback({ ...this.panchang });
    return this.subscribeKey('panchang', callback);
  }

  public updatePanchang(data: Partial<PanchangData>) {
    this.panchang = { ...this.panchang, ...data, updatedAt: new Date().toISOString().split('T')[0] };
    this.updateCollectionState('panchang', this.panchang);
    setDoc(doc(firebaseDb, 'app_settings', 'panchang'), this.panchang, { merge: true }).catch(() => {});
  }

  // AI Guru Config
  public getAiGuruConfig(): AiGuruConfig {
    return { ...this.aiGuruConfig };
  }

  public subscribeToAiGuruConfig(callback: (config: AiGuruConfig) => void): () => void {
    callback({ ...this.aiGuruConfig });
    return this.subscribeKey('aiguru', callback);
  }

  public updateAiGuruConfig(updates: Partial<AiGuruConfig>) {
    this.aiGuruConfig = { ...this.aiGuruConfig, ...updates };
    this.updateCollectionState('aiguru', this.aiGuruConfig);
    setDoc(doc(firebaseDb, 'app_settings', 'ai_guru_config'), this.aiGuruConfig, { merge: true }).catch(() => {});
  }

  // Join Applications
  public async createJoinApplication(data: Omit<JoinApplication, 'status' | 'createdAt' | 'source'> & { additionalMessage?: string; message?: string }): Promise<{ id: string; success: boolean }> {
    const docId = `join-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPayload = {
      fullName: data.fullName || data.name || '',
      name: data.fullName || data.name || '',
      mobileNumber: data.mobileNumber || data.mobile || '',
      mobile: data.mobileNumber || data.mobile || '',
      city: data.city || '',
      state: data.state || '',
      age: Number(data.age) || data.age || 0,
      reason: data.reason || 'General Interest',
      additionalMessage: data.additionalMessage || data.message || '',
      message: data.additionalMessage || data.message || '',
      status: 'new' as const,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString(),
      source: 'user-panel'
    };

    try {
      if (firebaseDb) {
        // Save to primary collection joinApplications
        await setDoc(doc(firebaseDb, 'joinApplications', docId), fullPayload);
        // Also mirror to join_applications for compatibility
        setDoc(doc(firebaseDb, 'join_applications', docId), fullPayload).catch(() => {});
      }
      return { id: docId, success: true };
    } catch (error: any) {
      console.warn('[Firestore Notice] Join application fallback write:', error?.message);
      // Even if offline/network error, return ID so user UI remains seamless
      return { id: docId, success: true };
    }
  }

  // Contact Messages
  public async createContactMessage(data: Omit<ContactMessage, 'status' | 'createdAt' | 'source'>): Promise<{ id: string; success: boolean }> {
    const docId = `msg-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPayload = {
      name: data.name || '',
      email: data.email || '',
      mobileNumber: data.mobileNumber || data.mobile || '',
      mobile: data.mobileNumber || data.mobile || '',
      reason: data.reason || 'General Query',
      message: data.message || '',
      status: 'new' as const,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString(),
      source: 'user-panel'
    };

    try {
      if (firebaseDb) {
        // Save to primary collection contactMessages
        await setDoc(doc(firebaseDb, 'contactMessages', docId), fullPayload);
        // Also mirror to contact_messages for compatibility
        setDoc(doc(firebaseDb, 'contact_messages', docId), fullPayload).catch(() => {});
      }
      return { id: docId, success: true };
    } catch (error: any) {
      console.warn('[Firestore Notice] Contact message fallback write:', error?.message);
      return { id: docId, success: true };
    }
  }
}

export const db = new RealtimeDatabase();

// Shopping Cart State
export interface CartItem {
  product: Product;
  quantity: number;
}

let cart: CartItem[] = JSON.parse(localStorage.getItem('hari_pathshala_cart') || '[]');
const cartListeners: ((cart: CartItem[]) => void)[] = [];

export function getCart(): CartItem[] {
  return [...cart];
}

export function subscribeToCart(callback: (cart: CartItem[]) => void): () => void {
  cartListeners.push(callback);
  callback([...cart]);
  return () => {
    const idx = cartListeners.indexOf(callback);
    if (idx !== -1) cartListeners.splice(idx, 1);
  };
}

function notifyCartListeners() {
  localStorage.setItem('hari_pathshala_cart', JSON.stringify(cart));
  cartListeners.forEach((callback) => callback([...cart]));
}

export function addToCart(product: Product, quantity = 1) {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  notifyCartListeners();
}

export function updateCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    cart = cart.filter((item) => item.product.id !== productId);
  } else {
    const item = cart.find((item) => item.product.id === productId);
    if (item) item.quantity = quantity;
  }
  notifyCartListeners();
}

export function removeFromCart(productId: string) {
  cart = cart.filter((item) => item.product.id !== productId);
  notifyCartListeners();
}

export function clearCart() {
  cart = [];
  notifyCartListeners();
}

// Wishlist State
let wishlist: string[] = JSON.parse(localStorage.getItem('hari_pathshala_wishlist') || '[]');
const wishlistListeners: ((wishlist: string[]) => void)[] = [];

export function getWishlist(): string[] {
  return [...wishlist];
}

export function subscribeToWishlist(callback: (wishlist: string[]) => void): () => void {
  wishlistListeners.push(callback);
  callback([...wishlist]);
  return () => {
    const idx = wishlistListeners.indexOf(callback);
    if (idx !== -1) wishlistListeners.splice(idx, 1);
  };
}

export function toggleWishlist(productId: string) {
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem('hari_pathshala_wishlist', JSON.stringify(wishlist));
  wishlistListeners.forEach((callback) => callback([...wishlist]));
}

// Bookmarks State for Stutis
let stutiBookmarks: string[] = JSON.parse(localStorage.getItem('hari_pathshala_stuti_bookmarks') || '[]');
const bookmarksListeners: ((bookmarks: string[]) => void)[] = [];

export function getStutiBookmarks(): string[] {
  return [...stutiBookmarks];
}

export function subscribeToBookmarks(callback: (bookmarks: string[]) => void): () => void {
  bookmarksListeners.push(callback);
  callback([...stutiBookmarks]);
  return () => {
    const idx = bookmarksListeners.indexOf(callback);
    if (idx !== -1) bookmarksListeners.splice(idx, 1);
  };
}

export function toggleStutiBookmark(stutiId: string) {
  if (stutiBookmarks.includes(stutiId)) {
    stutiBookmarks = stutiBookmarks.filter((id) => id !== stutiId);
  } else {
    stutiBookmarks.push(stutiId);
  }
  localStorage.setItem('hari_pathshala_stuti_bookmarks', JSON.stringify(stutiBookmarks));
  bookmarksListeners.forEach((callback) => callback([...stutiBookmarks]));
}
