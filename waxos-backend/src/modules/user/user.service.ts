import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['workspace'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
            relations: ['workspace'],
        });
    }

    async findByWorkspaceId(workspaceId: string): Promise<User[]> {
        return this.userRepository.find({
            where: { workspaceId },
            order: { createdAt: 'ASC' },
        });
    }

    async updateProfile(userId: string, data: Partial<User>): Promise<User> {
        await this.findById(userId); // Verify user exists

        // Prevent updating sensitive fields
        const allowedFields = ['fullName', 'avatarUrl', 'settings'];
        const filteredData: any = {};

        Object.keys(data).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredData[key] = data[key as keyof User];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            throw new BadRequestException('No valid fields to update');
        }

        await this.userRepository.update(userId, filteredData);

        return this.findById(userId);
    }

    async updateLastLogin(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            lastLoginAt: new Date(),
        });
    }

    async requestDeletion(userId: string, scheduledDays = 30): Promise<void> {
        const deletionScheduledFor = new Date();
        deletionScheduledFor.setDate(deletionScheduledFor.getDate() + scheduledDays);

        await this.userRepository.update(userId, {
            deletionRequestedAt: new Date(),
            deletionScheduledFor,
            status: 'pending_deletion',
        });
    }

    async cancelDeletion(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            deletionRequestedAt: null,
            deletionScheduledFor: null,
            status: 'active',
        });
    }

    async softDelete(userId: string): Promise<void> {
        await this.userRepository.softDelete(userId);
    }
}
