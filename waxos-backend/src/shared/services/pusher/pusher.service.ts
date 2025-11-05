import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher = require('pusher');

/**
 * PusherService provides real-time messaging capabilities using Pusher WebSocket service.
 * 
 * This service enables:
 * - Publishing events to channels
 * - Batch event publishing
 * - Private channel authentication
 * - Presence channel authentication
 * 
 * Channel naming convention: workspace-{workspaceId}.{resource}
 * Event naming convention: {resource}.{action}
 */
@Injectable()
export class PusherService implements OnModuleInit {
  private readonly logger = new Logger(PusherService.name);
  private pusherClient!: InstanceType<typeof Pusher>;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize Pusher client on module startup
   */
  onModuleInit() {
    try {
      const appId = this.configService.get<string>('PUSHER_APP_ID')!;
      const key = this.configService.get<string>('PUSHER_KEY')!;
      const secret = this.configService.get<string>('PUSHER_SECRET')!;
      const cluster = this.configService.get<string>('PUSHER_CLUSTER')!;

      this.pusherClient = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });

      this.logger.log(
        `✅ Pusher initialized successfully (App ID: ${appId}, Cluster: ${cluster})`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to initialize Pusher', error);
      throw error;
    }
  }

  /**
   * Publish an event to a specific channel
   * 
   * @param channel - Channel name (e.g., "workspace-123.chats")
   * @param event - Event name (e.g., "message.new")
   * @param data - Event payload
   * @returns Promise indicating success/failure
   * 
   * @example
   * await pusherService.trigger(
   *   'workspace-123.chats',
   *   'message.new',
   *   { messageId: '456', content: 'Hello' }
   * );
   */
  async trigger(
    channel: string,
    event: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      await this.pusherClient.trigger(channel, event, data);
      
      this.logger.debug(
        `📤 Event published: ${event} to channel ${channel}`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish event ${event} to channel ${channel}`,
        error,
      );
      return false;
    }
  }

  /**
   * Publish multiple events in a single batch
   * Reduces API calls and improves performance
   * 
   * @param events - Array of event objects
   * @returns Promise indicating success/failure
   * 
   * @example
   * await pusherService.triggerBatch([
   *   { channel: 'workspace-123.chats', name: 'message.new', data: {...} },
   *   { channel: 'workspace-123.notifications', name: 'notification.system', data: {...} }
   * ]);
   */
  async triggerBatch(
    events: Array<{
      channel: string;
      name: string;
      data: Record<string, any>;
    }>,
  ): Promise<boolean> {
    try {
      await this.pusherClient.triggerBatch(events);
      
      this.logger.debug(
        `📤 Batch published: ${events.length} events`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish batch of ${events.length} events`,
        error,
      );
      return false;
    }
  }

  /**
   * Generate authentication token for private channels
   * 
   * Private channels are prefixed with "private-" and require server-side authentication
   * 
   * @param socketId - Unique socket connection ID from client
   * @param channel - Channel name (must start with "private-")
   * @returns Authentication signature
   * 
   * @example
   * const auth = pusherService.authenticatePrivateChannel(
   *   'socket-id-123',
   *   'private-user-456'
   * );
   * // Returns: { auth: "key:signature" }
   */
  authenticatePrivateChannel(
    socketId: string,
    channel: string,
  ): { auth: string } {
    try {
      const auth = this.pusherClient.authorizeChannel(socketId, channel);
      
      this.logger.debug(
        `🔐 Private channel authenticated: ${channel}`,
      );
      
      return auth;
    } catch (error) {
      this.logger.error(
        `❌ Failed to authenticate private channel ${channel}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate authentication token for presence channels
   * 
   * Presence channels are prefixed with "presence-" and show which users are subscribed
   * 
   * @param socketId - Unique socket connection ID from client
   * @param channel - Channel name (must start with "presence-")
   * @param userData - User information to be shared with other channel subscribers
   * @returns Authentication signature with user data
   * 
   * @example
   * const auth = pusherService.authenticatePresenceChannel(
   *   'socket-id-123',
   *   'presence-workspace-456',
   *   { id: '789', name: 'John Doe', role: 'staff' }
   * );
   * // Returns: { auth: "key:signature", channel_data: "{...}" }
   */
  authenticatePresenceChannel(
    socketId: string,
    channel: string,
    userData: { id: string; [key: string]: any },
  ): { auth: string; channel_data?: string } {
    try {
      const presenceData = {
        user_id: userData.id,
        user_info: userData,
      };

      const auth = this.pusherClient.authorizeChannel(
        socketId,
        channel,
        presenceData,
      );
      
      this.logger.debug(
        `🔐 Presence channel authenticated: ${channel} for user ${userData.id}`,
      );
      
      return auth;
    } catch (error) {
      this.logger.error(
        `❌ Failed to authenticate presence channel ${channel}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get the underlying Pusher client instance
   * Use with caution - prefer using the service methods
   * 
   * @returns Pusher client instance
   */
  getClient(): InstanceType<typeof Pusher> {
    return this.pusherClient;
  }
}
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher = require('pusher');

/**
 * PusherService provides real-time messaging capabilities using Pusher WebSocket service.
 * 
 * This service enables:
 * - Publishing events to channels
 * - Batch event publishing
 * - Private channel authentication
 * - Presence channel authentication
 * 
 * Channel naming convention: workspace-{workspaceId}.{resource}
 * Event naming convention: {resource}.{action}
 */
@Injectable()
export class PusherService implements OnModuleInit {
  private readonly logger = new Logger(PusherService.name);
  private pusherClient!: InstanceType<typeof Pusher>;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize Pusher client on module startup
   */
  onModuleInit() {
    try {
      const appId = this.configService.get<string>('PUSHER_APP_ID')!;
      const key = this.configService.get<string>('PUSHER_KEY')!;
      const secret = this.configService.get<string>('PUSHER_SECRET')!;
      const cluster = this.configService.get<string>('PUSHER_CLUSTER')!;

      this.pusherClient = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });

      this.logger.log(
        `✅ Pusher initialized successfully (App ID: ${appId}, Cluster: ${cluster})`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to initialize Pusher', error);
      throw error;
    }
  }

  /**
   * Publish an event to a specific channel
   * 
   * @param channel - Channel name (e.g., "workspace-123.chats")
   * @param event - Event name (e.g., "message.new")
   * @param data - Event payload
   * @returns Promise indicating success/failure
   * 
   * @example
   * await pusherService.trigger(
   *   'workspace-123.chats',
   *   'message.new',
   *   { messageId: '456', content: 'Hello' }
   * );
   */
  async trigger(
    channel: string,
    event: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      await this.pusherClient.trigger(channel, event, data);
      
      this.logger.debug(
        `📤 Event published: ${event} to channel ${channel}`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish event ${event} to channel ${channel}`,
        error,
      );
      return false;
    }
  }

  /**
   * Publish multiple events in a single batch
   * Reduces API calls and improves performance
   * 
   * @param events - Array of event objects
   * @returns Promise indicating success/failure
   * 
   * @example
   * await pusherService.triggerBatch([
   *   { channel: 'workspace-123.chats', name: 'message.new', data: {...} },
   *   { channel: 'workspace-123.notifications', name: 'notification.system', data: {...} }
   * ]);
   */
  async triggerBatch(
    events: Array<{
      channel: string;
      name: string;
      data: Record<string, any>;
    }>,
  ): Promise<boolean> {
    try {
      await this.pusherClient.triggerBatch(events);
      
      this.logger.debug(
        `📤 Batch published: ${events.length} events`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish batch of ${events.length} events`,
        error,
      );
      return false;
    }
  }

  /**
   * Generate authentication token for private channels
   * 
   * Private channels are prefixed with "private-" and require server-side authentication
   * 
   * @param socketId - Unique socket connection ID from client
   * @param channel - Channel name (must start with "private-")
   * @returns Authentication signature
   * 
   * @example
   * const auth = pusherService.authenticatePrivateChannel(
   *   'socket-id-123',
   *   'private-user-456'
   * );
   * // Returns: { auth: "key:signature" }
   */
  authenticatePrivateChannel(
    socketId: string,
    channel: string,
  ): { auth: string } {
    try {
      const auth = this.pusherClient.authorizeChannel(socketId, channel);
      
      this.logger.debug(
        `🔐 Private channel authenticated: ${channel}`,
      );
      
      return auth;
    } catch (error) {
      this.logger.error(
        `❌ Failed to authenticate private channel ${channel}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate authentication token for presence channels
   * 
   * Presence channels are prefixed with "presence-" and show which users are subscribed
   * 
   * @param socketId - Unique socket connection ID from client
   * @param channel - Channel name (must start with "presence-")
   * @param userData - User information to be shared with other channel subscribers
   * @returns Authentication signature with user data
   * 
   * @example
   * const auth = pusherService.authenticatePresenceChannel(
   *   'socket-id-123',
   *   'presence-workspace-456',
   *   { id: '789', name: 'John Doe', role: 'staff' }
   * );
   * // Returns: { auth: "key:signature", channel_data: "{...}" }
   */
  authenticatePresenceChannel(
    socketId: string,
    channel: string,
    userData: { id: string; [key: string]: any },
  ): { auth: string; channel_data?: string } {
    try {
      const presenceData = {
        user_id: userData.id,
        user_info: userData,
      };

      const auth = this.pusherClient.authorizeChannel(
        socketId,
        channel,
        presenceData,
      );
      
      this.logger.debug(
        `🔐 Presence channel authenticated: ${channel} for user ${userData.id}`,
      );
      
      return auth;
    } catch (error) {
      this.logger.error(
        `❌ Failed to authenticate presence channel ${channel}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get the underlying Pusher client instance
   * Use with caution - prefer using the service methods
   * 
   * @returns Pusher client instance
   */
  getClient(): InstanceType<typeof Pusher> {
    return this.pusherClient;
  }
}
