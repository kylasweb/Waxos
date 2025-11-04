# 01 - MVP Roadmap & User Stories

**Document:** Strategic Planning - MVP Roadmap  
**Version:** 1.0  
**Last Updated:** 2025-11-04

---

## Table of Contents
1. [Epic Breakdown](#epic-breakdown)
2. [Production-Ready User Stories](#production-ready-user-stories)
3. [MoSCoW Prioritization](#moscow-prioritization)
4. [Phased Release Timeline](#phased-release-timeline)

---

## Epic Breakdown

### [Epic-001: Core Platform Foundation]
**Goal:** Establish secure, scalable foundation for all features

**Components:**
- Neon Auth integration (login, registration, JWT token management)
- Workspace & multi-tenant architecture
- Role-Based Access Control (Owner, Admin, Staff)
- Electron shell with auto-updater
- Backend API Gateway (NestJS on Render)
- PostgreSQL Row-Level Security (RLS) for tenant isolation

**Acceptance Criteria:**
- [ ] User can register and create workspace
- [ ] User can log in and session persists across app restarts
- [ ] RBAC enforces permissions at database and API level
- [ ] Electron app auto-updates without user intervention

---

### [Epic-002: Team Inbox (M1)]
**Goal:** Collaborative WhatsApp chat management

**Components:**
- WhatsApp Web integration layer (Puppeteer/Playwright)
- Chat assignment & routing engine
- Real-time chat synchronization via Pusher
- Folder system (My Chats, Unassigned, Archived)
- Internal notes with End-to-End Encryption (E2EE)
- Message threading & full-text search

**Acceptance Criteria:**
- [ ] Admin can connect WhatsApp account via QR code
- [ ] Staff sees assigned chats in "My Chats" folder
- [ ] Admin can assign/reassign chats with reason tracking
- [ ] Messages sync in real-time (<500ms latency)
- [ ] Internal notes are E2EE (only creator can decrypt)

---

### [Epic-003: AI Co-pilot (M4)]
**Goal:** AI-powered chat assistance with knowledge base integration

**Components:**
- AI Abstraction Layer (AAL) backend service
- Multi-provider routing: Bytez → OpenRouter → Groq → Gemini
- Contextual reply suggestions with RAG
- Sentiment analysis engine
- Voice cloning with mandatory identity verification (Stripe Identity)
- BYOK mode via Puter.js

**Acceptance Criteria:**
- [ ] AI suggestion appears within 2 seconds of opening chat
- [ ] Suggestion includes confidence score and KB sources
- [ ] Fallback to next provider if primary fails (< 5s total)
- [ ] Voice cloning requires verified ID before activation
- [ ] BYOK users can use own API keys (Puter.js integration)

---

### [Epic-004: Knowledge Base (M7)]
**Goal:** Semantic search over company documents

**Components:**
- Vector database using NeonDB pg_vector extension
- Document ingestion pipeline (PDF, DOCX, TXT, MD)
- Text chunking & embedding generation
- Semantic search with cosine similarity
- RAG integration with AI Co-pilot
- Knowledge Base UI with category management

**Acceptance Criteria:**
- [ ] Admin can upload documents (max 50MB)
- [ ] Document processed and vectorized within 2 minutes
- [ ] Semantic search returns relevant results (>0.7 similarity)
- [ ] AI suggestions cite KB sources when used
- [ ] Failed processing shows clear error message

---

### [Epic-005: Smart Clipboard (M9)]
**Goal:** Encrypted local template management

**Components:**
- Local SQLite database with sqlcipher encryption
- Template management system (CRUD operations)
- Quick insertion via slash commands (/greeting, /refund)
- Optional encrypted cloud sync
- Template categorization & usage analytics

**Acceptance Criteria:**
- [ ] User can create templates with shortcuts
- [ ] Typing /shortcut inserts template
- [ ] Templates stored encrypted locally (sqlcipher)
- [ ] Usage stats show most-used templates
- [ ] Templates sync across devices (optional)

---

## Production-Ready User Stories

### Authentication & Onboarding

```
[US-001] Staff Authentication
As a Staff user
I want to log in using my email and password via Neon Auth
So that I can securely access my team's workspace

Acceptance Criteria:
✓ Login form validates email format (RFC 5322 compliant)
✓ Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special character
✓ Password strength indicator (weak/medium/strong)
✓ Successful login redirects to Team Inbox dashboard
✓ Failed login shows specific errors: "Invalid credentials", "Account locked", "Too many attempts"
✓ Session persists across Electron app restarts (refresh token stored in secure storage)
✓ Logout clears all local data and revokes tokens on backend
✓ "Remember me" checkbox extends session to 30 days (vs 24 hours default)

Technical Implementation:
- Frontend: React Hook Form + Zod schema validation
- Backend: Neon Auth JWT verification middleware
- Storage: Electron safeStorage API for token encryption
- Rate Limiting: 5 failed attempts per 15 minutes per IP → account lockout
- Security: CSRF protection, secure cookies (httpOnly, sameSite=strict)

Definition of Done:
□ Unit tests cover validation logic
□ Integration test simulates successful login flow
□ Security test verifies token cannot be stolen via XSS
□ Performance test: login completes in <1 second
```

---

```
[US-002] Chat Assignment by Admin
As an Admin
I want to assign incoming WhatsApp chats to specific staff members
So that workload is distributed efficiently and SLAs are met

Acceptance Criteria:
✓ Admin sees "Unassigned" folder with count badge (e.g., "Unassigned (12)")
✓ Chats sorted by: Most recent first (default), Priority, Waiting time
✓ Drag-and-drop chat onto staff member in sidebar to assign
✓ Alternative: Right-click chat → "Assign to" → dropdown with staff list
✓ Assigned chat disappears from Admin's Unassigned, appears in Staff's "My Chats"
✓ Real-time notification to assigned staff: "New chat assigned: [Contact Name]"
✓ Desktop notification if Electron app is minimized
✓ Assignment logged: who assigned, to whom, timestamp, previous assignee (if reassigned)
✓ Can reassign chat to different staff member (logs reason if provided)
✓ Bulk assign: Select multiple chats → Assign all to one staff member

Technical Implementation:
- Frontend: react-beautiful-dnd library for drag-drop
- Backend: POST /api/v1/chats/:id/assign { userId, reason? }
- Real-time: Pusher event on private-user-{userId} channel: "chat.assigned"
- Database: chat_assignments table with history tracking
- Optimistic UI: Immediate local state update, rollback on API error
- Validation: Cannot assign to staff with "Away" status or >50 active chats

Definition of Done:
□ E2E test covers drag-drop assignment flow
□ Test reassignment creates audit trail
□ Test bulk assign handles partial failures gracefully
□ Notification delivery confirmed via Pusher test
```

---

```
[US-003] AI Reply Suggestion with RAG
As a Staff user
I want to see AI-generated reply suggestions when I open a chat
So that I can respond faster with accurate, knowledge-based answers

Acceptance Criteria:
✓ AI suggestion appears within 2 seconds of opening chat (or shows loading state)
✓ Suggestion has visual distinction: purple left border + "✨ Generated by WAXOS AI" badge
✓ Three action buttons: "Accept" (insert to compose box), "Edit" (open in compose), "Dismiss"
✓ Suggestion considers: Last 10 messages in chat + top 3 relevant KB articles (similarity >0.7)
✓ Tone selector: Professional, Friendly, Concise, Empathetic (default: Professional)
✓ Confidence score displayed: 
  - 🟢 High (>80%): "Ready to send"
  - 🟡 Medium (60-80%): "Review recommended"
  - 🔴 Low (<60%): "⚠️ Low confidence - verify before sending"
✓ If RAG used, show expandable "Sources" section citing KB articles with links
✓ Keyboard shortcut: Ctrl+Enter accepts suggestion, Esc dismisses
✓ If user starts typing manually, suggestion auto-dismisses

Technical Implementation:
- Backend: POST /api/v1/ai/reply-suggestion
  Request: { chatId, tone, maxTokens: 150 }
  Response: { suggestion, confidence, sources[], provider, tokensUsed }
- AAL Fallback Chain: 
  1. Bytez (gpt-4-turbo) - Primary
  2. OpenRouter (claude-3-sonnet) - If Bytez fails
  3. Groq (llama-3-70b) - If OpenRouter fails
  4. Gemini (gemini-pro) - Last resort
- RAG Pipeline:
  1. Extract chat context (last 10 messages)
  2. Generate query embedding from context
  3. Vector search in knowledge_vectors (cosine similarity, top 3 results)
  4. Inject KB content into system prompt
  5. Call AI provider via AAL
- Frontend: React Query for caching, skeleton loader during fetch
- BYOK Mode: If enabled, use Puter.js directly (bypasses AAL)

Definition of Done:
□ Unit test mocks AAL and verifies fallback chain
□ Integration test validates RAG retrieves correct KB articles
□ Performance test ensures <2s response time (95th percentile)
□ A/B test compares suggestion acceptance rate with/without RAG
□ Security test confirms no PII leakage in AI provider logs
```

---

## MoSCoW Prioritization

### MUST-HAVE (MVP - Q1 2026 Beta)

| Feature | Module | Effort (Weeks) | Dependencies |
|---------|--------|----------------|--------------|
| Authentication & RBAC | Core | 2 | Neon Auth setup |
| Workspace Management | Core | 2 | PostgreSQL RLS |
| Electron Shell | Core | 3 | Next.js static build |
| Team Inbox | M1 | 4 | WhatsApp automation |
| Contact Management | M2 | 2 | - |
| AI Reply Suggestions | M4 | 3 | AAL, Knowledge Base |
| Knowledge Base | M7 | 3 | pg_vector extension |
| Smart Clipboard | M9 | 2 | sqlcipher |
| **Total** | | **21 weeks** | |

**Critical Path:** Core Platform → Team Inbox → AI Co-pilot → Knowledge Base

---

### SHOULD-HAVE (v1.1 - Q2 2026 Public Launch)

| Feature | Module | Effort (Weeks) | Impact |
|---------|--------|----------------|--------|
| Auto-Responders | M3 | 3 | High - automation |
| Analytics Dashboard | M6 | 3 | High - business insights |
| Conductor Workflows | M10 | 4 | High - advanced automation |
| Multi-Device WhatsApp | Core | 2 | Medium - convenience |
| **Total** | | **12 weeks** | |

---

### COULD-HAVE (v1.2 - Q3 2026)
- M5: Developer Suite (custom CSS, scripting) - 4 weeks
- M11: E-commerce Integration (Shopify sync) - 3 weeks
- M12: Marketing Automation (broadcasts) - 4 weeks

---

### WON'T-HAVE (v2.0 - Q4 2026+)
- M13: Foundry (generative UI) - 6 weeks
- M14: Voice Navigation - 4 weeks
- M15: Autonomous Agents - 8 weeks

---

## Phased Release Timeline

### Q1 2026: MVP BETA (Weeks 1-21)

#### Sprint 1 (Weeks 1-3): Core Platform + Neon Auth + Electron Setup
**Deliverables:**
- ✅ User registration, login, logout
- ✅ Workspace creation & team invites
- ✅ Electron app shell with auto-updater
- ✅ Backend API Gateway (NestJS) on Render
- ✅ NeonDB provisioned with RLS policies

**Milestones:**
- Week 1: Infrastructure provisioning (Render, NeonDB, R2, Pusher)
- Week 2: Backend scaffolding + Auth endpoints
- Week 3: Electron + Next.js integration + first E2E test

---

#### Sprint 2 (Weeks 4-7): M1 Team Inbox + WhatsApp Automation
**Deliverables:**
- ✅ WhatsApp Web session management (QR code login)
- ✅ Chat synchronization & folder system
- ✅ Humanization sub-system (typing delays, jitter, rate limiting)
- ✅ Internal notes with E2EE
- ✅ Real-time updates via Pusher

**Milestones:**
- Week 4: WhatsApp automation POC (Puppeteer)
- Week 5: Humanization engine (typing simulation, delays)
- Week 6: Chat assignment & routing
- Week 7: E2EE notes implementation + testing

---

#### Sprint 3 (Weeks 8-11): M2 Contacts + M4 AI Co-pilot
**Deliverables:**
- ✅ Contact management UI (CRUD, tags, search)
- ✅ AI Abstraction Layer backend (multi-provider routing)
- ✅ Reply suggestions with RAG
- ✅ Sentiment analysis

**Milestones:**
- Week 8: Contact management API + UI
- Week 9: AAL implementation (Bytez, OpenRouter, Groq, Gemini)
- Week 10: RAG pipeline (vector search + prompt injection)
- Week 11: AI suggestion UI + A/B testing

---

#### Sprint 4 (Weeks 12-15): M7 Knowledge Base + M9 Clipboard
**Deliverables:**
- ✅ Document upload & processing (PDF, DOCX extraction)
- ✅ Vector embeddings generation (pg_vector)
- ✅ Semantic search API
- ✅ Local template management (sqlcipher encrypted)

**Milestones:**
- Week 12: Document ingestion pipeline (text extraction)
- Week 13: Embedding generation + vector storage
- Week 14: Semantic search implementation
- Week 15: Smart Clipboard UI + shortcuts

---

#### Sprint 5 (Weeks 16-18): Integration & Testing
**Deliverables:**
- ✅ End-to-end testing suite (Playwright)
- ✅ Security penetration testing
- ✅ Performance optimization (target: <100ms API response)
- ✅ Load testing (1000 concurrent users)

**Milestones:**
- Week 16: E2E test coverage >80%
- Week 17: Security audit (external consultant)
- Week 18: Performance tuning + caching optimization

---

#### Sprint 6 (Weeks 19-21): Beta Launch Prep
**Deliverables:**
- ✅ Beta user onboarding flow
- ✅ Documentation & video tutorials
- ✅ Beta invitations to 50 selected teams
- ✅ Monitoring dashboards (Grafana/Prometheus)

**Milestones:**
- Week 19: Onboarding UI + tutorial videos
- Week 20: Beta invites sent + support channels setup
- Week 21: Beta launch + real-time monitoring

---

### Q2 2026: v1.1 PUBLIC LAUNCH (Weeks 22-33)

#### Sprint 7 (Weeks 22-24): M3 Auto-Responders
**Deliverables:**
- ✅ Keyword-based triggers
- ✅ Time-delayed responses
- ✅ Contact tag-based rules
- ✅ Auto-responder management UI

---

#### Sprint 8 (Weeks 25-27): M6 Analytics Dashboard
**Deliverables:**
- ✅ Real-time metrics (chat volume, response time)
- ✅ Staff performance leaderboard
- ✅ AI usage tracking & cost attribution
- ✅ Exportable reports (CSV, Excel)

---

#### Sprint 9 (Weeks 28-31): M10 Conductor Workflows
**Deliverables:**
- ✅ Visual workflow builder (ReactFlow)
- ✅ Basic nodes: Trigger, Condition, Action, Delay
- ✅ BullMQ job queue for execution
- ✅ Workflow execution audit trail

---

#### Sprint 10 (Weeks 32-33): Public Launch
**Deliverables:**
- ✅ Marketing site & pricing page
- ✅ Stripe subscription integration
- ✅ Public launch announcement (Product Hunt, etc.)
- ✅ Customer support system (Zendesk/Intercom)

---

### Q3 2026: v1.2 FEATURE EXPANSION (Weeks 34-45)
- M5: Developer Suite (custom CSS, embedded scripting)
- M11: E-commerce Integration (Shopify, WooCommerce sync)
- M12: Marketing Automation (broadcast campaigns, A/B testing)
- Community feature requests

---

### Q4 2026+: v2.0 ADVANCED AI (Weeks 46+)
- M13: Foundry (generative UI builder)
- M14: Voice Navigation (hands-free operation)
- M15: Autonomous Agent Foundry (complex multi-step AI agents)
- Platform expansion (Instagram, Telegram, Messenger)

---

## Success Metrics (KPIs)

### MVP Beta (Q1 2026)
- **User Acquisition**: 50 beta teams onboarded
- **Engagement**: 70% DAU/MAU ratio
- **Performance**: <2s AI suggestion response time (P95)
- **Reliability**: 99.5% uptime
- **WhatsApp Risk**: <5% account suspension rate

### Public Launch (Q2 2026)
- **User Acquisition**: 500 paid teams
- **Revenue**: $50K MRR
- **Churn**: <10% monthly churn rate
- **NPS**: >40
- **AI Cost per User**: <$5/month

### v1.2 (Q3 2026)
- **User Acquisition**: 2000 paid teams
- **Revenue**: $200K MRR
- **Feature Adoption**: >50% use Conductor workflows
- **Enterprise Customers**: 20+ teams on Enterprise plan

---

**Document Status:** ✅ Complete - Ready for Implementation
