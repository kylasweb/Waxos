import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for NeonDB
    },
    entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'src/migrations/*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false, // Always false in production - use migrations
    logging: process.env.NODE_ENV === 'development',
});
