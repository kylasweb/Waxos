# Pusher Integration Design

## Overview

Integrate Pusher real-time messaging service into the WAXOS backend to enable WebSocket-based real-time communication between the server and clients. This integration supports critical features including real-time chat updates, message status synchronization, and system notifications.

## Objectives

1. Configure Pusher service with provided credentials in the backend application
2. Create a reusable Pusher service module for event publishing
3. Enable environment-based configuration management for Pusher credentials
4. Establish the foundation for real-time features outlined in the system architecture

## Technical Context

### Current State

- Backend built with NestJS and TypeScript
- Environment configuration uses Joi validation schema
- Validation schema already includes Pusher configuration fields:
  - PUSHER_APP_ID (required)
  - PUSHER_KEY (required)
  - PUSHER_SECRET (required)
  - PUSHER_CLUSTER (required)
- Current `.env` file contains placeholder test credentials

### Provided Credentials

| Parameter | Value |
|-----------|-------|
| App ID | 2073332 |
| Key | f509dea7753e0f72661c |
| Secret | 0083304811c598fd5253 |
| Cluster | ap2 |

## Design Decisions

### Module Architecture

The integration will follow NestJS modular architecture patterns:

- Create a dedicated `PusherModule` in the shared services directory
- Provide a `PusherService` as a global singleton service
- Inject ConfigService to retrieve environment variables
- Export the service for use across other modules

### Configuration Strategy

- Update the `.env` file with the provided production credentials
- Leverage existing Joi validation to ensure required fields are present
- Use ConfigService to retrieve configuration at runtime
- Support future environment-specific configurations (development, staging, production)

## Implementation Requirements

### 1. Package Dependencies

Add the official Pusher Node.js server SDK to the project dependencies.

**Package Name:** `pusher`

**Installation Context:** Production dependency for backend real-time communication

### 2. Environment Configuration Update

Update the `.env` file with the provided Pusher credentials:

| Variable | Current Value | New Value |
|----------|--------------|-----------|
| PUSHER_APP_ID | test | 2073332 |
| PUSHER_KEY | test | f509dea7753e0f72661c |
| PUSHER_SECRET | test | 0083304811c598fd5253 |
| PUSHER_CLUSTER | us2 | ap2 |

### 3. Pusher Service Module

Create a new service module at: `src/shared/services/pusher/`

#### Module Structure

```
src/shared/services/pusher/
├── pusher.module.ts
└── pusher.service.ts
```

#### Service Responsibilities

The PusherService should provide the following capabilities:

**Event Publishing**
- Publish events to specific channels with data payloads
- Support both public and private channel types
- Handle authentication for private/presence channels

**Channel Management**
- Trigger events on single or multiple channels
- Support channel name validation
- Provide methods for batch event publishing

**Connection Configuration**
- Initialize Pusher client with environment credentials
- Configure cluster-based endpoint
- Enable/disable encrypted connections based on environment

**Error Handling**
- Catch and log Pusher API errors
- Provide graceful fallbacks for real-time features
- Return success/failure status for event publishing operations

#### Service Interface Design

The service should expose the following methods:

| Method | Purpose | Parameters | Return Type |
|--------|---------|-----------|-------------|
| trigger | Publish event to a channel | channel: string, event: string, data: object | Promise with success status |
| triggerBatch | Publish multiple events | events: Array of event objects | Promise with success status |
| authenticatePrivateChannel | Generate auth signature for private channels | socketId: string, channel: string | Authentication token |
| authenticatePresenceChannel | Generate auth signature for presence channels | socketId: string, channel: string, userData: object | Authentication token |

### 4. Module Registration

Register the PusherModule as a global module in the application:

- Import PusherModule in the root AppModule
- Mark the module as global to avoid repeated imports
- Export PusherService for dependency injection across feature modules

### 5. Configuration Validation

The existing validation schema already enforces Pusher configuration requirements. No changes needed to the validation schema.

## Integration Points

### Future Usage Scenarios

Once implemented, the PusherService will be consumed by:

**Chat Module** (Week 6 implementation)
- Publish `message.new` events when messages are created
- Publish `message.status` events for delivery/read receipts
- Publish `chat.assigned` events when chats are assigned to staff

**Real-Time Updates** (M1 - Team Inbox)
- Broadcast chat assignment changes
- Notify staff of new incoming messages
- Update message statuses across connected clients

**AI Suggestion Notifications** (M4 - AI Co-pilot)
- Push AI-generated suggestions to staff interfaces
- Notify when suggestion generation completes

**System Notifications** (Cross-cutting)
- Broadcast system-wide announcements
- Push workspace-level notifications
- Trigger UI updates without polling

## Event Naming Convention

Establish a consistent event naming pattern for future implementations:

**Format:** `resource.action`

**Examples:**
- `message.new` - New message created
- `message.updated` - Message content or status changed
- `message.deleted` - Message removed
- `chat.assigned` - Chat assigned to staff member
- `chat.unassigned` - Chat assignment removed
- `user.online` - User connection status changed
- `notification.system` - System-wide notification

## Channel Naming Strategy

Define channel naming conventions to support multi-tenancy:

**Format:** `workspace-{workspaceId}.{resource}`

