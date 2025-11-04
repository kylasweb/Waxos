import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/database/base.entity';
import { Workspace } from '../workspace/workspace.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ type: 'uuid' })
    workspaceId!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    fullName!: string;

    @Column({ type: 'varchar', length: 50 })
    role!: string;

    @Column({ type: 'text', nullable: true })
    avatarUrl?: string | null;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    neonAuthUserId?: string | null;

    @Column({ type: 'text', nullable: true })
    encryptionKeyHash?: string | null;

    @Column({ type: 'text', nullable: true })
    encryptionSalt?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    identityVerifiedAt?: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    identityVerificationId?: string | null;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status!: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date | null;

    @Column({ type: 'jsonb', default: {} })
    settings!: Record<string, any>;

    @Column({ type: 'timestamp', nullable: true })
    deletionRequestedAt?: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    deletionScheduledFor?: Date | null;

    // Relations
    @ManyToOne(() => Workspace, (workspace) => workspace.users)
    @JoinColumn({ name: 'workspaceId' })
    workspace!: Workspace;
}
