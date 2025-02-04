import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DecoratorsModule } from './decorators/decorators.module';
import { PrismaService } from './prisma/prisma.service';
import { ProjectsModule } from './projects/projects.module';
import { SentimentService } from './sentiment/sentiment.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CacheModule.register({ isGlobal: true, ttl: 5000}), DecoratorsModule, TasksModule, UsersModule, ProjectsModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), DecoratorsModule],
  controllers: [AppController],
  providers: [AppService, SentimentService, PrismaService],
})
export class AppModule { }
