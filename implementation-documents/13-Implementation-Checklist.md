# 13 - Implementation Checklist

**Document:** Week-by-Week Implementation Plan  
**Version:** 1.0  
**Last Updated:** 2025-11-04

---

## Phase 1: MVP Beta (Q1 2026 - Weeks 1-21)

### Week 1-3: Infrastructure & Core Platform Setup

#### Week 1: Infrastructure Provisioning
**Owner:** DevOps Lead

- [ ] **Day 1-2: Render.com Setup**
  - [ ] Create Render account (Team plan)
  - [ ] Provision Web Service (waxos-api, Pro plan)
  - [ ] Provision Background Worker (waxos-worker, Starter plan)
  - [ ] Provision Redis (Starter plan)
  - [ ] Configure environment variables
  - [ ] Setup deploy hooks (GitHub Actions)

- [ ] **Day 2-3: NeonDB Setup**
  - [ ] Create Neon project (waxos-production)
  - [ ] Enable pg_vector extension
  - [ ] Configure connection pooling (max 100 connections)
  - [ ] Setup database backups (daily, 30-day retention)
  - [ ] Create staging database (waxos-staging)

- [ ] **Day 3-4: Cloudflare R2 Setup**
  - [ ] Create R2 bucket (waxos-production)
  - [ ] Configure CORS policies
  - [ ] Enable versioning (30-day retention)
  - [ ] Setup lifecycle rules (auto-delete old exports)
  - [ ] Generate access keys

- [ ] **Day 4-5: Additional Services**
  - [ ] Setup Pusher account (Pro plan)
  - [ ] Configure Neon Auth (JWT provider)
  - [ ] Setup Sentry for error tracking
  - [ ] Configure GitHub repository with branch protection
  - [ ] Setup CI/CD pipeline (GitHub Actions)

**Deliverables:** All infrastructure provisioned and accessible

---

#### Week 2: Backend Scaffolding
**Owner:** Backend Lead

- [ ] **Day 1-2: NestJS Project Setup**
  - [ ] Initialize NestJS project: `nest new waxos-backend`
  - [ ] Configure TypeScript strict mode
  - [ ] Setup ESLint + Prettier
  - [ ] Configure Dockerfile (multi-stage build)
  - [ ] Setup environment validation (Joi schemas)

- [ ] **Day 2-3: Database Layer**
  - [ ] Install dependencies: `pg`, `typeorm`
  - [ ] Configure TypeORM (NeonDB connection)
  - [ ] Create base entity with timestamps
  - [ ] Setup database migrations system
  - [ ] Run first migration (users, workspaces tables)

- [ ] **Day 3-4: Core Modules**
  - [ ] Create AuthModule (Neon Auth integration)
  - [ ] Create WorkspaceModule
  - [ ] Create UserModule
  - [ ] Implement JWT strategy (passport-jwt)
  - [ ] Create guards: JwtAuthGuard, RolesGuard

- [ ] **Day 4-5: API Endpoints (Auth)**
  - [ ] POST /api/v1/auth/register
  - [ ] POST /api/v1/auth/login
  - [ ] POST /api/v1/auth/logout
  - [ ] POST /api/v1/auth/refresh-token
  - [ ] GET /api/v1/auth/me
  - [ ] Write unit tests (>80% coverage)

**Deliverables:** Backend running locally, auth endpoints functional

---

#### Week 3: Electron + Next.js Integration
**Owner:** Frontend Lead

- [ ] **Day 1-2: Electron Setup**
  - [ ] Initialize Electron project
  - [ ] Configure electron-builder (Windows, macOS, Linux)
  - [ ] Setup IPC handlers (preload script)
  - [ ] Implement auto-updater (electron-updater)
  - [ ] Create system tray integration

- [ ] **Day 2-3: Next.js Static Export**
  - [ ] Initialize Next.js: `npx create-next-app@latest`
  - [ ] Configure static export (next.config.js)
  - [ ] Setup Tailwind CSS
  - [ ] Create base layout components
  - [ ] Integrate with Electron (load from /out)

