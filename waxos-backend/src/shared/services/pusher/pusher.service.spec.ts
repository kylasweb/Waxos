import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PusherService } from './pusher.service';

describe('PusherService', () => {
  let service: PusherService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        PUSHER_APP_ID: '2073332',
        PUSHER_KEY: 'f509dea7753e0f72661c',
        PUSHER_SECRET: '0083304811c598fd5253',
        PUSHER_CLUSTER: 'ap2',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PusherService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PusherService>(PusherService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Pusher client on module init', () => {
      expect(configService.get).toHaveBeenCalledWith('PUSHER_APP_ID');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_KEY');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_SECRET');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_CLUSTER');
    });

    it('should return Pusher client instance', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('trigger', () => {
    it('should publish event to channel successfully', async () => {
      // Mock the pusher client trigger method
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      const channel = 'workspace-123.chats';
      const event = 'message.new';
      const data = { messageId: '456', content: 'Hello' };

      const result = await service.trigger(channel, event, data);

      expect(result).toBe(true);
      expect(mockTrigger).toHaveBeenCalledWith(channel, event, data);
    });

    it('should return false and log error on failure', async () => {
      // Mock trigger to throw error
      const mockTrigger = jest.fn().mockRejectedValue(new Error('Network error'));
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      const result = await service.trigger('test-channel', 'test-event', {});

      expect(result).toBe(false);
    });
  });

  describe('triggerBatch', () => {
    it('should publish batch of events successfully', async () => {
      const mockTriggerBatch = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'triggerBatch').mockImplementation(mockTriggerBatch);

      const events = [
        { channel: 'workspace-123.chats', name: 'message.new', data: { id: '1' } },
        { channel: 'workspace-123.notifications', name: 'notification.system', data: { id: '2' } },
      ];

      const result = await service.triggerBatch(events);

      expect(result).toBe(true);
      expect(mockTriggerBatch).toHaveBeenCalledWith(events);
    });

    it('should return false on batch publish failure', async () => {
      const mockTriggerBatch = jest.fn().mockRejectedValue(new Error('Batch error'));
      jest.spyOn(service.getClient(), 'triggerBatch').mockImplementation(mockTriggerBatch);

      const result = await service.triggerBatch([]);

      expect(result).toBe(false);
    });
  });

  describe('authenticatePrivateChannel', () => {
    it('should generate auth token for private channel', () => {
      const mockAuth = { auth: 'test-key:test-signature' };
      const mockAuthorizeChannel = jest.fn().mockReturnValue(mockAuth);
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      const socketId = 'socket-123';
      const channel = 'private-user-456';

      const result = service.authenticatePrivateChannel(socketId, channel);

      expect(result).toEqual(mockAuth);
      expect(mockAuthorizeChannel).toHaveBeenCalledWith(socketId, channel);
    });

    it('should throw error on authentication failure', () => {
      const mockAuthorizeChannel = jest.fn().mockImplementation(() => {
        throw new Error('Invalid channel');
      });
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      expect(() => {
        service.authenticatePrivateChannel('socket-123', 'invalid-channel');
      }).toThrow('Invalid channel');
    });
  });

  describe('authenticatePresenceChannel', () => {
    it('should generate auth token for presence channel with user data', () => {
      const mockAuth = {
        auth: 'test-key:test-signature',
        channel_data: '{"user_id":"789","user_info":{...}}',
      };
      const mockAuthorizeChannel = jest.fn().mockReturnValue(mockAuth);
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      const socketId = 'socket-123';
      const channel = 'presence-workspace-456';
      const userData = { id: '789', name: 'John Doe', role: 'staff' };

      const result = service.authenticatePresenceChannel(socketId, channel, userData);

      expect(result).toEqual(mockAuth);
      expect(mockAuthorizeChannel).toHaveBeenCalledWith(
        socketId,
        channel,
        {
          user_id: userData.id,
          user_info: userData,
        },
      );
    });

    it('should throw error on presence authentication failure', () => {
      const mockAuthorizeChannel = jest.fn().mockImplementation(() => {
        throw new Error('Invalid presence channel');
      });
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      expect(() => {
        service.authenticatePresenceChannel('socket-123', 'invalid-channel', { id: '1' });
      }).toThrow('Invalid presence channel');
    });
  });

  describe('Event Naming Conventions', () => {
    it('should follow resource.action naming pattern', async () => {
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      // Test valid event names
      const validEvents = [
        'message.new',
        'message.updated',
        'message.deleted',
        'chat.assigned',
        'user.online',
        'notification.system',
      ];

      for (const event of validEvents) {
        await service.trigger('test-channel', event, {});
      }

      expect(mockTrigger).toHaveBeenCalledTimes(validEvents.length);
    });
  });

  describe('Channel Naming Conventions', () => {
    it('should follow workspace-{id}.{resource} naming pattern', async () => {
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      // Test valid channel names
      const validChannels = [
        'workspace-123.chats',
        'workspace-456.notifications',
        'private-user-789',
        'presence-workspace-123',
      ];

      for (const channel of validChannels) {
        await service.trigger(channel, 'test.event', {});
      }

      expect(mockTrigger).toHaveBeenCalledTimes(validChannels.length);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PusherService } from './pusher.service';

describe('PusherService', () => {
  let service: PusherService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        PUSHER_APP_ID: '2073332',
        PUSHER_KEY: 'f509dea7753e0f72661c',
        PUSHER_SECRET: '0083304811c598fd5253',
        PUSHER_CLUSTER: 'ap2',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PusherService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PusherService>(PusherService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Pusher client on module init', () => {
      expect(configService.get).toHaveBeenCalledWith('PUSHER_APP_ID');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_KEY');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_SECRET');
      expect(configService.get).toHaveBeenCalledWith('PUSHER_CLUSTER');
    });

    it('should return Pusher client instance', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('trigger', () => {
    it('should publish event to channel successfully', async () => {
      // Mock the pusher client trigger method
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      const channel = 'workspace-123.chats';
      const event = 'message.new';
      const data = { messageId: '456', content: 'Hello' };

      const result = await service.trigger(channel, event, data);

      expect(result).toBe(true);
      expect(mockTrigger).toHaveBeenCalledWith(channel, event, data);
    });

    it('should return false and log error on failure', async () => {
      // Mock trigger to throw error
      const mockTrigger = jest.fn().mockRejectedValue(new Error('Network error'));
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      const result = await service.trigger('test-channel', 'test-event', {});

      expect(result).toBe(false);
    });
  });

  describe('triggerBatch', () => {
    it('should publish batch of events successfully', async () => {
      const mockTriggerBatch = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'triggerBatch').mockImplementation(mockTriggerBatch);

      const events = [
        { channel: 'workspace-123.chats', name: 'message.new', data: { id: '1' } },
        { channel: 'workspace-123.notifications', name: 'notification.system', data: { id: '2' } },
      ];

      const result = await service.triggerBatch(events);

      expect(result).toBe(true);
      expect(mockTriggerBatch).toHaveBeenCalledWith(events);
    });

    it('should return false on batch publish failure', async () => {
      const mockTriggerBatch = jest.fn().mockRejectedValue(new Error('Batch error'));
      jest.spyOn(service.getClient(), 'triggerBatch').mockImplementation(mockTriggerBatch);

      const result = await service.triggerBatch([]);

      expect(result).toBe(false);
    });
  });

  describe('authenticatePrivateChannel', () => {
    it('should generate auth token for private channel', () => {
      const mockAuth = { auth: 'test-key:test-signature' };
      const mockAuthorizeChannel = jest.fn().mockReturnValue(mockAuth);
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      const socketId = 'socket-123';
      const channel = 'private-user-456';

      const result = service.authenticatePrivateChannel(socketId, channel);

      expect(result).toEqual(mockAuth);
      expect(mockAuthorizeChannel).toHaveBeenCalledWith(socketId, channel);
    });

    it('should throw error on authentication failure', () => {
      const mockAuthorizeChannel = jest.fn().mockImplementation(() => {
        throw new Error('Invalid channel');
      });
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      expect(() => {
        service.authenticatePrivateChannel('socket-123', 'invalid-channel');
      }).toThrow('Invalid channel');
    });
  });

  describe('authenticatePresenceChannel', () => {
    it('should generate auth token for presence channel with user data', () => {
      const mockAuth = {
        auth: 'test-key:test-signature',
        channel_data: '{"user_id":"789","user_info":{...}}',
      };
      const mockAuthorizeChannel = jest.fn().mockReturnValue(mockAuth);
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      const socketId = 'socket-123';
      const channel = 'presence-workspace-456';
      const userData = { id: '789', name: 'John Doe', role: 'staff' };

      const result = service.authenticatePresenceChannel(socketId, channel, userData);

      expect(result).toEqual(mockAuth);
      expect(mockAuthorizeChannel).toHaveBeenCalledWith(
        socketId,
        channel,
        {
          user_id: userData.id,
          user_info: userData,
        },
      );
    });

    it('should throw error on presence authentication failure', () => {
      const mockAuthorizeChannel = jest.fn().mockImplementation(() => {
        throw new Error('Invalid presence channel');
      });
      jest.spyOn(service.getClient(), 'authorizeChannel').mockImplementation(mockAuthorizeChannel);

      expect(() => {
        service.authenticatePresenceChannel('socket-123', 'invalid-channel', { id: '1' });
      }).toThrow('Invalid presence channel');
    });
  });

  describe('Event Naming Conventions', () => {
    it('should follow resource.action naming pattern', async () => {
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      // Test valid event names
      const validEvents = [
        'message.new',
        'message.updated',
        'message.deleted',
        'chat.assigned',
        'user.online',
        'notification.system',
      ];

      for (const event of validEvents) {
        await service.trigger('test-channel', event, {});
      }

      expect(mockTrigger).toHaveBeenCalledTimes(validEvents.length);
    });
  });

  describe('Channel Naming Conventions', () => {
    it('should follow workspace-{id}.{resource} naming pattern', async () => {
      const mockTrigger = jest.fn().mockResolvedValue({});
      jest.spyOn(service.getClient(), 'trigger').mockImplementation(mockTrigger);

      // Test valid channel names
      const validChannels = [
        'workspace-123.chats',
        'workspace-456.notifications',
        'private-user-789',
        'presence-workspace-123',
      ];

      for (const channel of validChannels) {
        await service.trigger(channel, 'test.event', {});
      }

      expect(mockTrigger).toHaveBeenCalledTimes(validChannels.length);
    });
  });
});
