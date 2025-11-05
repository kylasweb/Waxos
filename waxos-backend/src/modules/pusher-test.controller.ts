import { Controller, Get, Post, Body } from '@nestjs/common';
import { PusherService } from '../shared/services/pusher/pusher.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * PusherTestController - For testing Pusher integration
 * 
 * This controller provides endpoints to test Pusher event publishing.
 * Can be removed after successful testing or kept for debugging.
 */
@Controller('pusher-test')
@Public()
export class PusherTestController {
  constructor(private readonly pusherService: PusherService) {}

  /**
   * Test endpoint to check Pusher service initialization
   */
  @Get('health')
  checkHealth() {
    return {
      success: true,
      message: 'Pusher service is initialized',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test endpoint to publish a test event
   */
  @Post('trigger')
  async testTrigger(
    @Body() body: { channel: string; event: string; data: any },
  ) {
    const result = await this.pusherService.trigger(
      body.channel || 'test-channel',
      body.event || 'test-event',
      body.data || { message: 'Hello from WAXOS!' },
    );

    return {
      success: result,
      message: result
        ? 'Event published successfully'
        : 'Failed to publish event',
      details: {
        channel: body.channel || 'test-channel',
        event: body.event || 'test-event',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PusherService } from '../shared/services/pusher/pusher.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * PusherTestController - For testing Pusher integration
 * 
 * This controller provides endpoints to test Pusher event publishing.
 * Can be removed after successful testing or kept for debugging.
 */
@Controller('pusher-test')
@Public()
export class PusherTestController {
  constructor(private readonly pusherService: PusherService) {}

  /**
   * Test endpoint to check Pusher service initialization
   */
  @Get('health')
  checkHealth() {
    return {
      success: true,
      message: 'Pusher service is initialized',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test endpoint to publish a test event
   */
  @Post('trigger')
  async testTrigger(
    @Body() body: { channel: string; event: string; data: any },
  ) {
    const result = await this.pusherService.trigger(
      body.channel || 'test-channel',
      body.event || 'test-event',
      body.data || { message: 'Hello from WAXOS!' },
    );

    return {
      success: result,
      message: result
        ? 'Event published successfully'
        : 'Failed to publish event',
      details: {
        channel: body.channel || 'test-channel',
        event: body.event || 'test-event',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
