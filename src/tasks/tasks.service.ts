import { Injectable } from '@nestjs/common';
import { Priority, Prisma, Task, TaskAssignees } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { SentimentService } from './../sentiment/sentiment.service';

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
      if (data.priority == undefined || data.priority == Priority.AUTO) {
        data.priority = (data.normalizedSentiment < -0.1 ? Priority.HIGH : (data.normalizedSentiment < 0.1 ? Priority.MEDIUM : Priority.LOW));
      }
    } else {
      data.priority = Priority.NONE;
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
      orderBy: orderBy ? orderBy : { priority: 'desc' },
    });
  }

  async findOne(taskWhereUniqueInput: Prisma.TaskWhereUniqueInput) {
    return this.prisma.task.findUnique({
      where: taskWhereUniqueInput,
      select: {
        id: true,
        title: true,
        description: true,
        created: true,
        dueDate: true,
        completed: true,
        priority: true,
        creatorId: true,
        projectId: true,
        sentiment: true,
        normalizedSentiment: true,
        TaskAssignees: {
          select: {
            userId: true,
          },
        }
      }
    });
  }

  async update(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { where, data } = params;
    if (data.description) {
      var { score, comparative } = await this.sentimentService.analyze(data.description.toString());
      data.sentiment = score;
      data.normalizedSentiment = comparative;
      if (data.priority == undefined || data.priority == Priority.AUTO) {
        data.priority = (data.normalizedSentiment < -0.1 ? Priority.HIGH : (data.normalizedSentiment < 0.1 ? Priority.MEDIUM : Priority.LOW));
      }
    } else {
      data.priority = Priority.NONE;
    }
    return this.prisma.task.update({
      data,
      where,
    });
  }

  async assign(taskId: number, assigneeId: number): Promise<TaskAssignees> {
    return this.prisma.taskAssignees.create({
      data: {
        taskId: taskId,
        userId: assigneeId
      }
    });
  }

  async unAssign(taskId: number, assigneeId: number) {
    return this.prisma.taskAssignees.deleteMany({
      where: {
        AND: [{
          taskId: taskId,
          userId: assigneeId
        }]
      }
    });
  }

  async remove(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    const task = await this.prisma.task.delete({
      where,
    });
    return task;
  }
}
