import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { SentimentService } from './sentiment/sentiment.service';

@Module({
  imports: [TasksModule, UsersModule, ProjectsModule, TypeOrmModule.forRoot({
    type: `mysql`,
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'analyze',
    entities: [User],
    synchronize: true, // TODO do not use in production
  })],
  controllers: [AppController],
  providers: [AppService, SentimentService],
})
export class AppModule {}
