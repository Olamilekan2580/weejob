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
  primaryDark: '#5D7F00',
  ink: '#172014',
  muted: '#6A7464',
  line: '#E1E8DB',
  surface: '#F6FAF1',
  white: '#FFFFFF',
  amber: '#FFB84D',
  blue: '#5AA7FF',
  red: '#F66D6D',
  teal: '#22B8A0',
};

const categories = [
  { id: 'cleaning', label: 'Cleaning', count: 42, tone: COLORS.primary },
  { id: 'repairs', label: 'Repairs', count: 31, tone: COLORS.amber },
  { id: 'plumbing', label: 'Plumbing', count: 18, tone: COLORS.blue },
  { id: 'errands', label: 'Errands', count: 27, tone: COLORS.teal },
  { id: 'painting', label: 'Painting', count: 13, tone: COLORS.red },
  { id: 'moving', label: 'Moving', count: 22, tone: '#C4A8FF' },
];

const initialJobs = [
  {
    id: 1,
    title: 'Deep clean 2-bedroom flat',
    category: 'Cleaning',
    location: 'Ikeja GRA',
    distance: '1.4 km',
    pay: 'NGN 18,000',
    time: 'Today, 3:00 PM',
    bids: 8,
    urgent: true,
  },
  {
    id: 2,
    title: 'Fix leaking kitchen sink',
    category: 'Plumbing',
    location: 'Maryland',
    distance: '2.1 km',
    pay: 'NGN 12,500',
    time: 'Tomorrow morning',
    bids: 5,
    urgent: false,
  },
  {
    id: 3,
    title: 'Paint small shop front',
    category: 'Painting',
    location: 'Ogba',
    distance: '4.8 km',
    pay: 'NGN 45,000',
    time: 'This weekend',
    bids: 11,
    urgent: false,
  },
];

const providers = [
  {
    id: 1,
    name: 'Ada HomeCare',
    skill: 'Cleaning specialist',
    rating: '4.9',
    jobs: 126,
    response: '8 min',
    initials: 'AH',
    tone: COLORS.primary,
  },
  {
    id: 2,
    name: 'Tunde FixIt',
    skill: 'Repairs and plumbing',
    rating: '4.8',
    jobs: 88,
    response: '14 min',
    initials: 'TF',
    tone: COLORS.amber,
  },
  {
    id: 3,
    name: 'Mara Movers',
    skill: 'Moving and errands',
    rating: '4.7',
    jobs: 73,
    response: '21 min',
    initials: 'MM',
    tone: COLORS.blue,
  },
];

const initialMessages = [
  {
    id: 1,
    name: 'Ada HomeCare',
    preview: 'I can arrive by 3 PM with cleaning supplies.',
    time: '2m',
    unread: 2,
  },
  {
    id: 2,
    name: 'Tunde FixIt',
    preview: 'Please send a photo of the sink area.',
    time: '18m',
    unread: 0,
  },
  {
    id: 3,
    name: 'Mara Movers',
    preview: 'Two movers and a van are available Saturday.',
    time: '1h',
    unread: 1,
  },
];

const initialAlerts = [
  {
    id: 1,
    title: 'New bid received',
    body: 'Ada HomeCare bid NGN 17,500 for your cleaning request.',
    status: 'New',
  },
  {
    id: 2,
    title: 'Provider is nearby',
    body: 'Tunde FixIt is 10 minutes away from your location.',
    status: 'Live',
  },
  {
    id: 3,
    title: 'Payment reminder',
    body: 'Release payment only after the job is marked complete.',
    status: 'Safety',
  },
];

const tabs = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'post', label: 'Post', icon: '+' },
  { id: 'messages', label: 'Chat', icon: 'M' },
  { id: 'alerts', label: 'Alerts', icon: '!' },
  { id: 'profile', label: 'You', icon: 'U' },
];

const initialDraftJob = {
  title: '',
  category: 'Cleaning',
  location: '',
  budget: '',
  details: '',
};

const initialChatMessages = [
  {
    id: 1,
    from: 'provider',
    text: 'Can you confirm parking and water access?',
  },
  {
    id: 2,
    from: 'customer',
    text: 'Yes, both are available. Please bring mop heads.',
  },
];

function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function normalizeBudget(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.toUpperCase().startsWith('NGN') ? trimmed : `NGN ${trimmed}`;
}

