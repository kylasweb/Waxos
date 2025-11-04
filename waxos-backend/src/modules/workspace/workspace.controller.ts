import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) { }

    @Get(':id')
    async getWorkspace(@Param('id') id: string) {
        return this.workspaceService.findById(id);
    }

    @Patch(':id/settings')
    async updateSettings(
        @Param('id') id: string,
        @Body() settings: Record<string, any>,
    ) {
        return this.workspaceService.updateSettings(id, settings);
    }

    @Patch(':id/whatsapp/connect')
    async connectWhatsApp(
        @Param('id') id: string,
        @Body() data: { phoneNumber: string; sessionData: any },
    ) {
        return this.workspaceService.updateWhatsAppConnection(
            id,
            data.phoneNumber,
            data.sessionData,
        );
    }

    @Patch(':id/whatsapp/disconnect')
    async disconnectWhatsApp(@Param('id') id: string) {
        return this.workspaceService.disconnectWhatsApp(id);
    }
}
