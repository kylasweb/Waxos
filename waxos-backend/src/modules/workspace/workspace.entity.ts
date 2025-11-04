import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/database/base.entity';
import { User } from '../user/user.entity';

@Entity('workspaces')
export class Workspace extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug!: string;

    @Column({ type: 'varchar', length: 50, default: 'starter' })
    subscriptionTier!: string;

    @Column({ type: 'varchar', length: 50, default: 'trial' })
    subscriptionStatus!: string;

    @Column({ type: 'timestamp', nullable: true })
    trialEndsAt?: Date | null;

    @Column({ type: 'int', default: 5 })
    maxUsers!: number;

    @Column({ type: 'int', default: 1000 })
    maxAiCreditsPerMonth!: number;

    @Column({ type: 'int', default: 0 })
    aiCreditsUsedThisMonth!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    whatsappPhoneNumber?: string | null;

    @Column({ type: 'jsonb', nullable: true })
    whatsappSessionData?: any;

    @Column({ type: 'boolean', default: false })
    whatsappConnected!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    whatsappLastConnectedAt?: Date | null;

    @Column({ type: 'jsonb', default: {} })
    settings!: Record<string, any>;

    // Relations
    @OneToMany(() => User, (user) => user.workspace)
    users!: User[];
}