- [ ] **Day 3-4: State Management**
  - [ ] Install Zustand
  - [ ] Create auth store
  - [ ] Create UI store
  - [ ] Setup persistence (localStorage)

- [ ] **Day 4-5: Login Page**
  - [ ] Create login UI (React Hook Form + Zod)
  - [ ] Integrate with backend API
  - [ ] Implement token storage (Electron safeStorage)
  - [ ] Add loading states and error handling
  - [ ] Write E2E test (Playwright)

**Deliverables:** Electron app builds successfully, login works end-to-end

---

### Week 4-7: Team Inbox (M1) + WhatsApp Automation

#### Week 4: WhatsApp Automation POC
**Owner:** Automation Engineer

- [ ] **Day 1-2: Puppeteer Setup**
  - [ ] Install Puppeteer
  - [ ] Launch headless browser
  - [ ] Navigate to web.whatsapp.com
  - [ ] Implement QR code extraction
  - [ ] Save session to file

- [ ] **Day 2-3: Session Management**
  - [ ] Persist WhatsApp session to database
  - [ ] Implement auto-reconnect logic
  - [ ] Handle session expiry gracefully
  - [ ] Test multi-device support

- [ ] **Day 3-5: Message Operations**
  - [ ] Implement sendMessage(chatId, text)
  - [ ] Implement getChats() (list all chats)
  - [ ] Implement getMessages(chatId)
  - [ ] Test with real WhatsApp account

**Deliverables:** WhatsApp automation working, can send/receive messages

---

#### Week 5: Humanization Engine
**Owner:** Automation Engineer

- [ ] **Day 1-2: Typing Simulation**
  - [ ] Implement variable typing speed (3-8 cps)
  - [ ] Add random variance (±20%)
  - [ ] Implement typo simulation (3% rate)
  - [ ] Add mid-typing pauses (15% probability)

- [ ] **Day 2-3: Action Delays**
  - [ ] Before typing: 800-2000ms
  - [ ] After typing: 500-1500ms
  - [ ] Between messages: 2000-5000ms
  - [ ] Read receipt delay: 2000-8000ms

- [ ] **Day 3-5: Rate Limiting**
  - [ ] Implement daily limit (500 messages)
  - [ ] Implement hourly limit (50 messages)
  - [ ] Implement minute limit (5 actions)
  - [ ] Add cooldown mechanism
  - [ ] Create activity monitor UI

**Deliverables:** Humanization engine functional, rate limits enforced

---

#### Week 6: Chat Assignment & Routing
**Owner:** Backend Lead + Frontend Lead

- [ ] **Backend (Day 1-3)**
  - [ ] Create chats table migration
  - [ ] Create messages table migration
  - [ ] Create chat_assignments table
  - [ ] Implement GET /api/v1/chats
  - [ ] Implement POST /api/v1/chats/:id/assign
  - [ ] Implement Pusher event publishing

- [ ] **Frontend (Day 3-5)**
  - [ ] Create ChatList component
  - [ ] Create ChatView component
  - [ ] Implement drag-and-drop (react-beautiful-dnd)
  - [ ] Integrate Pusher subscription
  - [ ] Add real-time updates

**Deliverables:** Chat assignment working, real-time updates functioning

---

#### Week 7: E2EE Internal Notes
**Owner:** Security Engineer

- [ ] **Day 1-2: E2EE Implementation**
  - [ ] Implement key derivation (PBKDF2)
  - [ ] Implement encrypt/decrypt functions (AES-256-GCM)
  - [ ] Store encryption salt in local_settings
  - [ ] Test encryption/decryption cycle

- [ ] **Day 2-3: Backend API**
  - [ ] Create chat_notes table
  - [ ] Implement POST /api/v1/chats/:id/notes
  - [ ] Implement GET /api/v1/chats/:id/notes
  - [ ] Add RLS policy (user can only see own notes)