function categoryIdFromLabel(label) {
  const normalized = label.trim().toLowerCase();
  return categories.find((category) => category.label.toLowerCase() === normalized)?.id;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('cleaning');
  const [serviceMode, setServiceMode] = useState('Hire');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState(initialJobs);
  const [draftJob, setDraftJob] = useState(initialDraftJob);
  const [messages, setMessages] = useState(initialMessages);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [notificationPrefs, setNotificationPrefs] = useState({
    'New bids': true,
    'Provider arrival': true,
    Promotions: false,
  });
  const [selectedMessageId, setSelectedMessageId] = useState(initialMessages[0]?.id ?? null);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [chatDraft, setChatDraft] = useState('');
  const [profileMode, setProfileMode] = useState('Customer');
  const [serviceRadius, setServiceRadius] = useState(5);
  const { width } = useWindowDimensions();
  const compact = width < 390;

  const selectedCategoryLabel = useMemo(
    () => categories.find((category) => category.id === selectedCategory)?.label ?? 'Cleaning',
    [selectedCategory]
  );

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const categoryMatch = job.category === selectedCategoryLabel;
      const searchMatch =
        !query ||
        [job.title, job.category, job.location, job.pay, job.time]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return categoryMatch && searchMatch;
    });
  }, [jobs, searchTerm, selectedCategoryLabel]);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? messages[0],
    [messages, selectedMessageId]
  );

  function showNotice(title, message) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    Alert.alert(title, message);
  }

  function updateDraftJob(field, value) {
    setDraftJob((current) => ({ ...current, [field]: value }));
  }

  function saveDraftJob() {
    showNotice('Draft saved', 'Your job draft is kept in this session.');
  }

  function publishJob() {
    const title = draftJob.title.trim();
    const category = draftJob.category.trim();
    const location = draftJob.location.trim();
    const budget = normalizeBudget(draftJob.budget);

    if (!title || !category || !location || !budget) {
      showNotice('Missing details', 'Add a title, category, location and budget before publishing.');
      return;
    }

    const job = {
      id: makeId(),
      title,
      category,
      location,
      distance: 'New',
      pay: budget,
      time: 'Open now',
      bids: 0,
      urgent: false,
    };

    setJobs((current) => [job, ...current]);
    setAlerts((current) => [
      {
        id: makeId(),
        title: 'Job published',
        body: `${title} is now visible to nearby ${category.toLowerCase()} providers.`,
        status: 'Live',
      },
      ...current,
    ]);
    setDraftJob(initialDraftJob);
    setSelectedCategory(categoryIdFromLabel(category) ?? selectedCategory);
    setActiveTab('home');
  }

  function selectMessage(id) {
    setSelectedMessageId(id);
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, unread: 0 } : message))
    );
  }

  function sendChatMessage() {
    const text = chatDraft.trim();

    if (!text || !selectedMessage) {
      return;
    }

    setChatMessages((current) => [...current, { id: makeId(), from: 'customer', text }]);
    setMessages((current) =>
      current.map((message) =>
        message.id === selectedMessage.id
          ? { ...message, preview: text, time: 'Now', unread: 0 }
          : message
      )
    );
    setChatDraft('');
  }

  function toggleNotificationPreference(title) {
    setNotificationPrefs((current) => ({ ...current, [title]: !current[title] }));
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
            <Text style={styles.location}>Local jobs around Ikeja</Text>
          </View>
          <Pressable style={styles.headerButton} onPress={() => setActiveTab('alerts')}>
            <Text style={styles.headerButtonText}>!</Text>
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {activeTab === 'home' && (
            <HomeScreen
              compact={compact}
              jobs={filteredJobs}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedCategoryLabel={selectedCategoryLabel}
              setSearchTerm={setSearchTerm}
              setSelectedCategory={setSelectedCategory}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'post' && (
            <PostScreen
              draftJob={draftJob}
              publishJob={publishJob}
              saveDraftJob={saveDraftJob}
              serviceMode={serviceMode}
              setServiceMode={setServiceMode}
              updateDraftJob={updateDraftJob}
            />
          )}
          {activeTab === 'messages' && (
            <MessagesScreen
              chatDraft={chatDraft}
              chatMessages={chatMessages}
              messages={messages}
              selectedMessage={selectedMessage}
              selectMessage={selectMessage}
              sendChatMessage={sendChatMessage}
              setChatDraft={setChatDraft}
            />
          )}
          {activeTab === 'alerts' && (
            <AlertsScreen
              alerts={alerts}
              notificationPrefs={notificationPrefs}
              toggleNotificationPreference={toggleNotificationPreference}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              profileMode={profileMode}
              serviceRadius={serviceRadius}
              setProfileMode={setProfileMode}
              setServiceRadius={setServiceRadius}
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

function HomeScreen({
  compact,
  jobs,
  searchTerm,
  selectedCategory,
  selectedCategoryLabel,
  setSearchTerm,
  setSelectedCategory,
  setActiveTab,
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>LOCAL SERVICE MARKETPLACE</Text>
          <Text style={styles.heroTitle}>Find trusted help nearby.</Text>
          <Text style={styles.heroText}>
            Book cleaners, plumbers, painters, movers and errand runners in your area.
          </Text>
        </View>
        <View style={styles.heroPanel}>
          <Text style={styles.heroPanelLabel}>Open jobs</Text>
          <Text style={styles.heroPanelValue}>153</Text>
          <Text style={styles.heroPanelMeta}>within 5 km</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search local services"
          placeholderTextColor={COLORS.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
        <Pressable style={styles.filterButton} onPress={() => setSearchTerm('')}>
          <Text style={styles.filterButtonText}>{searchTerm ? 'Clear' : 'Tune'}</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Text style={styles.sectionLink}>See all</Text>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const active = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              style={[
                styles.categoryCard,
                compact && styles.categoryCardCompact,
                active && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[styles.categoryMark, { backgroundColor: category.tone }]}>
                <Text style={styles.categoryMarkText}>{category.label.slice(0, 1)}</Text>
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryMeta}>{category.count} jobs</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{selectedCategoryLabel} jobs near you</Text>
          <Text style={styles.sectionSubtitle}>Sorted by distance and urgency</Text>
        </View>
        <Pressable onPress={() => setActiveTab('post')}>
          <Text style={styles.sectionLink}>Post</Text>
        </Pressable>
      </View>
      <View style={styles.stack}>
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <EmptyState
            title="No jobs here yet"
            body="Post the first job in this category or try a different search."
            action="Post job"
            onPress={() => setActiveTab('post')}
          />
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top providers</Text>
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

function JobCard({ job }) {
  return (
    <Pressable style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleWrap}>
          <Text style={styles.jobCategory}>{job.category}</Text>
          <Text style={styles.jobTitle}>{job.title}</Text>
        </View>
        {job.urgent && (
          <View style={styles.urgentPill}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>
      <View style={styles.jobMetaRow}>
        <Text style={styles.jobMeta}>{job.location}</Text>
        <Text style={styles.dotSeparator}>.</Text>
        <Text style={styles.jobMeta}>{job.distance}</Text>
      </View>
      <View style={styles.jobFooter}>
        <View>
          <Text style={styles.payLabel}>Budget</Text>
          <Text style={styles.payValue}>{job.pay}</Text>
        </View>
        <View style={styles.jobFooterRight}>
          <Text style={styles.jobTime}>{job.time}</Text>
          <Text style={styles.bidCount}>{job.bids} bids</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ProviderCard({ provider }) {
  return (
    <Pressable style={styles.providerCard}>
      <View style={[styles.providerAvatar, { backgroundColor: provider.tone }]}>
        <Text style={styles.providerInitials}>{provider.initials}</Text>
      </View>
      <Text style={styles.providerName}>{provider.name}</Text>
      <Text style={styles.providerSkill}>{provider.skill}</Text>
      <View style={styles.providerStats}>
        <Text style={styles.providerStat}>{provider.rating} rating</Text>
        <Text style={styles.providerStat}>{provider.jobs} jobs</Text>
      </View>
      <Text style={styles.providerResponse}>Replies in {provider.response}</Text>
    </Pressable>
  );
}

function PostScreen({
  draftJob,
  publishJob,
  saveDraftJob,
  serviceMode,
  setServiceMode,
  updateDraftJob,
}) {
  const isHiring = serviceMode === 'Hire';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>{isHiring ? 'Post a local job' : 'Offer a service'}</Text>
      <Text style={styles.screenText}>
        {isHiring
          ? 'Describe the work, set a fair budget, then chat with verified local providers.'
          : 'Share what you do, where you work, and the starting price customers should expect.'}
      </Text>

      <View style={styles.segmented}>
        {['Hire', 'Offer'].map((mode) => {
          const active = serviceMode === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setServiceMode(mode)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {mode === 'Hire' ? 'I need help' : 'I offer service'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formCard}>
        <LabeledInput
          label={isHiring ? 'Job title' : 'Service title'}
          placeholder={isHiring ? 'Example: Clean my 2-bedroom apartment' : 'Example: Weekend plumbing repairs'}
          value={draftJob.title}
          onChangeText={(value) => updateDraftJob('title', value)}
        />
        <LabeledInput
          label="Category"
          placeholder="Cleaning, plumbing, repairs..."
          value={draftJob.category}
          onChangeText={(value) => updateDraftJob('category', value)}
        />
        <LabeledInput
          label="Location"
          placeholder="Street or neighborhood"
          value={draftJob.location}
          onChangeText={(value) => updateDraftJob('location', value)}
        />
        <LabeledInput
          label={isHiring ? 'Budget' : 'Starting price'}
          placeholder="Example: NGN 20,000"
          keyboardType="numeric"
          value={draftJob.budget}
          onChangeText={(value) => updateDraftJob('budget', value)}
        />
        <LabeledInput
          label="Details"
          placeholder={
            isHiring
              ? 'What should the provider bring? Any timing or access notes?'
              : 'Describe your tools, availability, coverage area and proof of work.'
          }
          multiline
          value={draftJob.details}
          onChangeText={(value) => updateDraftJob('details', value)}
        />
        <View style={styles.formRow}>
          <Pressable style={styles.secondaryAction} onPress={saveDraftJob}>
            <Text style={styles.secondaryActionText}>Save draft</Text>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={publishJob}>
            <Text style={styles.primaryActionText}>{isHiring ? 'Publish job' : 'Publish service'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>Built-in safety checks</Text>
        <Text style={styles.safetyText}>Provider identity, ratings, job completion and payment release are tracked in the app.</Text>
      </View>
    </ScrollView>
  );
}

function LabeledInput({ label, placeholder, multiline, keyboardType, value, onChangeText }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function MessagesScreen({
  chatDraft,
  chatMessages,
  messages,
  selectedMessage,
  selectMessage,
  sendChatMessage,
  setChatDraft,
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Messages</Text>
      <Text style={styles.screenText}>Coordinate job details before accepting bids or releasing payment.</Text>
      <View style={styles.stack}>
        {messages.map((message) => (
          <Pressable
            key={message.id}
            style={[
              styles.messageCard,
              selectedMessage?.id === message.id && styles.messageCardActive,
            ]}
            onPress={() => selectMessage(message.id)}
          >
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{message.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.messageBody}>
              <View style={styles.messageTop}>
                <Text style={styles.messageName}>{message.name}</Text>
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

      <View style={styles.chatPreview}>
        <Text style={styles.chatTitle}>{selectedMessage?.name ?? 'Conversation'}</Text>
        {chatMessages.map((message) => {
          const outgoing = message.from === 'customer';

          return (
            <View
              key={message.id}
              style={outgoing ? styles.bubbleOutgoing : styles.bubbleIncoming}
            >
              <Text style={outgoing ? styles.bubbleOutgoingText : styles.bubbleIncomingText}>
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
            onSubmitEditing={sendChatMessage}
            style={styles.replyInput}
          />
          <Pressable style={styles.sendButton} onPress={sendChatMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function AlertsScreen({ alerts, notificationPrefs, toggleNotificationPreference }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Notifications</Text>
      <Text style={styles.screenText}>Bids, arrival updates, chat alerts and payment reminders stay here.</Text>
      <View style={styles.stack}>
        {alerts.map((alert) => (
          <Pressable key={alert.id} style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Text style={styles.alertIconText}>!</Text>
            </View>
            <View style={styles.alertBody}>
              <View style={styles.messageTop}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <View style={styles.alertStatus}>
                  <Text style={styles.alertStatusText}>{alert.status}</Text>
                </View>
              </View>
              <Text style={styles.alertText}>{alert.body}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Notification preferences</Text>
        {Object.entries(notificationPrefs).map(([title, active]) => (
          <PreferenceRow
            key={title}
            title={title}
            active={active}
            onPress={() => toggleNotificationPreference(title)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function PreferenceRow({ title, active, onPress }) {
  return (
    <Pressable style={styles.preferenceRow} onPress={onPress}>
      <Text style={styles.preferenceLabel}>{title}</Text>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
      </View>
    </Pressable>
  );
}

function ProfileScreen({ profileMode, serviceRadius, setProfileMode, setServiceRadius }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileTop}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>WO</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>WEEJOB Owner</Text>
          <Text style={styles.profileMeta}>Verified customer and provider account</Text>
        </View>
      </View>

      <View style={styles.modeCard}>
        <Text style={styles.preferenceTitle}>Account mode</Text>
        <View style={styles.modeRow}>
          {['Customer', 'Provider'].map((mode) => (
            <ModeChip
              key={mode}
              active={profileMode === mode}
              label={mode}
              onPress={() => setProfileMode(mode)}
            />
          ))}
        </View>
        <View style={styles.radiusRow}>
          <Text style={styles.preferenceLabel}>Service radius</Text>
          <View style={styles.radiusControls}>
            <Pressable
              style={styles.radiusButton}
              onPress={() => setServiceRadius((current) => Math.max(1, current - 1))}
            >
              <Text style={styles.radiusButtonText}>-</Text>
            </Pressable>
            <Text style={styles.radiusValue}>{serviceRadius} km</Text>
            <Pressable
              style={styles.radiusButton}
              onPress={() => setServiceRadius((current) => Math.min(25, current + 1))}
            >
              <Text style={styles.radiusButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.scoreGrid}>
        <MetricCard label="Jobs posted" value="12" />
        <MetricCard label="Completed" value="9" />
        <MetricCard label="Rating" value="4.8" />
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Account setup</Text>
        <SetupRow title="Identity verification" status="Complete" />
        <SetupRow title="Payment wallet" status="Ready" />
        <SetupRow title="Service radius" status={`${serviceRadius} km`} />
        <SetupRow title="Support center" status="Open" />
      </View>
    </ScrollView>
  );
}

function ModeChip({ active, label, onPress }) {
  return (
    <Pressable style={[styles.modeChip, active && styles.modeChipActive]} onPress={onPress}>
      <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ title, body, action, onPress }) {
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

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SetupRow({ title, status }) {
  return (
    <Pressable style={styles.setupRow}>
      <Text style={styles.setupTitle}>{title}</Text>
      <Text style={styles.setupStatus}>{status}</Text>
    </Pressable>
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
    minHeight: 76,
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
    fontWeight: '600',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  headerButtonText: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.white,
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
    minHeight: 176,
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
    backgroundColor: COLORS.ink,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroTitle: {
    marginTop: 10,
    color: COLORS.white,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroText: {
    marginTop: 10,
    color: '#DCE8D4',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  heroPanel: {
    width: 104,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  heroPanelLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  heroPanelValue: {
    marginTop: 10,
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroPanelMeta: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: COLORS.ink,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 15,
    fontWeight: '600',
  },
  filterButton: {
    height: 50,
    minWidth: 64,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    fontWeight: '600',
  },
  sectionLink: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31.7%',
    minWidth: 96,
    minHeight: 112,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  categoryCardCompact: {
    width: '48%',
  },
  categoryCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#FBFFF1',
  },
  categoryMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMarkText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  categoryLabel: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  categoryMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  stack: {
    gap: 12,
  },
  jobCard: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  jobTitleWrap: {
    flex: 1,
  },
  jobCategory: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  jobTitle: {
    marginTop: 5,
    color: COLORS.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  urgentPill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E8',
  },
  urgentText: {
    color: '#B22D2D',
    fontSize: 12,
    fontWeight: '900',
  },
  jobMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  jobMeta: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  dotSeparator: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '900',
  },
  jobFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  payLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  payValue: {
    marginTop: 3,
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  jobFooterRight: {
    alignItems: 'flex-end',
  },
  jobTime: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  bidCount: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  providerRail: {
    gap: 12,
    paddingRight: 20,
  },
  providerCard: {
    width: 190,
    minHeight: 192,
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
  providerName: {
    marginTop: 12,
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  providerSkill: {
    marginTop: 4,
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
    fontWeight: '900',
  },
  screenTitle: {
    color: COLORS.ink,
    fontSize: 27,
    lineHeight: 32,
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
  segmented: {
    height: 52,
    padding: 4,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  segment: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: COLORS.ink,
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
    fontWeight: '600',
  },
  textArea: {
    minHeight: 104,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 50,
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
  secondaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  secondaryActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  safetyCard: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#EFFFF6',
    borderWidth: 1,
    borderColor: '#CDEEDF',
  },
  safetyTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  safetyText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
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
    backgroundColor: '#FBFFF1',
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
  chatPreview: {
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
  bubbleIncoming: {
    maxWidth: '84%',
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  bubbleIncomingText: {
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  bubbleOutgoing: {
    alignSelf: 'flex-end',
    maxWidth: '84%',
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.primary,
  },
  bubbleOutgoingText: {
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 18,
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
    fontWeight: '600',
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
  alertCard: {
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  alertIconText: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  alertBody: {
    flex: 1,
  },
  alertTitle: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  alertText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  alertStatus: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  alertStatusText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
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
    minWidth: 48,
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
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
  setupRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  setupTitle: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  setupStatus: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
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
    fontSize: 11,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: COLORS.ink,
  },
});
