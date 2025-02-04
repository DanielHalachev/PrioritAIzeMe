import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Priority, Prisma, Task } from '@prisma/client';
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

  async findOne(userId, taskId, taskWhereUniqueInput: Prisma.TaskWhereUniqueInput) {
    return await this.prisma.$transaction(async (transaction) => {
      const task = await transaction.task.findUnique({ where: { id: taskId }, select: { id: true, creatorId: true, TaskAssignees: { select: { userId: true } } } });
      if (!task) {
        throw new NotFoundException();
      }
      if (task.creatorId != userId && task.TaskAssignees.find(assignee => assignee.userId == userId) == null) {
        throw new ForbiddenException();
      }
      return transaction.task.findUnique({
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
    });
  }

  async update(
    userId,
    taskId,
    params: {
      where: Prisma.TaskWhereUniqueInput;
      data: Prisma.TaskUpdateInput;
    }): Promise<Task> {

    return await this.prisma.$transaction(async (transaction) => {
      const task = await transaction.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException();
      }
      if (task.creatorId != userId) {
        throw new ForbiddenException();
      }
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

      return transaction.task.update({
        data,
        where,
      });
    });
  }

  async assign(userId, taskId: number, assigneeId: number) {
    return await this.prisma.$transaction(async (transaction) => {
      const task = await transaction.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException();
      }
      if (task.creatorId != userId) {
        throw new ForbiddenException();
      }
      await transaction.taskAssignees.create({
        data: {
          taskId: taskId,
          userId: assigneeId
        }
      });
      return transaction.task.findUnique({ where: { id: taskId } });
    });
  }

  async unAssign(userId, taskId: number, assigneeId: number) {
    return await this.prisma.$transaction(async (transaction) => {
      const task = await transaction.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException();
      }
      if (task.creatorId != userId) {
        throw new ForbiddenException();
      }
      await this.prisma.taskAssignees.deleteMany({
        where: {
          AND: [{
            taskId: taskId,
            userId: assigneeId
          }]
        }
      });
      return transaction.task.findUnique({ where: { id: taskId } });
    });
  }

  async remove(userId, taskId, where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return await this.prisma.$transaction(async (transaction) => {
      const task = await transaction.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException();
      }
      if (task.creatorId != userId) {
        throw new ForbiddenException();
      }
      return await transaction.task.delete({
        where,
      });
    });
  }
}