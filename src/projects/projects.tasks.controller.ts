import { TasksService } from 'src/tasks/tasks.service';
import { ReqUser } from 'src/user.decorator';
import { CreateTaskDto } from 'src/tasks/dto/create.task.dto';
import { GetTaskDto } from 'src/tasks/dto/get.task.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';


@Controller('projects/:projectId/tasks')
export class ProjectTasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    async create(@ReqUser() user, @Param('projectId') projectId, @Body() createTaskDto: CreateTaskDto): Promise<Task> {
        // TODO users should be able to create tasks only in projects, in which they participate

        return this.tasksService.create({
            title: createTaskDto.title,
            description: createTaskDto.description,
            dueDate: createTaskDto.dueDate,
            completed: createTaskDto.completed,
            priority: createTaskDto.priority,
            creator: { connect: { id: user.id } },
            project: { connect: { id: projectId } },
        });
    }

    @Get()
    async findAll(@ReqUser() user, @Param('projectId') projectId: string, @Query() params: GetTaskDto): Promise<Task[]> {
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
                    projectId: Number(projectId),
                    project: { ownerId: user.id }
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
        // TODO task should be visible only if users are participants in project
        // TODO assignees of a task should be able to view it
        return this.tasksService.findOne({ id: Number(id), creatorId: user.id });
    }

    @Patch(':id')
    async update(@ReqUser() user, @Param('id') id: string, @Body() updateTaskDto: Prisma.TaskUpdateInput): Promise<Task> {
        // TODO assignees of a task should be able to complete it
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

