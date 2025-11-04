import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                ssl: {
                    rejectUnauthorized: false, // Required for NeonDB
                },
                entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
                synchronize: configService.get('NODE_ENV') === 'development', // Auto-sync in dev only
                logging: configService.get('NODE_ENV') === 'development',
                maxQueryExecutionTime: 1000, // Log slow queries (>1s)
                poolSize: configService.get<number>('DATABASE_MAX_CONNECTIONS', 20),
            }),
        }),
    ],
})
export class DatabaseModule { }
