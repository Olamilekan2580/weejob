import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
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

const initialCategories = [
  { id: 'cleaning', label: 'Cleaning', count: 28, tone: categoryPalette.Cleaning },
  { id: 'plumbing', label: 'Plumbing', count: 16, tone: categoryPalette.Plumbing },
  { id: 'electrical', label: 'Electrical', count: 12, tone: categoryPalette.Electrical },
  { id: 'handyman', label: 'Handyman', count: 21, tone: categoryPalette.Handyman },
  { id: 'gardening', label: 'Gardening', count: 18, tone: categoryPalette.Gardening },
  { id: 'moving', label: 'Moving', count: 9, tone: categoryPalette.Moving },
  { id: 'painting', label: 'Painting', count: 14, tone: categoryPalette.Painting },
  { id: 'pet-care', label: 'Pet Care', count: 7, tone: categoryPalette['Pet Care'] },
];

const initialJobs = [
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
  {
    id: 104,
    title: 'Garden tidy and hedge trim',
    category: 'Gardening',
    location: 'Blackrock, Dublin',
    distance: '6.2 km',
    budget: 180,
    schedule: 'This weekend',
    description: 'Small back garden needs mowing, hedge trimming, weeding and green waste removal.',
    customer: 'Niamh O Connor',
    status: 'Open',
    urgent: false,
    createdAt: '2h ago',
    acceptedOfferId: null,
  },
];

const initialProviders = [
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
    location: 'Dublin',
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
  {
    id: 204,
    name: 'Green Mile Gardens',
    category: 'Gardening',
    rating: '4.7',
    reviews: 88,
    completed: 133,
    response: '22 min',
    location: 'Dublin',
    verified: true,
    hourly: 42,
    initials: 'GG',
    tone: '#63D471',
  },
];

const initialOffers = [
  {
    id: 301,
    jobId: 101,
    providerId: 201,
    amount: 135,
    eta: 'Today, 15:45',
    note: 'Two-person team, eco products included, insured and available today.',
    status: 'Pending',
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
    createdAt: '20 min ago',
  },
];

const initialMessages = [
  {
    id: 401,
    participant: 'Emerald HomeCare',
    jobId: 101,
    offerId: 301,
    preview: 'We can bring all cleaning products and arrive before 4.',
    time: '8m',
    unread: 1,
  },
  {
    id: 402,
    participant: 'Liffey Plumbing Co.',
    jobId: 102,
    offerId: 302,
    preview: 'Please send a close photo of the tap if possible.',
    time: '19m',
    unread: 0,
  },
];

const initialThreads = {
  401: [
    {
      id: 501,
      from: 'provider',
      text: 'We can bring all cleaning products and arrive before 4.',
    },
    {
      id: 502,
      from: 'customer',
      text: 'That works. Please include the oven and fridge.',
    },
  ],
  402: [
    {
      id: 503,
      from: 'provider',
      text: 'Please send a close photo of the tap if possible.',
    },
  ],
};

const initialAlerts = [
  {
    id: 601,
    title: 'Offer received',
    body: 'Emerald HomeCare sent an offer for your Dublin cleaning job.',
    status: 'New',
  },
  {
    id: 602,
    title: 'Safety reminder',
    body: 'Keep payment in-app and release it only when the job is completed.',
    status: 'Trust',
  },
];

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

const tabs = [
  { id: 'market', label: 'Market', icon: 'M' },
  { id: 'post', label: 'Post', icon: '+' },
  { id: 'offers', label: 'Offers', icon: 'O' },
  { id: 'messages', label: 'Chat', icon: 'C' },
  { id: 'profile', label: 'Profile', icon: 'P' },
];

