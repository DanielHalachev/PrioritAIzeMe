import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from './../prisma/prisma.module';
import { SentimentModule } from './../sentiment/sentiment.module';

@Module({
  imports: [PrismaModule, SentimentModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule { }
