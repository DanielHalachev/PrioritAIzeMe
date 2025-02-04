import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { Prisma, Task, UserRole } from '@prisma/client';
import { ReqUser } from '../decorators/user.decorator';
import { SortingParams } from './../decorators/sorting.params.decorator';
import { CreateTaskDto } from './dto/create.task.dto';
import { GetTaskDto } from './dto/get.task.dto';
import { TasksService } from './tasks.service';


@Controller('tasks')
@UseInterceptors(CacheInterceptor)
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
    return this.tasksService.findOne(user.sub, id, { id: id, creatorId: user.sub });
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: number, @Body() updateTaskDto: Prisma.TaskUpdateInput): Promise<Task> {
    return this.tasksService.update(user.sub, id, {
      data: updateTaskDto,
      where: { id: id, creatorId: user.sub }
    });
  }

  @Patch(':id/complete')
  async complete(@ReqUser() user, @Param('id') id: number): Promise<Task> {
    return this.tasksService.update(user.sub, id, {
      data: { completed: true },
      where: { id: id, creatorId: user.sub }
    });
  }

  @Patch(':taskId/assign')
  async assign(@ReqUser() user, @Param('taskId') taskId: number, @Body('assigneeId') assigneeId: number) {
    return this.tasksService.assign(user.sub, taskId, assigneeId);
  }

  @Patch(':taskId/unassign')
  async unAssign(@ReqUser() user, @Param('taskId') taskId: number, @Body('assigneeId') assigneeId: number) {
    return this.tasksService.unAssign(user.sub, taskId, assigneeId);
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: number): Promise<Task> {
    return this.tasksService.remove(user.sub, id, { id: id, creatorId: user.sub });
  }
}