- [ ] **Day 3-5: Frontend UI**
  - [ ] Create Notes panel in ChatView
  - [ ] Implement add note form
  - [ ] Client-side encryption before upload
  - [ ] Client-side decryption on display
  - [ ] Add "locked" icon to indicate E2EE

**Deliverables:** E2EE notes working, Admin cannot decrypt staff notes

---

### Week 8-11: AI Co-pilot (M4) + Contacts (M2)

#### Week 8: Contact Management
**Owner:** Full-Stack Engineer

- [ ] **Backend (Day 1-2)**
  - [ ] Create contacts table migration
  - [ ] Implement CRUD endpoints
  - [ ] Implement search endpoint (full-text + tags)
  - [ ] Add custom fields support (JSONB)

- [ ] **Frontend (Day 3-5)**
  - [ ] Create Contacts page
  - [ ] Create ContactCard component
  - [ ] Implement search with filters
  - [ ] Add tag management
  - [ ] Implement CSV import

**Deliverables:** Contact management fully functional

---

#### Week 9: AI Abstraction Layer
**Owner:** AI Engineer

- [ ] **Day 1-2: Provider Integration**
  - [ ] Integrate Bytez.com SDK
  - [ ] Integrate OpenRouter SDK
  - [ ] Integrate Groq SDK
  - [ ] Integrate Gemini SDK
  - [ ] Create provider config registry

- [ ] **Day 2-3: Routing Logic**
  - [ ] Implement provider selection algorithm
  - [ ] Implement fallback chain
  - [ ] Add circuit breaker pattern
  - [ ] Add rate limiting per provider

- [ ] **Day 3-5: Testing**
  - [ ] Test each provider independently
  - [ ] Test fallback when Bytez fails
  - [ ] Test circuit breaker opens after failures
  - [ ] Load test (100 concurrent requests)

**Deliverables:** AAL functional, fallback chain tested

---

#### Week 10: RAG Pipeline (Knowledge Base Integration)
**Owner:** AI Engineer

- [ ] **Day 1-2: Embedding Generation**
  - [ ] Implement text → embedding function
  - [ ] Test with OpenAI ada-002
  - [ ] Optimize batch embedding (100+ at once)
  - [ ] Cache embeddings (Redis)

- [ ] **Day 2-3: Vector Search**
  - [ ] Write vector similarity query (pg_vector)
  - [ ] Create knowledge_vectors table
  - [ ] Implement search function (cosine similarity)
  - [ ] Test with sample documents

- [ ] **Day 3-5: RAG Integration**
  - [ ] Implement context retrieval (last 10 messages + top 3 KB)
  - [ ] Inject context into AI prompt
  - [ ] Test reply quality with/without RAG
  - [ ] A/B test setup (measure acceptance rate)

**Deliverables:** RAG working, AI suggestions include KB sources

---

#### Week 11: AI Suggestion UI
**Owner:** Frontend Lead

- [ ] **Day 1-3: AISuggestion Component**
  - [ ] Create suggestion card UI (purple border)
  - [ ] Add confidence indicator (traffic light)
  - [ ] Add action buttons (Accept, Edit, Dismiss)
  - [ ] Show KB sources (expandable)
  - [ ] Add tone selector (Professional, Friendly, etc.)

- [ ] **Day 3-5: Integration & Polish**
  - [ ] Integrate with backend API
  - [ ] Add loading skeleton
  - [ ] Implement keyboard shortcuts (Ctrl+Enter)
  - [ ] Add error handling (retry logic)
  - [ ] Write E2E test (Playwright)

**Deliverables:** AI suggestion UI polished, user testing ready

---

### Week 12-15: Knowledge Base (M7) + Smart Clipboard (M9)

#### Week 12: Document Ingestion
**Owner:** Backend Lead

- [ ] **Day 1-2: File Upload**
  - [ ] Implement presigned URL generation (R2)
  - [ ] Create document upload UI
  - [ ] Validate file types (PDF, DOCX, TXT, MD)
  - [ ] Implement file size limits (50MB)

