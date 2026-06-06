// src/data/helpArticles.js
// In-app Help Center content. Each article body is an array of blocks rendered
// by Helps.jsx: { type: "h2"|"p"|"ul"|"steps"|"tip"|"code", ... }

export const HELP_CATEGORIES = [
  "All Articles", "General", "Bots", "Chat", "Voice",
  "Knowledge", "Active Tags", "Numbers", "Integrations",
];

export const HELP_ARTICLES = [
  // ── GENERAL ──────────────────────────────────────────────────────────────
  {
    id: "getting-started",
    title: "Getting Started",
    subtitle: "A quick tour of the platform: connect GoHighLevel, build an assistant, give it a number, and go live.",
    tag: "General",
    level: "Beginner",
    body: [
      { type: "p", text: "Welcome! This platform lets you build AI voice & chat assistants that work hand-in-hand with your GoHighLevel (GHL) sub-accounts. Here's the typical path from zero to a live assistant." },
      { type: "h2", text: "1. Connect a sub-account" },
      { type: "p", text: "Go to **Integrations** and connect GoHighLevel. Each GHL location (sub-account) you connect becomes selectable across the app via the sub-account switcher. Most pages (Contacts, Calendars, Knowledge, Numbers) are scoped to the selected sub-account." },
      { type: "h2", text: "2. Build an assistant" },
      { type: "p", text: "Open the **Assistant Builder**, write a system prompt, pick a model and a voice, then add tools (booking, tagging, web search, etc.) from the Toolkit." },
      { type: "h2", text: "3. Give it a phone number" },
      { type: "p", text: "On the **Numbers** page, buy a Twilio number or import an external one, then connect it to your assistant." },
      { type: "h2", text: "4. Test, then go live" },
      { type: "p", text: "Use the **Chat Lab** and **Voice Lab** to test behaviour before pointing real traffic at the assistant." },
      { type: "tip", text: "Many GHL-dependent features (booking, tagging, custom fields) require the right OAuth scopes. If something says 'reconnect' or 'not authorized for this scope', see the Troubleshooting article." },
    ],
  },

  // ── BOTS / ASSISTANT BUILDER ─────────────────────────────────────────────
  {
    id: "assistant-builder",
    title: "Building an Assistant",
    subtitle: "The Assistant Builder: prompt, model, voice, saving, the readiness audit and the Issues count.",
    tag: "Bots",
    level: "Beginner",
    body: [
      { type: "h2", text: "The prompt" },
      { type: "p", text: "The Global Prompt is your assistant's system prompt — it defines its role, tone, and rules. Use **Generate** to draft one from a description, or **Snippet** to insert reusable blocks." },
      { type: "h2", text: "Model & voice" },
      { type: "p", text: "The model pill (top bar) opens the AI Model picker. The voice pill (prompt toolbar) opens the Voice Library. Whatever you select shows on the pill and is saved to the assistant." },
      { type: "h2", text: "Saving" },
      { type: "p", text: "Click **Save Changes** to persist the prompt. Voice, model, and most Toolkit settings auto-save when you change them." },
      { type: "h2", text: "Readiness audit & Issues" },
      { type: "p", text: "The flask icon runs a **Readiness Audit** — it checks that the assistant has a prompt, model, voice, first message, and tools. The **Issues** button shows how many of those still need attention, and clicking it lists them." },
      { type: "h2", text: "Header actions" },
      { type: "ul", items: [
        "Rocket — opens the Chat Lab to test.",
        "Refresh — reloads the assistant's latest saved config.",
        "Collaborators (people icon) — see teammates and invite, or copy a link to this assistant.",
      ] },
    ],
  },

  // ── VOICE ────────────────────────────────────────────────────────────────
  {
    id: "choosing-a-voice",
    title: "Choosing a Voice",
    subtitle: "Use the Voice Library to pick and apply a voice, and filter by provider, gender, and accent.",
    tag: "Voice",
    level: "Beginner",
    body: [
      { type: "p", text: "Open the Voice Library from the voice pill in the prompt toolbar." },
      { type: "steps", items: [
        "Browse or search voices; filter by Provider, Gender, or Accent.",
        "Click 'Use voice' on a card to apply it.",
        "The selected voice is marked 'Applied' and the voice pill updates immediately.",
      ] },
      { type: "tip", text: "Selecting a voice is a Vapi-only operation — it does not require a GoHighLevel connection." },
    ],
  },

  // ── CHAT / TESTING ───────────────────────────────────────────────────────
  {
    id: "chat-and-voice-lab",
    title: "Testing in Chat Lab & Voice Lab",
    subtitle: "How to test your assistant's responses before going live — and why Chat Lab may ask for a payment method.",
    tag: "Chat",
    level: "Beginner",
    body: [
      { type: "h2", text: "Chat Lab" },
      { type: "p", text: "Chat Lab lets you message your assistant and see its replies using your current prompt and model. It runs in 'Live Lab Mode' — no tools or appointments are executed." },
      { type: "tip", text: "Chat Lab uses Vapi's chat API, which is metered. If you see 'Add a payment method to use chat', add a card to your Vapi organization's billing — it's a Vapi-side requirement, not a bug." },
      { type: "h2", text: "Voice Lab" },
      { type: "p", text: "Voice Lab lets you place a quick test call to hear the assistant. Your wallet balance must be positive to run tests." },
    ],
  },

  // ── TOOLS ────────────────────────────────────────────────────────────────
  {
    id: "tools-and-apis",
    title: "Tools & APIs (Toolkit)",
    subtitle: "Add platform tools, tag contacts, import an existing tool by ID, or create a custom webhook tool.",
    tag: "Bots",
    level: "Intermediate",
    body: [
      { type: "h2", text: "Adding tools" },
      { type: "p", text: "Open **Tools & APIs** from the Toolkit. Each card adds a capability to the assistant. Tools already on the assistant show an 'Added' badge and can be removed." },
      { type: "h2", text: "Available tools" },
      { type: "ul", items: [
        "Scrape Website / Search The Web — let the assistant pull info from the web.",
        "Update User Details — write contact fields (and mapped custom fields) to the CRM.",
        "Get Availability / Book Appointment / Get Calendar Events — calendar booking.",
        "Add Tag / Remove Tag — tag the contact in GoHighLevel during a call.",
      ] },
      { type: "h2", text: "Import Tool ID" },
      { type: "p", text: "Already created a tool in Vapi? Use **Import Tool ID** to attach it to this assistant by its tool id." },
      { type: "h2", text: "Create New Tool" },
      { type: "p", text: "**Create New Tool** builds a custom webhook (function) tool: give it a name, description, and your server URL. Vapi POSTs to that URL when the assistant calls the tool." },
      { type: "tip", text: "Tag tools and contact writes require the GoHighLevel 'contacts.write' scope. If they fail, reconnect GHL with the correct scopes (see Troubleshooting)." },
    ],
  },

  // ── ACTIVE TAGS ──────────────────────────────────────────────────────────
  {
    id: "tags",
    title: "Tags & the Add/Remove Tag Tools",
    subtitle: "How the assistant tags contacts in GoHighLevel, and what the Tags page does.",
    tag: "Active Tags",
    level: "Intermediate",
    body: [
      { type: "p", text: "Tags label and segment contacts in GoHighLevel, often triggering automations/workflows." },
      { type: "h2", text: "Tagging during calls" },
      { type: "p", text: "Add the **Add Tag** / **Remove Tag** tools from the Toolkit. The assistant can then tag or untag the contact mid-call (e.g. mark a caller 'qualified-lead' or clear 'callback')." },
      { type: "tip", text: "These tools upsert the contact by email, so they need the GHL 'contacts.write' scope on the connected sub-account." },
    ],
  },

  // ── KNOWLEDGE ────────────────────────────────────────────────────────────
  {
    id: "knowledge-bases",
    title: "Knowledge Bases",
    subtitle: "Upload files, URLs, text, or FAQs; preview content; and test retrieval with the Embedding Playground.",
    tag: "Knowledge",
    level: "Beginner",
    body: [
      { type: "h2", text: "Creating a knowledge base" },
      { type: "p", text: "On the **Knowledge** page, click New Knowledge Base and choose a type:" },
      { type: "ul", items: [
        "File — PDF, DOCX, TXT, or CSV (up to 10MB). Text is extracted and stored.",
        "URL — the page is scraped and indexed.",
        "Text — paste content directly.",
        "FAQ — add question/answer pairs.",
      ] },
      { type: "h2", text: "Linking to an assistant" },
      { type: "p", text: "Each knowledge base becomes a query tool you can attach to assistants so they can answer from it." },
      { type: "h2", text: "Preview & metadata" },
      { type: "p", text: "Cards show the type, file name, size, character count, and version (re-uploads increment the version). 'View' opens the original file or an inline text preview." },
      { type: "h2", text: "Embedding Playground (Test)" },
      { type: "p", text: "Click **Test** on a knowledge base to open the Embedding Playground. Type a question and see the passages it would surface to the assistant — a quick way to verify 'does my KB actually cover this?'." },
      { type: "tip", text: "Search works on stored text. Text/FAQ/URL bases are searchable immediately; file bases are searchable for uploads made after this feature shipped." },
    ],
  },

  // ── NUMBERS ──────────────────────────────────────────────────────────────
  {
    id: "phone-numbers",
    title: "Phone Numbers",
    subtitle: "Buy a Twilio number, import an external (BYO) number, connect to Vapi, and manage each number.",
    tag: "Numbers",
    level: "Intermediate",
    body: [
      { type: "h2", text: "Buy vs Import" },
      { type: "ul", items: [
        "Buy a Number — purchase a new Twilio number (appears under the 'Bought' tab).",
        "Import a Number — bring an external/BYO number you already own via its SIP termination URI (appears under the 'Imported' tab).",
      ] },
      { type: "h2", text: "Importing an external number" },
      { type: "steps", items: [
        "Click Import a Number.",
        "Enter the number in E.164 format (e.g. +12125551234).",
        "Enter your SIP Termination URI (e.g. sip:user@your.pstn.twilio.com).",
        "Optionally expand Authentication for SIP username/password.",
        "Import — the number is created in Vapi and saved to your account.",
      ] },
      { type: "h2", text: "Connecting to an assistant" },
      { type: "p", text: "Open a number's ⋯ menu and choose Connect to link it to the assistant via Vapi (or Disconnect to unlink)." },
      { type: "h2", text: "Number actions (⋯ menu)" },
      { type: "ul", items: [
        "Rename — set a display name (persists).",
        "Edit Account — name + notes.",
        "Manage Limits — max calls/day and monthly budget (saved; enforcement coming soon).",
        "View Details — number, SID, linked assistant, connection status.",
        "Copy Number / Copy SID — copy to clipboard.",
      ] },
    ],
  },

  // ── CALENDARS / BOOKING ──────────────────────────────────────────────────
  {
    id: "calendars-booking",
    title: "Calendars & Appointment Booking",
    subtitle: "Link a GoHighLevel calendar, let the assistant book on calls, or book manually from the Appointments page.",
    tag: "General",
    level: "Intermediate",
    body: [
      { type: "h2", text: "Link a calendar" },
      { type: "p", text: "In the Assistant Builder Toolkit, open **Calendars**, then select a calendar to link it to the assistant. If it says the connection expired, click Reconnect GoHighLevel." },
      { type: "h2", text: "Booking on a call" },
      { type: "p", text: "Add the **Get Availability** and **Book Appointment** tools. The assistant checks free slots, then books — and the customer gets a confirmation email; reminders are sent automatically." },
      { type: "h2", text: "Manual booking" },
      { type: "p", text: "On the **Appointments** page, click New Appointment: pick a calendar and date, choose a free slot, enter the customer's name and email, and book." },
      { type: "tip", text: "Booking upserts a contact, so it needs the GHL 'contacts.write' scope plus calendar scopes. A 500 on booking is almost always a missing scope — reconnect with the right scopes." },
    ],
  },

  // ── INTEGRATIONS ─────────────────────────────────────────────────────────
  {
    id: "integrations",
    title: "Integrations & Connections",
    subtitle: "Connect GoHighLevel, OpenAI, and Stripe — and what to do when a connection expires.",
    tag: "Integrations",
    level: "Intermediate",
    body: [
      { type: "h2", text: "GoHighLevel" },
      { type: "p", text: "Connecting GHL authorizes the platform to read/write the sub-account's contacts, calendars, and custom fields. Connection status is shown per sub-account and self-heals when the token is still valid." },
      { type: "h2", text: "OpenAI & Stripe" },
      { type: "p", text: "Connect OpenAI by pasting your API key (it's validated before saving). Connect Stripe via OAuth to enable wallet top-ups and rebilling." },
      { type: "h2", text: "When a connection expires" },
      { type: "p", text: "If you see 'reconnect' prompts, the GHL token can't be refreshed. Click Reconnect and re-authorize. Reconnect runs against the production server, so scope changes must be live there." },
    ],
  },

  // ── API KEYS ─────────────────────────────────────────────────────────────
  {
    id: "api-keys",
    title: "API Keys & the Developer API",
    subtitle: "Generate a key and call the platform's REST API to manage assistants, calls, and contacts.",
    tag: "Integrations",
    level: "Advanced",
    body: [
      { type: "h2", text: "Generating a key" },
      { type: "p", text: "Integrations → API → Generate Key. The full key is shown **once** — copy it immediately; only a masked prefix is stored afterward. Revoke a key anytime." },
      { type: "h2", text: "Authenticating" },
      { type: "p", text: "Send your key as a bearer token:" },
      { type: "code", text: "Authorization: Bearer sk_live_xxxxxxxx" },
      { type: "h2", text: "Endpoints" },
      { type: "ul", items: [
        "GET /api/v1/assistants — list assistants",
        "GET /api/v1/assistants/:id — get one",
        "POST /api/v1/calls — start an outbound call",
        "GET /api/v1/calls — call logs",
        "GET /api/v1/contacts · POST /api/v1/contacts",
        "GET /api/v1/analytics — KPIs",
      ] },
      { type: "tip", text: "Most endpoints accept ?subaccountId=... to scope to a specific GHL location." },
    ],
  },

  // ── TEAM ─────────────────────────────────────────────────────────────────
  {
    id: "team-collaborators",
    title: "Team & Collaborators",
    subtitle: "Invite teammates, assign roles, and share access to assistants.",
    tag: "General",
    level: "Beginner",
    body: [
      { type: "h2", text: "Inviting" },
      { type: "p", text: "From Settings → Members (or the Collaborators dropdown in the Assistant Builder), invite by email and pick a role." },
      { type: "h2", text: "Roles" },
      { type: "ul", items: [
        "Admin — full access except removing the owner.",
        "Member — manage assistants, contacts & calls (no billing/team).",
        "Viewer — read-only.",
      ] },
      { type: "p", text: "Members act on behalf of the agency, so they see the same assistants and sub-accounts." },
    ],
  },

  // ── CALL CENTER ──────────────────────────────────────────────────────────
  {
    id: "call-center",
    title: "Call Center & Call Logs",
    subtitle: "Review analytics, browse the call list, open call details, and export to CSV.",
    tag: "General",
    level: "Beginner",
    body: [
      { type: "h2", text: "Dashboard" },
      { type: "p", text: "The Data Center tab shows KPIs (total/inbound/outbound calls, costs, appointments) and charts for the selected sub-account." },
      { type: "h2", text: "Call list" },
      { type: "p", text: "The Call List tab lists every call with filters (search, status, type, date). Use **Export CSV** to download the filtered set." },
      { type: "h2", text: "Call details" },
      { type: "p", text: "Each row has two actions: open the **recording**, and **View details** — a popup with the full transcript, summary, duration, status, and end reason." },
      { type: "tip", text: "Transcripts/recordings appear only if Vapi returns them. Recording is controlled by the assistant's Call Settings 'Recording' toggle." },
    ],
  },

  // ── TROUBLESHOOTING ──────────────────────────────────────────────────────
  {
    id: "troubleshooting",
    title: "Troubleshooting & FAQ",
    subtitle: "The most common errors — reconnect prompts, invalid scopes, Chat payment, booking 500s — and their fixes.",
    tag: "General",
    level: "Intermediate",
    body: [
      { type: "h2", text: "'Reconnect GoHighLevel' / token expired" },
      { type: "p", text: "The sub-account's GHL token can't be refreshed. Click Reconnect and re-authorize. This is required after changing OAuth scopes." },
      { type: "h2", text: "'Invalid scope(s)' during reconnect" },
      { type: "p", text: "The scope you're requesting isn't enabled on the GHL Marketplace app version being used. Enable it in the app's Scopes, then make sure the OAuth uses the app version that has it." },
      { type: "h2", text: "'redirect_uri does not match'" },
      { type: "p", text: "The exact callback URL must be registered in the GHL app's Redirect URLs, on the same app/version your Client ID belongs to." },
      { type: "h2", text: "'not authorized for this scope' (booking, tags, custom fields)" },
      { type: "p", text: "The token is valid but lacks 'contacts.write' (or the custom-fields scope). Enable the scope in the GHL app and reconnect." },
      { type: "h2", text: "Chat Lab: 'Add a payment method'" },
      { type: "p", text: "Vapi requires a card on file for chat. Add one in your Vapi organization billing." },
      { type: "h2", text: "Getting logged out / 'token refresh failed'" },
      { type: "p", text: "Your session token couldn't be renewed (e.g. after a server secret change). Log out and back in to mint fresh tokens." },
    ],
  },
];
