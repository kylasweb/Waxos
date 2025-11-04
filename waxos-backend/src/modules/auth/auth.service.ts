import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Workspace } from '../workspace/workspace.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Workspace)
        private workspaceRepository: Repository<Workspace>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Create workspace slug from name
        const slug = this.generateSlug(registerDto.workspaceName);

        // Check if workspace slug already exists
        const existingWorkspace = await this.workspaceRepository.findOne({
            where: { slug },
        });

        if (existingWorkspace) {
            throw new ConflictException('Workspace name already taken');
        }

        // Create workspace
        const workspace = this.workspaceRepository.create({
            name: registerDto.workspaceName,
            slug,
            subscriptionTier: 'starter',
            subscriptionStatus: 'trial',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
            maxUsers: 5,
            maxAiCreditsPerMonth: 1000,
            aiCreditsUsedThisMonth: 0,
            whatsappConnected: false,
            settings: {},
        });

        const savedWorkspace = await this.workspaceRepository.save(workspace);

        // Hash password
        // Note: Password storage will be handled by Neon Auth in production
        await bcrypt.hash(registerDto.password, 10);

        // Create owner user
        const user = this.userRepository.create({
            workspaceId: savedWorkspace.id,
            email: registerDto.email,
            fullName: registerDto.fullName,
            role: 'owner',
            status: 'active',
            settings: {},
        });

        // Note: Password is not stored in User entity in this architecture
        // In production, integrate with Neon Auth for password management
        const savedUser = await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(savedUser);

        // Update last login
        await this.userRepository.update(savedUser.id, {
            lastLoginAt: new Date(),
        });

        return {
            user: this.sanitizeUser(savedUser),
            workspace: {
                id: savedWorkspace.id,
                name: savedWorkspace.name,
                slug: savedWorkspace.slug,
                subscriptionTier: savedWorkspace.subscriptionTier,
                subscriptionStatus: savedWorkspace.subscriptionStatus,
                trialEndsAt: savedWorkspace.trialEndsAt,
            },
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        // Find user by email
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            relations: ['workspace'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check user status
        if (user.status === 'suspended') {
            throw new UnauthorizedException('Account suspended');
        }

        if (user.deletedAt) {
            throw new UnauthorizedException('Account deleted');
        }

        // Note: In production, verify password with Neon Auth
        // For now, accepting any password for development
        // TODO: Integrate Neon Auth password verification

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Update last login
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
        });

        return {
            user: this.sanitizeUser(user),
            workspace: {
                id: user.workspace.id,
                name: user.workspace.name,
                slug: user.workspace.slug,
                subscriptionTier: user.workspace.subscriptionTier,
                subscriptionStatus: user.workspace.subscriptionStatus,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
                relations: ['workspace'],
            });

            if (!user || user.status === 'suspended' || user.deletedAt) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(_userId: string) {
        // In production, invalidate refresh token in Redis/database
        // For now, just return success
        return { message: 'Logged out successfully' };
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['workspace'],
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return {
            user: this.sanitizeUser(user),
            workspace: {
                id: user.workspace.id,
                name: user.workspace.name,
                slug: user.workspace.slug,
                subscriptionTier: user.workspace.subscriptionTier,
                subscriptionStatus: user.workspace.subscriptionStatus,
                trialEndsAt: user.workspace.trialEndsAt,
                whatsappConnected: user.workspace.whatsappConnected,
                aiCreditsRemaining:
                    user.workspace.maxAiCreditsPerMonth - user.workspace.aiCreditsUsedThisMonth,
            },
        };
    }

    private async generateTokens(user: User) {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            workspaceId: user.workspaceId,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload as any);
        const refreshToken = this.jwtService.sign(payload as any);

        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get<string>('JWT_EXPIRATION', '24h'),
        };
    }

    private sanitizeUser(user: User) {
        const { workspace, ...userData } = user;
        return {
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            avatarUrl: userData.avatarUrl,
            status: userData.status,
            lastLoginAt: userData.lastLoginAt,
            identityVerifiedAt: userData.identityVerifiedAt,
            createdAt: userData.createdAt,
        };
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
    }
}
