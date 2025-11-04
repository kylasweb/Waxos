import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1730750000000 implements MigrationInterface {
    name = 'InitialSchema1730750000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create workspaces table
        await queryRunner.createTable(
            new Table({
                name: 'workspaces',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'slug',
                        type: 'varchar',
                        length: '100',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'subscriptionTier',
                        type: 'varchar',
                        length: '50',
                        default: "'starter'",
                        isNullable: false,
                    },
                    {
                        name: 'subscriptionStatus',
                        type: 'varchar',
                        length: '50',
                        default: "'trial'",
                        isNullable: false,
                    },
                    {
                        name: 'trialEndsAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'maxUsers',
                        type: 'int',
                        default: 5,
                        isNullable: false,
                    },
                    {
                        name: 'maxAiCreditsPerMonth',
                        type: 'int',
                        default: 1000,
                        isNullable: false,
                    },
                    {
                        name: 'aiCreditsUsedThisMonth',
                        type: 'int',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'whatsappPhoneNumber',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'whatsappSessionData',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'whatsappConnected',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'whatsappLastConnectedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'settings',
                        type: 'jsonb',
                        default: "'{}'",
                        isNullable: false,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create users table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'workspaceId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'fullName',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'role',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'avatarUrl',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'neonAuthUserId',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: true,
                    },
                    {
                        name: 'encryptionKeyHash',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'encryptionSalt',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'identityVerifiedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'identityVerificationId',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'active'",
                        isNullable: false,
                    },
                    {
                        name: 'lastLoginAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'settings',
                        type: 'jsonb',
                        default: "'{}'",
                        isNullable: false,
                    },
                    {
                        name: 'deletionRequestedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'deletionScheduledFor',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create foreign key for users.workspaceId
        await queryRunner.createForeignKey(
            'users',
            new TableForeignKey({
                columnNames: ['workspaceId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'workspaces',
                onDelete: 'CASCADE',
            }),
        );

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_users_workspace_id" ON "users" ("workspaceId")`);
        await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "idx_users_status" ON "users" ("status")`);
        await queryRunner.query(`CREATE INDEX "idx_workspaces_slug" ON "workspaces" ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "idx_workspaces_slug"`);
        await queryRunner.query(`DROP INDEX "idx_users_status"`);
        await queryRunner.query(`DROP INDEX "idx_users_email"`);
        await queryRunner.query(`DROP INDEX "idx_users_workspace_id"`);

        // Drop foreign key
        const table = await queryRunner.getTable('users');
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('workspaceId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('users', foreignKey);
        }

        // Drop tables
        await queryRunner.dropTable('users');
        await queryRunner.dropTable('workspaces');
    }
}