**Examples:**
- `workspace-123.chats` - All chat events for workspace 123
- `workspace-123.notifications` - Workspace-level notifications
- `private-user-456` - Private channel for specific user
- `presence-workspace-123` - Presence channel showing online users

## Security Considerations

### Credential Protection

- Store Pusher credentials exclusively in environment variables
- Never commit credentials to version control
- Use different credentials for development, staging, and production environments

### Channel Authentication

- Implement server-side authentication for private channels
- Validate workspace ownership before allowing channel subscriptions
- Prevent unauthorized access to other workspace channels

### Data Transmission

- Avoid sending sensitive data through Pusher events
- Send only identifiers and metadata; fetch full data via authenticated API
- Consider end-to-end encryption requirements for compliance

## Testing Strategy

### Unit Testing

- Mock Pusher client in service unit tests
- Test event payload formatting
- Verify error handling for failed publish operations
- Test configuration initialization

### Integration Testing

- Verify events are successfully published to Pusher
- Test channel authentication workflows
- Validate event delivery to subscribed clients
- Test fallback behavior when Pusher is unavailable

### Manual Verification

- Use Pusher Debug Console to observe published events
- Subscribe to test channels from the Pusher dashboard
- Verify event payloads match expected formats

## Rollout Plan

### Phase 1: Service Setup (Current Task)

- Install Pusher SDK dependency
- Update environment configuration with production credentials
- Create PusherModule and PusherService
- Register module globally in AppModule
- Verify service initialization and configuration

### Phase 2: Testing and Validation

- Write unit tests for PusherService
- Test event publishing to Pusher debug console
- Validate authentication token generation
- Document service usage patterns

### Phase 3: Feature Integration (Week 6+)

- Integrate with Chat module for message events
- Implement private channel authentication
- Add workspace-level event broadcasting
- Monitor event delivery performance

## Success Criteria

- Pusher SDK successfully installed and configured
- PusherService initializes without errors on application startup
- Environment variables correctly loaded via ConfigService
- Service can publish test events visible in Pusher debug console
- Module is globally available for dependency injection
- No breaking changes to existing application functionality

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Pusher service unavailable | Real-time features fail | Implement fallback polling mechanism; log errors gracefully |
| Incorrect credentials | Service initialization fails | Validate credentials during startup; fail fast with clear error messages |
| Rate limiting | Event publishing throttled | Implement event batching; monitor usage against plan limits |
| Network latency | Delayed event delivery | Set appropriate timeout configurations; monitor event delivery metrics |

## Performance Considerations

### Event Volume Estimation

Based on system architecture (Week 6 implementation):
- Peak concurrent users: 50 beta teams × 5 staff = 250 users
- Average messages per user per day: 100
- Peak messages per second: ~1-2 messages/second

### Pusher Plan Requirements

Current credentials suggest a production-tier Pusher plan. Verify plan includes:
- Sufficient concurrent connections (250+ for beta)
- Adequate message volume (25,000+ messages/day)
- Required features (private channels, presence channels)

### Optimization Strategies

- Batch events where possible to reduce API calls
- Implement client-side debouncing for rapid event sequences
- Use presence channels efficiently (avoid unnecessary subscriptions)
- Monitor connection count and message volume

## Documentation Requirements

### Developer Documentation

Create developer guide covering:
- How to publish events using PusherService
- Channel naming conventions
- Event payload structure guidelines
- Authentication implementation for private channels

### API Documentation

Document the following for future API endpoints:
- POST /api/v1/pusher/auth (private channel authentication)
- POST /api/v1/pusher/presence-auth (presence channel authentication)

## Dependencies

### Prerequisites

- NestJS application running successfully
- ConfigModule configured with environment validation
- Valid Pusher account with provided credentials

### Blocking Dependencies

None - this is a foundational service that enables future features

### Dependent Features

The following features depend on this integration:
- M1 Team Inbox (Week 6) - Real-time chat updates
- M4 AI Co-pilot (Week 11) - AI suggestion notifications
- Real-time message status synchronization
- Workspace-level notifications

## Monitoring and Observability

### Metrics to Track

- Event publish success/failure rate
- Event delivery latency
- Connection count by workspace
- API call volume to Pusher
- Error rates and types

### Logging Requirements

Log the following events:
- Service initialization with configuration summary
- Successful event publications (debug level)
- Failed event publications (error level with full context)
- Authentication token generation (debug level)
- Rate limit warnings

### Alerting

Configure alerts for:
- Pusher service initialization failures
- Event publish failure rate >5%
- Connection count approaching plan limits
- Unusual error patterns

## Compliance and Privacy

### Data Handling

- Pusher events should contain minimal personally identifiable information
- Use entity IDs and timestamps; avoid message content in event payloads
- Client applications fetch full data via authenticated API calls

### GDPR Considerations

- Pusher is a data processor; ensure DPA (Data Processing Agreement) is in place
- Transient event data automatically expires (not stored by Pusher)
- No special GDPR considerations beyond standard API data handling

## Future Enhancements

### Potential Improvements

- Implement WebHook endpoints for Pusher events (user presence tracking)
- Add support for encrypted private channels
- Implement message queuing for offline users
- Create admin dashboard for monitoring Pusher usage
- Implement automatic failover to alternative real-time providers
