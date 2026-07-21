import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const COLORS = {
  primary: '#B7F000',
  primaryDark: '#4D6A00',
  ink: '#172014',
  muted: '#687465',
  faint: '#EEF3E9',
  line: '#DDE7D6',
  surface: '#F7FAF4',
  white: '#FFFFFF',
  blue: '#2563EB',
  teal: '#0F9F8E',
  amber: '#D97706',
  red: '#D92D20',
  navy: '#20304A',
};

const categoryPalette = {
  Cleaning: COLORS.primary,
  Plumbing: '#73C7FF',
  Electrical: '#FFD166',
  Handyman: '#FFB86B',
  Gardening: '#63D471',
  Moving: '#B9A7FF',
  Painting: '#FF9CAD',
  'Pet Care': '#88D8C0',
};

const emptyJobDraft = {
  title: '',
  category: 'Cleaning',
  location: '',
  budget: '',
  schedule: '',
  description: '',
};

const emptyOfferDraft = {
  amount: '',
  eta: '',
  note: '',
};

const countryOptions = [
  {
    code: 'IE',
    label: 'Ireland',
    locale: 'en-IE',
    currency: 'EUR',
    cityHint: 'Dublin 2, Cork City, Galway...',
    distanceUnit: 'km',
    paymentMethods: [
      { id: 'visa', label: 'Visa ending 4242', meta: 'Instant escrow hold' },
      { id: 'mastercard', label: 'Mastercard ending 1881', meta: '3D Secure ready' },
      { id: 'bank', label: 'Irish bank transfer', meta: 'Manual confirmation' },
    ],
  },
  {
    code: 'US',
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    cityHint: 'Brooklyn, Austin, Seattle...',
    distanceUnit: 'mi',
    paymentMethods: [
      { id: 'visa', label: 'Visa ending 4242', meta: 'Instant escrow hold' },
      { id: 'amex', label: 'Amex ending 9015', meta: 'Business card ready' },
      { id: 'ach', label: 'ACH transfer', meta: '1-2 business days' },
    ],
  },
  {
    code: 'GB',
    label: 'United Kingdom',
    locale: 'en-GB',
    currency: 'GBP',
    cityHint: 'Shoreditch, Manchester, Leeds...',
    distanceUnit: 'mi',
    paymentMethods: [
      { id: 'visa', label: 'Visa ending 4242', meta: 'Instant escrow hold' },
      { id: 'mastercard', label: 'Mastercard ending 1881', meta: '3D Secure ready' },
      { id: 'openbanking', label: 'Open Banking', meta: 'Bank-authenticated payout hold' },
    ],
  },
  {
    code: 'NG',
    label: 'Nigeria',
    locale: 'en-NG',
    currency: 'NGN',
    cityHint: 'Yaba, Abuja, Port Harcourt...',
    distanceUnit: 'km',
    paymentMethods: [
      { id: 'verve', label: 'Verve ending 2455', meta: 'Instant escrow hold' },
      { id: 'bank', label: 'Bank transfer', meta: 'Manual confirmation' },
      { id: 'mobile', label: 'Mobile wallet', meta: 'Fast release ready' },
    ],
  },
  {
    code: 'CA',
    label: 'Canada',
    locale: 'en-CA',
    currency: 'CAD',
    cityHint: 'Toronto, Vancouver, Calgary...',
    distanceUnit: 'km',
    paymentMethods: [
      { id: 'visa', label: 'Visa ending 4242', meta: 'Instant escrow hold' },
      { id: 'interac', label: 'Interac e-Transfer', meta: 'Bank-backed confirmation' },
      { id: 'mastercard', label: 'Mastercard ending 1881', meta: '3D Secure ready' },
    ],
  },
  {
    code: 'AU',
    label: 'Australia',
    locale: 'en-AU',
    currency: 'AUD',
    cityHint: 'Sydney, Melbourne, Perth...',
    distanceUnit: 'km',
    paymentMethods: [
      { id: 'visa', label: 'Visa ending 4242', meta: 'Instant escrow hold' },
      { id: 'payid', label: 'PayID transfer', meta: 'Fast bank confirmation' },
      { id: 'mastercard', label: 'Mastercard ending 1881', meta: '3D Secure ready' },
    ],
  },
];

const STORAGE_KEY = 'openwork-state-v2';
const memoryStorage = new Map();