- [ ] **Day 2-4: Text Extraction**
  - [ ] Install pdf-parse, mammoth libraries
  - [ ] Implement PDF → text extraction
  - [ ] Implement DOCX → text extraction
  - [ ] Handle extraction errors gracefully

- [ ] **Day 4-5: Background Jobs**
  - [ ] Setup BullMQ
  - [ ] Create document processing job
  - [ ] Update processing status in DB
  - [ ] Publish Pusher event on completion

**Deliverables:** Documents can be uploaded and processed

---

#### Week 13: Embedding Generation & Storage
**Owner:** AI Engineer

- [ ] **Day 1-2: Text Chunking**
  - [ ] Implement chunking algorithm (~500 tokens)
  - [ ] Add overlap between chunks (50 tokens)
  - [ ] Test with various document lengths

- [ ] **Day 2-4: Embedding Generation**
  - [ ] Generate embeddings for each chunk (AAL)
  - [ ] Store in knowledge_vectors table
  - [ ] Create IVFFlat index for performance
  - [ ] Test query speed (<50ms for top-k)

- [ ] **Day 4-5: Error Handling**
  - [ ] Handle embedding API failures
  - [ ] Retry logic with exponential backoff
  - [ ] Mark documents as "failed" on permanent error
  - [ ] Add admin view for failed documents

**Deliverables:** Documents vectorized and searchable

---

#### Week 14: Semantic Search Implementation
**Owner:** Backend Lead

- [ ] **Day 1-2: Search API**
  - [ ] Implement POST /api/v1/knowledge/search
  - [ ] Accept query, limit, minRelevanceScore
  - [ ] Generate query embedding
  - [ ] Perform vector search (cosine similarity)
  - [ ] Return top-k results with scores

- [ ] **Day 2-4: Search UI**
  - [ ] Create Knowledge Base page
  - [ ] Add search bar
  - [ ] Display results with relevance scores
  - [ ] Highlight matching text snippets
  - [ ] Add filters (category, tags, date)

- [ ] **Day 4-5: Testing**
  - [ ] Test search accuracy (qualitative)
  - [ ] Test search performance (<100ms P95)
  - [ ] Test with 100+ documents
  - [ ] User testing for relevance

**Deliverables:** Semantic search working, users can find answers

---

#### Week 15: Smart Clipboard (M9)
**Owner:** Full-Stack Engineer

- [ ] **Day 1-2: Local Database**
  - [ ] Setup sqlcipher in Electron
  - [ ] Create templates table
  - [ ] Implement CRUD operations via IPC
  - [ ] Test encryption (cannot read DB without key)

- [ ] **Day 2-4: Template UI**
  - [ ] Create Templates management page
  - [ ] Add create/edit/delete forms
  - [ ] Implement shortcut assignment
  - [ ] Add category selector

- [ ] **Day 4-5: Quick Insertion**
  - [ ] Detect "/" in compose box
  - [ ] Show autocomplete dropdown
  - [ ] Insert template on selection
  - [ ] Track usage stats

**Deliverables:** Smart Clipboard functional, shortcuts working

---

### Week 16-18: Integration Testing & Performance

#### Week 16: E2E Test Coverage
**Owner:** QA Engineer

- [ ] **Critical User Flows**
  - [ ] User registration → workspace creation → invite staff
  - [ ] Connect WhatsApp → receive chat → assign to staff
  - [ ] Staff opens chat → AI suggestion → send message
  - [ ] Admin uploads document → search finds answer
  - [ ] User creates template → uses shortcut
  - [ ] User exports data (GDPR) → receives ZIP

- [ ] **Test Automation (Playwright)**
  - [ ] Setup Playwright test suite
  - [ ] Write test for each flow above
  - [ ] Run tests in CI/CD pipeline
  - [ ] Target: >80% E2E coverage

**Deliverables:** E2E tests passing, coverage >80%

---

#### Week 17: Security Audit
**Owner:** External Security Consultant

