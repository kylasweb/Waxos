import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspaceService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspaceRepository: Repository<Workspace>,
    ) { }

    async findById(id: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    async findBySlug(slug: string): Promise<Workspace | null> {
        return this.workspaceRepository.findOne({
            where: { slug },
            relations: ['users'],
        });
    }

    async updateSettings(workspaceId: string, settings: Record<string, any>): Promise<Workspace> {
        const workspace = await this.findById(workspaceId);

        await this.workspaceRepository.update(workspaceId, {
            settings: { ...workspace.settings, ...settings },
        });

        return this.findById(workspaceId);
    }

    async updateWhatsAppConnection(
        workspaceId: string,
        phoneNumber: string,
        sessionData: any,
    ): Promise<Workspace> {
        await this.workspaceRepository.update(workspaceId, {
            whatsappPhoneNumber: phoneNumber,
            whatsappSessionData: sessionData,
            whatsappConnected: true,
            whatsappLastConnectedAt: new Date(),
        });

        return this.findById(workspaceId);
    }

    async disconnectWhatsApp(workspaceId: string): Promise<Workspace> {
        await this.workspaceRepository.update(workspaceId, {
            whatsappConnected: false,
            whatsappSessionData: undefined,
        });

        return this.findById(workspaceId);
    }

    async incrementAiCredits(workspaceId: string, credits: number): Promise<void> {
        const workspace = await this.findById(workspaceId);

        const newCreditsUsed = workspace.aiCreditsUsedThisMonth + credits;

        if (newCreditsUsed > workspace.maxAiCreditsPerMonth) {
            throw new BadRequestException('AI credits limit exceeded');
        }

        await this.workspaceRepository.update(workspaceId, {
            aiCreditsUsedThisMonth: newCreditsUsed,
        });
    }

    async resetMonthlyCredits(workspaceId: string): Promise<void> {
        await this.workspaceRepository.update(workspaceId, {
            aiCreditsUsedThisMonth: 0,
        });
    }

    async updateSubscription(
        workspaceId: string,
        tier: string,
        status: string,
    ): Promise<Workspace> {
        await this.workspaceRepository.update(workspaceId, {
            subscriptionTier: tier,
            subscriptionStatus: status,
        });

        return this.findById(workspaceId);
    }
}