const marketFixtures = {
  IE: {
    jobs: [
      {
        id: 101,
        title: 'Deep clean two-bedroom apartment',
        category: 'Cleaning',
        location: 'Rathmines, Dublin',
        distance: '2.4 km',
        budget: 145,
        schedule: 'Today, 16:00',
        description: 'Full apartment clean after guests, including kitchen appliances and two bathrooms.',
        customer: 'Sophie Walsh',
        status: 'Open',
        urgent: true,
        createdAt: '12 min ago',
        acceptedOfferId: null,
      },
      {
        id: 102,
        title: 'Repair leaking bathroom tap',
        category: 'Plumbing',
        location: 'Salthill, Galway',
        distance: '3.1 km',
        budget: 95,
        schedule: 'Tomorrow morning',
        description: 'Mixer tap keeps dripping. Please include call-out and parts estimate.',
        customer: 'Declan Murphy',
        status: 'Open',
        urgent: false,
        createdAt: '34 min ago',
        acceptedOfferId: null,
      },
      {
        id: 103,
        title: 'Assemble home office furniture',
        category: 'Handyman',
        location: 'Douglas, Cork',
        distance: '5.8 km',
        budget: 120,
        schedule: 'Friday afternoon',
        description: 'Desk, shelving unit and ergonomic chair need assembly in a new home office.',
        customer: 'Aisling Byrne',
        status: 'Open',
        urgent: false,
        createdAt: '1h ago',
        acceptedOfferId: null,
      },
    ],
    providers: [
      {
        id: 201,
        name: 'Emerald HomeCare',
        category: 'Cleaning',
        rating: '4.9',
        reviews: 184,
        completed: 312,
        response: '9 min',
        location: 'Dublin',
        verified: true,
        hourly: 38,
        initials: 'EH',
        tone: COLORS.primary,
      },
      {
        id: 202,
        name: 'Liffey Plumbing Co.',
        category: 'Plumbing',
        rating: '4.8',
        reviews: 96,
        completed: 147,
        response: '14 min',
        location: 'Galway',
        verified: true,
        hourly: 65,
        initials: 'LP',
        tone: '#73C7FF',
      },
      {
        id: 203,
        name: 'Cork Fix & Fit',
        category: 'Handyman',
        rating: '4.9',
        reviews: 121,
        completed: 204,
        response: '18 min',
        location: 'Cork',
        verified: true,
        hourly: 48,
        initials: 'CF',
        tone: '#FFB86B',
      },
    ],
    offers: [
      {
        id: 301,
        jobId: 101,
        providerId: 201,
        amount: 135,
        eta: 'Today, 15:45',
        note: 'Two-person team, eco products included, insured and available today.',
        status: 'Pending',
        paymentStatus: 'Not paid',
        paymentMethod: null,
        createdAt: '8 min ago',
      },
      {
        id: 302,
        jobId: 102,
        providerId: 202,
        amount: 110,
        eta: 'Tomorrow, 09:30',
        note: 'Call-out, seal replacement and pressure check included. Parts billed only if needed.',
        status: 'Pending',
        paymentStatus: 'Not paid',
        paymentMethod: null,
        createdAt: '20 min ago',
      },
    ],
    messages: [
      { id: 401, participant: 'Emerald HomeCare', jobId: 101, offerId: 301, preview: 'We can bring all cleaning products and arrive before 4.', time: '8m', unread: 1 },
      { id: 402, participant: 'Liffey Plumbing Co.', jobId: 102, offerId: 302, preview: 'Please send a close photo of the tap if possible.', time: '19m', unread: 0 },
    ],
    threads: {
      401: [
        { id: 501, from: 'provider', text: 'We can bring all cleaning products and arrive before 4.' },
        { id: 502, from: 'customer', text: 'That works. Please include the oven and fridge.' },
      ],
      402: [{ id: 503, from: 'provider', text: 'Please send a close photo of the tap if possible.' }],
    },
    alerts: [
      { id: 601, title: 'Offer received', body: 'Emerald HomeCare sent an offer for your Dublin cleaning job.', status: 'New' },
      { id: 602, title: 'Safety reminder', body: 'Keep payment in-app and release it only when the job is completed.', status: 'Trust' },
    ],
  },
  US: {
    jobs: [
      {
        id: 1101,
        title: 'Post-renovation apartment cleanup',
        category: 'Cleaning',
        location: 'Williamsburg, Brooklyn',
        distance: '1.7 mi',
        budget: 240,
        schedule: 'Today, 5:30 PM',
        description: 'Need dust removal, floor cleanup, bathroom detail and window wipe-down after light renovation work.',
        customer: 'Maya Carter',
        status: 'Open',
        urgent: true,
        createdAt: '18 min ago',
        acceptedOfferId: null,
      },
      {
        id: 1102,
        title: 'Install ceiling fan in spare bedroom',
        category: 'Electrical',
        location: 'South Congress, Austin',
        distance: '2.9 mi',
        budget: 160,
        schedule: 'Tomorrow, 10:00 AM',
        description: 'Existing light fixture needs to be swapped for a remote-controlled ceiling fan.',
        customer: 'Jordan Lee',
        status: 'Open',
        urgent: false,
        createdAt: '42 min ago',
        acceptedOfferId: null,
      },
      {
        id: 1103,
        title: 'Pack and move studio apartment',
        category: 'Moving',
        location: 'Capitol Hill, Seattle',
        distance: '4.4 mi',
        budget: 320,
        schedule: 'Saturday, 9:00 AM',
        description: 'Need packing help, van loading and unloading into a second-floor walk-up.',
        customer: 'Avery Nguyen',
        status: 'Open',
        urgent: false,
        createdAt: '1h ago',
        acceptedOfferId: null,
      },
    ],
    providers: [
      { id: 1201, name: 'Hudson Spark Clean', category: 'Cleaning', rating: '4.9', reviews: 211, completed: 388, response: '7 min', location: 'New York', verified: true, hourly: 55, initials: 'HS', tone: COLORS.primary },
      { id: 1202, name: 'Lone Star Electric', category: 'Electrical', rating: '4.8', reviews: 143, completed: 260, response: '11 min', location: 'Austin', verified: true, hourly: 92, initials: 'LS', tone: '#FFD166' },
      { id: 1203, name: 'North Sound Movers', category: 'Moving', rating: '4.7', reviews: 104, completed: 176, response: '16 min', location: 'Seattle', verified: true, hourly: 88, initials: 'NS', tone: '#B9A7FF' },
    ],
    offers: [
      { id: 1301, jobId: 1101, providerId: 1201, amount: 225, eta: 'Today, 5:00 PM', note: 'Crew of two with HEPA vacuums and post-reno cleanup experience.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '10 min ago' },
      { id: 1302, jobId: 1102, providerId: 1202, amount: 175, eta: 'Tomorrow, 9:30 AM', note: 'Includes fan mounting, balance check and disposal of old fixture.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '24 min ago' },
    ],
    messages: [
      { id: 1401, participant: 'Hudson Spark Clean', jobId: 1101, offerId: 1301, preview: 'We can bring ladders and dust barriers if needed.', time: '10m', unread: 1 },
      { id: 1402, participant: 'Lone Star Electric', jobId: 1102, offerId: 1302, preview: 'Please confirm ceiling height and if there is attic access.', time: '24m', unread: 0 },
    ],
    threads: {
      1401: [{ id: 1501, from: 'provider', text: 'We can bring ladders and dust barriers if needed.' }],
      1402: [{ id: 1502, from: 'provider', text: 'Please confirm ceiling height and if there is attic access.' }],
    },
    alerts: [
      { id: 1601, title: 'Offer received', body: 'Hudson Spark Clean priced your Brooklyn cleanup request.', status: 'New' },
      { id: 1602, title: 'Trust tip', body: 'Use escrow for higher-value bookings and keep all updates in chat.', status: 'Trust' },
    ],
  },
  GB: {
    jobs: [
      { id: 2101, title: 'End-of-tenancy flat clean', category: 'Cleaning', location: 'Shoreditch, London', distance: '1.2 mi', budget: 185, schedule: 'Today, 18:00', description: 'Need kitchen degreasing, limescale removal and appliance wipe-down before handover.', customer: 'Amelia Brown', status: 'Open', urgent: true, createdAt: '9 min ago', acceptedOfferId: null },
      { id: 2102, title: 'Fix dripping kitchen sink and trap', category: 'Plumbing', location: 'Northern Quarter, Manchester', distance: '2.8 mi', budget: 115, schedule: 'Tomorrow, 08:30', description: 'Leak under sink worsens during dishwasher cycles. Please inspect seals and waste trap.', customer: 'Harry Collins', status: 'Open', urgent: false, createdAt: '31 min ago', acceptedOfferId: null },
      { id: 2103, title: 'Refresh white paint in guest room', category: 'Painting', location: 'Headingley, Leeds', distance: '4.1 mi', budget: 210, schedule: 'Sunday afternoon', description: 'One bedroom repaint with minor prep and furniture protection included.', customer: 'Sophie Walker', status: 'Open', urgent: false, createdAt: '58 min ago', acceptedOfferId: null },
    ],
    providers: [
      { id: 2201, name: 'City Sparkle London', category: 'Cleaning', rating: '4.9', reviews: 172, completed: 295, response: '8 min', location: 'London', verified: true, hourly: 42, initials: 'CS', tone: COLORS.primary },
      { id: 2202, name: 'Northline Plumbing', category: 'Plumbing', rating: '4.8', reviews: 131, completed: 204, response: '12 min', location: 'Manchester', verified: true, hourly: 74, initials: 'NP', tone: '#73C7FF' },
      { id: 2203, name: 'Leeds Finish Co.', category: 'Painting', rating: '4.7', reviews: 96, completed: 141, response: '20 min', location: 'Leeds', verified: true, hourly: 51, initials: 'LF', tone: '#FF9CAD' },
    ],
    offers: [
      { id: 2301, jobId: 2101, providerId: 2201, amount: 170, eta: 'Today, 17:30', note: 'We can finish before check-out and supply all materials.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '6 min ago' },
      { id: 2302, jobId: 2102, providerId: 2202, amount: 128, eta: 'Tomorrow, 08:00', note: 'Includes seal kit and under-sink inspection.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '21 min ago' },
    ],
    messages: [
      { id: 2401, participant: 'City Sparkle London', jobId: 2101, offerId: 2301, preview: 'We can finish before the agent arrives.', time: '6m', unread: 1 },
      { id: 2402, participant: 'Northline Plumbing', jobId: 2102, offerId: 2302, preview: 'Please send a photo of the cabinet base if possible.', time: '21m', unread: 0 },
    ],
    threads: {
      2401: [{ id: 2501, from: 'provider', text: 'We can finish before the agent arrives.' }],
      2402: [{ id: 2502, from: 'provider', text: 'Please send a photo of the cabinet base if possible.' }],
    },
    alerts: [
      { id: 2601, title: 'Offer received', body: 'City Sparkle London responded to your Shoreditch clean.', status: 'New' },
      { id: 2602, title: 'Market note', body: 'Open Banking payments are available for UK escrow checkouts.', status: 'Trust' },
    ],
  },
  NG: {
    jobs: [
      { id: 3101, title: 'Office deep clean before client visit', category: 'Cleaning', location: 'Yaba, Lagos', distance: '2.2 km', budget: 85000, schedule: 'Today, 17:00', description: 'Need meeting room, reception and restroom cleaning before tomorrow morning presentation.', customer: 'Adaeze Okafor', status: 'Open', urgent: true, createdAt: '11 min ago', acceptedOfferId: null },
      { id: 3102, title: 'Service inverter and batteries', category: 'Electrical', location: 'Wuse 2, Abuja', distance: '5.6 km', budget: 120000, schedule: 'Tomorrow, 11:00', description: 'Need full inverter system check, wiring inspection and battery terminal cleanup.', customer: 'Tunde Yusuf', status: 'Open', urgent: false, createdAt: '37 min ago', acceptedOfferId: null },
      { id: 3103, title: 'Fix wardrobe hinges and drawer runners', category: 'Handyman', location: 'GRA Phase 2, Port Harcourt', distance: '3.8 km', budget: 65000, schedule: 'Saturday, 14:00', description: 'Three wardrobe doors need alignment and two drawers keep jamming.', customer: 'Chioma Briggs', status: 'Open', urgent: false, createdAt: '1h ago', acceptedOfferId: null },
    ],
    providers: [
      { id: 3201, name: 'Lagos Prime Clean', category: 'Cleaning', rating: '4.9', reviews: 203, completed: 362, response: '8 min', location: 'Lagos', verified: true, hourly: 18000, initials: 'LP', tone: COLORS.primary },
      { id: 3202, name: 'Capital Power Works', category: 'Electrical', rating: '4.8', reviews: 119, completed: 188, response: '13 min', location: 'Abuja', verified: true, hourly: 25000, initials: 'CP', tone: '#FFD166' },
      { id: 3203, name: 'Delta Handy Crew', category: 'Handyman', rating: '4.7', reviews: 87, completed: 149, response: '19 min', location: 'Port Harcourt', verified: true, hourly: 15000, initials: 'DH', tone: '#FFB86B' },
    ],
    offers: [
      { id: 3301, jobId: 3101, providerId: 3201, amount: 78000, eta: 'Today, 16:30', note: 'Four-person team available with floor machine and washroom consumables.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '7 min ago' },
      { id: 3302, jobId: 3102, providerId: 3202, amount: 135000, eta: 'Tomorrow, 10:15', note: 'Diagnostics, cable tightening and load balancing included.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '23 min ago' },
    ],
    messages: [
      { id: 3401, participant: 'Lagos Prime Clean', jobId: 3101, offerId: 3301, preview: 'We can arrive with backup staff if you need same-day completion.', time: '7m', unread: 1 },
      { id: 3402, participant: 'Capital Power Works', jobId: 3102, offerId: 3302, preview: 'Please confirm inverter brand and battery count.', time: '23m', unread: 0 },
    ],
    threads: {
      3401: [{ id: 3501, from: 'provider', text: 'We can arrive with backup staff if you need same-day completion.' }],
      3402: [{ id: 3502, from: 'provider', text: 'Please confirm inverter brand and battery count.' }],
    },
    alerts: [
      { id: 3601, title: 'Offer received', body: 'Lagos Prime Clean sent pricing for your Yaba office cleanup.', status: 'New' },
      { id: 3602, title: 'Payment tip', body: 'Wallet and bank-transfer escrow both support payout hold and release.', status: 'Trust' },
    ],
  },
  CA: {
    jobs: [
      { id: 4101, title: 'Move sofa and dining set to new condo', category: 'Moving', location: 'Liberty Village, Toronto', distance: '6.1 km', budget: 280, schedule: 'Friday, 15:00', description: 'Need two movers, blankets and careful elevator booking timing.', customer: 'Noah Patel', status: 'Open', urgent: false, createdAt: '16 min ago', acceptedOfferId: null },
      { id: 4102, title: 'Seasonal yard cleanup and mulch top-up', category: 'Gardening', location: 'Kitsilano, Vancouver', distance: '4.2 km', budget: 230, schedule: 'Saturday morning', description: 'Front and back garden cleanup with hedge shaping and mulch spread.', customer: 'Claire Bernard', status: 'Open', urgent: false, createdAt: '39 min ago', acceptedOfferId: null },
      { id: 4103, title: 'Patch drywall and repaint hallway', category: 'Painting', location: 'Beltline, Calgary', distance: '5.9 km', budget: 260, schedule: 'Monday, 13:00', description: 'Need small dent repairs and one-coat repaint in condo hallway.', customer: 'Liam Ross', status: 'Open', urgent: false, createdAt: '1h ago', acceptedOfferId: null },
    ],
    providers: [
      { id: 4201, name: 'Sixix Move Crew', category: 'Moving', rating: '4.8', reviews: 138, completed: 224, response: '12 min', location: 'Toronto', verified: true, hourly: 84, initials: 'SM', tone: '#B9A7FF' },
      { id: 4202, name: 'Pacific Green Yards', category: 'Gardening', rating: '4.9', reviews: 111, completed: 180, response: '10 min', location: 'Vancouver', verified: true, hourly: 58, initials: 'PG', tone: '#63D471' },
      { id: 4203, name: 'Prairie Paint Works', category: 'Painting', rating: '4.7', reviews: 92, completed: 146, response: '17 min', location: 'Calgary', verified: true, hourly: 62, initials: 'PP', tone: '#FF9CAD' },
    ],
    offers: [
      { id: 4301, jobId: 4101, providerId: 4201, amount: 295, eta: 'Friday, 14:30', note: 'Truck, blankets, shrink-wrap and elevator coordination included.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '9 min ago' },
      { id: 4302, jobId: 4102, providerId: 4202, amount: 210, eta: 'Saturday, 08:30', note: 'Includes yard waste bags, edge cleanup and fresh mulch spread.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '25 min ago' },
    ],
    messages: [
      { id: 4401, participant: 'Sixix Move Crew', jobId: 4101, offerId: 4301, preview: 'We can coordinate with concierge for loading dock access.', time: '9m', unread: 1 },
      { id: 4402, participant: 'Pacific Green Yards', jobId: 4102, offerId: 4302, preview: 'Please share yard photos if you have them.', time: '25m', unread: 0 },
    ],
    threads: {
      4401: [{ id: 4501, from: 'provider', text: 'We can coordinate with concierge for loading dock access.' }],
      4402: [{ id: 4502, from: 'provider', text: 'Please share yard photos if you have them.' }],
    },
    alerts: [
      { id: 4601, title: 'Offer received', body: 'Sixix Move Crew priced your Toronto condo move.', status: 'New' },
      { id: 4602, title: 'Checkout ready', body: 'Interac e-Transfer is available for supported Canadian bookings.', status: 'Trust' },
    ],
  },
  AU: {
    jobs: [
      { id: 5101, title: 'Assemble nursery furniture set', category: 'Handyman', location: 'Surry Hills, Sydney', distance: '3.4 km', budget: 190, schedule: 'Tomorrow, 16:00', description: 'Need cot, dresser and rocker chair assembled with packaging removed.', customer: 'Olivia Smith', status: 'Open', urgent: false, createdAt: '13 min ago', acceptedOfferId: null },
      { id: 5102, title: 'Unblock outdoor drain and clear leaves', category: 'Gardening', location: 'South Yarra, Melbourne', distance: '4.8 km', budget: 165, schedule: 'Saturday, 09:00', description: 'Patio drain overflows during rain. Need leaf removal and water-flow check.', customer: 'Isaac Turner', status: 'Open', urgent: false, createdAt: '36 min ago', acceptedOfferId: null },
      { id: 5103, title: 'Dog walking and feeding over weekend', category: 'Pet Care', location: 'Subiaco, Perth', distance: '2.1 km', budget: 140, schedule: 'This weekend', description: 'Two daily visits for a senior labrador, with meds after dinner.', customer: 'Grace Miller', status: 'Open', urgent: false, createdAt: '54 min ago', acceptedOfferId: null },
    ],
    providers: [
      { id: 5201, name: 'Harbour Handy Co.', category: 'Handyman', rating: '4.8', reviews: 108, completed: 169, response: '15 min', location: 'Sydney', verified: true, hourly: 64, initials: 'HH', tone: '#FFB86B' },
      { id: 5202, name: 'Laneway Garden Crew', category: 'Gardening', rating: '4.9', reviews: 126, completed: 201, response: '11 min', location: 'Melbourne', verified: true, hourly: 59, initials: 'LG', tone: '#63D471' },
      { id: 5203, name: 'Perth Pet Circle', category: 'Pet Care', rating: '4.9', reviews: 83, completed: 130, response: '9 min', location: 'Perth', verified: true, hourly: 47, initials: 'PP', tone: '#88D8C0' },
    ],
    offers: [
      { id: 5301, jobId: 5101, providerId: 5201, amount: 175, eta: 'Tomorrow, 15:30', note: 'Assembly, safety anchoring and packaging removal included.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '8 min ago' },
      { id: 5302, jobId: 5103, providerId: 5203, amount: 135, eta: 'Saturday, 08:00', note: 'Medication reminders and photo updates after each visit.', status: 'Pending', paymentStatus: 'Not paid', paymentMethod: null, createdAt: '19 min ago' },
    ],
    messages: [
      { id: 5401, participant: 'Harbour Handy Co.', jobId: 5101, offerId: 5301, preview: 'Happy to anchor the dresser to the wall as well.', time: '8m', unread: 1 },
      { id: 5402, participant: 'Perth Pet Circle', jobId: 5103, offerId: 5302, preview: 'Please share feeding instructions and vet contact details.', time: '19m', unread: 0 },
    ],
    threads: {
      5401: [{ id: 5501, from: 'provider', text: 'Happy to anchor the dresser to the wall as well.' }],
      5402: [{ id: 5502, from: 'provider', text: 'Please share feeding instructions and vet contact details.' }],
    },
    alerts: [
      { id: 5601, title: 'Offer received', body: 'Harbour Handy Co. responded to your Sydney nursery setup request.', status: 'New' },
      { id: 5602, title: 'Escrow note', body: 'PayID transfer support is available on eligible Australian jobs.', status: 'Trust' },
    ],
  },
};

const currencyOptions = [
  { code: 'EUR', label: 'Euro' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'NGN', label: 'Naira' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
];

const currencyLocales = {
  EUR: 'en-IE',
  USD: 'en-US',
  GBP: 'en-GB',
  NGN: 'en-NG',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

const currencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  NGN: 1540,
  CAD: 1.37,
  AUD: 1.52,
};

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildMarketState(countryCode) {
  return cloneValue(marketFixtures[countryCode] ?? marketFixtures.IE);
}

function buildAllMarketStates() {
  return Object.fromEntries(countryOptions.map((option) => [option.code, buildMarketState(option.code)]));
}

function deriveCategories(jobs) {
  const counts = jobs.reduce((result, job) => {
    result[job.category] = (result[job.category] ?? 0) + 1;
    return result;
  }, {});

  const orderedLabels = [...new Set([...Object.keys(categoryPalette), ...Object.keys(counts)])];

  return orderedLabels
    .filter((label) => (counts[label] ?? 0) > 0)
    .map((label) => ({
      id: categoryId(label),
      label,
      count: counts[label],
      tone: categoryPalette[label] ?? COLORS.teal,
    }));
}

async function loadStoredState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(STORAGE_KEY);
    }
  } catch {}

  return memoryStorage.get(STORAGE_KEY) ?? null;
}

async function saveStoredState(value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, value);
      return;
    }
  } catch {}

  memoryStorage.set(STORAGE_KEY, value);
}

const defaultCountryCode = countryOptions[0].code;
const initialMarketState = buildMarketState(defaultCountryCode);

const tabs = [
  { id: 'market', label: 'Market', icon: 'market' },
  { id: 'post', label: 'Post', icon: 'post' },
  { id: 'offers', label: 'Offers', icon: 'offers' },
  { id: 'messages', label: 'Chat', icon: 'chat' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

const onboardingSteps = [
  {
    title: 'Local work, handled end to end',
    body: 'Post jobs, receive clear offers, book verified providers and keep every update in one place.',
    metric: '4 live workflows',
    tone: COLORS.primary,
  },
  {
    title: 'Built for country and currency choice',
    body: 'Choose your market, price work in your preferred currency and keep the same booking flow anywhere.',
    metric: 'Multi-currency',
    tone: '#73C7FF',
  },
  {
    title: 'Chat before and after booking',
    body: 'Every offer can become a conversation, then a booked job, then a completed service record.',
    metric: 'Secure chat',
    tone: '#FFB86B',
  },
];

const emptyAuthForm = {
  name: '',
  email: '',
  password: '',
  accountType: 'Customer',
  countryCode: countryOptions[0].code,
  currency: countryOptions[0].currency,
};

function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function getCountryOption(countryCode) {
  return countryOptions.find((option) => option.code === countryCode) ?? countryOptions[0];
}

function getPricingConfig(countryCode, currency) {
  const country = getCountryOption(countryCode);

  return {
    country,
    currency: currency || country.currency,
    locale: country.locale || currencyLocales[currency] || 'en-US',
  };
}

function convertAmount(value, fromCurrency, toCurrency) {
  const numeric = Number(value) || 0;

  if (fromCurrency === toCurrency) {
    return numeric;
  }

  const fromRate = currencyRates[fromCurrency];
  const toRate = currencyRates[toCurrency];

  if (!fromRate || !toRate) {
    return numeric;
  }

  return (numeric / fromRate) * toRate;
}

function formatMoney(value, { currency = 'EUR', locale = 'en-IE' } = {}) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }
}

function parseAmount(value) {
  const numeric = value.replace(/[^0-9.]/g, '');
  return Number(numeric);
}

function categoryId(label) {
  const clean = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return clean || `category-${makeId()}`;
}

function showNotice(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

function statusTone(status) {
  if (status === 'Accepted' || status === 'Booked') {
    return COLORS.blue;
  }
  if (status === 'Completed') {
    return COLORS.teal;
  }
  if (status === 'Declined' || status === 'Cancelled') {
    return COLORS.red;
  }
  return COLORS.amber;
}

export default function App() {
  const [authStage, setAuthStage] = useState('onboarding');
  const [authMode, setAuthMode] = useState('signup');
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('market');
  const [mode, setMode] = useState('Customer');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [marketplaces, setMarketplaces] = useState(() => buildAllMarketStates());
  const [jobs, setJobs] = useState(initialMarketState.jobs);
  const [providers, setProviders] = useState(initialMarketState.providers);
  const [offers, setOffers] = useState(initialMarketState.offers);
  const [messages, setMessages] = useState(initialMarketState.messages);
  const [threads, setThreads] = useState(initialMarketState.threads);
  const [alerts, setAlerts] = useState(initialMarketState.alerts);
  const [jobDraft, setJobDraft] = useState(emptyJobDraft);
  const [offerDrafts, setOfferDrafts] = useState({});
  const [selectedJobId, setSelectedJobId] = useState(initialMarketState.jobs[0]?.id ?? null);
  const [selectedMessageId, setSelectedMessageId] = useState(initialMarketState.messages[0]?.id ?? null);
  const [chatDraft, setChatDraft] = useState('');
  const [serviceRadius, setServiceRadius] = useState(12);
  const [instantBooking, setInstantBooking] = useState(true);
  const [checkoutOfferId, setCheckoutOfferId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    getCountryOption(defaultCountryCode).paymentMethods[0].id
  );
  const [loadedMarketCode, setLoadedMarketCode] = useState(defaultCountryCode);
  const [hydrated, setHydrated] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const activeCountryCode = currentUser?.countryCode ?? authForm.countryCode;
  const pricingConfig = useMemo(
    () => getPricingConfig(activeCountryCode, currentUser?.currency ?? authForm.currency),
    [authForm.countryCode, authForm.currency, currentUser]
  );
  const activeCountry = pricingConfig.country;
  const formatPrice = (value) =>
    formatMoney(convertAmount(value, activeCountry.currency, pricingConfig.currency), pricingConfig);
  const categories = useMemo(() => deriveCategories(jobs), [jobs]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId]
  );

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? messages[0] ?? null,
    [messages, selectedMessageId]
  );

  const selectedThread = selectedMessage ? threads[selectedMessage.id] ?? [] : [];
  const checkoutOffer = offers.find((offer) => offer.id === checkoutOfferId) ?? null;
  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const categoryMatch = selectedCategory === 'all' || categoryId(job.category) === selectedCategory;
      const queryMatch =
        !query ||
        [job.title, job.category, job.location, job.description, job.customer]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return categoryMatch && queryMatch;
    });
  }, [jobs, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const openJobs = jobs.filter((job) => job.status === 'Open').length;
    const pendingOffers = offers.filter((offer) => offer.status === 'Pending').length;
    const bookedJobs = jobs.filter((job) => job.status === 'Booked').length;

    return { openJobs, pendingOffers, bookedJobs };
  }, [jobs, offers]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateState() {
      const raw = await loadStoredState();

      if (!raw || cancelled) {
        setHydrated(true);
        return;
      }

      try {
        const saved = JSON.parse(raw);
        const nextMarkets = saved.marketplaces ? { ...buildAllMarketStates(), ...saved.marketplaces } : buildAllMarketStates();

        setMarketplaces(nextMarkets);
        setAuthStage(saved.authStage ?? 'onboarding');
        setAuthMode(saved.authMode ?? 'signup');
        setOnboardingIndex(saved.onboardingIndex ?? 0);
        setAuthForm(saved.authForm ?? emptyAuthForm);
        setCurrentUser(saved.currentUser ?? null);
        setActiveTab(saved.activeTab ?? 'market');
        setMode(saved.mode ?? 'Customer');
        setSelectedCategory(saved.selectedCategory ?? 'all');
        setSearchTerm(saved.searchTerm ?? '');
        setServiceRadius(saved.serviceRadius ?? 12);
        setInstantBooking(saved.instantBooking ?? true);
      } catch {}

      if (!cancelled) {
        setHydrated(true);
      }
    }

    hydrateState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const market = marketplaces[activeCountryCode] ?? buildMarketState(activeCountryCode);

    setJobs(market.jobs);
    setProviders(market.providers);
    setOffers(market.offers);
    setMessages(market.messages);
    setThreads(market.threads);
    setAlerts(market.alerts);
    setSelectedCategory('all');
    setSearchTerm('');
    setSelectedJobId(market.jobs[0]?.id ?? null);
    setSelectedMessageId(market.messages[0]?.id ?? null);
    setCheckoutOfferId(null);
    setSelectedPaymentMethod(activeCountry.paymentMethods[0].id);
    setLoadedMarketCode(activeCountryCode);
  }, [activeCountry, activeCountryCode, marketplaces]);

  useEffect(() => {
    if (!hydrated || loadedMarketCode !== activeCountryCode) {
      return;
    }

    setMarketplaces((current) => ({
      ...current,
      [activeCountryCode]: {
        jobs,
        providers,
        offers,
        messages,
        threads,
        alerts,
      },
    }));
  }, [activeCountryCode, alerts, hydrated, jobs, loadedMarketCode, messages, offers, providers, threads]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveStoredState(
      JSON.stringify({
        authStage,
        authMode,
        onboardingIndex,
        authForm,
        currentUser,
        activeTab,
        mode,
        selectedCategory,
        searchTerm,
        serviceRadius,
        instantBooking,
        marketplaces,
      })
    );
  }, [
    activeTab,
    authForm,
    authMode,
    authStage,
    currentUser,
    hydrated,
    instantBooking,
    marketplaces,
    mode,
    onboardingIndex,
    searchTerm,
    selectedCategory,
    serviceRadius,
  ]);

  function addAlert(title, body, status = 'New') {
    setAlerts((current) => [{ id: makeId(), title, body, status }, ...current]);
  }

  function updateJobDraft(field, value) {
    setJobDraft((current) => ({ ...current, [field]: value }));
  }

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function updateMode(nextMode) {
    setMode(nextMode);
    setCurrentUser((current) => (current ? { ...current, accountType: nextMode } : current));
  }

  function updateCountry(countryCode) {
    const nextCountry = getCountryOption(countryCode);

    setAuthForm((current) => ({
      ...current,
      countryCode,
      currency:
        current.currency === getCountryOption(current.countryCode).currency || !current.currency
          ? nextCountry.currency
          : current.currency,
    }));
  }

  function updateProfileCountry(countryCode) {
    const nextCountry = getCountryOption(countryCode);

    setCurrentUser((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        countryCode,
        countryLabel: nextCountry.label,
        locale: nextCountry.locale,
        currency: current.currency === getCountryOption(current.countryCode).currency ? nextCountry.currency : current.currency,
      };
    });
  }

  function updateProfileCurrency(currency) {
    setCurrentUser((current) => (current ? { ...current, currency } : current));
  }

  function openAuth(nextMode) {
    setAuthMode(nextMode);
    setAuthStage('auth');
  }

  function advanceOnboarding() {
    if (onboardingIndex < onboardingSteps.length - 1) {
      setOnboardingIndex((current) => current + 1);
      return;
    }

    openAuth('signup');
  }

  function submitAuth() {
    const name = authForm.name.trim();
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();

    if (authMode === 'signup' && !name) {
      showNotice('Add your name', 'Enter your name or business name to create the account.');
      return;
    }

    if (!email || !email.includes('@') || password.length < 6) {
      showNotice('Check your details', 'Use a valid email and a password with at least 6 characters.');
      return;
    }

    const country = getCountryOption(authForm.countryCode);

    const user = {
      name: authMode === 'signup' ? name : email.split('@')[0],
      email,
      accountType: authForm.accountType,
      countryCode: country.code,
      countryLabel: country.label,
      currency: authForm.currency,
      locale: country.locale,
    };

    setCurrentUser(user);
    updateMode(user.accountType);
    setActiveTab('market');
    setAuthStage('app');
    addAlert(
      'Signed in',
      `${user.name} is active as a ${user.accountType.toLowerCase()} in ${user.countryLabel} with ${user.currency} pricing.`,
      'Account'
    );
  }

  function useDemoAccount(accountType = 'Customer') {
    const country = getCountryOption(authForm.countryCode);
    const user = {
      name: accountType === 'Customer' ? 'Aoife Kelly' : 'Emerald HomeCare',
      email: accountType === 'Customer' ? 'aoife@openwork.app' : 'hello@emeraldhomecare.app',
      accountType,
      countryCode: country.code,
      countryLabel: country.label,
      currency: authForm.currency,
      locale: country.locale,
    };

    setCurrentUser(user);
    updateMode(accountType);
    setActiveTab('market');
    setAuthStage('app');
    addAlert(
      'Demo session started',
      `${user.name} is active as a ${accountType.toLowerCase()} in ${user.countryLabel} with ${user.currency} pricing.`,
      'Account'
    );
  }

  function signOut() {
    setCurrentUser(null);
    setAuthMode('login');
    setAuthStage('auth');
    setActiveTab('market');
  }

  function updateOfferDraft(jobId, field, value) {
    setOfferDrafts((current) => ({
      ...current,
      [jobId]: {
        ...(current[jobId] ?? emptyOfferDraft),
        [field]: value,
      },
    }));
  }

  function publishJob() {
    const title = jobDraft.title.trim();
    const category = jobDraft.category.trim();
    const location = jobDraft.location.trim();
    const budget = parseAmount(jobDraft.budget);
    const schedule = jobDraft.schedule.trim();
    const description = jobDraft.description.trim();

    if (!title || !category || !location || !budget || !schedule || !description) {
      showNotice('Add the missing details', 'Title, category, location, budget, schedule and description are required.');
      return;
    }

    const newJob = {
      id: makeId(),
      title,
      category,
      location,
      distance: activeCountry.distanceUnit === 'mi' ? '<1 mi' : '<1 km',
      budget: Math.round(convertAmount(budget, pricingConfig.currency, activeCountry.currency)),
      schedule,
      description,
      customer: currentUser?.name ?? 'Client Account',
      status: 'Open',
      urgent: false,
      createdAt: 'Just now',
      acceptedOfferId: null,
    };
    const id = categoryId(category);

    setJobs((current) => [newJob, ...current]);
    setSelectedCategory(id);
    setSelectedJobId(newJob.id);
    setJobDraft(emptyJobDraft);
    addAlert('Job published', `${title} is live for verified providers in ${location}.`, 'Live');
    setActiveTab('market');
  }

  function sendOffer(job) {
    const draft = offerDrafts[job.id] ?? emptyOfferDraft;
    const amount = parseAmount(draft.amount);
    const eta = draft.eta.trim();
    const note = draft.note.trim();

    if (!amount || !eta || !note) {
      showNotice('Complete the offer', 'Add your price, arrival time and a short note before sending.');
      return;
    }

    const provider = providers[0];
    const offer = {
      id: makeId(),
      jobId: job.id,
        providerId: provider.id,
        amount: Math.round(convertAmount(amount, pricingConfig.currency, activeCountry.currency)),
        eta,
        note,
        status: 'Pending',
        paymentStatus: 'Not paid',
        paymentMethod: null,
        createdAt: 'Just now',
      };
    const conversationId = makeId();

    setOffers((current) => [offer, ...current]);
    setMessages((current) => [
      {
        id: conversationId,
        participant: provider.name,
        jobId: job.id,
        offerId: offer.id,
        preview: note,
        time: 'Now',
        unread: 0,
      },
      ...current,
    ]);
    setThreads((current) => ({
      ...current,
      [conversationId]: [
        {
          id: makeId(),
          from: 'provider',
          text: `${formatPrice(amount)} offer: ${note}`,
        },
      ],
    }));
    setOfferDrafts((current) => ({ ...current, [job.id]: emptyOfferDraft }));
    setSelectedMessageId(conversationId);
    addAlert('Offer sent', `${provider.name} sent an offer for ${job.title}.`, 'Pending');
    setActiveTab('offers');
  }

  function requestProvider(provider) {
    const job = selectedJob;
    const existing = messages.find(
      (message) => !message.offerId && message.participant === provider.name && message.jobId === job?.id
    );
    const text = job
      ? `Hi ${provider.name}, are you available for "${job.title}" in ${job.location}?`
      : `Hi ${provider.name}, I would like to discuss a local service booking.`;

    if (existing) {
      setSelectedMessageId(existing.id);
      setThreads((current) => ({
        ...current,
        [existing.id]: [...(current[existing.id] ?? []), { id: makeId(), from: 'customer', text }],
      }));
      setMessages((current) =>
        current.map((message) =>
          message.id === existing.id ? { ...message, preview: text, time: 'Now', unread: 0 } : message
        )
      );
      setActiveTab('messages');
      return;
    }

    const conversationId = makeId();
    setMessages((current) => [
      {
        id: conversationId,
        participant: provider.name,
        jobId: job?.id ?? null,
        offerId: null,
        preview: text,
        time: 'Now',
        unread: 0,
      },
      ...current,
    ]);
    setThreads((current) => ({
      ...current,
      [conversationId]: [{ id: makeId(), from: 'customer', text }],
    }));
    setSelectedMessageId(conversationId);
    addAlert('Provider contacted', `${provider.name} received your message.`, 'Sent');
    setActiveTab('messages');
  }

  function acceptOffer(offer) {
    const provider = providers.find((item) => item.id === offer.providerId);
    const job = jobs.find((item) => item.id === offer.jobId);

    setOffers((current) =>
      current.map((item) => {
        if (item.id === offer.id) {
          return { ...item, status: 'Accepted' };
        }
        if (item.jobId === offer.jobId && item.status === 'Pending') {
          return { ...item, status: 'Declined' };
        }
        return item;
      })
    );
    setJobs((current) =>
      current.map((item) =>
        item.id === offer.jobId ? { ...item, status: 'Booked', acceptedOfferId: offer.id } : item
      )
    );
    setCheckoutOfferId(offer.id);
    addAlert('Offer accepted', `${provider?.name ?? 'Provider'} is booked for ${job?.title ?? 'the job'}.`, 'Booked');
    ensureConversation(offer, 'customer', `Accepted. You are booked for ${job?.schedule ?? 'the requested time'}.`);
  }

  function declineOffer(offer) {
    const provider = providers.find((item) => item.id === offer.providerId);

    setOffers((current) =>
      current.map((item) => (item.id === offer.id ? { ...item, status: 'Declined' } : item))
    );
    addAlert('Offer declined', `${provider?.name ?? 'Provider'} was notified that the offer was declined.`, 'Closed');
    ensureConversation(offer, 'customer', 'Thanks for the offer. I will pass on this one.');
  }

  function openCheckout(offer) {
    setCheckoutOfferId(offer.id);
    setActiveTab('offers');
  }

  function confirmPayment() {
    if (!checkoutOffer) {
      return;
    }

    const method =
      activeCountry.paymentMethods.find((item) => item.id === selectedPaymentMethod) ??
      activeCountry.paymentMethods[0];

    setOffers((current) =>
      current.map((offer) =>
        offer.id === checkoutOffer.id
          ? { ...offer, paymentStatus: 'Held in escrow', paymentMethod: method.label }
          : offer
      )
    );
    addAlert('Payment secured', `${formatPrice(checkoutOffer.amount)} is held in escrow via ${method.label}.`, 'Escrow');
    ensureConversation(
      checkoutOffer,
      'system',
      `Payment of ${formatPrice(checkoutOffer.amount)} is now held in escrow.`
    );
  }

  function releasePayment(jobId) {
    const job = jobs.find((item) => item.id === jobId);

    if (!job?.acceptedOfferId) {
      return;
    }

    const offer = offers.find((item) => item.id === job.acceptedOfferId);

    setOffers((current) =>
      current.map((item) =>
        item.id === job.acceptedOfferId ? { ...item, paymentStatus: 'Released' } : item
      )
    );
    addAlert('Payment released', `${formatPrice(offer?.amount ?? 0)} was released to the provider.`, 'Paid');
    if (offer) {
      ensureConversation(offer, 'system', 'Payment has been released. Thanks for using OpenWork.');
    }
  }

  function refundPayment(offer) {
    setOffers((current) =>
      current.map((item) =>
        item.id === offer.id ? { ...item, paymentStatus: 'Refund requested' } : item
      )
    );
    addAlert('Refund requested', `A refund review was opened for ${formatPrice(offer.amount)}.`, 'Review');
    ensureConversation(offer, 'system', 'A refund review has been opened for this payment.');
  }

  function openOfferConversation(offer) {
    const existing = messages.find((message) => message.offerId === offer.id);

    if (existing) {
      openMessage(existing.id);
      setActiveTab('messages');
      return;
    }

    ensureConversation(offer, 'system', 'Conversation opened for this offer.');
  }

  function completeJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);

    setJobs((current) =>
      current.map((item) => (item.id === jobId ? { ...item, status: 'Completed' } : item))
    );
    setOffers((current) =>
      current.map((item) =>
        item.id === job?.acceptedOfferId ? { ...item, status: 'Completed', paymentStatus: 'Ready to release' } : item
      )
    );
    addAlert('Job completed', `${job?.title ?? 'The job'} is marked complete. Payment can be released.`, 'Done');
  }

  function ensureConversation(offer, from, text) {
    const provider = providers.find((item) => item.id === offer.providerId);
    const job = jobs.find((item) => item.id === offer.jobId);
    const existing = messages.find((message) => message.offerId === offer.id);

    if (existing) {
      setThreads((current) => ({
        ...current,
        [existing.id]: [...(current[existing.id] ?? []), { id: makeId(), from, text }],
      }));
      setMessages((current) =>
        current.map((message) =>
          message.id === existing.id ? { ...message, preview: text, time: 'Now', unread: 0 } : message
        )
      );
      setSelectedMessageId(existing.id);
      setActiveTab('messages');
      return;
    }

    const conversationId = makeId();
    setMessages((current) => [
      {
        id: conversationId,
        participant: provider?.name ?? 'Provider',
        jobId: offer.jobId,
        offerId: offer.id,
        preview: text,
        time: 'Now',
        unread: 0,
      },
      ...current,
    ]);
    setThreads((current) => ({
      ...current,
      [conversationId]: [
        { id: makeId(), from: 'system', text: `Conversation for ${job?.title ?? 'job'}` },
        { id: makeId(), from, text },
      ],
    }));
    setSelectedMessageId(conversationId);
    setActiveTab('messages');
  }

  function sendMessage() {
    const text = chatDraft.trim();

    if (!text || !selectedMessage) {
      return;
    }

    setThreads((current) => ({
      ...current,
      [selectedMessage.id]: [
        ...(current[selectedMessage.id] ?? []),
        { id: makeId(), from: mode === 'Customer' ? 'customer' : 'provider', text },
      ],
    }));
    setMessages((current) =>
      current.map((message) =>
        message.id === selectedMessage.id ? { ...message, preview: text, time: 'Now', unread: 0 } : message
      )
    );
    setChatDraft('');
  }

  function openMessage(id) {
    setSelectedMessageId(id);
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, unread: 0 } : message))
    );
  }

  if (authStage === 'onboarding') {
    return (
      <OnboardingScreen
        activeIndex={onboardingIndex}
        onBack={() => setOnboardingIndex((current) => Math.max(0, current - 1))}
        onCreateAccount={() => openAuth('signup')}
        onNext={advanceOnboarding}
        onSignIn={() => openAuth('login')}
        onSkip={() => useDemoAccount('Customer')}
        steps={onboardingSteps}
      />
    );
  }

  if (authStage === 'auth') {
    return (
      <AuthScreen
        authForm={authForm}
        authMode={authMode}
        onBack={() => setAuthStage('onboarding')}
        onDemoCustomer={() => useDemoAccount('Customer')}
        onDemoProvider={() => useDemoAccount('Provider')}
        onSubmit={submitAuth}
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        setAuthMode={setAuthMode}
        updateCountry={updateCountry}
        updateAuthForm={updateAuthForm}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.surface} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.appShell}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>OpenWork</Text>
            <Text style={styles.location}>{`${currentUser?.countryLabel ?? 'Global'} local services - ${pricingConfig.currency}`}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.modeSwitch, mode === 'Provider' && styles.modeSwitchActive]}
              onPress={() => updateMode(mode === 'Customer' ? 'Provider' : 'Customer')}
            >
              <Text style={[styles.modeSwitchText, mode === 'Provider' && styles.modeSwitchTextActive]}>
                {mode}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          {activeTab === 'market' && (
            <MarketScreen
              categories={categories}
              compact={compact}
              jobs={filteredJobs}
              mode={mode}
              offers={offers}
              offerDrafts={offerDrafts}
              providers={providers}
              requestProvider={requestProvider}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedJob={selectedJob}
              setActiveTab={setActiveTab}
              setSearchTerm={setSearchTerm}
              setSelectedCategory={setSelectedCategory}
              setSelectedJobId={setSelectedJobId}
              sendOffer={sendOffer}
              stats={stats}
              formatMoney={formatPrice}
              marketLabel={currentUser?.countryLabel ?? activeCountry.label}
              updateOfferDraft={updateOfferDraft}
            />
          )}
          {activeTab === 'post' && (
            <PostScreen
              countryLabel={currentUser?.countryLabel ?? activeCountry.label}
              currencyCode={pricingConfig.currency}
              jobDraft={jobDraft}
              locationHint={activeCountry.cityHint}
              publishJob={publishJob}
              updateJobDraft={updateJobDraft}
            />
          )}
          {activeTab === 'offers' && (
            <OffersScreen
              acceptOffer={acceptOffer}
              checkoutOffer={checkoutOffer}
              confirmPayment={confirmPayment}
              declineOffer={declineOffer}
              openCheckout={openCheckout}
              jobs={jobs}
              offers={offers}
              openOfferConversation={openOfferConversation}
              paymentMethods={activeCountry.paymentMethods}
              providers={providers}
              refundPayment={refundPayment}
              selectedPaymentMethod={selectedPaymentMethod}
              setActiveTab={setActiveTab}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              formatMoney={formatPrice}
            />
          )}
          {activeTab === 'messages' && (
            <MessagesScreen
              chatDraft={chatDraft}
              acceptOffer={acceptOffer}
              declineOffer={declineOffer}
              jobs={jobs}
              openCheckout={openCheckout}
              offers={offers}
              messages={messages}
              openMessage={openMessage}
              selectedMessage={selectedMessage}
              selectedThread={selectedThread}
              sendMessage={sendMessage}
              setChatDraft={setChatDraft}
              formatMoney={formatPrice}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              alerts={alerts}
              completeJob={completeJob}
              currentUser={currentUser}
              instantBooking={instantBooking}
              jobs={jobs}
              mode={mode}
              offers={offers}
              releasePayment={releasePayment}
              serviceRadius={serviceRadius}
              signOut={signOut}
              countryOptions={countryOptions}
              currencyOptions={currencyOptions}
              setInstantBooking={setInstantBooking}
              setMode={updateMode}
              setServiceRadius={setServiceRadius}
              stats={stats}
              formatMoney={formatPrice}
              distanceUnit={activeCountry.distanceUnit}
              updateProfileCountry={updateProfileCountry}
              updateProfileCurrency={updateProfileCurrency}
            />
          )}
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <TabIcon name={tab.icon} active={active} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OnboardingScreen({
  activeIndex,
  onBack,
  onCreateAccount,
  onNext,
  onSignIn,
  onSkip,
  steps,
}) {
  const step = steps[activeIndex];
  const lastStep = activeIndex === steps.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.surface} />
      <View style={styles.authShell}>
        <View style={styles.authHeader}>
          <View>
            <Text style={styles.authBrand}>OpenWork</Text>
            <Text style={styles.authLocation}>Global local services marketplace</Text>
          </View>
          <Pressable style={styles.authGhostButton} onPress={onSignIn}>
            <Text style={styles.authGhostButtonText}>Sign in</Text>
          </Pressable>
        </View>

        <View style={styles.onboardingArt}>
          <View style={[styles.onboardingOrb, { backgroundColor: step.tone }]} />
          <View style={styles.onboardingCardLarge}>
            <Text style={styles.onboardingMetric}>{step.metric}</Text>
            <Text style={styles.onboardingMetricLabel}>Marketplace ready</Text>
          </View>
          <View style={styles.onboardingCardSmall}>
            <Text style={styles.onboardingCheck}>OK</Text>
          </View>
        </View>

        <View style={styles.authCopy}>
          <Text style={styles.authTitle}>{step.title}</Text>
          <Text style={styles.authText}>{step.body}</Text>
        </View>

        <View style={styles.onboardingDots}>
          {steps.map((item, index) => (
            <View
              key={item.title}
              style={[styles.onboardingDot, index === activeIndex && styles.onboardingDotActive]}
            />
          ))}
        </View>

        <View style={styles.authActions}>
          <Pressable style={styles.primaryActionLarge} onPress={onNext}>
            <Text style={styles.primaryActionText}>{lastStep ? 'Create account' : 'Continue'}</Text>
          </Pressable>
          <View style={styles.authActionRow}>
            <Pressable
              style={[styles.secondaryAction, activeIndex === 0 && styles.disabledAction]}
              onPress={onBack}
            >
              <Text style={styles.secondaryActionText}>Back</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={onSkip}>
              <Text style={styles.secondaryActionText}>Try demo</Text>
            </Pressable>
          </View>
          {lastStep && (
            <Pressable style={styles.authTextButton} onPress={onCreateAccount}>
              <Text style={styles.authTextButtonLabel}>Start sign up</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen({
  authForm,
  authMode,
  countryOptions,
  currencyOptions,
  onBack,
  onDemoCustomer,
  onDemoProvider,
  onSubmit,
  setAuthMode,
  updateCountry,
  updateAuthForm,
}) {
  const signingUp = authMode === 'signup';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.surface} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.authShell}
      >
        <View style={styles.authHeader}>
          <View>
            <Text style={styles.authBrand}>OpenWork</Text>
            <Text style={styles.authLocation}>Secure marketplace access</Text>
          </View>
          <Pressable style={styles.authGhostButton} onPress={onBack}>
            <Text style={styles.authGhostButtonText}>Intro</Text>
          </Pressable>
        </View>

        <View style={styles.authCopy}>
          <Text style={styles.authTitle}>{signingUp ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.authText}>
            {signingUp
              ? 'Choose your role, country and preferred currency, then enter the marketplace.'
              : 'Sign in to continue managing jobs, offers and messages.'}
          </Text>
        </View>

        <View style={styles.authSegmented}>
          {['login', 'signup'].map((item) => {
            const active = authMode === item;
            return (
              <Pressable
                key={item}
                style={[styles.authSegment, active && styles.authSegmentActive]}
                onPress={() => setAuthMode(item)}
              >
                <Text style={[styles.authSegmentText, active && styles.authSegmentTextActive]}>
                  {item === 'login' ? 'Login' : 'Sign up'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formCard}>
          {signingUp && (
            <LabeledInput
              label="Name or business"
              placeholder="Example: Aoife Kelly"
              value={authForm.name}
              onChangeText={(value) => updateAuthForm('name', value)}
            />
          )}
          <LabeledInput
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            value={authForm.email}
            onChangeText={(value) => updateAuthForm('email', value)}
          />
          <AuthPasswordInput
            value={authForm.password}
            onChangeText={(value) => updateAuthForm('password', value)}
          />
          {signingUp && (
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Account type</Text>
              <View style={styles.modeRow}>
                {['Customer', 'Provider'].map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.modeChip, authForm.accountType === item && styles.modeChipActive]}
                    onPress={() => updateAuthForm('accountType', item)}
                  >
                    <Text
                      style={[
                        styles.modeChipText,
                        authForm.accountType === item && styles.modeChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {signingUp && (
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.optionGrid}>
                {countryOptions.map((item) => (
                  <Pressable
                    key={item.code}
                    style={[styles.optionChip, authForm.countryCode === item.code && styles.optionChipActive]}
                    onPress={() => updateCountry(item.code)}
                  >
                    <Text style={[styles.optionChipText, authForm.countryCode === item.code && styles.optionChipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {signingUp && (
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Preferred currency</Text>
              <View style={styles.optionGrid}>
                {currencyOptions.map((item) => (
                  <Pressable
                    key={item.code}
                    style={[styles.optionChip, authForm.currency === item.code && styles.optionChipActive]}
                    onPress={() => updateAuthForm('currency', item.code)}
                  >
                    <Text style={[styles.optionChipText, authForm.currency === item.code && styles.optionChipTextActive]}>
                      {item.code}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.helperText}>
                Prices across the app will be shown in {authForm.currency}.
              </Text>
            </View>
          )}
          <Pressable style={styles.primaryActionLarge} onPress={onSubmit}>
            <Text style={styles.primaryActionText}>{signingUp ? 'Create account' : 'Login'}</Text>
          </Pressable>
        </View>

        <View style={styles.demoActions}>
          <Pressable style={styles.secondaryAction} onPress={onDemoCustomer}>
            <Text style={styles.secondaryActionText}>Demo customer</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={onDemoProvider}>
            <Text style={styles.secondaryActionText}>Demo provider</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthPasswordInput({ onChangeText, value }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        placeholder="At least 6 characters"
        placeholderTextColor={COLORS.muted}
        secureTextEntry
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

function TabIcon({ active, name }) {
  const color = active ? COLORS.ink : '#DCE8D4';

  if (name === 'post') {
    return (
      <View style={styles.tabIconFrame}>
        <View style={[styles.iconLineHorizontal, { backgroundColor: color }]} />
        <View style={[styles.iconLineVertical, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'offers') {
    return (
      <View style={styles.tabIconFrame}>
        <View style={[styles.iconTicket, { borderColor: color }]}>
          <View style={[styles.iconTicketDot, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === 'chat') {
    return (
      <View style={styles.tabIconFrame}>
        <View style={[styles.iconChatBubble, { borderColor: color }]}>
          <View style={[styles.iconChatLine, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === 'profile') {
    return (
      <View style={styles.tabIconFrame}>
        <View style={[styles.iconProfileHead, { borderColor: color }]} />
        <View style={[styles.iconProfileBody, { borderColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.tabIconFrame}>
      <View style={[styles.iconGridCell, { borderColor: color }]} />
      <View style={[styles.iconGridCell, { borderColor: color }]} />
      <View style={[styles.iconGridCell, { borderColor: color }]} />
      <View style={[styles.iconGridCell, { borderColor: color }]} />
    </View>
  );
}

function MarketScreen({
  categories,
  compact,
  formatMoney,
  jobs,
  marketLabel,
  mode,
  offers,
  offerDrafts,
  providers,
  requestProvider,
  searchTerm,
  selectedCategory,
  selectedJob,
  setActiveTab,
  setSearchTerm,
  setSelectedCategory,
  setSelectedJobId,
  sendOffer,
  stats,
  updateOfferDraft,
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>VERIFIED LOCAL MARKETPLACE</Text>
          <Text style={styles.heroTitle}>Book trusted help near you.</Text>
          <Text style={styles.heroText}>
            Post work, compare offers, accept a provider, message securely and track completion.
          </Text>
          <View style={styles.heroStats}>
            <MiniStat label="Open jobs" value={stats.openJobs} />
            <MiniStat label="Offers" value={stats.pendingOffers} />
            <MiniStat label="Booked" value={stats.bookedJobs} />
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search service, location or provider"
          placeholderTextColor={COLORS.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
        <Pressable style={styles.filterButton} onPress={() => setSearchTerm('')}>
          <Text style={styles.filterButtonText}>{searchTerm ? 'Clear' : 'All'}</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
        <CategoryPill
          active={selectedCategory === 'all'}
          label="All"
          onPress={() => setSelectedCategory('all')}
        />
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            active={selectedCategory === category.id}
            label={category.label}
            tone={category.tone}
            count={category.count}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{mode === 'Provider' ? 'Jobs needing offers' : 'Live marketplace'}</Text>
          <Text style={styles.sectionSubtitle}>{`${marketLabel}-ready pricing, locations and workflow`}</Text>
        </View>
        <Pressable style={styles.textAction} onPress={() => setActiveTab('post')}>
          <Text style={styles.textActionLabel}>Post job</Text>
        </Pressable>
      </View>

      {selectedJob && (
        <View style={styles.selectedPanel}>
          <View style={styles.selectedPanelTop}>
            <View style={styles.selectedPanelCopy}>
              <Text style={styles.selectedPanelLabel}>Selected job</Text>
              <Text style={styles.selectedPanelTitle}>{selectedJob.title}</Text>
              <Text style={styles.selectedPanelMeta}>
                {selectedJob.location} - {formatMoney(selectedJob.budget)}
              </Text>
            </View>
            <StatusPill status={selectedJob.status} />
          </View>
          <View style={styles.selectedPanelActions}>
            <Pressable style={styles.secondaryAction} onPress={() => setActiveTab('offers')}>
              <Text style={styles.secondaryActionText}>Review offers</Text>
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => requestProvider(providers[0])}>
              <Text style={styles.primaryActionText}>Message provider</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.stack}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              compact={compact}
              draft={offerDrafts[job.id] ?? emptyOfferDraft}
              formatMoney={formatMoney}
              job={job}
              mode={mode}
              selected={selectedJob?.id === job.id}
              offersCount={offers.filter((offer) => offer.jobId === job.id).length}
              onSelect={() => setSelectedJobId(job.id)}
              openOffers={() => {
                setSelectedJobId(job.id);
                setActiveTab('offers');
              }}
              sendOffer={() => sendOffer(job)}
              updateDraft={(field, value) => updateOfferDraft(job.id, field, value)}
            />
          ))
        ) : (
          <EmptyState
            title="No matching jobs"
            body="Try another category or clear the search to see more local work."
            action="Post a job"
            onPress={() => setActiveTab('post')}
          />
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verified providers</Text>
        <Pressable style={styles.textAction} onPress={() => setActiveTab('post')}>
          <Text style={styles.textActionLabel}>New request</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerRail}>
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            formatMoney={formatMoney}
            provider={provider}
            requestProvider={() => requestProvider(provider)}
            viewCategory={() => setSelectedCategory(categoryId(provider.category))}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

function MiniStat({ label, value }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function CategoryPill({ active, count, label, onPress, tone }) {
  return (
    <Pressable style={[styles.categoryPill, active && styles.categoryPillActive]} onPress={onPress}>
      {tone && <View style={[styles.categoryDot, { backgroundColor: tone }]} />}
      <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>{label}</Text>
      {typeof count === 'number' && <Text style={styles.categoryCount}>{count}</Text>}
    </Pressable>
  );
}

function JobCard({
  compact,
  draft,
  formatMoney,
  job,
  mode,
  offersCount,
  onSelect,
  openOffers,
  selected,
  sendOffer,
  updateDraft,
}) {
  const booked = job.status !== 'Open';

  return (
    <View style={[styles.jobCard, selected && styles.jobCardSelected]}>
      <View style={styles.jobTop}>
        <View style={styles.jobTitleWrap}>
          <View style={styles.inlineMeta}>
            <Text style={styles.jobCategory}>{job.category}</Text>
            <StatusPill status={job.status} />
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobDescription}>{job.description}</Text>
        </View>
        {job.urgent && (
          <View style={styles.urgentPill}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>

      <View style={styles.detailGrid}>
        <Detail label="Budget" value={formatMoney(job.budget)} />
        <Detail label="When" value={job.schedule} />
        <Detail label="Where" value={job.location} />
        <Detail label="Distance" value={job.distance} />
      </View>

      <View style={styles.jobActions}>
        <Pressable style={styles.secondaryAction} onPress={onSelect}>
          <Text style={styles.secondaryActionText}>{selected ? 'Selected' : 'View job'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={openOffers}>
          <Text style={styles.secondaryActionText}>{offersCount > 0 ? `${offersCount} offers` : 'Offers'}</Text>
        </Pressable>
      </View>

      {mode === 'Provider' && !booked && (
        <View style={styles.offerComposer}>
          <Text style={styles.offerComposerTitle}>Send an offer</Text>
          <View style={[styles.offerRow, compact && styles.offerRowCompact]}>
            <TextInput
              placeholder="Price"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={draft.amount}
              onChangeText={(value) => updateDraft('amount', value)}
              style={styles.offerInputSmall}
            />
            <TextInput
              placeholder="Arrival time"
              placeholderTextColor={COLORS.muted}
              value={draft.eta}
              onChangeText={(value) => updateDraft('eta', value)}
              style={styles.offerInput}
            />
          </View>
          <TextInput
            placeholder="Short note for the customer"
            placeholderTextColor={COLORS.muted}
            value={draft.note}
            onChangeText={(value) => updateDraft('note', value)}
            style={styles.offerNote}
          />
          <Pressable style={styles.primaryAction} onPress={sendOffer}>
            <Text style={styles.primaryActionText}>Send offer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  return (
    <View style={[styles.statusPill, { borderColor: statusTone(status) }]}>
      <Text style={[styles.statusPillText, { color: statusTone(status) }]}>{status}</Text>
    </View>
  );
}

function ProviderCard({ formatMoney, provider, requestProvider, viewCategory }) {
  return (
    <View style={styles.providerCard}>
      <View style={[styles.providerAvatar, { backgroundColor: provider.tone }]}>
        <Text style={styles.providerInitials}>{provider.initials}</Text>
      </View>
      <View style={styles.providerVerifiedRow}>
        <Text style={styles.providerName}>{provider.name}</Text>
        {provider.verified && <Text style={styles.verifiedText}>Verified</Text>}
      </View>
      <Text style={styles.providerSkill}>{provider.category} in {provider.location}</Text>
      <View style={styles.providerStats}>
        <Text style={styles.providerStat}>{provider.rating} rating</Text>
        <Text style={styles.providerStat}>{provider.completed} jobs</Text>
      </View>
      <Text style={styles.providerResponse}>From {formatMoney(provider.hourly)}/hr. Replies in {provider.response}</Text>
      <View style={styles.providerActions}>
        <Pressable style={styles.providerAction} onPress={viewCategory}>
          <Text style={styles.providerActionText}>View jobs</Text>
        </Pressable>
        <Pressable style={styles.providerPrimaryAction} onPress={requestProvider}>
          <Text style={styles.providerPrimaryActionText}>Message</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PostScreen({ countryLabel, currencyCode, jobDraft, locationHint, publishJob, updateJobDraft }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Post a job</Text>
      <Text style={styles.screenText}>
        {`Create a clear request so verified providers in ${countryLabel} can price it in ${currencyCode} and send offers.`}
      </Text>

      <View style={styles.formCard}>
        <LabeledInput
          label="Job title"
          placeholder="Example: Paint a bedroom"
          value={jobDraft.title}
          onChangeText={(value) => updateJobDraft('title', value)}
        />
        <LabeledInput
          label="Category"
          placeholder="Cleaning, plumbing, electrical..."
          value={jobDraft.category}
          onChangeText={(value) => updateJobDraft('category', value)}
        />
        <LabeledInput
          label="Location"
          placeholder={locationHint}
          value={jobDraft.location}
          onChangeText={(value) => updateJobDraft('location', value)}
        />
        <LabeledInput
          label="Budget"
          placeholder="Example: 150"
          keyboardType="numeric"
          value={jobDraft.budget}
          onChangeText={(value) => updateJobDraft('budget', value)}
        />
        <LabeledInput
          label="Schedule"
          placeholder="Today, tomorrow morning, this weekend..."
          value={jobDraft.schedule}
          onChangeText={(value) => updateJobDraft('schedule', value)}
        />
        <LabeledInput
          label="Job details"
          placeholder="Describe access, materials, parking, photos needed and any must-haves."
          multiline
          value={jobDraft.description}
          onChangeText={(value) => updateJobDraft('description', value)}
        />
        <Pressable style={styles.primaryActionLarge} onPress={publishJob}>
          <Text style={styles.primaryActionText}>Publish job</Text>
        </Pressable>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Marketplace protections</Text>
        <Text style={styles.trustText}>
          Provider verification, offer history, secure chat, booking status and completion records are built into this flow.
        </Text>
      </View>
    </ScrollView>
  );
}

function LabeledInput({ keyboardType, label, multiline, onChangeText, placeholder, value }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
      />
    </View>
  );
}

function OffersScreen({
  acceptOffer,
  checkoutOffer,
  confirmPayment,
  declineOffer,
  formatMoney,
  jobs,
  openCheckout,
  offers,
  openOfferConversation,
  paymentMethods,
  providers,
  refundPayment,
  selectedPaymentMethod,
  setActiveTab,
  setSelectedPaymentMethod,
}) {
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.status === b.status) {
      return b.id - a.id;
    }
    return a.status === 'Pending' ? -1 : 1;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Offers</Text>
      <Text style={styles.screenText}>Review pricing, arrival time and provider notes before booking.</Text>

      {checkoutOffer && (
          <PaymentPanel
          confirmPayment={confirmPayment}
          formatMoney={formatMoney}
          job={jobs.find((item) => item.id === checkoutOffer.jobId)}
          offer={checkoutOffer}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
        />
      )}

      <View style={styles.stack}>
        {sortedOffers.length > 0 ? (
          sortedOffers.map((offer) => {
            const job = jobs.find((item) => item.id === offer.jobId);
            const provider = providers.find((item) => item.id === offer.providerId);
            const pending = offer.status === 'Pending';

            return (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View>
                    <Text style={styles.offerAmount}>{formatMoney(offer.amount)}</Text>
                    <Text style={styles.offerProvider}>{provider?.name ?? 'Provider'}</Text>
                  </View>
                  <StatusPill status={offer.status} />
                </View>
                <Text style={styles.offerJob}>{job?.title ?? 'Job'}</Text>
                <Text style={styles.offerNoteText}>{offer.note}</Text>
                <View style={styles.offerMetaRow}>
                  <Text style={styles.offerMeta}>Arrival: {offer.eta}</Text>
                  <Text style={styles.offerMeta}>{offer.createdAt}</Text>
                </View>
                <View style={styles.paymentStatusRow}>
                  <Text style={styles.paymentStatusLabel}>Payment</Text>
                  <Text style={styles.paymentStatusValue}>{offer.paymentStatus}</Text>
                </View>
                {pending ? (
                  <View style={styles.offerActions}>
                    <Pressable style={styles.messageOfferAction} onPress={() => openOfferConversation(offer)}>
                      <Text style={styles.messageOfferActionText}>Message</Text>
                    </Pressable>
                    <Pressable style={styles.declineAction} onPress={() => declineOffer(offer)}>
                      <Text style={styles.declineActionText}>Decline</Text>
                    </Pressable>
                    <Pressable style={styles.acceptAction} onPress={() => acceptOffer(offer)}>
                      <Text style={styles.acceptActionText}>Accept offer</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.secondaryWideAction} onPress={() => openOfferConversation(offer)}>
                    <Text style={styles.secondaryWideActionText}>Open conversation</Text>
                  </Pressable>
                )}
                {offer.status === 'Accepted' && offer.paymentStatus === 'Not paid' && (
                  <Pressable style={styles.primaryActionLarge} onPress={() => openCheckout(offer)}>
                    <Text style={styles.primaryActionText}>Pay into escrow</Text>
                  </Pressable>
                )}
                {offer.paymentStatus === 'Held in escrow' && (
                  <Pressable style={styles.secondaryWideAction} onPress={() => refundPayment(offer)}>
                    <Text style={styles.secondaryWideActionText}>Request refund review</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        ) : (
          <EmptyState
            title="No offers yet"
            body="Switch to Provider mode in the header and send an offer from the marketplace."
            action="Browse jobs"
            onPress={() => setActiveTab('market')}
          />
        )}
      </View>
    </ScrollView>
  );
}

function PaymentPanel({
  confirmPayment,
  formatMoney,
  job,
  offer,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}) {
  const paid = offer.paymentStatus !== 'Not paid';

  return (
    <View style={styles.paymentPanel}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.paymentEyebrow}>Secure checkout</Text>
          <Text style={styles.paymentTitle}>{formatMoney(offer.amount)}</Text>
        </View>
        <StatusPill status={offer.paymentStatus} />
      </View>
      <Text style={styles.paymentText}>
        {job?.title ?? 'Selected job'} payment is held until the customer marks the work complete.
      </Text>
      <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => {
          const active = selectedPaymentMethod === method.id;

          return (
            <Pressable
              key={method.id}
              style={[styles.paymentMethod, active && styles.paymentMethodActive]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <Text style={[styles.paymentMethodLabel, active && styles.paymentMethodLabelActive]}>
                {method.label}
              </Text>
              <Text style={styles.paymentMethodMeta}>{method.meta}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.primaryActionLarge, paid && styles.disabledAction]}
        onPress={confirmPayment}
      >
        <Text style={styles.primaryActionText}>{paid ? 'Payment secured' : 'Confirm payment'}</Text>
      </Pressable>
    </View>
  );
}

function MessagesScreen({
  acceptOffer,
  chatDraft,
  declineOffer,
  formatMoney,
  jobs,
  messages,
  openMessage,
  openCheckout,
  offers,
  selectedMessage,
  selectedThread,
  sendMessage,
  setChatDraft,
}) {
  const selectedJob = jobs.find((job) => job.id === selectedMessage?.jobId);
  const selectedOffer = offers.find((offer) => offer.id === selectedMessage?.offerId);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Messages</Text>
      <Text style={styles.screenText}>Keep every offer, booking and job update attached to the right conversation.</Text>

      <View style={styles.stack}>
        {messages.map((message) => (
          <Pressable
            key={message.id}
            style={[styles.messageCard, selectedMessage?.id === message.id && styles.messageCardActive]}
            onPress={() => openMessage(message.id)}
          >
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{message.participant.slice(0, 1)}</Text>
            </View>
            <View style={styles.messageBody}>
              <View style={styles.messageTop}>
                <Text style={styles.messageName}>{message.participant}</Text>
                <Text style={styles.messageTime}>{message.time}</Text>
              </View>
              <Text style={styles.messagePreview}>{message.preview}</Text>
            </View>
            {message.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{message.unread}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.chatPanel}>
        <Text style={styles.chatTitle}>{selectedMessage?.participant ?? 'Conversation'}</Text>
        <Text style={styles.chatSubtitle}>{selectedJob?.title ?? 'Select a conversation'}</Text>
        {selectedOffer && (
            <View style={styles.chatOfferPanel}>
              <View>
                <Text style={styles.chatOfferAmount}>{formatMoney(selectedOffer.amount)}</Text>
                <Text style={styles.chatOfferMeta}>Arrival: {selectedOffer.eta}</Text>
                <Text style={styles.chatOfferMeta}>Payment: {selectedOffer.paymentStatus}</Text>
              </View>
              <StatusPill status={selectedOffer.status} />
            </View>
          )}
        {selectedOffer?.status === 'Pending' && (
          <View style={styles.chatOfferActions}>
            <Pressable style={styles.declineAction} onPress={() => declineOffer(selectedOffer)}>
              <Text style={styles.declineActionText}>Decline</Text>
            </Pressable>
            <Pressable style={styles.acceptAction} onPress={() => acceptOffer(selectedOffer)}>
              <Text style={styles.acceptActionText}>Accept</Text>
            </Pressable>
          </View>
        )}
        {selectedOffer?.status === 'Accepted' && selectedOffer.paymentStatus === 'Not paid' && (
          <Pressable style={styles.primaryActionLarge} onPress={() => openCheckout(selectedOffer)}>
            <Text style={styles.primaryActionText}>Pay into escrow</Text>
          </Pressable>
        )}
        {selectedThread.map((message) => {
          const outgoing = message.from === 'customer';
          const system = message.from === 'system';

          return (
            <View
              key={message.id}
              style={[
                styles.bubble,
                outgoing && styles.bubbleOutgoing,
                system && styles.bubbleSystem,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  outgoing && styles.bubbleOutgoingText,
                  system && styles.bubbleSystemText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          );
        })}
        <View style={styles.replyRow}>
          <TextInput
            placeholder="Write a message"
            placeholderTextColor={COLORS.muted}
            value={chatDraft}
            onChangeText={setChatDraft}
            onSubmitEditing={sendMessage}
            style={styles.replyInput}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen({
  alerts,
  completeJob,
  countryOptions,
  currentUser,
  currencyOptions,
  distanceUnit,
  formatMoney,
  instantBooking,
  jobs,
  mode,
  offers,
  releasePayment,
  serviceRadius,
  signOut,
  setInstantBooking,
  setMode,
  setServiceRadius,
  stats,
  updateProfileCountry,
  updateProfileCurrency,
}) {
  const bookedJobs = jobs.filter((job) => job.status === 'Booked');
  const completedJobs = jobs.filter((job) => job.status === 'Completed');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileTop}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>OW</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{currentUser?.name ?? 'OpenWork'}</Text>
          <Text style={styles.profileMeta}>
            {currentUser
              ? `${currentUser.email} - ${currentUser.countryLabel} - ${currentUser.currency}`
              : 'Verified customer and provider account'}
          </Text>
        </View>
      </View>

      <View style={styles.modeCard}>
        <Text style={styles.preferenceTitle}>Account controls</Text>
        <View style={styles.modeRow}>
          {['Customer', 'Provider'].map((item) => (
            <Pressable
              key={item}
              style={[styles.modeChip, mode === item && styles.modeChipActive]}
              onPress={() => setMode(item)}
            >
              <Text style={[styles.modeChipText, mode === item && styles.modeChipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Marketplace country</Text>
          <View style={styles.optionGrid}>
            {countryOptions.map((item) => (
              <Pressable
                key={item.code}
                style={[styles.optionChip, currentUser?.countryCode === item.code && styles.optionChipActive]}
                onPress={() => updateProfileCountry(item.code)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    currentUser?.countryCode === item.code && styles.optionChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Preferred currency</Text>
          <View style={styles.optionGrid}>
            {currencyOptions.map((item) => (
              <Pressable
                key={item.code}
                style={[styles.optionChip, currentUser?.currency === item.code && styles.optionChipActive]}
                onPress={() => updateProfileCurrency(item.code)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    currentUser?.currency === item.code && styles.optionChipTextActive,
                  ]}
                >
                  {item.code}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helperText}>
            Switching country loads that market's local demo jobs, providers and payment options.
          </Text>
        </View>
        <View style={styles.radiusRow}>
          <Text style={styles.preferenceLabel}>Service radius</Text>
          <View style={styles.radiusControls}>
            <Pressable
              style={styles.radiusButton}
              onPress={() => setServiceRadius((current) => Math.max(3, current - 1))}
            >
              <Text style={styles.radiusButtonText}>-</Text>
            </Pressable>
            <Text style={styles.radiusValue}>{serviceRadius} {distanceUnit}</Text>
            <Pressable
              style={styles.radiusButton}
              onPress={() => setServiceRadius((current) => Math.min(50, current + 1))}
            >
              <Text style={styles.radiusButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
        <PreferenceRow
          active={instantBooking}
          title="Instant booking eligible"
          onPress={() => setInstantBooking((current) => !current)}
        />
        <Pressable style={styles.signOutAction} onPress={signOut}>
          <Text style={styles.signOutActionText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.scoreGrid}>
        <MetricCard label="Open jobs" value={stats.openJobs} />
        <MetricCard label="Pending offers" value={stats.pendingOffers} />
        <MetricCard label="Booked" value={stats.bookedJobs} />
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Booked jobs</Text>
        {bookedJobs.length > 0 ? (
          bookedJobs.map((job) => (
            <View key={job.id} style={styles.bookedRow}>
              <View style={styles.bookedCopy}>
                <Text style={styles.setupTitle}>{job.title}</Text>
                <Text style={styles.setupMeta}>{job.location} - {job.schedule}</Text>
              </View>
              <Pressable style={styles.completeAction} onPress={() => completeJob(job.id)}>
                <Text style={styles.completeActionText}>Complete</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyInline}>Accepted offers will appear here.</Text>
        )}
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Payment release</Text>
        {completedJobs.length > 0 ? (
          completedJobs.map((job) => {
            const offer = offers.find((item) => item.id === job.acceptedOfferId);
            const releasable = offer?.paymentStatus === 'Ready to release';

            return (
              <View key={job.id} style={styles.bookedRow}>
                <View style={styles.bookedCopy}>
                  <Text style={styles.setupTitle}>{job.title}</Text>
                  <Text style={styles.setupMeta}>
                    {offer ? `${formatMoney(offer.amount)} - ${offer.paymentStatus}` : 'No payment linked'}
                  </Text>
                </View>
                <Pressable
                  style={[styles.completeAction, !releasable && styles.disabledAction]}
                  onPress={() => releasable && releasePayment(job.id)}
                >
                  <Text style={styles.completeActionText}>
                    {offer?.paymentStatus === 'Released' ? 'Released' : 'Release'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyInline}>Completed jobs with escrow payments will appear here.</Text>
        )}
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Activity</Text>
        {alerts.slice(0, 5).map((alert) => (
          <View key={alert.id} style={styles.alertRow}>
            <View style={styles.alertMark}>
              <Text style={styles.alertMarkText}>{alert.status.slice(0, 1)}</Text>
            </View>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertText}>{alert.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function PreferenceRow({ active, onPress, title }) {
  return (
    <Pressable style={styles.preferenceRow} onPress={onPress}>
      <Text style={styles.preferenceLabel}>{title}</Text>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
      </View>
    </Pressable>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ action, body, onPress, title }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{body}</Text>
      <Pressable style={styles.emptyAction} onPress={onPress}>
        <Text style={styles.emptyActionText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  appShell: {
    flex: 1,
  },
  authShell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 18,
    backgroundColor: COLORS.surface,
  },
  authHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  authBrand: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  authLocation: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  authGhostButton: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  authGhostButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  onboardingArt: {
    minHeight: 238,
    borderRadius: 8,
    padding: 18,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.ink,
    overflow: 'hidden',
  },
  onboardingOrb: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -38,
    top: -26,
  },
  onboardingCardLarge: {
    width: '72%',
    minHeight: 112,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  onboardingCardSmall: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 74,
    height: 74,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  onboardingCheck: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  onboardingMetric: {
    color: COLORS.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  onboardingMetricLabel: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  authCopy: {
    gap: 8,
  },
  authTitle: {
    color: COLORS.ink,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  authText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  onboardingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  onboardingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.line,
  },
  onboardingDotActive: {
    width: 28,
    backgroundColor: COLORS.ink,
  },
  authActions: {
    marginTop: 'auto',
    gap: 10,
  },
  authActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  authTextButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTextButtonLabel: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  authSegmented: {
    height: 52,
    padding: 4,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  authSegment: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  authSegmentText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  authSegmentTextActive: {
    color: COLORS.ink,
  },
  demoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  header: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  location: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeSwitch: {
    minHeight: 42,
    minWidth: 104,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  modeSwitchActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  modeSwitchText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  modeSwitchTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 112,
    gap: 18,
  },
  hero: {
    borderRadius: 8,
    padding: 18,
    backgroundColor: COLORS.ink,
  },
  heroCopy: {
    gap: 10,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroText: {
    color: '#DCE8D4',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  heroStats: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  miniStat: {
    flex: 1,
    minHeight: 70,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#26351F',
  },
  miniStatValue: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: '900',
  },
  miniStatLabel: {
    marginTop: 2,
    color: '#DCE8D4',
    fontSize: 11,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: COLORS.ink,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 14,
    fontWeight: '700',
  },
  filterButton: {
    minWidth: 62,
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  filterButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  categoryRail: {
    gap: 9,
    paddingRight: 20,
  },
  categoryPill: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  categoryPillActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F9FFE8',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryPillText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  categoryPillTextActive: {
    color: COLORS.primaryDark,
  },
  categoryCount: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLink: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  textAction: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  textActionLabel: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  stack: {
    gap: 12,
  },
  selectedPanel: {
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: '#F9FFE8',
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  selectedPanelTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedPanelCopy: {
    flex: 1,
  },
  selectedPanelLabel: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  selectedPanelTitle: {
    marginTop: 4,
    color: COLORS.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  selectedPanelMeta: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedPanelActions: {
    flexDirection: 'row',
    gap: 10,
  },
  jobCard: {
    borderRadius: 8,
    padding: 15,
    gap: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  jobCardSelected: {
    borderColor: COLORS.primaryDark,
  },
  jobTop: {
    flexDirection: 'row',
    gap: 12,
  },
  jobTitleWrap: {
    flex: 1,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  jobCategory: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  statusPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: COLORS.white,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  jobTitle: {
    marginTop: 7,
    color: COLORS.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  jobDescription: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  urgentPill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFECE9',
  },
  urgentText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '900',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailItem: {
    width: '47%',
    minHeight: 58,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  detailValue: {
    marginTop: 3,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  secondaryActionText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  disabledAction: {
    opacity: 0.45,
  },
  offerComposer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 14,
    gap: 10,
  },
  offerComposerTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  offerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  offerRowCompact: {
    flexDirection: 'column',
  },
  offerInputSmall: {
    width: 92,
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 13,
    fontWeight: '700',
  },
  offerInput: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 13,
    fontWeight: '700',
  },
  offerNote: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  primaryActionLarge: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  primaryActionText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  providerRail: {
    gap: 12,
    paddingRight: 20,
  },
  providerCard: {
    width: 210,
    minHeight: 196,
    borderRadius: 8,
    padding: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInitials: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  providerVerifiedRow: {
    marginTop: 12,
    gap: 6,
  },
  providerName: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  verifiedText: {
    alignSelf: 'flex-start',
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '900',
  },
  providerSkill: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  providerStats: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  providerStat: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  providerResponse: {
    marginTop: 12,
    color: COLORS.primaryDark,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
  },
  providerActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  providerAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  providerActionText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  providerPrimaryAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  providerPrimaryActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  screenTitle: {
    color: COLORS.ink,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: 0,
  },
  screenText: {
    marginTop: -10,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 8,
    padding: 16,
    gap: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  fieldGroup: {
    gap: 7,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  optionChipTextActive: {
    color: COLORS.ink,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  inputLabel: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 14,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  trustCard: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#EFFAF4',
    borderWidth: 1,
    borderColor: '#CDEEDF',
  },
  trustTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  trustText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  offerCard: {
    borderRadius: 8,
    padding: 15,
    gap: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerAmount: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  offerProvider: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  offerJob: {
    color: COLORS.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  offerNoteText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  offerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerMeta: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentStatusRow: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  paymentStatusLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentStatusValue: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  messageOfferAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#C9DCFF',
  },
  messageOfferActionText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  declineAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  declineActionText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  acceptAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  acceptActionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryWideAction: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  secondaryWideActionText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  paymentPanel: {
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.ink,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  paymentTitle: {
    marginTop: 4,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  paymentText: {
    color: '#DCE8D4',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  paymentMethods: {
    gap: 8,
  },
  paymentMethod: {
    minHeight: 58,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#26351F',
    borderWidth: 1,
    borderColor: '#3D4D35',
  },
  paymentMethodActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#314320',
  },
  paymentMethodLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  paymentMethodLabelActive: {
    color: COLORS.primary,
  },
  paymentMethodMeta: {
    marginTop: 3,
    color: '#DCE8D4',
    fontSize: 12,
    fontWeight: '700',
  },
  messageCard: {
    minHeight: 76,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  messageCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F9FFE8',
  },
  messageAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  messageAvatarText: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  messageBody: {
    flex: 1,
  },
  messageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  messageName: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  messageTime: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  messagePreview: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  chatPanel: {
    borderRadius: 8,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chatTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  chatSubtitle: {
    marginTop: -5,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  chatOfferPanel: {
    minHeight: 66,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  chatOfferAmount: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  chatOfferMeta: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  chatOfferActions: {
    flexDirection: 'row',
    gap: 10,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  bubbleOutgoing: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  bubbleSystem: {
    alignSelf: 'center',
    backgroundColor: '#EEF5FF',
  },
  bubbleText: {
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  bubbleOutgoingText: {
    color: COLORS.ink,
    fontWeight: '800',
  },
  bubbleSystemText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  replyRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 10,
  },
  replyInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 14,
    fontWeight: '700',
  },
  sendButton: {
    minWidth: 68,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  profileTop: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.ink,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  profileAvatarText: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '900',
  },
  profileMeta: {
    marginTop: 5,
    color: '#DCE8D4',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  modeCard: {
    borderRadius: 8,
    padding: 16,
    gap: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  modeChipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  modeChipTextActive: {
    color: COLORS.ink,
  },
  radiusRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 12,
  },
  radiusControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radiusButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  radiusButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  radiusValue: {
    minWidth: 52,
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  preferenceRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  preferenceLabel: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: COLORS.line,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  metricValue: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  preferenceCard: {
    borderRadius: 8,
    padding: 16,
    gap: 2,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  preferenceTitle: {
    marginBottom: 8,
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  bookedRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  bookedCopy: {
    flex: 1,
  },
  setupTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  setupMeta: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  completeAction: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  completeActionText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  signOutAction: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFECE9',
    borderWidth: 1,
    borderColor: '#FFD0C9',
  },
  signOutActionText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: '900',
  },
  emptyInline: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  alertRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  alertMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  alertMarkText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  alertText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 8,
    padding: 18,
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  emptyTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  emptyAction: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  emptyActionText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'ios' ? 18 : 12,
    minHeight: 68,
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.ink,
  },
  tabItem: {
    flex: 1,
    height: 56,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabIconFrame: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  iconGridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 2,
  },
  iconLineHorizontal: {
    position: 'absolute',
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  iconLineVertical: {
    position: 'absolute',
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  iconTicket: {
    width: 19,
    height: 15,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTicketDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  iconChatBubble: {
    width: 20,
    height: 16,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChatLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  iconProfileHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
  },
  iconProfileBody: {
    marginTop: 2,
    width: 17,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  tabLabel: {
    color: '#DCE8D4',
    fontSize: 10,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: COLORS.ink,
  },
});
