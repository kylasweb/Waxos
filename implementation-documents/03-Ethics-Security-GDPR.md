# 03 - Ethics, Security & GDPR Compliance

**Document:** Risk Management & Compliance  
**Version:** 1.0  
**Last Updated:** 2025-11-04

---

## Ethical Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Residual Risk |
|---------|------------------|------------|--------|---------------------|---------------|
| **ETH-001** | WhatsApp ToS violation → permanent account ban | **HIGH (60-80%)** | **CRITICAL** | Humanization Sub-System, user warnings, rate limiting, configurable safety profiles | **MEDIUM (30-40%)** |
| **ETH-002** | PII leakage via insecure storage | Medium (30-40%) | **CRITICAL** | E2EE for notes, sqlcipher for local DB, NeonDB encryption, strict RBAC | **LOW (5-10%)** |
| **ETH-003** | Voice cloning abuse (deepfakes) | Medium (30-40%) | **HIGH** | Mandatory Stripe Identity verification, vocal consent recording, usage audit logs | **LOW (10-15%)** |
| **ETH-004** | XSS attacks via Custom CSS | Medium (25-35%) | **HIGH** | Sandboxed iframe execution, CSP headers, automated security scanning (Snyk) | **LOW (5-10%)** |
| **ETH-005** | Insecure AI-generated code (Foundry) | Low (15-25%) | **HIGH** | Security scans, human review, sandboxed execution | **LOW (5-10%)** |
| **ETH-006** | AI hallucination causing harm | Medium (40-50%) | Medium | Visual labeling, confidence scoring, KB citations, staff training | **LOW (15-20%)** |
| **ETH-007** | Autonomous agents taking harmful actions | Low (20-30%) | **CRITICAL** | Mandatory HITL approval nodes, action whitelisting, rollback capability | **MEDIUM (10-15%)** |
| **ETH-008** | GDPR/Privacy compliance failure | Low (15-25%) | **HIGH** | Data lineage tracking, export/deletion workflows, consent management | **LOW (5-10%)** |
| **ETH-009** | Insider threat (staff data exfiltration) | Low (10-20%) | Medium | Activity logging, export rate limiting, anomaly detection | **LOW (5-10%)** |
| **ETH-010** | Third-party AI provider data leak | Low (10-15%) | Medium | Contractual DPAs, data anonymization, BYOK option | **LOW (5-10%)** |

---

## WhatsApp ToS Mitigation (ETH-001)

### Humanization Sub-System

**Core Features:**
- **Variable Typing Speed**: 3-8 characters/second with 20% random variance
- **Action Delays**:
  - Before typing: 800-2000ms (thinking time)
  - After typing: 500-1500ms (review time)
  - Between messages: 2000-5000ms (natural pace)
- **Typo Simulation**: 3% of messages include typo + correction
- **Mid-Typing Pauses**: 15% chance of 1-3 second pause
- **Read Receipt Delays**: 2-8 seconds before marking read

**Rate Limiting:**
- Max 500 messages/day (conservative)
- Max 50 messages/hour
- Max 5 actions/minute
- 60-minute cooldown after hitting limits

**Safety Profiles:**

| Profile | Messages/Day | Typing Speed | Typo Rate | Risk Level |
|---------|-------------|--------------|-----------|------------|
| **Conservative** | 300 | 3-5 cps | 5% | 🟢 Low |
| **Balanced** (Default) | 500 | 4-7 cps | 3% | 🟡 Medium |
| **Aggressive** | 800 | 6-9 cps | 1% | 🔴 High |

### User Warning (Non-Dismissable Onboarding Modal)

