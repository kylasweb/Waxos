import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/v1/auth/register (POST)', () => {
        it('should register a new user and workspace', async () => {
            const registerDto = {
                email: 'test@example.com',
                fullName: 'Test User',
                password: 'TestPassword123!',
                workspaceName: 'Test Company',
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(registerDto)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Registration successful');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('workspace');
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user.email).toBe(registerDto.email);
            expect(response.body.data.workspace.name).toBe(registerDto.workspaceName);
        });

        it('should fail to register with duplicate email', async () => {
            const registerDto = {
                email: 'owner@waxos.test',
                fullName: 'Test User 2',
                password: 'TestPassword123!',
                workspaceName: 'Test Company 2',
            };

            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(registerDto)
                .expect(409);
        });
    });

    describe('/api/v1/auth/login (POST)', () => {
        it('should login with valid credentials', async () => {
            const loginDto = {
                email: 'owner@waxos.test',
                password: 'SecurePassword123!',
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send(loginDto)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data).toHaveProperty('accessToken');
            
            accessToken = response.body.data.accessToken;
        });

        it('should fail with invalid credentials', async () => {
            const loginDto = {
                email: 'owner@waxos.test',
                password: 'WrongPassword',
            };

            await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send(loginDto)
                .expect(401);
        });
    });

    describe('/api/v1/auth/me (GET)', () => {
        it('should get user profile with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('workspace');
        });

        it('should fail without token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .expect(401);
        });
    });

    describe('/api/v1/auth/logout (POST)', () => {
        it('should logout successfully', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
