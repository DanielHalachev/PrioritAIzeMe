import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { ReqUser } from 'src/user.decorator';
import { GetTaskDto as GetTaskDto } from './dto/get.task.dto';
import { Prisma, Task } from '@prisma/client';
import { ApiQuery } from '@nestjs/swagger';


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
      creator: { connect: { id: user.id } },
    });
  }

  @Get()
  async findAll(@ReqUser() user, @Query() params: GetTaskDto): Promise<Task[]> {
    const sortingCriteria = parseOrderBy(params.orderBy);
    return this.tasksService.findAll(
      {
        where: {
          title: { contains: params.title },
          description: { contains: params.description },
          created: params.created,
          dueDate: params.dueDate,
          completed: params.completed,
          priority: params.priority,
          creatorId: user.isAdmin ? undefined : user.id,
        },
        orderBy: {
          title: sortingCriteria.title,
          description: sortingCriteria.description,
          created: sortingCriteria.created,
          dueDate: sortingCriteria.dueDate,
          completed: sortingCriteria.completed,
          priority: sortingCriteria.priority,
          sentiment: sortingCriteria.sentiment,
          normalizedSentiment: sortingCriteria.normalizedSentiment,
        },
        skip: params.skip,
        take: params.take,
      }
    );
  }

  @Get(':id')
  async findOne(@ReqUser() user, @Param('id') id: string): Promise<Task | null> {
    return this.tasksService.findOne({ id: Number(id), creatorId: user.id });
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: string, @Body() updateTaskDto: Prisma.TaskUpdateInput): Promise<Task> {
    return this.tasksService.update({
      data: updateTaskDto,
      where: { id: Number(id), creatorId: user.id }
    });
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: string): Promise<Task> {
    return this.tasksService.remove({ id: Number(id), creatorId: user.id });
  }
}
