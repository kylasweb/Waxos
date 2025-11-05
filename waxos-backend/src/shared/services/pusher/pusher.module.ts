import { Global, Module } from '@nestjs/common';
import { PusherService } from './pusher.service';

/**
 * PusherModule provides real-time WebSocket messaging capabilities.
 * 
 * This module is marked as @Global() to make PusherService available
 * throughout the application without repeated imports.
 * 
 * Usage in other modules:
 * Simply inject PusherService via constructor:
 * 
 * @example
 * constructor(private readonly pusherService: PusherService) {}
 */
@Global()
@Module({
  providers: [PusherService],
  exports: [PusherService],
})
export class PusherModule {}
import { Global, Module } from '@nestjs/common';
import { PusherService } from './pusher.service';

/**
 * PusherModule provides real-time WebSocket messaging capabilities.
 * 
 * This module is marked as @Global() to make PusherService available
 * throughout the application without repeated imports.
 * 
 * Usage in other modules:
 * Simply inject PusherService via constructor:
 * 
 * @example
 * constructor(private readonly pusherService: PusherService) {}
 */
@Global()
@Module({
  providers: [PusherService],
  exports: [PusherService],
})
export class PusherModule {}