```
⚠️  CRITICAL RISK WARNING - READ CAREFULLY  ⚠️

WAXOS uses automation to interact with WhatsApp Web.
This carries an INHERENT, UNAVOIDABLE RISK of account suspension.

RISKS YOU ACCEPT BY PROCEEDING:
✗ Your WhatsApp account may be TEMPORARILY or PERMANENTLY BANNED
✗ Meta/WhatsApp explicitly PROHIBITS automation in their Terms of Service
✗ WAXOS CANNOT GUARANTEE account safety despite humanization technology
✗ Meta may update detection systems at ANY TIME without notice
✗ Business disruption, customer communication loss, reputational damage

WAXOS DOES NOT PROVIDE:
✗ Any warranty against account suspension
✗ Responsibility for business losses due to bans
✗ Refunds or compensation for lost WhatsApp access

By clicking "I Accept the Risks," you acknowledge:
☐ I have read and fully understand the risks
☐ I accept FULL RESPONSIBILITY for any consequences
☐ I will use WAXOS within safe limits
☐ I understand this is a productivity tool, NOT a guaranteed safe solution

[🚫 Cancel Setup]  [✅ I Accept All Risks and Want to Proceed]
```

**Additional Safety UI:**
- Persistent dashboard banner: "⚠️ AUTOMATION ACTIVE - Account Ban Risk Exists"
- Real-time activity monitor showing usage vs. limits
- Emergency "Pause All Automation" button in header
- Weekly risk reports via email

---

## Data Lineage Map (PII Tracking)

| Data Element | Storage | Encryption | Retention | Access Control | Deletion Method |
|--------------|---------|------------|-----------|----------------|-----------------|
| **Customer Phone** | NeonDB: `contacts.phone` | At-rest (NeonDB AES-256) | Indefinite (user-controlled) | RBAC: Owner, Admin, assigned Staff | Hard delete on contact removal |
| **Chat Messages** | NeonDB: `messages.content` | At-rest | Indefinite | RBAC: Owner, Admin, assigned Staff | Hard delete on chat deletion |
| **Internal Notes** | NeonDB: `chat_notes.encrypted_content` | **E2EE (AES-256 client-side)** | Indefinite | **Only creating staff member** | Hard delete (Admin cannot decrypt) |
| **Clipboard Templates** | Local SQLite: `templates.content` | **sqlcipher (AES-256)** | Until local deletion | **Local device only** | Local DB record deletion |
| **BYOK API Keys** | Local SQLite: `byok_keys.encrypted_api_key` | **sqlcipher + AES-256-GCM** | Until revoked | **Local device only** | Secure wipe on deletion |
| **Voice Clone Models** | Cloudflare R2: `voice-models/{userId}/` | At-rest + TLS | Until deleted | **User-specific only** | R2 object deletion |
| **KB Documents** | Cloudflare R2 + NeonDB | At-rest + TLS | Until deleted | RBAC: Owner, Admin | R2 + DB cascade delete |
| **AI Interaction Logs** | NeonDB: `ai_interactions.metadata` | At-rest | **90 days (auto-purge)** | RBAC: Owner only (audit) | Automatic cron deletion |

---

## GDPR Compliance

### Right to Access (Article 15)

**User-Facing "Export My Data" Feature:**
1. User clicks "Export My Data" in Settings
2. Backend generates encrypted ZIP containing:
   - All chats, contacts, notes, templates
   - AI interaction history (metadata only)
   - Account activity logs
3. ZIP delivered via secure presigned URL (expires 48 hours)
4. Email sent with download link + password
5. Logged in `gdpr_requests` table

**Processing Time:** <5 minutes for typical user

---

### Right to Erasure (Article 17)

**"Delete My Account" Workflow:**
1. User initiates deletion
2. **30-day grace period** (can cancel anytime)
3. Warning shown: "All data will be permanently deleted"
4. After 30 days, automatic hard deletion:
   - NeonDB: Cascading delete on `users` table
   - R2: Delete all user files
   - Pusher: Revoke all active sessions
   - Audit logs: Anonymize (replace user ID with `DELETED_USER`)
5. Final confirmation email sent

---

### Consent Management

