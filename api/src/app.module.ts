import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthResolver } from './auth/auth.resolver';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { QuizModule } from './quiz/quiz.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { SocketModule } from './socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 3,
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 20,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100,
            },
        ]),

        ConfigModule.forRoot(),

        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            playground: false,
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        CacheModule.register({
            isGlobal: true,
            store: redisStore,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_HOST_PORT,
            },
        }),
        UsersModule,
        PrismaModule,
        AuthModule,
        CoursesModule,
        FilesModule,
        QuizModule,
        SocketModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        PrismaService,
        AuthResolver,
        AuthService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
