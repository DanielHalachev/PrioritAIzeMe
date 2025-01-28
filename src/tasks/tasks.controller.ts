import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { ReqUser } from '../decorators/user.decorator';
import { GetTaskDto as GetTaskDto } from './dto/get.task.dto';
import { Prisma, Task, UserRole } from '@prisma/client';
import { SortingParams } from './../decorators/sorting.params.decorator';


@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  async create(@ReqUser() user, @Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      dueDate: createTaskDto.dueDate,
      completed: createTaskDto.completed,
      priority: createTaskDto.priority,
      creator: { connect: { id: user.sub } },
    });
  }

  @Get()
  async findAll(
    @ReqUser() user,
    @Query() params: GetTaskDto,
    @SortingParams([
      'title',
      'description',
      'created',
      'dueDate',
      'completed',
      'priority',
      'sentiment',
      'normalizedSentiment'
    ]) orderBy): Promise<Task[]> {
    const whereClause: Prisma.TaskWhereInput = {
      title: params.title ? { contains: params.title } : undefined,
      description: params.description ? { contains: params.description } : undefined,
      created: params.created ? params.created : undefined,
      dueDate: params.dueDate ? params.dueDate : undefined,
      completed: params.completed ? params.completed : undefined,
      priority: params.priority ? params.priority : undefined,
      sentiment: params.sentiment ? Number(params.sentiment) : undefined,
      normalizedSentiment: params.normalizedSentiment ? Number(params.normalizedSentiment) : undefined,
    };

    if (user.role !== UserRole.ADMIN) {
      whereClause.OR = [
        { creatorId: user.sub },
        { TaskAssignees: { some: { userId: user.sub } } }
      ];
    }
    const orderByArray = orderBy.map(order => ({ [order.property]: order.direction }));
    return this.tasksService.findAll(
      {
        where: whereClause,
        orderBy: orderByArray.length ? orderByArray : { priority: 'desc' },
        skip: params.skip,
        take: params.take,
      }
    );
  }

  @Get(':id')
  async findOne(@ReqUser() user, @Param('id') id: number) {
    const task = await this.tasksService.findOne({ id: id });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub && task.TaskAssignees.find(assignee => assignee.userId == user.sub) == null) {
      throw new ForbiddenException();
    }
    return this.tasksService.findOne({ id: id, creatorId: user.sub });
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: number, @Body() updateTaskDto: Prisma.TaskUpdateInput): Promise<Task> {
    const task = await this.tasksService.findOne({ id: id });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub) {
      throw new ForbiddenException();
    }
    return this.tasksService.update({
      data: updateTaskDto,
      where: { id: id, creatorId: user.sub }
    });
  }

  @Patch(':id/complete')
  async complete(@ReqUser() user, @Param('id') id: number): Promise<Task> {
    const task = await this.tasksService.findOne({ id: id });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub && task.TaskAssignees.find(assignee => assignee.userId == user.sub) == null) {
      throw new ForbiddenException();
    }
    return this.tasksService.update({
      data: { completed: true },
      where: { id: id, creatorId: user.sub }
    });
  }

  @Patch(':taskId/assign')
  async assign(@ReqUser() user, @Param('taskId') taskId: number, @Body('assigneeId') assigneeId: number) {
    const task = await this.tasksService.findOne({ id: taskId });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub) {
      console.log(task.creatorId, user.sub)
      throw new ForbiddenException();
    }
    await this.tasksService.assign(taskId, assigneeId);
    return this.tasksService.findOne({ id: taskId });
  }

  @Patch(':taskId/unassign')
  async unAssign(@ReqUser() user, @Param('taskId') taskId: number, @Body('assigneeId') assigneeId: number) {
    const task = await this.tasksService.findOne({ id: Number(taskId) });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub) {
      throw new ForbiddenException();
    }
    await this.tasksService.unAssign(taskId, assigneeId);
    return this.tasksService.findOne({ id: taskId });
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: number): Promise<Task> {
    const task = await this.tasksService.findOne({ id: id });
    if (task == null) {
      throw new NotFoundException();
    }
    if (task.creatorId != user.sub) {
      throw new ForbiddenException();
    }
    return this.tasksService.remove({ id: id, creatorId: user.sub });
  }
}