function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
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
  const [activeTab, setActiveTab] = useState('market');
  const [mode, setMode] = useState('Customer');
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState(initialJobs);
  const [providers] = useState(initialProviders);
  const [offers, setOffers] = useState(initialOffers);
  const [messages, setMessages] = useState(initialMessages);
  const [threads, setThreads] = useState(initialThreads);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [jobDraft, setJobDraft] = useState(emptyJobDraft);
  const [offerDrafts, setOfferDrafts] = useState({});
  const [selectedJobId, setSelectedJobId] = useState(initialJobs[0]?.id ?? null);
  const [selectedMessageId, setSelectedMessageId] = useState(initialMessages[0]?.id ?? null);
  const [chatDraft, setChatDraft] = useState('');
  const [serviceRadius, setServiceRadius] = useState(12);
  const [instantBooking, setInstantBooking] = useState(true);
  const { width } = useWindowDimensions();
  const compact = width < 390;

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId]
  );

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? messages[0] ?? null,
    [messages, selectedMessageId]
  );

  const selectedThread = selectedMessage ? threads[selectedMessage.id] ?? [] : [];

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

  function addAlert(title, body, status = 'New') {
    setAlerts((current) => [{ id: makeId(), title, body, status }, ...current]);
  }

  function updateJobDraft(field, value) {
    setJobDraft((current) => ({ ...current, [field]: value }));
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
      distance: 'New',
      budget,
      schedule,
      description,
      customer: 'Client Account',
      status: 'Open',
      urgent: false,
      createdAt: 'Just now',
      acceptedOfferId: null,
    };
    const id = categoryId(category);

    setJobs((current) => [newJob, ...current]);
    setCategories((current) => {
      const existing = current.find((item) => item.id === id);

      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, count: item.count + 1 } : item
        );
      }

      return [
        ...current,
        {
          id,
          label: category,
          count: 1,
          tone: categoryPalette[category] ?? COLORS.teal,
        },
      ];
    });
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
      amount,
      eta,
      note,
      status: 'Pending',
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
          text: `${formatMoney(amount)} offer: ${note}`,
        },
      ],
    }));
    setOfferDrafts((current) => ({ ...current, [job.id]: emptyOfferDraft }));
    setSelectedMessageId(conversationId);
    addAlert('Offer sent', `${provider.name} sent an offer for ${job.title}.`, 'Pending');
    setActiveTab('offers');
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

  function completeJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);

    setJobs((current) =>
      current.map((item) => (item.id === jobId ? { ...item, status: 'Completed' } : item))
    );
    setOffers((current) =>
      current.map((item) =>
        item.id === job?.acceptedOfferId ? { ...item, status: 'Completed' } : item
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.surface} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.appShell}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>WEEJOB</Text>
            <Text style={styles.location}>Ireland local services</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.modeSwitch, mode === 'Provider' && styles.modeSwitchActive]}
              onPress={() => setMode(mode === 'Customer' ? 'Provider' : 'Customer')}
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
              offerDrafts={offerDrafts}
              providers={providers}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedJob={selectedJob}
              setActiveTab={setActiveTab}
              setSearchTerm={setSearchTerm}
              setSelectedCategory={setSelectedCategory}
              setSelectedJobId={setSelectedJobId}
              sendOffer={sendOffer}
              stats={stats}
              updateOfferDraft={updateOfferDraft}
            />
          )}
          {activeTab === 'post' && (
            <PostScreen
              jobDraft={jobDraft}
              publishJob={publishJob}
              updateJobDraft={updateJobDraft}
            />
          )}
          {activeTab === 'offers' && (
            <OffersScreen
              acceptOffer={acceptOffer}
              declineOffer={declineOffer}
              jobs={jobs}
              offers={offers}
              providers={providers}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'messages' && (
            <MessagesScreen
              chatDraft={chatDraft}
              jobs={jobs}
              messages={messages}
              openMessage={openMessage}
              selectedMessage={selectedMessage}
              selectedThread={selectedThread}
              sendMessage={sendMessage}
              setChatDraft={setChatDraft}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              alerts={alerts}
              completeJob={completeJob}
              instantBooking={instantBooking}
              jobs={jobs}
              mode={mode}
              serviceRadius={serviceRadius}
              setInstantBooking={setInstantBooking}
              setMode={setMode}
              setServiceRadius={setServiceRadius}
              stats={stats}
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
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MarketScreen({
  categories,
  compact,
  jobs,
  mode,
  offerDrafts,
  providers,
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
          <Text style={styles.heroTitle}>Book trusted help across Ireland.</Text>
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
          <Text style={styles.sectionSubtitle}>Ireland-ready pricing, locations and workflow</Text>
        </View>
        <Pressable style={styles.textAction} onPress={() => setActiveTab('post')}>
          <Text style={styles.textActionLabel}>Post job</Text>
        </Pressable>
      </View>

      <View style={styles.stack}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              compact={compact}
              draft={offerDrafts[job.id] ?? emptyOfferDraft}
              job={job}
              mode={mode}
              selected={selectedJob?.id === job.id}
              onPress={() => setSelectedJobId(job.id)}
              sendOffer={() => sendOffer(job)}
              updateDraft={(field, value) => updateOfferDraft(job.id, field, value)}
            />
          ))
        ) : (
          <EmptyState
            title="No matching jobs"
            body="Try another category or clear the search to see more Ireland-based work."
            action="Post a job"
            onPress={() => setActiveTab('post')}
          />
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verified providers</Text>
        <Text style={styles.sectionLink}>Invite</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerRail}>
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
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

function JobCard({ compact, draft, job, mode, onPress, selected, sendOffer, updateDraft }) {
  const booked = job.status !== 'Open';

  return (
    <Pressable style={[styles.jobCard, selected && styles.jobCardSelected]} onPress={onPress}>
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
    </Pressable>
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

function ProviderCard({ provider }) {
  return (
    <Pressable style={styles.providerCard}>
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
    </Pressable>
  );
}

function PostScreen({ jobDraft, publishJob, updateJobDraft }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Post a job</Text>
      <Text style={styles.screenText}>
        Create a clear request so verified providers can price it accurately and send offers.
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
          placeholder="Dublin 2, Cork City, Galway..."
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

function OffersScreen({ acceptOffer, declineOffer, jobs, offers, providers, setActiveTab }) {
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
                {pending ? (
                  <View style={styles.offerActions}>
                    <Pressable style={styles.declineAction} onPress={() => declineOffer(offer)}>
                      <Text style={styles.declineActionText}>Decline</Text>
                    </Pressable>
                    <Pressable style={styles.acceptAction} onPress={() => acceptOffer(offer)}>
                      <Text style={styles.acceptActionText}>Accept offer</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.secondaryWideAction} onPress={() => setActiveTab('messages')}>
                    <Text style={styles.secondaryWideActionText}>Open conversation</Text>
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

function MessagesScreen({
  chatDraft,
  jobs,
  messages,
  openMessage,
  selectedMessage,
  selectedThread,
  sendMessage,
  setChatDraft,
}) {
  const selectedJob = jobs.find((job) => job.id === selectedMessage?.jobId);

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
  instantBooking,
  jobs,
  mode,
  serviceRadius,
  setInstantBooking,
  setMode,
  setServiceRadius,
  stats,
}) {
  const bookedJobs = jobs.filter((job) => job.status === 'Booked');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileTop}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>WJ</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>WEEJOB Ireland</Text>
          <Text style={styles.profileMeta}>Verified customer and provider account</Text>
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
        <View style={styles.radiusRow}>
          <Text style={styles.preferenceLabel}>Service radius</Text>
          <View style={styles.radiusControls}>
            <Pressable
              style={styles.radiusButton}
              onPress={() => setServiceRadius((current) => Math.max(3, current - 1))}
            >
              <Text style={styles.radiusButtonText}>-</Text>
            </Pressable>
            <Text style={styles.radiusValue}>{serviceRadius} km</Text>
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
  offerActions: {
    flexDirection: 'row',
    gap: 10,
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
  tabIcon: {
    color: '#DCE8D4',
    fontSize: 14,
    fontWeight: '900',
  },
  tabIconActive: {
    color: COLORS.ink,
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
