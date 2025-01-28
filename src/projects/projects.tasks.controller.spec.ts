import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Priority, Prisma, Project, Task, UserRole } from '@prisma/client';
import { DecoratorsModule } from './../decorators/decorators.module';
import { PrismaModule } from './../prisma/prisma.module';
import { SentimentModule } from './../sentiment/sentiment.module';
import { GetTaskDto } from './../tasks/dto/get.task.dto';
import { ProjectTasksController } from './projects.tasks.controller';
import { TasksService } from './../tasks/tasks.service';
import { ProjectsService } from './projects.service';

let projectsController: ProjectTasksController;
let tasksService: Partial<TasksService>;
let projectsService: Partial<ProjectsService>;

const mockUsers = [
    { id: 1, role: UserRole.ADMIN },
    { id: 2, role: UserRole.USER },
    { id: 3, role: UserRole.USER }
];

const projectMock: Project = {
    id: 1,
    name: "Project",
    description: "",
    ownerId: 1,
}

const projectMockWithParticipants = {
    id: 1,
    name: "Project",
    description: "",
    ownerId: 1,
    ProjectParticipants: [{ userId: 1 }, { userId: 2 }, { userId: 3 }, { userId: 4 }]
}
const mockTasks = [
    {
        id: 1,
        title: 'Task 1',
        description: 'Task 1',
        creatorId: 1,
        projectId: 1,
        created: new Date(),
        dueDate: new Date(),
        completed: false,
        sentiment: 3,
        normalizedSentiment: 3,
        priority: Priority.MEDIUM,
        TaskAssignees: [{ userId: 1 }]
    },
    {
        id: 2,
        title: 'Task 2',
        description: 'Task 2',
        creatorId: 1,
        projectId: 1,
        created: new Date(),
        dueDate: new Date(),
        completed: false,
        sentiment: 1,
        normalizedSentiment: 1,
        priority: Priority.HIGH,
        TaskAssignees: [{ userId: 2 }]
    },
    {
        id: 3,
        title: 'Task 1',
        description: 'Task 1',
        creatorId: 2,
        projectId: 1,
        created: new Date(),
        dueDate: new Date(),
        completed: false,
        sentiment: 4,
        normalizedSentiment: 4,
        priority: Priority.MEDIUM,
        TaskAssignees: [{ userId: 1 }, { userId: 2 }]
    },
    {
        id: 4,
        title: 'Task New',
        description: 'Task New',
        creatorId: 3,
        projectId: 1,
        created: new Date(),
        dueDate: new Date(),
        completed: true,
        sentiment: 2,
        normalizedSentiment: 2,
        priority: Priority.LOW,
        TaskAssignees: []
    }
];

const mockTaskDto = {
    id: 4,
    title: mockTasks[3].title,
    description: mockTasks[3].description,
    dueDate: mockTasks[3].dueDate,
    completed: mockTasks[3].completed,
}

type MockUserDto = {
    sub: number,
    role: UserRole,
};

const mockUserDtos: MockUserDto[] = mockUsers.map(user => { return { sub: user.id, role: user.role } })

describe('GET projects/:projectId/projects/:projectId/tasks', () => {
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ProjectTasksController],
            providers: [TasksService, ProjectsService],
            imports: [DecoratorsModule, PrismaModule, SentimentModule]
        }).compile();

        tasksService = moduleRef.get(TasksService);
        projectsService = moduleRef.get(ProjectsService);
        projectsController = moduleRef.get(ProjectTasksController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all tasks for admin', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockTasks);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.findAll(mockUsers[0], projectMock.id, {}, []);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual(mockTasks);
    });

    it('should sort all tasks by normalizedSentiment ascending', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1], mockTasks[3], mockTasks[0], mockTasks[2]]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.findAll(mockUsers[0], projectMock.id, {}, [{ normalizedSentiment: "asc" }]);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockTasks[1], mockTasks[3], mockTasks[0], mockTasks[2]]);
    });

    it('should sort all tasks by normalizedSentiment descending', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[2], mockTasks[0], mockTasks[3], mockTasks[1]]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.findAll(mockUsers[0], projectMock.id, {}, [{ normalizedSentiment: "desc" }]);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockTasks[2], mockTasks[0], mockTasks[3], mockTasks[1]]);
    });

    it('should filter all tasks by title', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1]]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const filter: GetTaskDto = { title: "Task 2" };
        const result = await projectsController.findAll(mockUsers[0], projectMock.id, filter, []);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockTasks[1]]);
    });

    it('should get all tasks for a user and no other tasks', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1], mockTasks[2]]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.findAll(mockUsers[0], projectMock.id, {}, []);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockTasks[1], mockTasks[2]]);
    });

    it('should get all tasks for a user, who is assigned to them', async () => {
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[2], mockTasks[3]]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.findAll(mockUsers[0], projectMock.id, {}, []);

        expect(tasksService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockTasks[2], mockTasks[3]]);
    });

    it('should throw ForbiddenException if user tries to get a task they don’t own', async () => {
        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        // user with id 2 tries to access task with id 4, which has owner with id=3 and no assignees
        await expect(projectsController.findOne(mockUserDtos[1], projectMock.id, 4)).rejects.toThrow(
            ForbiddenException,
        );
    });
});

