import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // Application
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_VERSION: Joi.string().default('v1'),

    // Database
    DATABASE_URL: Joi.string().required(),
    DATABASE_MAX_CONNECTIONS: Joi.number().default(20),

    // Authentication
    NEON_AUTH_SECRET: Joi.string().min(32).required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    JWT_REFRESH_EXPIRATION: Joi.string().default('30d'),

    // Redis
    REDIS_URL: Joi.string().required(),
    REDIS_TTL: Joi.number().default(3600),

    // Cloudflare R2
    R2_ENDPOINT: Joi.string().required(),
    R2_ACCESS_KEY_ID: Joi.string().required(),
    R2_SECRET_ACCESS_KEY: Joi.string().required(),
    R2_BUCKET_NAME: Joi.string().required(),
    R2_PUBLIC_URL: Joi.string().required(),

    // Pusher
    PUSHER_APP_ID: Joi.string().required(),
    PUSHER_KEY: Joi.string().required(),
    PUSHER_SECRET: Joi.string().required(),
    PUSHER_CLUSTER: Joi.string().required(),

    // AI Providers
    BYTEZ_API_KEY: Joi.string().allow(''),
    OPENROUTER_API_KEY: Joi.string().allow(''),
    GROQ_API_KEY: Joi.string().allow(''),
    GEMINI_API_KEY: Joi.string().allow(''),

    // Stripe
    STRIPE_SECRET_KEY: Joi.string().allow(''),
    STRIPE_PUBLISHABLE_KEY: Joi.string().allow(''),

    // Monitoring
    SENTRY_DSN: Joi.string().allow(''),

    // CORS
    CORS_ORIGIN: Joi.string().required(),

    // Rate Limiting
    RATE_LIMIT_TTL: Joi.number().default(60),
    RATE_LIMIT_MAX: Joi.number().default(100),
});
