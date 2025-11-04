import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    async getProfile(@CurrentUser('sub') userId: string) {
        return this.userService.findById(userId);
    }

    @Patch('profile')
    async updateProfile(
        @CurrentUser('sub') userId: string,
        @Body() data: any,
    ) {
        return this.userService.updateProfile(userId, data);
    }

    @Get('workspace/:workspaceId')
    async getWorkspaceUsers(@Param('workspaceId') workspaceId: string) {
        return this.userService.findByWorkspaceId(workspaceId);
    }
}