describe('POST /projects/:projectId/tasks', () => {
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ProjectTasksController],
            providers: [TasksService, ProjectsService],
            imports: [DecoratorsModule, PrismaModule, SentimentModule]
        }).compile();

        tasksService = moduleRef.get(TasksService);
        projectsService = moduleRef.get(ProjectsService);
        projectsController = moduleRef.get(ProjectTasksController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a task for the user', async () => {
        jest.spyOn(tasksService, 'create').mockResolvedValue(mockTasks[3]);

        const result = await projectsController.create(mockUsers[1], projectMock.id, mockTaskDto);

        expect(tasksService.create).toHaveBeenCalled();
        expect(result).toEqual(mockTasks[3]);
    });

    it('should throw NotFoundException if task to update does not exist', async () => {
        await expect(
            projectsController.update(mockUserDtos[1], projectMock.id, 99, { title: 'Updated Task' }),
        ).rejects.toThrow(NotFoundException);
    });
});

describe('PATCH /projects/:projectId/tasks/id', () => {
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ProjectTasksController],
            providers: [TasksService, ProjectsService],
            imports: [DecoratorsModule, PrismaModule, SentimentModule]
        }).compile();

        tasksService = moduleRef.get(TasksService);
        projectsService = moduleRef.get(ProjectsService);
        projectsController = moduleRef.get(ProjectTasksController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should allow the owner or assignee to complete a task', async () => {
        const mockCompletedTask = { ...mockTasks[3], completed: true };
        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
        jest.spyOn(tasksService, 'update').mockResolvedValue(mockCompletedTask);


        const result = await projectsController.complete(mockUserDtos[2], projectMock.id, mockTasks[3].id);
        expect(result).toEqual(mockCompletedTask);
    });

    it('should allow the owner to add an assignee', async () => {
        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
        jest.spyOn(tasksService, 'assign').mockResolvedValue({ taskId: mockTasks[3].id, userId: 1 });

        const mockTaskWithAssignees = { ...mockTasks[3], TaskAssignees: [{ userId: 1 }] };
        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTaskWithAssignees);

        const result = await projectsController.assign(mockUserDtos[2], mockTasks[3].id, 1);

        expect(tasksService.assign).toHaveBeenCalled();
        expect(result).toEqual(mockTaskWithAssignees);
    });

    it('should allow the owner to remove an assignee', async () => {
        const mockTaskWithAssignees = { ...mockTasks[3], TaskAssignees: [{ userId: 1 }] };

        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTaskWithAssignees);
        jest.spyOn(tasksService, 'unAssign').mockResolvedValue({ count: 1 });

        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);

        const result = await projectsController.unAssign(mockUserDtos[2], mockTasks[3].id, 1);

        expect(tasksService.unAssign).toHaveBeenCalled();
        expect(result).toEqual(mockTasks[3]);
    });
});

describe('DELETE /projects/:projectId/tasks/:id', () => {
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ProjectTasksController],
            providers: [TasksService, ProjectsService],
            imports: [DecoratorsModule, PrismaModule, SentimentModule]
        }).compile();

        tasksService = moduleRef.get(TasksService);
        projectsService = moduleRef.get(ProjectsService);
        projectsController = moduleRef.get(ProjectTasksController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a task if the user is the owner', async () => {
        jest.spyOn(tasksService, 'remove').mockResolvedValue(mockTasks[3]);
        jest.spyOn(tasksService, 'findAll').mockResolvedValue([]);
        jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
        jest.spyOn(projectsService, 'findOne').mockResolvedValue(projectMockWithParticipants);

        const result = await projectsController.remove(mockUserDtos[2], 4);
        const newTasks = await projectsController.findAll(mockUserDtos[2], projectMock.id, {}, []);
        expect(tasksService.remove).toHaveBeenCalled();
        expect(result).toEqual(mockTasks[3]);
        expect(newTasks).toEqual([]);
    });
});