**Granular Consent Toggles (Settings Page):**
- [ ] Allow AI processing of my chat data
- [ ] Allow analytics/performance monitoring
- [ ] Allow voice clone model training
- [ ] Receive marketing emails
- [ ] Share activity data with workspace admins

**Implementation:**
- All changes logged in `consent_log` table (timestamp, IP, user agent)
- Consent withdrawal immediately stops affected processing
- Historical consent changes auditable by Owner

---

## Voice Cloning Protection (ETH-003)

### Identity Verification Workflow (Stripe Identity)

```
1. User navigates to Settings → AI Co-pilot → Personal Voice Cloning
2. System checks: users.identity_verified_at
   - If NULL → Proceed to verification
   - If verified → Skip to step 5
3. Redirect to Stripe Identity verification session
4. User uploads government ID + takes selfie (liveness check)
5. Stripe validates ID authenticity + face match
6. Webhook sent to WAXOS backend
7. Backend updates: users.identity_verified_at = NOW()
8. User records "vocal signature" consent:
   - Reads legal disclosure aloud (30 seconds)
   - Recording uploaded to R2 with SHA-256 hash
9. Voice model training begins (via Bytez API)
10. All usage logged in voice_clone_usage_log table
```

**Admin Oversight:**
- M6 Analytics Dashboard includes "Voice Clone Activity" report
- Shows: Total uses, recipients, timestamps, playback links
- Admin can disable user's voice clone access if abuse detected

---

## Security Testing Plan

### Penetration Testing (Pre-Launch)

**External Audit (Week 17):**
- OWASP Top 10 testing
- SQL injection attempts
- XSS/CSRF testing
- Authentication bypass attempts
- Rate limiting validation
- File upload vulnerability testing

**Tools:**
- Burp Suite Professional
- OWASP ZAP
- Nmap for port scanning
- SQLMap for injection testing

**Expected Findings:** <5 Medium severity issues, 0 Critical/High

---

### Ongoing Security Monitoring

**Real-Time Alerts (Sentry):**
- Failed authentication attempts (>5 in 5 minutes)
- Unusual data export volumes
- Unexpected API endpoints accessed
- Database query anomalies

**Monthly Security Reviews:**
- Dependency vulnerability scanning (Snyk)
- Access log analysis
- Privilege escalation checks
- Third-party integration audits

---

## Data Processing Agreements (DPAs)

### Sub-Processors

| Service | Purpose | Data Processed | DPA Status | Data Location |
|---------|---------|----------------|------------|---------------|
| **Render.com** | Backend hosting | All application data | ✅ Signed | US (Oregon) |
| **Neon.tech** | Database | All application data | ✅ Signed | US (multi-region) |
| **Cloudflare** | File storage, CDN | Files, media | ✅ Signed | Global (edge) |
| **Pusher** | Real-time events | Metadata only | ✅ Signed | US (Virginia) |
| **Bytez.com** | AI processing | Chat context (anonymized) | ✅ Signed | US |
| **Stripe** | Identity verification | Government ID (temporary) | ✅ Signed | US |

**Enterprise Customers:**
- Custom DPA provided upon request
- Can specify data residency requirements
- Can request on-premise deployment (future)

---

## Compliance Checklist

### Pre-Launch (Week 18)
- [ ] GDPR compliance review by external consultant
- [ ] Privacy policy updated and reviewed by lawyer
- [ ] Terms of Service finalized
- [ ] Cookie consent banner implemented (EU users)
- [ ] Data retention policies documented
- [ ] Breach notification procedure established
- [ ] GDPR representative appointed (if EU users)

### Ongoing (Monthly)
- [ ] Review consent log for patterns
- [ ] Audit data deletion requests (completion time)
- [ ] Update sub-processor list if changed
- [ ] Review security incidents
- [ ] Update risk register

---

**Document Status:** ✅ Complete - Legal Review Pending
