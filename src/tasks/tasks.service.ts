import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SentimentService } from 'src/sentiment/sentiment.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private sentimentService: SentimentService
  ) { }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    if (data.description) {
      var { score, comparative } = await this.sentimentService.analyze(data.description);
      data.sentiment = score;
      data.normalizedSentiment = comparative;
    }
    return this.prisma.task.create({
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(taskWhereUniqueInput: Prisma.TaskWhereUniqueInput): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: taskWhereUniqueInput
    });
  }

  async update(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { where, data } = params;
    return this.prisma.task.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    const task = await this.prisma.task.delete({
      where,
    });
    return task;
  }
}
