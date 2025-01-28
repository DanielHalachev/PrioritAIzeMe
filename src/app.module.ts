import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { SentimentService } from './sentiment/sentiment.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DecoratorsModule } from './decorators/decorators.module';

@Module({
  imports: [DecoratorsModule, TasksModule, UsersModule, ProjectsModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), DecoratorsModule],
  controllers: [AppController],
  providers: [AppService, SentimentService, PrismaService],
})
export class AppModule { }