- [ ] **Penetration Testing**
  - [ ] OWASP Top 10 testing
  - [ ] SQL injection attempts
  - [ ] XSS/CSRF testing
  - [ ] Authentication bypass attempts
  - [ ] Rate limiting validation

- [ ] **Code Review**
  - [ ] Review E2EE implementation
  - [ ] Review BYOK key encryption
  - [ ] Review RBAC policies
  - [ ] Review input validation

- [ ] **Remediation**
  - [ ] Fix all Critical/High findings
  - [ ] Document Medium/Low findings
  - [ ] Retest after fixes

**Deliverables:** Security audit report, all Critical/High issues resolved

---

#### Week 18: Performance Optimization
**Owner:** Performance Engineer

- [ ] **Backend Optimization**
  - [ ] Add database indexes (review slow queries)
  - [ ] Implement query caching (Redis)
  - [ ] Optimize N+1 queries (use DataLoader)
  - [ ] Add API response caching (15-minute TTL)

- [ ] **Frontend Optimization**
  - [ ] Code splitting (React.lazy)
  - [ ] Image optimization (sharp, WebP)
  - [ ] Bundle size optimization (<500KB main bundle)
  - [ ] Lazy load components

- [ ] **Load Testing**
  - [ ] Use k6 for load testing
  - [ ] Test 100 concurrent users
  - [ ] Test 1000 concurrent users (stretch goal)
  - [ ] Identify bottlenecks

**Deliverables:** P95 API response <100ms, frontend <3s load time

---

### Week 19-21: Beta Launch Preparation

#### Week 19: Onboarding & Documentation
**Owner:** Product Manager

- [ ] **Onboarding Flow**
  - [ ] Create welcome tour (React Joyride)
  - [ ] Add tooltips for key features
  - [ ] Create sample workspace (demo data)
  - [ ] Add "Getting Started" checklist

- [ ] **Documentation**
  - [ ] Write user guide (knowledge base format)
  - [ ] Create video tutorials (Loom)
  - [ ] Write admin guide
  - [ ] Create API documentation (Swagger)

**Deliverables:** Onboarding flow complete, documentation published

---

#### Week 20: Beta User Recruitment
**Owner:** Marketing Lead

- [ ] **Beta Outreach**
  - [ ] Identify 100 potential beta testers
  - [ ] Send personalized invites (email)
  - [ ] Setup beta feedback channels (Discord/Slack)
  - [ ] Prepare beta access codes

- [ ] **Monitoring Setup**
  - [ ] Setup Grafana dashboards
  - [ ] Configure alerting (PagerDuty)
  - [ ] Setup user behavior analytics (Mixpanel)

**Deliverables:** 50 beta teams onboarded

---

#### Week 21: Beta Launch & Monitoring
**Owner:** CTO + Product Manager

- [ ] **Launch Day**
  - [ ] Send beta access to 50 teams
  - [ ] Monitor error rates (Sentry)
  - [ ] Monitor performance (Grafana)
  - [ ] Respond to beta feedback (within 2 hours)

- [ ] **First Week of Beta**
  - [ ] Daily standup with beta feedback review
  - [ ] Hot fix critical bugs (deploy same day)
  - [ ] Collect feature requests
  - [ ] Measure engagement (DAU/MAU)

**Deliverables:** Beta launched, 70% of teams actively using platform

---

## Success Criteria (MVP Beta)

- [ ] **Functionality**: All MUST-HAVE features working
- [ ] **Performance**: API response <100ms (P95), AI suggestion <2s
- [ ] **Reliability**: 99.5% uptime during beta
- [ ] **Security**: 0 Critical/High vulnerabilities
- [ ] **User Satisfaction**: NPS >30 from beta users
- [ ] **WhatsApp Risk**: <5% account suspension rate

---

**Next Phase:** Q2 2026 Public Launch (Weeks 22-33)
- See implementation-documents for M3, M6, M10 specifications

---

**Document Status:** ✅ Complete - Ready for Team Assignment
